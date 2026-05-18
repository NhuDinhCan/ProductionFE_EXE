/**
 * Decode JWT payload (không verify - chỉ để lấy claims)
 */
export function decodeToken(token) {
  try {
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
}

export function getCurrentUserEmail() {
  return localStorage.getItem("userEmail") || "";
}

export function getCurrentUserId() {
  const token = localStorage.getItem("accessToken");
  const payload = decodeToken(token);
  return payload?.userId ?? null;
}

export function isLoggedIn() {
  return !!localStorage.getItem("accessToken");
}

export function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userEmail");
}
