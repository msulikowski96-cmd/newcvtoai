import express from "express";
import { db } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const userId = (req.session as any).userId;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const history = await db.all(
    "SELECT * FROM cv_history WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  
  const formattedHistory = history.map((item: any) => ({
    ...item,
    analysis: JSON.parse(item.analysis_json)
  }));
  
  res.json(formattedHistory);
});

router.post("/save", async (req, res) => {
  const userId = (req.session as any).userId;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { cvText, jobDescription, analysis } = req.body;
  
  await db.run(
    "INSERT INTO cv_history (user_id, cv_text, job_description, analysis_json) VALUES (?, ?, ?, ?)",
    [userId, cvText, jobDescription, JSON.stringify(analysis)]
  );
  
  res.json({ success: true });
});

router.delete("/:id", async (req, res) => {
  const userId = (req.session as any).userId;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  await db.run("DELETE FROM cv_history WHERE id = ? AND user_id = ?", [req.params.id, userId]);
  res.json({ success: true });
});

export default router;
