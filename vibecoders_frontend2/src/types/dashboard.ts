export interface RecentQuiz {
  id: number;
  title: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  subject: string;
  passed: boolean;
}

export interface PopularTheory {
  id: number;
  title: string;
  description: string;
  category: string;
  views: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: number; // in minutes
  imageUrl?: string;
}

export interface PopularQuestion {
  id: number;
  question: string;
  answer: string;
  category: string;
  askedCount: number;
  helpfulCount: number;
  lastAsked: string;
}

export interface LearningStreak {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
}

export interface UserProgress {
  completedCourses: number;
  inProgressCourses: number;
  totalQuizzes: number;
  averageScore: number;
}
