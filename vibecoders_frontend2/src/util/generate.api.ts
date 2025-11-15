import axios from "./axios.customize";
const API_URL = "/api/generate";
const API_FLASHCARD_URL = "/api/flashcards";
const API_QUIZ_URL = "/api/quiz";

interface FlashcardRequest {
  sections: SubSection[];
  config: {
    n_flashcards: number;
    types: string[];
  };
}

interface SubSection {
  id: string;
  summary: string;
}

const saveSummaryText = async (summaryText: string) => {
  try {
    const formData = new FormData();
    formData.append("summary", summaryText);

    const response = await axios.post(`${API_URL}/saveSummary`, formData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

const getSummaryText = async (imageFile: File) => {
  try {
    const formData = new FormData();
    formData.append("file", imageFile); // tên "file" phải trùng với backend

    const response = await axios.post(`${API_URL}/summarize`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

const generateFlashcards = async (
  summaryText: string,
  nFlashcards: number = 10,
  types: string[] = ["definition", "question"]
) => {
  try {
    const requestBody: FlashcardRequest = {
      sections: [
        {
          id: "section_1",
          summary: summaryText,
        },
      ],
      config: {
        n_flashcards: nFlashcards,
        types: types,
      },
    };

    const response = await axios.post(
      `${API_FLASHCARD_URL}/generate`,
      requestBody
    );

    return response.data; // backend trả về list flashcards
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

const generateQuiz = async (
  summaryText: string,
  nQuestions: number = 10,
  types: string[] = ["fill_blank", "mcq", "tf"]
) => {
  try {
    const requestBody = {
      sections: [
        {
          id: "section_1",
          summary: summaryText,
        },
      ],
      config: {
        n_questions: nQuestions,
        types: types,
      },
    };

    const response = await axios.post(`${API_QUIZ_URL}/generate`, requestBody);

    return response.data; // backend trả về quiz questions
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

const saveQuizAnswer = async (quizAnswerData: any) => {
  try {
    const response = await axios.post(`${API_QUIZ_URL}/save`, quizAnswerData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export default {
  getSummaryText,
  generateFlashcards,
  generateQuiz,
  saveSummaryText,
  saveQuizAnswer,
};
