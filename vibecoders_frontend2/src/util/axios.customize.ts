import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

instance.interceptors.request.use(
  function (config) {
    config.headers.Authorization = `Bearer ${localStorage.getItem(
      "access_token"
    )}`;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);


instance.interceptors.response.use(
  function (response) {
    if (response && response.data) return response.data;
    return response;
  },
  async function (error) {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");

        const newTokenResp = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const newAccessToken = newTokenResp.data;

        localStorage.setItem("access_token", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        console.log("Refresh failed:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


export default instance;