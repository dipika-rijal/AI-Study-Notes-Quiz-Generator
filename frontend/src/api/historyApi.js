const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function getHistory(type = "all") {
  const query = type === "all" ? "" : "?type=" + type;
  const response = await fetch(API_BASE_URL + "/api/history" + query);

  if (!response.ok) {
    throw new Error("Failed to fetch history");
  }

  return response.json();
}

export async function getRecentActivity(limit = 5) {
  const response = await fetch(API_BASE_URL + "/api/history/recent?limit=" + limit);

  if (!response.ok) {
    throw new Error("Failed to fetch recent activity");
  }

  return response.json();
}
