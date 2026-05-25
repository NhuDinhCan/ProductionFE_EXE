import api from "./api";

export const getAppliedLearningMethods = ({ careerId } = {}) => {
  const params = {};

  if (careerId) {
    params.careerId = careerId;
  }

  return api.get("/user-learning-methods", { params });
};

export const applyLearningMethod = ({ careerId, learningMethodId }) =>
  api.post("/user-learning-methods/apply", { careerId, learningMethodId });
