// Client-side API wrappers. All Gemini calls run on the server (/api/ai/*),
// so the API key never ships in the browser bundle.
import type { CVAnalysis, SkillsGap, LinkedInOptimization, User, JobOffer } from "../types";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const post = async <T>(path: string, body: unknown): Promise<T> => {
  const res = await fetch(`/api/ai/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data?.error || `Request failed (${res.status})`);
  }
  return data as T;
};

export const analyzeCV = (cvText: string, jobDescription: string, language: string = "pl", preferences?: User["preferences"]) =>
  post<CVAnalysis>("analyze", { cvText, jobDescription, language, preferences });

export const generateCoverLetter = async (cvText: string, jobDescription: string, language: string = "pl", customDetails?: string) =>
  (await post<{ text: string }>("cover-letter", { cvText, jobDescription, language, customDetails })).text;

export const generateInterviewQuestions = (cvText: string, jobDescription: string, language: string = "pl") =>
  post<string[]>("interview", { cvText, jobDescription, language });

export const analyzeSkillsGap = (cvText: string, jobDescription: string, language: string = "pl") =>
  post<SkillsGap>("skills-gap", { cvText, jobDescription, language });

export const optimizeLinkedIn = (cvText: string, language: string = "pl") =>
  post<LinkedInOptimization>("linkedin", { cvText, language });

export const findJobOffers = (cvText: string, language: string = "pl") =>
  post<JobOffer[]>("jobs", { cvText, language });
