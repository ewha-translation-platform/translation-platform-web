import { setAccessToken } from "@/utils";
import httpService from "./httpService";

export const authService = {
  async register(createUserDto: CreateUserDto): Promise<string> {
    return await httpService
      .post<{ accessToken: string }>("auth/register", createUserDto, {
        withCredentials: true,
      })
      .then(({ data: { accessToken } }) => {
        setAccessToken(accessToken);
        return accessToken;
      })
      .catch((err) => {
        throw new Error(err.response.data.message);
      });
  },

  async login(id: string, password: string): Promise<string> {
    return await httpService
      .post<{ accessToken: string }>(
        "auth/login",
        { id, password },
        { withCredentials: true }
      )
      .then(({ data: { accessToken } }) => {
        setAccessToken(accessToken);
        return accessToken;
      })
      .catch((err) => {
        throw new Error(err.response.data.message);
      });
  },

  async logout() {
    return await httpService
      .post("auth/logout", {}, { withCredentials: true })
      .then((res) => {
        setAccessToken("");
      });
  },

  async refreshToken(): Promise<string> {
    return await httpService
      .post<{ ok: boolean; accessToken: string }>(
        "auth/refresh-token",
        {},
        { withCredentials: true }
      )
      .then(({ data: { accessToken } }) => {
        setAccessToken(accessToken);
        return accessToken;
      })
      .catch((err) => {
        throw err;
      });
  },
};
