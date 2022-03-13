import { getAccessToken, setAccessToken } from "@/utils";
import Axios from "axios";
import { authService } from "./authService";

const client = Axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "/api"
      : "http://localhost:3030/api",
  withCredentials: true,
});

client.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (!accessToken) return config;
  if (!config.headers) config.headers = {};
  config.headers["authorization"] = `Bearer ${accessToken}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 403) {
      const accessToken = await authService.refreshToken();
      setAccessToken(accessToken);
      return client(error.config);
    }
    return Promise.reject(error);
  }
);
export default client;
