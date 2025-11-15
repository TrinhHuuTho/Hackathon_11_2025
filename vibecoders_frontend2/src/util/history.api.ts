import instance from "./axios.customize";
import { FlashCard, QuizAnswerDto } from "@/types/history";

interface ResponseData<T> {
  data: T;
  message: string;
  status: number;
}

/**
 * Get flashcard history for the current user
 * @returns List of flashcards created by the user
 */
export const getFlashCardHistory = async (): Promise<FlashCard[]> => {
  try {
    const response = await instance.get<any, ResponseData<FlashCard[]>>(
      "/api/histories/flashcards"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching flashcard history:", error);
    throw error;
  }
};

/**
 * Get quiz history for the current user
 * @returns List of quiz answers submitted by the user
 */
export const getQuizHistory = async (): Promise<QuizAnswerDto[]> => {
  try {
    const response = await instance.get<any, ResponseData<QuizAnswerDto[]>>(
      "/api/histories/quizs"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching quiz history:", error);
    throw error;
  }
};

/**
 * Get flashcard detail by ID
 * @param id - Flashcard ID
 * @returns Flashcard detail
 */
export const getFlashCardById = async (id: string): Promise<FlashCard> => {
  try {
    const response = await instance.get<any, ResponseData<FlashCard>>(
      `/api/histories/flashcards/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching flashcard detail:", error);
    throw error;
  }
};

/**
 * Get quiz detail by ID
 * @param id - Quiz ID
 * @returns Quiz detail
 */
export const getQuizById = async (id: string): Promise<QuizAnswerDto> => {
  try {
    const response = await instance.get<any, ResponseData<QuizAnswerDto>>(
      `/api/histories/quiz/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching quiz detail:", error);
    throw error;
  }
};
