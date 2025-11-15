import axios from "./axios.customize";
interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
  userDto?: {
    userId: string;
    userName: string;
    email: string;
    onboarding: boolean;
  };
}

const registerApi = async (
  fullName: string,
  email: string,
  password: string
) => {
  try {
    const URL_API = "/api/auth/signup";

    const data: CreateUserPayload = { fullName, email, password };
    const response = await axios.post(URL_API, data);

    return response as unknown as any;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

const loginApi = async (email: string, password: string) => {
  try {
    const URL_API = "/api/auth/login";

    const data: LoginPayload = { email, password };
    const response = await axios.post<LoginResponse>(URL_API, data);
    console.log("Login response:", response);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

const refreshTokenApi = async () => {
  try {
    const URL_API = "/api/auth/refresh";
    const refreshToken = localStorage.getItem("refresh_token");

    const response = await axios.post(
      URL_API,
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );

    return response as unknown as any;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

const getProfileApi = async () => {
  try {
    const URL_API = "/api/auth/profile";
    const response = await axios.get<any>(URL_API);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export { registerApi, loginApi, getProfileApi };
