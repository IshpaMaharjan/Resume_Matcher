export interface Resume {
  id: string;
  content: string;
  title: string;
  source: 'text' | 'file';
  fileName?: string;
}

export interface MatchResult {
  resume: Resume;
  score: number;
  percentage: number;
  matchedKeywords: string[];
  totalKeywords: number;
  breakdown: {
    skills: number;
    experience: number;
    education: number;
    general: number;
  };
}

export interface KeywordCategories {
  skills: string[];
  experience: string[];
  education: string[];
  general: string[];
}