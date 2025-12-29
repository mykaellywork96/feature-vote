import { useState } from "react";
import type { Feature } from "../types";
import "./FeatureItem.css";

interface FeatureItemProps {
  feature: Feature;
  onVote: (featureId: number) => Promise<void>;
}

export default function FeatureItem({ feature, onVote }: FeatureItemProps) {
  const [isVoting, setIsVoting] = useState(false);

  async function handleVote() {
    setIsVoting(true);
    try {
      await onVote(feature.id);
    } finally {
      setIsVoting(false);
    }
  }

  return (
    <div className="feature-item">
      <div className="feature-content">
        <h3 className="feature-title">{feature.title}</h3>
        {feature.description && (
          <p className="feature-description">{feature.description}</p>
        )}
        <div className="feature-meta">
          {new Date(feature.created_at).toLocaleDateString()}
        </div>
      </div>
      <button
        className="vote-button"
        onClick={handleVote}
        disabled={isVoting}
        aria-label={`Vote for ${feature.title}`}
      >
        <span className="vote-icon">▲</span>
        <span className="vote-count">{feature.vote_count}</span>
      </button>
    </div>
  );
}
