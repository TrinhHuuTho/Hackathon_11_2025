// Backend response types
export interface FlashCard {
  id: string;
  type: string;
  cards: Card[];
  isSaved: boolean;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  front: string;
  back: string;
}

export interface QuizSet {
  id: string | null;
  title?: string;
  questions: QuizQuestion[];
  meta?: any;
}

export interface QuizQuestion {
  id: string;
  type: "mcq" | "fill_blank" | "tf";
  stem: string;
  options: string[] | null;
  answer: string;
  difficulty: string | null;
  source_sections: string[];
}

export interface QuizAnswerDto {
  id: string;
  quizSets: QuizSet;
  userAnswers: string[];
  email: string;
}

// Frontend display types (legacy)
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
