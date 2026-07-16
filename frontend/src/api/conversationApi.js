import api from "./axios";

export const getConversation = async (id) => {
  const response = await api.get(`/conversations/${id}`);
  return response.data;
};

export const saveConversation = async (id, data) => {
  const response = await api.put(`/conversations/${id}`, data);
  return response.data;
};
