import express from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import { db } from "../db.js";

const router = express.Router();

// Google OAuth Routes
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const info = await db.run("INSERT INTO users (email, password, name) VALUES (?, ?, ?)", [email, hashedPassword, name]);
    const user = await db.get("SELECT id, email, name FROM users WHERE id = ?", [info.lastInsertRowid]);
    (req.session as any).userId = user.id;
    res.json(user);
  } catch (error) {
    console.error("Register error:", error);
    res.status(400).json({ error: "User already exists or invalid data" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
  if (user && (await bcrypt.compare(password, user.password))) {
    (req.session as any).userId = user.id;
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

router.get("/me", async (req, res) => {
  const userId = (req.session as any).userId;
  if (userId) {
    const user = await db.get("SELECT id, email, name, avatar, bio, theme, target_role, experience_level, linkedin_url, github_url, preferences FROM users WHERE id = ?", [userId]);
    if (user && user.preferences) {
      user.preferences = JSON.parse(user.preferences);
    }
    res.json(user);
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

router.get("/google/url", (req, res) => {
  const redirectUri = req.query.redirect_uri as string;
  if (!redirectUri) return res.status(400).json({ error: "Missing redirect_uri" });

  const url = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    redirect_uri: redirectUri,
  });
  res.json({ url });
});

export const authCallbackRouter = express.Router();

authCallbackRouter.get("/google/callback", async (req, res) => {
  const { code, state } = req.query;
  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
  const redirectUri = `${baseUrl}/auth/google/callback`;

  try {
    const { tokens } = await googleClient.getToken({
      code: code as string,
      redirect_uri: redirectUri,
    });
    googleClient.setCredentials(tokens);

    const userInfo = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );

    const { email, name, picture } = userInfo.data;

    let user = await db.get("SELECT * FROM users WHERE email = ?", [email]);

    if (!user) {
      const info = await db.run(
        "INSERT INTO users (email, name, avatar, password) VALUES (?, ?, ?, ?)",
        [email, name, picture, ""]
      );
      user = await db.get("SELECT * FROM users WHERE id = ?", [info.lastInsertRowid]);
    }

    (req.session as any).userId = user.id;

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Google OAuth Error:", error);
    res.status(500).send("Authentication failed");
  }
});

export default router;
