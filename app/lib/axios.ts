import axios from "axios";

const base = new URL("/v1", process.env.NEXT_PUBLIC_BACK_URL);

export const api = axios.create({
  baseURL: base.toString(),
  withCredentials: true,
});
