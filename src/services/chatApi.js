import api from "./api";

export const chatApi = {
  // Lấy danh sách user khác (trừ bản thân)
  getUsers: () => api.get("/users?excludeSelf=true"),

  // Lấy hoặc tạo conversation
  getOrCreateConversation: ({ userId, mentorId }) =>
    api.post("/chat/conversation", { userId, mentorId }),

  // Lấy lịch sử tin nhắn (phân trang)
  getHistory: (conversationId, page = 0, size = 20) =>
    api.get(`/chat/history/${conversationId}?page=${page}&size=${size}`),
};
