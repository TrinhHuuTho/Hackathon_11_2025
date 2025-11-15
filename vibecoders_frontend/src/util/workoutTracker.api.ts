import axios from "./axios.customize";

export interface UploadResponse {
  fileUrl: string;
  fileType: "image" | "video";
  fileName: string;
}
export interface SaveWorkoutRequest {
  score: number;
  comment: string;
  note?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
}

export interface WorkoutRecord {
  id: string;        
  fileUrl: string;    
  score: number;      
  comment: string;   
  note: string;       
  email: string;      
  createdAt: string; 
}

const uploadMediaApi = async (file: File): Promise<any> => {
  try {
    const URL_API = "/api/workout-tracker/tracker";

    const formData = new FormData();
    formData.append("files", file);

    const response = await axios.post<any>(URL_API, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

const saveWorkoutApi = async (
  workoutData: SaveWorkoutRequest,
  files?: File[]
) => {
  try {
    const URL_API = "/api/workout-tracker/save-tracker";

    const formData = new FormData();
    formData.append("workoutTrackerDTO", JSON.stringify(workoutData));

    if (files && files.length > 0) {
      files.forEach((file) => formData.append("files", file));
    }

    const response = await axios.post<any>(URL_API, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

const getWorkoutHistoryApi = async (page = 0, size = 10): Promise<any> => {
  try {
    const response = await axios.get<any>(
      `/api/workout-tracker/history?page=${page}&size=${size}`
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export { uploadMediaApi,saveWorkoutApi,getWorkoutHistoryApi };
