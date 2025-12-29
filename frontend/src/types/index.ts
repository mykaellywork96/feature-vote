export interface Feature {
  id: number;
  title: string;
  description: string | null;
  vote_count: number;
  created_at: string;
}

export interface FeatureCreate {
  title: string;
  description?: string;
}

export interface ApiError {
  detail: string;
}
