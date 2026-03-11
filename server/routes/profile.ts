import express from "express";
import multer from "multer";
import fs from "fs";
import { db } from "../db.js";

const router = express.Router();

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

router.post("/update", async (req, res) => {
  const userId = (req.session as any).userId;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { name, bio, theme, target_role, experience_level, linkedin_url, github_url, preferences } = req.body;
  
  const updates: string[] = [];
  const params: any[] = [];

  if (name !== undefined) { updates.push("name = ?"); params.push(name); }
  if (bio !== undefined) { updates.push("bio = ?"); params.push(bio); }
  if (theme !== undefined) { updates.push("theme = ?"); params.push(theme); }
  if (target_role !== undefined) { updates.push("target_role = ?"); params.push(target_role); }
  if (experience_level !== undefined) { updates.push("experience_level = ?"); params.push(experience_level); }
  if (linkedin_url !== undefined) { updates.push("linkedin_url = ?"); params.push(linkedin_url); }
  if (github_url !== undefined) { updates.push("github_url = ?"); params.push(github_url); }
  if (preferences !== undefined) { updates.push("preferences = ?"); params.push(JSON.stringify(preferences)); }

  if (updates.length > 0) {
    params.push(userId);
    await db.run(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params);
  }

  res.json({ success: true });
});

router.post("/avatar", upload.single("avatar"), async (req, res) => {
  const userId = (req.session as any).userId;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  if (req.file) {
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await db.run("UPDATE users SET avatar = ? WHERE id = ?", [avatarUrl, userId]);
    res.json({ avatar: avatarUrl });
  } else {
    res.status(400).json({ error: "No file uploaded" });
  }
});

export default router;
