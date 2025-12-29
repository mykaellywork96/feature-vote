from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import List

from database import initialize_database, get_all_features, create_feature, increment_vote
from models import Feature, FeatureCreate, ErrorResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    initialize_database()
    yield


app = FastAPI(
    title="Feature Voting System API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/features", response_model=List[Feature])
def list_features():
    """
    Retrieve all features sorted by vote count (descending), then by creation date (descending).
    """
    try:
        features = get_all_features()
        return features
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.post("/features", response_model=Feature, status_code=201)
def submit_feature(feature_data: FeatureCreate):
    """
    Create a new feature request.
    
    Titles must be unique (case-insensitive, whitespace-trimmed).
    Returns 409 Conflict if a feature with the same normalized title already exists.
    """
    try:
        # Validate title is not just whitespace
        if not feature_data.title.strip():
            raise HTTPException(status_code=400, detail="Title cannot be empty or whitespace")
        
        new_feature = create_feature(
            title=feature_data.title.strip(),
            description=feature_data.description.strip() if feature_data.description else None
        )
        
        # None indicates duplicate title (UNIQUE constraint violation)
        if new_feature is None:
            raise HTTPException(
                status_code=409,
                detail=f"A feature with the title '{feature_data.title.strip()}' already exists (case-insensitive match)"
            )
        
        return new_feature
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.post("/features/{feature_id}/vote", response_model=Feature)
def vote_for_feature(feature_id: int):
    """
    Upvote a feature by incrementing its vote count.
    """
    if feature_id < 1:
        raise HTTPException(status_code=400, detail="Invalid feature ID")
    
    try:
        updated_feature = increment_vote(feature_id)
        
        if not updated_feature:
            raise HTTPException(status_code=404, detail=f"Feature with ID {feature_id} not found")
        
        return updated_feature
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/")
def root():
    """Health check endpoint."""
    return {"message": "Feature Voting System API", "status": "running"}