import api from "./api";

const list = (path, config) => api.get(`/admin/${path}`, config);
const detail = (path, id) => api.get(`/admin/${path}/${id}`);
const create = (path, data) => api.post(`/admin/${path}`, data);
const update = (path, id, data) => api.put(`/admin/${path}/${id}`, data);
const remove = (path, id) => api.delete(`/admin/${path}/${id}`);

export const adminApi = {
  dashboard: () => api.get("/admin/dashboard"),

  list,
  detail,
  create,
  update,
  remove,

  careers: () => list("careers"),
  universities: () => list("universities"),
  universityMajors: () => list("university-majors"),
  learningMethods: () => list("learning-methods"),
  learningStrategyProfiles: () => list("learning-strategy-profiles"),
  learningResources: () => list("learning-resources"),
  examSubjects: () => list("exam-subjects"),
  examCombinations: () => list("exam-combinations"),
  mockExams: () => list("mock-exams"),
  users: (keyword) => list("users", { params: keyword ? { keyword } : {} }),

  mockQuestions: (examId) => api.get(`/admin/mock-exams/${examId}/questions`),
  previewMockQuestions: (examId) => api.get(`/admin/mock-exams/${examId}/questions/preview`),
  createMockQuestion: (examId, data) => api.post(`/admin/mock-exams/${examId}/questions`, data),
  updateMockQuestion: (questionId, data) => api.put(`/admin/mock-questions/${questionId}`, data),
  deleteMockQuestion: (questionId) => api.delete(`/admin/mock-questions/${questionId}`),
  uploadMockQuestionImage: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/admin/mock-questions/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadMockQuestions: (examId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/admin/mock-exams/${examId}/upload-questions`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadMockAnswers: (examId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/admin/mock-exams/${examId}/upload-answers`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  publishMockExam: (examId) => api.put(`/admin/mock-exams/${examId}/publish`),

  quizQuestions: () => list("quiz/questions"),
  quizQuestionsWithWeights: () => list("quiz/questions-with-weights"),
  createQuizQuestion: (data) => api.post("/admin/quiz/questions", data),
  updateQuizQuestion: (id, data) => api.put(`/admin/quiz/questions/${id}`, data),
  deleteQuizQuestion: (id) => api.delete(`/admin/quiz/questions/${id}`),
  quizWeights: (questionId) => api.get(`/admin/quiz/questions/${questionId}/weights`),
  createQuizWeight: (questionId, data) => api.post(`/admin/quiz/questions/${questionId}/weights`, data),
  updateQuizWeight: (weightId, data) => api.put(`/admin/quiz/weights/${weightId}`, data),
  deleteQuizWeight: (weightId) => api.delete(`/admin/quiz/weights/${weightId}`),

  updateUserRoles: (id, roles) => api.put(`/admin/users/${id}/roles`, { roles }),
};

export const getResult = (response) => response.data?.result || response.data || [];
