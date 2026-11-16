import express, { type Request } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import { db } from "../db.js";
import { asyncHandler, HttpError } from "../middleware/errors.js";

const router = express.Router();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);

// Brute-force protection for credential endpoints.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again in a few minutes." },
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (email: unknown) => (typeof email === "string" ? email.trim().toLowerCase() : "");

// Regenerate the session on login to prevent session fixation.
const establishSession = (req: Request, userId: number) =>
  new Promise<void>((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      (req.session as any).userId = userId;
      req.session.save((saveErr) => (saveErr ? reject(saveErr) : resolve()));
    });
  });

// The redirect URI is always computed on the server so it matches between
// the authorization request and the token exchange.
const getRedirectUri = (req: Request) => {
  const baseUrl = (process.env.APP_URL || `${req.protocol}://${req.get("host")}`).replace(/\/+$/, "");
  return `${baseUrl}/auth/google/callback`;
};

router.post(
  "/register",
  authLimiter,
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";

    if (!EMAIL_RE.test(email) || email.length > 254) throw new HttpError(400, "Invalid email address");
    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      throw new HttpError(400, "Password must be between 8 and 128 characters");
    }
    if (!name || name.length > 100) throw new HttpError(400, "Name is required (max 100 characters)");

    const existing = await db.get("SELECT id FROM users WHERE LOWER(email) = ?", [email]);
    if (existing) throw new HttpError(409, "User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const info = await db.run("INSERT INTO users (email, password, name) VALUES (?, ?, ?)", [email, hashedPassword, name]);
    const user = await db.get("SELECT id, email, name FROM users WHERE id = ?", [info.lastInsertRowid]);
    await establishSession(req, user.id);
    res.json(user);
  })
);

router.post(
  "/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;
    if (!email || typeof password !== "string" || !password) throw new HttpError(401, "Invalid credentials");

    const user = await db.get("SELECT * FROM users WHERE LOWER(email) = ?", [email]);
    // Accounts created via Google have no password and cannot log in with one.
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      throw new HttpError(401, "Invalid credentials");
    }
    await establishSession(req, user.id);
    const { password: _, ...userWithoutPassword } = user;
    if (typeof userWithoutPassword.preferences === "string") {
      try {
        userWithoutPassword.preferences = JSON.parse(userWithoutPassword.preferences);
      } catch {
        userWithoutPassword.preferences = undefined;
      }
    }
    res.json(userWithoutPassword);
  })
);

router.get(
  "/me",
  asyncHandler(async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) throw new HttpError(401, "Not authenticated");

    const user = await db.get(
      "SELECT id, email, name, avatar, bio, theme, target_role, experience_level, linkedin_url, github_url, preferences FROM users WHERE id = ?",
      [userId]
    );
    if (!user) throw new HttpError(401, "Not authenticated");
    if (user.preferences) {
      try {
        user.preferences = JSON.parse(user.preferences);
      } catch {
        user.preferences = undefined;
      }
    }
    res.json(user);
  })
);

router.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

router.get(
  "/google/url",
  asyncHandler(async (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new HttpError(503, "Google login is not configured");
    }
    // CSRF protection: random state stored in the session and verified in the callback.
    const state = crypto.randomBytes(24).toString("hex");
    (req.session as any).oauthState = state;
    await new Promise<void>((resolve, reject) => req.session.save((err) => (err ? reject(err) : resolve())));

    const url = googleClient.generateAuthUrl({
      access_type: "online",
      scope: ["openid", "https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
      redirect_uri: getRedirectUri(req),
      state,
      prompt: "select_account",
    });
    res.json({ url });
  })
);

export const authCallbackRouter = express.Router();

const callbackPage = (success: boolean) => `<!doctype html>
<html>
  <body>
    <script>
      (function () {
        var msg = { type: ${JSON.stringify(success ? "OAUTH_AUTH_SUCCESS" : "OAUTH_AUTH_ERROR")} };
        if (window.opener) {
          window.opener.postMessage(msg, window.location.origin);
          window.close();
        } else {
          window.location.href = '/';
        }
      })();
    </script>
    <p>${success ? "Authentication successful. This window should close automatically." : "Authentication failed."}</p>
  </body>
</html>`;

authCallbackRouter.get("/google/callback", async (req, res) => {
  const { code, state } = req.query;
  const expectedState = (req.session as any).oauthState;
  delete (req.session as any).oauthState;

  try {
    if (typeof code !== "string" || typeof state !== "string" || !expectedState) {
      throw new Error("Missing OAuth code or state");
    }
    const a = Buffer.from(state);
    const b = Buffer.from(String(expectedState));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      throw new Error("Invalid OAuth state");
    }

    const { tokens } = await googleClient.getToken({ code, redirect_uri: getRedirectUri(req) });

    const userInfo = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const { name, picture, email_verified } = userInfo.data;
    const email = normalizeEmail(userInfo.data.email);
    if (!email || email_verified !== true) {
      throw new Error("Google account email is not verified");
    }

    let user = await db.get("SELECT * FROM users WHERE LOWER(email) = ?", [email]);
    if (!user) {
      const info = await db.run("INSERT INTO users (email, name, avatar, password) VALUES (?, ?, ?, ?)", [
        email,
        name || email,
        picture || null,
        "",
      ]);
      user = await db.get("SELECT * FROM users WHERE id = ?", [info.lastInsertRowid]);
    }

    await establishSession(req, user.id);
    res.send(callbackPage(true));
  } catch (error) {
    console.error("Google OAuth Error:", error);
    res.status(400).send(callbackPage(false));
  }
});

export default router;
