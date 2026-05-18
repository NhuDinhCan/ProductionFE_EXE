import api from "./api";

export const submitQuiz = (answerList) =>
  api.post("/quiz/result", answerList);