import api from "./axios";

export async function getHistory(type = "all") {
  const query = type === "all" ? "" : "?type=" + type;
  const response = await api.get("/history" + query);
  return response.data;
}

export async function getRecentActivity(limit = 5) {
  const response = await api.get("/history/recent?limit=" + limit);
  return response.data;
}
