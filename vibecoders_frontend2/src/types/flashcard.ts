export interface Flashcard {
  id: number;
  question: string;
  answer: string;
  category: string;
  isBookmarked?: boolean;
}

export interface FlashcardSet {
  id: number;
  title: string;
  description: string;
  cards: Flashcard[];
  progress: number;
}
