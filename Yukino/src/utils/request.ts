import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

const instance: AxiosInstance = axios.create({
  timeout: 5000,
  baseURL: "http://localhost:3000",
});

instance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error),
);

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error) => {
    const response = error?.response;
    if (response) {
      console.error(`请求错误，状态码：${response.status}`);
    }
    return Promise.reject(error);
  },
);

export default instance;
