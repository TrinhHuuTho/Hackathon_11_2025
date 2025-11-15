export interface FlashcardHistory {
  id: number;
  setTitle: string;
  cardsStudied: number;
  totalCards: number;
  completedAt: string;
  score: number;
}

export interface SavedFlashcard {
  id: number;
  question: string;
  answer: string;
  category: string;
  savedAt: string;
  setTitle: string;
}

export interface QuizHistory {
  id: number;
  title: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  timeSpent: number; // in minutes
  passed: boolean;
}

export interface Feedback {
  id: number;
  assignmentTitle: string;
  submittedAt: string;
  gradedAt: string;
  score: number;
  maxScore: number;
  feedback: string;
  status: "excellent" | "good" | "average" | "needs-improvement";
}
