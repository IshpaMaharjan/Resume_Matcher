import { KeywordCategories } from '../types';

// Common stop words to filter out
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has',
  'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
  'shall', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we',
  'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our',
  'their', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'any', 'both',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
  'own', 'same', 'so', 'than', 'too', 'very', 'just', 'now', 'also', 'here', 'there',
  'then', 'once', 'during', 'before', 'after', 'above', 'below', 'between', 'through',
  'into', 'over', 'under', 'again', 'further', 'up', 'down', 'out', 'off', 'above'
]);

// Skill keywords (commonly sought after in job descriptions)
const SKILL_KEYWORDS = new Set([
  'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node', 'express',
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'docker', 'kubernetes',
  'aws', 'azure', 'gcp', 'git', 'agile', 'scrum', 'api', 'rest', 'graphql',
  'html', 'css', 'typescript', 'php', 'ruby', 'go', 'rust', 'c++', 'c#',
  'machine learning', 'ai', 'data science', 'analytics', 'visualization',
  'excel', 'powerbi', 'tableau', 'figma', 'sketch', 'photoshop', 'illustrator'
]);

// Experience keywords
const EXPERIENCE_KEYWORDS = new Set([
  'lead', 'senior', 'junior', 'manager', 'director', 'architect', 'developer',
  'engineer', 'analyst', 'consultant', 'specialist', 'coordinator', 'associate',
  'intern', 'freelance', 'contractor', 'full-time', 'part-time', 'remote'
]);

// Education keywords
const EDUCATION_KEYWORDS = new Set([
  'bachelor', 'master', 'phd', 'degree', 'university', 'college', 'certification',
  'certified', 'diploma', 'course', 'training', 'bootcamp', 'workshop', 'seminar'
]);

export function extractKeywords(text: string): KeywordCategories {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));

  // Extract phrases (2-3 words) for better context
  const phrases: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    const phrase2 = `${words[i]} ${words[i + 1]}`;
    phrases.push(phrase2);
    
    if (i < words.length - 2) {
      const phrase3 = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      phrases.push(phrase3);
    }
  }

  const allTerms = [...words, ...phrases];
  
  const categories: KeywordCategories = {
    skills: [],
    experience: [],
    education: [],
    general: []
  };

  // Count frequency and categorize
  const frequency = new Map<string, number>();
  
  allTerms.forEach(term => {
    frequency.set(term, (frequency.get(term) || 0) + 1);
  });

  // Sort by frequency and categorize
  const sortedTerms = Array.from(frequency.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([term]) => term);

  sortedTerms.forEach(term => {
    if (SKILL_KEYWORDS.has(term) || isSkillKeyword(term)) {
      categories.skills.push(term);
    } else if (EXPERIENCE_KEYWORDS.has(term)) {
      categories.experience.push(term);
    } else if (EDUCATION_KEYWORDS.has(term)) {
      categories.education.push(term);
    } else if (frequency.get(term)! > 1 || term.length > 4) {
      categories.general.push(term);
    }
  });

  // Limit categories to most relevant terms
  categories.skills = categories.skills.slice(0, 20);
  categories.experience = categories.experience.slice(0, 10);
  categories.education = categories.education.slice(0, 10);
  categories.general = categories.general.slice(0, 15);

  return categories;
}

function isSkillKeyword(term: string): boolean {
  // Common patterns for skills
  const skillPatterns = [
    /\w+(js|py|sql|css|html)$/,
    /^(web|mobile|frontend|backend|fullstack|devops)/,
    /(development|programming|coding|scripting)/,
    /(framework|library|tool|platform)/
  ];
  
  return skillPatterns.some(pattern => pattern.test(term));
}

export function calculateMatchScore(jobKeywords: KeywordCategories, resumeText: string): {
  score: number;
  percentage: number;
  matchedKeywords: string[];
  breakdown: { skills: number; experience: number; education: number; general: number };
} {
  const resumeLower = resumeText.toLowerCase();
  const allJobKeywords = [
    ...jobKeywords.skills,
    ...jobKeywords.experience,
    ...jobKeywords.education,
    ...jobKeywords.general
  ];

  const matchedKeywords: string[] = [];
  const breakdown = { skills: 0, experience: 0, education: 0, general: 0 };

  // Check for matches with different weights
  jobKeywords.skills.forEach(keyword => {
    if (resumeLower.includes(keyword)) {
      matchedKeywords.push(keyword);
      breakdown.skills++;
    }
  });

  jobKeywords.experience.forEach(keyword => {
    if (resumeLower.includes(keyword)) {
      matchedKeywords.push(keyword);
      breakdown.experience++;
    }
  });

  jobKeywords.education.forEach(keyword => {
    if (resumeLower.includes(keyword)) {
      matchedKeywords.push(keyword);
      breakdown.education++;
    }
  });

  jobKeywords.general.forEach(keyword => {
    if (resumeLower.includes(keyword)) {
      matchedKeywords.push(keyword);
      breakdown.general++;
    }
  });

  // Weighted scoring: skills are most important
  const weightedScore = (breakdown.skills * 3) + 
                       (breakdown.experience * 2) + 
                       (breakdown.education * 1.5) + 
                       (breakdown.general * 1);

  const maxPossibleScore = (jobKeywords.skills.length * 3) + 
                          (jobKeywords.experience.length * 2) + 
                          (jobKeywords.education.length * 1.5) + 
                          (jobKeywords.general.length * 1);

  const percentage = maxPossibleScore > 0 ? (weightedScore / maxPossibleScore) * 100 : 0;

  return {
    score: weightedScore,
    percentage: Math.round(percentage),
    matchedKeywords: [...new Set(matchedKeywords)], // Remove duplicates
    breakdown
  };
}