import express from "express";
import { db } from "../db.js";
import { asyncHandler, HttpError } from "../middleware/errors.js";

const router = express.Router();

const MAX_TEXT = 50_000;

const requireUser = (req: express.Request) => {
  const userId = (req.session as any).userId;
  if (!userId) throw new HttpError(401, "Not authenticated");
  return userId as number;
};

const safeParse = (json: string) => {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
};

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const userId = requireUser(req);
    const history = await db.all("SELECT * FROM cv_history WHERE user_id = ? ORDER BY created_at DESC", [userId]);

    res.json(
      history.map((item: any) => ({
        ...item,
        analysis: safeParse(item.analysis_json),
      }))
    );
  })
);

router.post(
  "/save",
  asyncHandler(async (req, res) => {
    const userId = requireUser(req);
    const { cvText, jobDescription, analysis } = req.body ?? {};

    if (typeof cvText !== "string" || typeof jobDescription !== "string" || !analysis || typeof analysis !== "object") {
      throw new HttpError(400, "Invalid history entry");
    }
    const analysisJson = JSON.stringify(analysis);
    if (cvText.length > MAX_TEXT || jobDescription.length > MAX_TEXT || analysisJson.length > 200_000) {
      throw new HttpError(413, "History entry too large");
    }

    await db.run("INSERT INTO cv_history (user_id, cv_text, job_description, analysis_json) VALUES (?, ?, ?, ?)", [
      userId,
      cvText,
      jobDescription,
      analysisJson,
    ]);

    res.json({ success: true });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const userId = requireUser(req);
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, "Invalid id");

    await db.run("DELETE FROM cv_history WHERE id = ? AND user_id = ?", [id, userId]);
    res.json({ success: true });
  })
);

export default router;
