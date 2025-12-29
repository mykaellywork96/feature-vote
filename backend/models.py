from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class FeatureCreate(BaseModel):
    """Request model for creating a new feature."""
    title: str = Field(..., min_length=1, max_length=200, description="Feature title")
    description: Optional[str] = Field(None, max_length=1000, description="Optional description")


class Feature(BaseModel):
    """Response model for a feature."""
    id: int
    title: str
    description: Optional[str]
    vote_count: int
    created_at: str  # ISO format timestamp


class ErrorResponse(BaseModel):
    """Standard error response."""
    detail: str