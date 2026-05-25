import api from "./api";

export const getResourceMajors = () => api.get("/majors");

export const getLearningResources = ({ careerId, type, keyword } = {}) => {
  const params = {};

  if (careerId) {
    params.careerId = careerId;
  }

  if (type) {
    params.type = type;
  }

  if (keyword?.trim()) {
    params.keyword = keyword.trim();
  }

  return api.get("/learning-resources", { params });
};

export const getLearningResource = (id) => api.get(`/learning-resources/${id}`);

export const getSavedLearningResources = () => api.get("/learning-resources/saved");

export const saveLearningResource = (id) => api.post(`/learning-resources/${id}/save`);

export const unsaveLearningResource = (id) => api.delete(`/learning-resources/${id}/save`);
