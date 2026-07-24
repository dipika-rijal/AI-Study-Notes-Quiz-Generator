import api from "./axios";

/**
 * Generate a new AI study plan.
 * @param {{ goal, subjects, examDate, availableHours, currentLevel, weakTopics }} payload
 */
export const generatePlan = async (payload) => {
  const response = await api.post("/plans/generate", payload);
  return response.data;
};

/**
 * Get all plans for the current user (lightweight – no dailyTasks).
 */
export const getPlans = async () => {
  const response = await api.get("/plans");
  return response.data;
};

/**
 * Get a single plan by ID (full detail).
 * @param {string} id
 */
export const getPlanById = async (id) => {
  const response = await api.get(`/plans/${id}`);
  return response.data;
};

/**
 * Mark a task complete / incomplete.
 * @param {string} planId
 * @param {{ dayIndex, blockIndex, taskIndex, completed }} body
 */
export const updatePlanProgress = async (planId, body) => {
  const response = await api.put(`/plans/${planId}/progress`, body);
  return response.data;
};

/**
 * Delete a plan.
 * @param {string} id
 */
export const deletePlan = async (id) => {
  const response = await api.delete(`/plans/${id}`);
  return response.data;
};
