import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import session from "express-session";
import pgSession from "connect-pg-simple";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import multer from "multer";
import fs from "fs";
import pg from "pg";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";

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
        target_role TEXT,
        experience_level TEXT,
        linkedin_url TEXT,
        github_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS target_role TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS experience_level TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS github_url TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences TEXT;

      CREATE TABLE IF NOT EXISTS cv_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        cv_text TEXT,
        job_description TEXT,
        analysis_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      ) WITH (OIDS=FALSE);
      
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 
          FROM pg_constraint 
          WHERE conname = 'session_pkey'
        ) THEN
          ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
        END IF;
      END $$;
      
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
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
        target_role TEXT,
        experience_level TEXT,
        linkedin_url TEXT,
        github_url TEXT,
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
    
    // SQLite doesn't support ADD COLUMN IF NOT EXISTS in all versions, so we try/catch
    const columns = ['target_role', 'experience_level', 'linkedin_url', 'github_url', 'preferences'];
    for (const col of columns) {
      try {
        await db.exec(`ALTER TABLE users ADD COLUMN ${col} TEXT`);
      } catch (e) {
        // Ignore error if column already exists
      }
    }
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
      const user = await db.get("SELECT id, email, name, avatar, bio, theme, target_role, experience_level, linkedin_url, github_url, preferences FROM users WHERE id = ?", [userId]);
      if (user && user.preferences) {
        user.preferences = JSON.parse(user.preferences);
      }
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

  // Google OAuth Routes
  const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  app.get("/api/auth/google/url", (req, res) => {
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

  app.get("/auth/google/callback", async (req, res) => {
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

      const { email, name, picture, sub: googleId } = userInfo.data;

      // Find or create user
      let user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
      if (!user) {
        const info = await db.run(
          "INSERT INTO users (email, name, avatar) VALUES (?, ?, ?)",
          [email, name, picture]
        );
        user = await db.get("SELECT * FROM users WHERE id = ?", [info.lastInsertRowid]);
      } else if (!user.avatar && picture) {
        await db.run("UPDATE users SET avatar = ? WHERE id = ?", [picture, user.id]);
        user.avatar = picture;
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
      console.error("Google OAuth error:", error);
      res.status(500).send("Authentication failed");
    }
  });

  // Profile Routes
  app.post("/api/profile/update", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { name, bio, theme, target_role, experience_level, linkedin_url, github_url, preferences } = req.body;
    await db.run(
      "UPDATE users SET name = ?, bio = ?, theme = ?, target_role = ?, experience_level = ?, linkedin_url = ?, github_url = ?, preferences = ? WHERE id = ?", 
      [name, bio, theme || 'light', target_role, experience_level, linkedin_url, github_url, JSON.stringify(preferences), userId]
    );
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
