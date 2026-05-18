import api from "./api";

export const getAllQuestions = () => api.get("/question");
