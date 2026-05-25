const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_EMAIL_KEY = "userEmail";

const readAuthValue = (key) =>
  sessionStorage.getItem(key) || localStorage.getItem(key) || "";

const clearLegacyAuth = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
};

export function normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
}

export function decodeToken(token) {
  try {
    if (!token) return null;
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function setAuthSession({ accessToken, refreshToken, userEmail }) {
  clearLegacyAuth();
  if (accessToken) sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (userEmail) sessionStorage.setItem(USER_EMAIL_KEY, normalizeEmail(userEmail));
}

export function updateTokens({ accessToken, refreshToken }) {
  if (accessToken) sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function getAccessToken() {
  return readAuthValue(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return readAuthValue(REFRESH_TOKEN_KEY);
}

export function getCurrentUserEmail() {
  const tokenEmail = decodeToken(getAccessToken())?.sub;
  return normalizeEmail(tokenEmail || readAuthValue(USER_EMAIL_KEY));
}

export function getCurrentUserId() {
  return decodeToken(getAccessToken())?.userId ?? null;
}

export function isLoggedIn() {
  return !!getAccessToken();
}

export function clearSession() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(USER_EMAIL_KEY);
  clearLegacyAuth();
}
