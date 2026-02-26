import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import session from "express-session";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import multer from "multer";
import fs from "fs";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database Abstraction
const isPostgres = !!process.env.DATABASE_URL;
let pgPool: pg.Pool | null = null;
let sqliteDb: any = null;

if (isPostgres) {
  pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
} else {
  sqliteDb = new Database("database.sqlite");
}

const db = {
  get: async (sql: string, params: any[] = []) => {
    if (isPostgres) {
      let count = 1;
      const pgSql = sql.replace(/\?/g, () => `$${count++}`);
      const res = await pgPool!.query(pgSql, params);
      return res.rows[0];
    } else {
      return sqliteDb.prepare(sql).get(...params);
    }
  },
  all: async (sql: string, params: any[] = []) => {
    if (isPostgres) {
      let count = 1;
      const pgSql = sql.replace(/\?/g, () => `$${count++}`);
      const res = await pgPool!.query(pgSql, params);
      return res.rows;
    } else {
      return sqliteDb.prepare(sql).all(...params);
    }
  },
  run: async (sql: string, params: any[] = []) => {
    if (isPostgres) {
      let count = 1;
      let pgSql = sql.replace(/\?/g, () => `$${count++}`);
      if (pgSql.trim().toUpperCase().startsWith("INSERT")) {
        pgSql += " RETURNING id";
      }
      const res = await pgPool!.query(pgSql, params);
      return { lastInsertRowid: res.rows[0]?.id };
    } else {
      const info = sqliteDb.prepare(sql).run(...params);
      return { lastInsertRowid: info.lastInsertRowid };
    }
  },
  exec: async (sql: string) => {
    if (isPostgres) {
      await pgPool!.query(sql);
    } else {
      sqliteDb.exec(sql);
    }
  }
};

async function initDb() {
  if (isPostgres) {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE,
        password TEXT,
        name TEXT,
        avatar TEXT,
        bio TEXT,
        theme TEXT DEFAULT 'light',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS cv_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        cv_text TEXT,
        job_description TEXT,
        analysis_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } else {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        name TEXT,
        avatar TEXT,
        bio TEXT,
        theme TEXT DEFAULT 'light',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS cv_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        cv_text TEXT,
        job_description TEXT,
        analysis_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
    `);
  }
}

// Configure Multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/avatars";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

async function startServer() {
  await initDb();
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(
    session({
      secret: "cv-to-ai-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      },
    })
  );

  // Serve uploads statically
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
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

  app.post("/api/auth/login", async (req, res) => {
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

  app.get("/api/auth/me", async (req, res) => {
    const userId = (req.session as any).userId;
    if (userId) {
      const user = await db.get("SELECT id, email, name, avatar, bio, theme FROM users WHERE id = ?", [userId]);
      res.json(user);
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // Profile Routes
  app.post("/api/profile/update", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { name, bio, theme } = req.body;
    await db.run("UPDATE users SET name = ?, bio = ?, theme = ? WHERE id = ?", [name, bio, theme || 'light', userId]);
    res.json({ success: true });
  });

  app.post("/api/profile/avatar", upload.single("avatar"), async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const avatarPath = `/uploads/avatars/${req.file?.filename}`;
    await db.run("UPDATE users SET avatar = ? WHERE id = ?", [avatarPath, userId]);
    res.json({ avatar: avatarPath });
  });

  // CV History Routes
  app.post("/api/history/save", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { cvText, jobDescription, analysis } = req.body;
    await db.run("INSERT INTO cv_history (user_id, cv_text, job_description, analysis_json) VALUES (?, ?, ?, ?)", 
      [userId, cvText, jobDescription, JSON.stringify(analysis)]);
    res.json({ success: true });
  });

  app.get("/api/history", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const history = await db.all("SELECT * FROM cv_history WHERE user_id = ? ORDER BY created_at DESC", [userId]);
    res.json(history.map((h: any) => ({ ...h, analysis: JSON.parse(h.analysis_json) })));
  });

  app.delete("/api/history/:id", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    await db.run("DELETE FROM cv_history WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    res.json({ success: true });
  });

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
