import api from "./api";

export const getMockExamSubjects = () => api.get("/mock-exams/subjects");

export const getMockExamCombinations = () => api.get("/mock-exams/combinations");

export const getMockExams = ({
  subjectId,
  combinationCode,
  difficulty,
  year,
  keyword,
} = {}) => {
  const params = {};

  if (subjectId) params.subjectId = subjectId;
  if (combinationCode) params.combinationCode = combinationCode;
  if (difficulty) params.difficulty = difficulty;
  if (year) params.year = year;
  if (keyword?.trim()) params.keyword = keyword.trim();

  return api.get("/mock-exams", { params });
};

export const getMockExam = (examId) => api.get(`/mock-exams/${examId}`);

export const startMockExam = (examId) => api.post(`/mock-exams/${examId}/start`);

export const resumeMockExamAttempt = (attemptId) =>
  api.get(`/mock-exams/attempts/${attemptId}/resume`);

export const submitMockExamAttempt = (attemptId, answers) =>
  api.post(`/mock-exams/attempts/${attemptId}/submit`, { answers });

export const getMockExamAttempts = () => api.get("/mock-exams/attempts");

export const getMockExamAttempt = (attemptId) => api.get(`/mock-exams/attempts/${attemptId}`);

export const deleteMockExamAttempt = (attemptId) =>
  api.delete(`/mock-exams/attempts/${attemptId}`);

export const deleteAllMockExamAttempts = () => api.delete("/mock-exams/attempts");
