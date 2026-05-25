import api from "./api";

export const sendAiChatMessage = ({ message, contextType = "GENERAL" }) =>
  api.post("/ai/chat", { message, contextType }, { timeout: 65000 });
