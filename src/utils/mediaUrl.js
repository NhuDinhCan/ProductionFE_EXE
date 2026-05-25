import api from "../services/api";

export function resolveMediaUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;

  const baseUrl = api.defaults.baseURL || "";
  const apiRoot = baseUrl.replace(/\/api\/?$/i, "").replace(/\/$/, "");

  if (url.startsWith("/")) {
    return `${apiRoot}${url}`;
  }

  return url;
}
