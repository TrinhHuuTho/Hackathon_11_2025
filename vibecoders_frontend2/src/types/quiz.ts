export interface QuizQuestion {
  id: string;
  type: "fill_blank" | "mcq" | "tf";
  stem: string;
  options: string[] | null;
  answer: string;
  difficulty: string | null;
  source_sections: string[] | null;
}

export interface QuizSet {
  questions: QuizQuestion[];
}

export interface QuizState {
  quizData: QuizQuestion[];
  quizTitle: string;
  quizDescription: string;
}

export interface QuizAnswerDto {
  id?: string;
  quizSets: QuizSet;
  userAnswers: string[];
  passed: boolean;
}
