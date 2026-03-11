import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const isPostgres = !!process.env.DATABASE_URL;
export let pgPool: pg.Pool | null = null;
let sqliteDb: any = null;

if (isPostgres) {
  pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
} else {
  sqliteDb = new Database("database.sqlite");
}

export const db = {
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

export const getIsPostgres = () => isPostgres;

export async function initDb() {
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
