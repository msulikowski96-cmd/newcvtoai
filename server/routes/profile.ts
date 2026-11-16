import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { db } from "../db.js";
import { asyncHandler, HttpError } from "../middleware/errors.js";

const router = express.Router();

const AVATAR_DIR = path.resolve("uploads", "avatars");

// Only real image types are accepted; the extension is derived from the MIME type,
// never from the user-supplied filename (prevents uploading .html/.svg -> stored XSS).
const ALLOWED_AVATAR_TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(AVATAR_DIR, { recursive: true });
    cb(null, AVATAR_DIR);
  },
  filename: (_req, file, cb) => {
    cb(null, `${crypto.randomUUID()}${ALLOWED_AVATAR_TYPES[file.mimetype]}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_AVATAR_TYPES[file.mimetype]) cb(null, true);
    else cb(new HttpError(400, "Only PNG, JPEG, WEBP or GIF images are allowed"));
  },
});

// Check file signatures so a script renamed/mislabelled as an image is rejected.
const looksLikeImage = (filePath: string) => {
  const fd = fs.openSync(filePath, "r");
  const buf = Buffer.alloc(12);
  try {
    fs.readSync(fd, buf, 0, 12, 0);
  } finally {
    fs.closeSync(fd);
  }
  const isPng = buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const isGif = buf.subarray(0, 4).toString("ascii") === "GIF8";
  const isWebp = buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP";
  return isPng || isJpeg || isGif || isWebp;
};

const requireUser = (req: express.Request) => {
  const userId = (req.session as any).userId;
  if (!userId) throw new HttpError(401, "Not authenticated");
  return userId as number;
};

const optionalString = (value: unknown, field: string, max: number) => {
  if (value === null) return null;
  if (typeof value !== "string") throw new HttpError(400, `Invalid field: ${field}`);
  if (value.length > max) throw new HttpError(400, `Field too long: ${field}`);
  return value;
};

const optionalUrl = (value: unknown, field: string) => {
  const str = optionalString(value, field, 300);
  if (str && !/^https?:\/\//i.test(str)) throw new HttpError(400, `${field} must start with http:// or https://`);
  return str;
};

router.post(
  "/update",
  asyncHandler(async (req, res) => {
    const userId = requireUser(req);
    const { name, bio, theme, target_role, experience_level, linkedin_url, github_url, preferences } = req.body ?? {};

    const updates: string[] = [];
    const params: any[] = [];
    const set = (column: string, value: unknown) => {
      updates.push(`${column} = ?`);
      params.push(value);
    };

    if (name !== undefined) set("name", optionalString(name, "name", 100));
    if (bio !== undefined) set("bio", optionalString(bio, "bio", 2000));
    if (theme !== undefined) {
      if (theme !== "light" && theme !== "dark") throw new HttpError(400, "Invalid theme");
      set("theme", theme);
    }
    if (target_role !== undefined) set("target_role", optionalString(target_role, "target_role", 200));
    if (experience_level !== undefined) set("experience_level", optionalString(experience_level, "experience_level", 100));
    if (linkedin_url !== undefined) set("linkedin_url", optionalUrl(linkedin_url, "linkedin_url"));
    if (github_url !== undefined) set("github_url", optionalUrl(github_url, "github_url"));
    if (preferences !== undefined) {
      const json = JSON.stringify(preferences ?? null);
      if (json.length > 10_000) throw new HttpError(400, "Preferences too large");
      set("preferences", json);
    }

    if (updates.length > 0) {
      params.push(userId);
      await db.run(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params);
    }

    res.json({ success: true });
  })
);

router.post(
  "/avatar",
  // Reject unauthenticated uploads before anything is written to disk.
  (req, _res, next) => {
    try {
      requireUser(req);
      next();
    } catch (err) {
      next(err);
    }
  },
  (req, res, next) => {
    upload.single("avatar")(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        return next(new HttpError(err.code === "LIMIT_FILE_SIZE" ? 413 : 400, err.code === "LIMIT_FILE_SIZE" ? "File too large (max 2 MB)" : err.message));
      }
      next(err);
    });
  },
  asyncHandler(async (req, res) => {
    const userId = requireUser(req);
    if (!req.file) throw new HttpError(400, "No file uploaded");

    if (!looksLikeImage(req.file.path)) {
      fs.rmSync(req.file.path, { force: true });
      throw new HttpError(400, "Uploaded file is not a valid image");
    }

    const previous = await db.get("SELECT avatar FROM users WHERE id = ?", [userId]);
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await db.run("UPDATE users SET avatar = ? WHERE id = ?", [avatarUrl, userId]);

    // Remove the previous locally stored avatar (if any) to avoid orphaned files.
    if (typeof previous?.avatar === "string" && previous.avatar.startsWith("/uploads/avatars/")) {
      const oldPath = path.join(AVATAR_DIR, path.basename(previous.avatar));
      fs.rm(oldPath, { force: true }, () => {});
    }

    res.json({ avatar: avatarUrl });
  })
);

export default router;
