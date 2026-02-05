import axios from "axios";

const backUrl = process.env.NEXT_PUBLIC_BACK_URL;
const baseURL = (() => {
  if (!backUrl) return "/v1";
  try {
    return new URL("/v1", backUrl).toString();
  } catch {
    return "/v1";
  }
})();

export const api = axios.create({
  baseURL,
  withCredentials: true,
});
