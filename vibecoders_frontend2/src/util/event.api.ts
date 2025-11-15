import axios from "./axios.customize";

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  color: string;
  eventDateTime: string;
}

const API_URL = "/api/events";

export const getEventsApi = async (): Promise<any> => {
  const res = await axios.get<Event[]>(API_URL);
  return res.data;
};

export const addEventApi = async (event: Event): Promise<Event> => {
  const res = await axios.post<Event>(API_URL, event);
  return res.data;
};

export const deleteEventApi = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
