import { useState, useEffect } from "react";
import FeatureForm from "./components/FeatureForm";
import FeatureList from "./components/FeatureList";
import { fetchFeatures, createFeature, voteForFeature } from "./services/api";
import type { Feature } from "./types";
import "./App.css";

export default function App() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadFeatures() {
    try {
      setError(null);
      const data = await fetchFeatures();
      setFeatures(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load features");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadFeatures();
  }, []);

  async function handleCreateFeature(title: string, description: string) {
    const newFeature = await createFeature({
      title,
      description: description || undefined,
    });
    setFeatures((prev) => [...prev, newFeature]);
  }

  async function handleVote(featureId: number) {
    const updatedFeature = await voteForFeature(featureId);

    setFeatures((prev) =>
      prev
        .map((f) => (f.id === featureId ? updatedFeature : f))
        .sort((a, b) => {
          if (b.vote_count !== a.vote_count) {
            return b.vote_count - a.vote_count;
          }
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        })
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Feature Voting System</h1>
        <p>Submit and vote on feature requests</p>
      </header>

      <main className="app-main">
        <div>
          <FeatureForm onSubmit={handleCreateFeature} />
        </div>
        <FeatureList
          features={features}
          onVote={handleVote}
          isLoading={isLoading}
          error={error}
        />
      </main>
    </div>
  );
}
