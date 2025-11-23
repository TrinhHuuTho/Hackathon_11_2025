import axios from "./axios.customize";
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  addCalendar: boolean;
}

const API_URL = "/api/notes";

export const addNoteApi = async (note: Note) => {
  return axios.post(API_URL, note);
};

export const deleteNoteApi = async (noteId: string) => {
  return axios.delete(`${API_URL}/${noteId}`);
};

export const getNotesApi = async (
  page: number,
  size: number,
  keyword: string
) => {
  const res = await axios.get(
    `${API_URL}?page=${page}&size=${size}&keyword=${keyword}`
  );
  console.log("API Response:", res.data);
  return res.data;
};
