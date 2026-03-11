import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import session from "express-session";
import pgSession from "connect-pg-simple";
import dotenv from "dotenv";

import { db, pgPool, initDb, getIsPostgres } from "./server/db.js";
import authRouter, { authCallbackRouter } from "./server/routes/auth.js";
import profileRouter from "./server/routes/profile.js";
import historyRouter from "./server/routes/history.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  await initDb();
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isPostgres = getIsPostgres();

  app.use(express.json());
  
  // Trust proxy is required for secure cookies behind a reverse proxy (like Koyeb/Vercel)
  if (process.env.NODE_ENV === "production") {
    app.set('trust proxy', 1);
  }

  const PgStore = pgSession(session);

  app.use(
    session({
      store: isPostgres ? new PgStore({
        pool: pgPool!,
        tableName: 'session'
      }) : undefined,
      secret: process.env.SESSION_SECRET || "cv-to-ai-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: true, // Required for SameSite=None
        sameSite: "none", // Required for cross-origin iframe
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      },
    })
  );

  // Serve uploads statically
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  // Use extracted routes
  app.use("/api/auth", authRouter);
  app.use("/auth", authCallbackRouter);
  app.use("/api/profile", profileRouter);
  app.use("/api/history", historyRouter);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
