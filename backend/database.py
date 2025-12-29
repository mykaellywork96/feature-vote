import sqlite3
from pathlib import Path
from typing import Optional

DB_PATH = Path(__file__).parent / "features.db"


def get_connection():
    """Create and return a database connection."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def initialize_database():
    """Create the features table if it doesn't exist."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS features (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            title_normalized TEXT NOT NULL UNIQUE,
            description TEXT,
            vote_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create index on normalized title for faster lookups
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_title_normalized 
        ON features(title_normalized)
    """)
    
    conn.commit()
    conn.close()
    print(f"✓ Database initialized at {DB_PATH}")


def normalize_title(title: str) -> str:
    """Normalize title: trim whitespace and convert to lowercase."""
    return title.strip().lower()


def get_all_features():
    """Retrieve all features sorted by vote_count (desc), then created_at (desc)."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, title, description, vote_count, created_at
        FROM features
        ORDER BY vote_count DESC, created_at DESC
    """)
    
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]


def create_feature(title: str, description: Optional[str] = None):
    """
    Insert a new feature and return its data.
    Returns None if a feature with the same normalized title already exists.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    title_norm = normalize_title(title)
    
    try:
        cursor.execute("""
            INSERT INTO features (title, title_normalized, description, vote_count)
            VALUES (?, ?, ?, 0)
        """, (title, title_norm, description))
        
        feature_id = cursor.lastrowid
        conn.commit()
        
        # Fetch the newly created feature
        cursor.execute("""
            SELECT id, title, description, vote_count, created_at
            FROM features
            WHERE id = ?
        """, (feature_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        return dict(row) if row else None
        
    except sqlite3.IntegrityError as e:
        # UNIQUE constraint violation on title_normalized
        conn.close()
        if "title_normalized" in str(e).lower() or "unique" in str(e).lower():
            return None
        raise


def increment_vote(feature_id: int):
    """Increment the vote count for a feature. Returns updated feature or None if not found."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check if feature exists
    cursor.execute("SELECT id FROM features WHERE id = ?", (feature_id,))
    if not cursor.fetchone():
        conn.close()
        return None
    
    # Increment vote
    cursor.execute("""
        UPDATE features
        SET vote_count = vote_count + 1
        WHERE id = ?
    """, (feature_id,))
    
    conn.commit()
    
    # Fetch updated feature
    cursor.execute("""
        SELECT id, title, description, vote_count, created_at
        FROM features
        WHERE id = ?
    """, (feature_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    return dict(row) if row else None