import type { Feature } from "../types";
import FeatureItem from "./FeatureItem";
import "./FeatureList.css";

interface FeatureListProps {
  features: Feature[];
  onVote: (featureId: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function FeatureList({
  features,
  onVote,
  isLoading,
  error,
}: FeatureListProps) {
  if (isLoading) {
    return (
      <div className="feature-list-container">
        <div className="loading-state">Loading features...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feature-list-container">
        <div className="error-state">
          <p>Failed to load features</p>
          <p className="error-detail">{error}</p>
        </div>
      </div>
    );
  }

  if (features.length === 0) {
    return (
      <div className="feature-list-container">
        <div className="empty-state">
          <p>No features yet!</p>
          <p>Be the first to submit a feature request.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feature-list-container">
      <div className="feature-list-header">
        <h2>Features ({features.length})</h2>
        <p className="subtitle">Sorted by votes</p>
      </div>
      <div className="feature-list">
        {features.map((feature) => (
          <FeatureItem key={feature.id} feature={feature} onVote={onVote} />
        ))}
      </div>
    </div>
  );
}
