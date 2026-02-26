export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
}

export interface CVAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  optimizedContent: string;
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
