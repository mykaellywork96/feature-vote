import { useState, FormEvent } from "react";
import "./FeatureForm.css";

interface FeatureFormProps {
  onSubmit: (title: string, description: string) => Promise<void>;
}

export default function FeatureForm({ onSubmit }: FeatureFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await onSubmit(title.trim(), description.trim());
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create feature");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="feature-form-container">
      <h2>Submit New Feature</h2>
      <form onSubmit={handleSubmit} className="feature-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Dark mode support"
            maxLength={200}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide more details about this feature..."
            maxLength={1000}
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={isSubmitting} className="submit-button">
          {isSubmitting ? "Submitting..." : "Submit Feature"}
        </button>
      </form>
    </div>
  );
}
