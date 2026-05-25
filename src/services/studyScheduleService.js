import api from "./api";

export const getStudySchedules = ({ careerId, learningMethodId } = {}) => {
  const params = {};

  if (careerId) {
    params.careerId = careerId;
  }

  if (learningMethodId) {
    params.learningMethodId = learningMethodId;
  }

  return api.get("/study-schedules", { params });
};

export const getTodayStudySchedules = () => api.get("/study-schedules/today");

export const generateStudySchedules = ({ careerId, learningMethodId }) =>
  api.post("/study-schedules/generate", { careerId, learningMethodId });

export const createStudySchedule = (payload) => api.post("/study-schedules", payload);

export const updateStudySchedule = (id, payload) => api.put(`/study-schedules/${id}`, payload);

export const deleteStudySchedule = (id) => api.delete(`/study-schedules/${id}`);
