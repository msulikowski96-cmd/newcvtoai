export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  theme?: 'light' | 'dark';
  target_role?: string;
  experience_level?: string;
  linkedin_url?: string;
  github_url?: string;
  preferences?: {
    include_projects?: boolean;
    emphasized_keywords?: string[];
    summary_tone?: 'professional' | 'creative' | 'minimalist' | 'bold';
    preferred_sections?: string[];
  };
}

export interface CVHistoryItem {
  id: number;
  cv_text: string;
  job_description: string;
  analysis: CVAnalysis;
  created_at: string;
}

export interface CVAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  optimizedContent: string;
  atsBreakdown: {
    formatting: { score: number; feedback: string };
    keywords: { score: number; feedback: string };
    structure: { score: number; feedback: string };
    relevance: { score: number; feedback: string };
    impact: { score: number; feedback: string };
  };
}

export interface SkillsGap {
  matchPercentage: number;
  missingSkills: { skill: string; importance: 'high' | 'medium' | 'low'; reason: string }[];
  learningPath: { step: string; resourceType: string; duration: string }[];
  careerAdvice: string;
}

export interface LinkedInOptimization {
  headline: string;
  about: string;
  experienceBulletPoints: string[];
  skillsToHighlight: string[];
}
