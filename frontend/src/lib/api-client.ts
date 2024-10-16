import Axios, { InternalAxiosRequestConfig } from "axios";

// import { useNotifications } from '@/components/ui/notifications';
import { env } from "@/config/env";

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = "application/json";
  }

  config.withCredentials = true;
  return config;
}

export const api = Axios.create({
  baseURL: env.BACKEND_API_URL,
});

api.interceptors.request.use(authRequestInterceptor);
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      const searchParams = new URLSearchParams();
      const redirectTo = searchParams.get("redirectTo");
      if (!redirectTo) {
        window.location.href = `/login`;
      } else {
        window.location.href = `/login?redirectTo=${redirectTo}`;
      }
    }

    return Promise.reject(error);
  },
);
