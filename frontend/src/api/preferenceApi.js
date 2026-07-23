import api from "./axios";

export const getPreferences = async () => {
  const response = await api.get("/preferences");
  return response.data;
};

export const updatePreferences = async (preferences) => {
  const response = await api.put("/preferences", preferences);
  return response.data;
};
