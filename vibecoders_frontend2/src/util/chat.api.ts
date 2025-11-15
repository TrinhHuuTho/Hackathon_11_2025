interface ApiChatRequest {
  query: string;
  mail: string;
  conversationId: string | null;
}

export interface ApiContextDTO {
  retrieved_count: number;
  context_used: boolean;
  sources: any[];
  context_text: string | null;
}

export interface ApiChatResponse {
  answer: string;
  context: ApiContextDTO;
  conversation_id: string;
  timestamp: string;
  processing_time: number;
  retrieved_documents: any[];
}

import axios from "./axios.customize";

const CHAT_API_URL = "/api/chatbot";

export const postChatMessage = async (
  query: string,
  mail: string,
  conversationId: string | null
): Promise<ApiChatResponse> => {
  const requestBody: ApiChatRequest = {
    query,
    mail,
    conversationId,
  };

  const response = await axios.post<ApiChatResponse>(CHAT_API_URL, requestBody);
  return response.data;
};
