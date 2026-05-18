import api from "./api";

// BE nhận: POST /university/suggest với body { careerId, score }
export const suggestUniversity = (careerId, score) =>
  api.post("/university/suggest", { careerId, score });
