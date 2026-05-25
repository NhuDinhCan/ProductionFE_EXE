import api from "./api";

export const getLearningMajors = () => api.get("/learning-strategies/majors");

export const getLearningStrategy = (majorCode) =>
  api.get("/learning-strategies", { params: { major: majorCode } });
