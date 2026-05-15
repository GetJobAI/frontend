import axios from "axios";

export const apiNext = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});
