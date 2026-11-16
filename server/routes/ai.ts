import express from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler, HttpError } from "../middleware/errors.js";
import {
  analyzeCV,
  generateCoverLetter,
  generateInterviewQuestions,
  analyzeSkillsGap,
  optimizeLinkedIn,
  findJobOffers,
} from "../services/gemini.js";

const router = express.Router();

// AI calls cost money: limit them per client IP.
router.use(
  rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: Number(process.env.AI_RATE_LIMIT_PER_HOUR) || 30,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many AI requests. Please try again later. (429)" },
  })
);

const MAX_TEXT = 50_000;

const text = (value: unknown, field: string, required = true): string => {
  if (value === undefined || value === null || value === "") {
    if (required) throw new HttpError(400, `Missing field: ${field}`);
    return "";
  }
  if (typeof value !== "string") throw new HttpError(400, `Invalid field: ${field}`);
  if (value.length > MAX_TEXT) throw new HttpError(413, `Field too long: ${field}`);
  return value;
};

const lang = (value: unknown) => (value === "en" ? "en" : "pl");

const sanitizePreferences = (prefs: any) => {
  if (!prefs || typeof prefs !== "object") return undefined;
  const strList = (v: unknown) =>
    Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, 30).map((x) => x.slice(0, 100)) : undefined;
  return {
    include_projects: !!prefs.include_projects,
    emphasized_keywords: strList(prefs.emphasized_keywords),
    summary_tone: typeof prefs.summary_tone === "string" ? prefs.summary_tone.slice(0, 50) : undefined,
    preferred_sections: strList(prefs.preferred_sections),
  };
};

// Translate Gemini quota errors into a 429 the client can recognise.
const callAI = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const msg = String(error?.message || "");
    if (error?.status === 429 || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
      throw new HttpError(429, "AI quota exceeded (429). Please try again later.");
    }
    if (error?.status === 503) throw new HttpError(503, msg);
    throw error;
  }
};

router.post(
  "/analyze",
  asyncHandler(async (req, res) => {
    const { cvText, jobDescription, language, preferences } = req.body ?? {};
    const result = await callAI(() =>
      analyzeCV(text(cvText, "cvText"), text(jobDescription, "jobDescription"), lang(language), sanitizePreferences(preferences) as any)
    );
    res.json(result);
  })
);

router.post(
  "/cover-letter",
  asyncHandler(async (req, res) => {
    const { cvText, jobDescription, language, customDetails } = req.body ?? {};
    const result = await callAI(() =>
      generateCoverLetter(
        text(cvText, "cvText"),
        text(jobDescription, "jobDescription"),
        lang(language),
        text(customDetails, "customDetails", false) || undefined
      )
    );
    res.json({ text: result });
  })
);

router.post(
  "/interview",
  asyncHandler(async (req, res) => {
    const { cvText, jobDescription, language } = req.body ?? {};
    const result = await callAI(() =>
      generateInterviewQuestions(text(cvText, "cvText"), text(jobDescription, "jobDescription"), lang(language))
    );
    res.json(result);
  })
);

router.post(
  "/skills-gap",
  asyncHandler(async (req, res) => {
    const { cvText, jobDescription, language } = req.body ?? {};
    const result = await callAI(() =>
      analyzeSkillsGap(text(cvText, "cvText"), text(jobDescription, "jobDescription"), lang(language))
    );
    res.json(result);
  })
);

router.post(
  "/linkedin",
  asyncHandler(async (req, res) => {
    const { cvText, language } = req.body ?? {};
    const result = await callAI(() => optimizeLinkedIn(text(cvText, "cvText"), lang(language)));
    res.json(result);
  })
);

router.post(
  "/jobs",
  asyncHandler(async (req, res) => {
    const { cvText, language } = req.body ?? {};
    const result = await callAI(() => findJobOffers(text(cvText, "cvText"), lang(language)));
    res.json(result);
  })
);

export default router;
