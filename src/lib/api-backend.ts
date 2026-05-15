import axios from "axios";
import { auth } from "@clerk/nextjs/server";

import { env } from "~/env";

export function createBackendAxios() {
  const root = env.BACKEND_API_BASE_URL.replace(/\/$/, "");
  const baseURL = `${root}/api/v1`;

  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  instance.interceptors.request.use(async (config) => {
    const { getToken } = await auth();
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
}
