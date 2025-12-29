import type { Feature, FeatureCreate } from "../types";

const API_BASE_URL = "http://localhost:8000";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function fetchFeatures(): Promise<Feature[]> {
  const response = await fetch(`${API_BASE_URL}/features`);
  return handleResponse<Feature[]>(response);
}

export async function createFeature(data: FeatureCreate): Promise<Feature> {
  const response = await fetch(`${API_BASE_URL}/features`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Feature>(response);
}

export async function voteForFeature(featureId: number): Promise<Feature> {
  const response = await fetch(`${API_BASE_URL}/features/${featureId}/vote`, {
    method: "POST",
  });
  return handleResponse<Feature>(response);
}
