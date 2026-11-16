import express from "express";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import session from "express-session";
import pgSession from "connect-pg-simple";
import dotenv from "dotenv";

import { pgPool, initDb, getIsPostgres } from "./server/db.js";
import authRouter, { authCallbackRouter } from "./server/routes/auth.js";
import profileRouter from "./server/routes/profile.js";
import historyRouter from "./server/routes/history.js";
import aiRouter from "./server/routes/ai.js";
import { errorHandler } from "./server/middleware/errors.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === "production";

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  if (isProduction) {
    throw new Error("SESSION_SECRET must be set in production. Refusing to start with an insecure default.");
  }
  console.warn("[dev] SESSION_SECRET is not set - using a random secret (sessions reset on restart).");
  return crypto.randomBytes(32).toString("hex");
}

async function startServer() {
  const sessionSecret = getSessionSecret();
  await initDb();
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isPostgres = getIsPostgres();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));

  // Trust proxy is required for secure cookies behind a reverse proxy (like Render/Koyeb/Vercel)
  if (isProduction) {
    app.set("trust proxy", 1);
  }

  const PgStore = pgSession(session);

  app.use(
    session({
      store: isPostgres
        ? new PgStore({
            pool: pgPool!,
            tableName: "session",
          })
        : undefined,
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        // Secure cookies are only sent over HTTPS; on http://localhost express-session
        // would silently drop them, so enable them only in production.
        secure: isProduction,
        // SameSite=None (cross-origin iframe support) requires Secure.
        sameSite: isProduction ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      },
    })
  );

  // Serve uploaded avatars. nosniff + restrictive CSP prevent uploaded files from executing as pages.
  app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"), {
      dotfiles: "deny",
      index: false,
      setHeaders: (res) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Security-Policy", "default-src 'none'; img-src 'self'; sandbox");
      },
    })
  );

  app.use("/api/auth", authRouter);
  app.use("/auth", authCallbackRouter);
  app.use("/api/profile", profileRouter);
  app.use("/api/history", historyRouter);
  app.use("/api/ai", aiRouter);

  // Unknown API routes should return JSON 404 instead of the SPA HTML.
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.use(errorHandler);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
