from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from typing import List
import re

from .models.flashcard import (
    Flashcard,
    FlashcardCreate, 
    FlashcardUpdate,
    FlashcardList,
    ReviewRequest,
    ReviewResponse,
    StudySession,
    StudyStats
)
from .services.flashcard_service import FlashcardService, StudySessionService, AnalyticsService

app = FastAPI(
    title="Spaced Repetition Flashcards API",
    description="A FastAPI backend for spaced repetition flashcard learning with SM-2 algorithm",
    version="1.0.0"
)

# Add CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Legacy quiz endpoints (maintained for backward compatibility)
class QuizItem(BaseModel):
    question: str = Field(..., min_length=3, max_length=1000, description="Question text (3-1000 chars)")
    answer: str = Field(..., min_length=1, max_length=1000, description="Answer text (1-1000 chars)")
    
    @field_validator('question')
    @classmethod
    def validate_question(cls, v):
        if not v or not v.strip():
            raise ValueError('Question cannot be empty or whitespace only')
        
        # Remove excessive whitespace
        v = re.sub(r'\s+', ' ', v.strip())
        
        # Check for minimum meaningful content after normalization
        if len(v) < 3:
            raise ValueError('Question must be at least 3 characters long')
        
        # Reject questions that are just punctuation or numbers
        if re.match(r'^[^\w]*$', v) or re.match(r'^\d+$', v):
            raise ValueError('Question must contain meaningful text')
        
        return v
    
    @field_validator('answer')
    @classmethod
    def validate_answer(cls, v):
        if not v or not v.strip():
            raise ValueError('Answer cannot be empty or whitespace only')
        
        # Remove excessive whitespace  
        v = re.sub(r'\s+', ' ', v.strip())
        
        return v

@app.post("/quiz/create", tags=["Legacy"])
def quiz_create(item: QuizItem):
    """
    Legacy quiz creation endpoint (maintained for backward compatibility).
    For new applications, use /api/flashcards endpoints.
    """
    try:
        # Additional business logic validation
        if item.question.lower() == item.answer.lower():
            raise HTTPException(
                status_code=400, 
                detail="Question and answer cannot be identical"
            )
        
        # Check for potentially problematic content
        forbidden_patterns = [
            r'<script',  # XSS prevention
            r'javascript:',  # XSS prevention  
            r'data:.*base64',  # Data URL prevention
        ]
        
        for pattern in forbidden_patterns:
            if re.search(pattern, item.question, re.IGNORECASE) or \
               re.search(pattern, item.answer, re.IGNORECASE):
                raise HTTPException(
                    status_code=400,
                    detail="Content contains potentially harmful patterns"
                )
        
        return {
            "status": "ok", 
            "item": item,
            "metadata": {
                "question_length": len(item.question),
                "answer_length": len(item.answer),
                "created_at": "2024-01-01T00:00:00Z"  # Fixed timestamp for determinism
            }
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/healthz", tags=["System"])
def healthz():
    """Health check endpoint"""
    return {"ok": True}

# ============================================================================
# FLASHCARD MANAGEMENT ENDPOINTS
# ============================================================================

@app.post("/api/flashcards", response_model=Flashcard, tags=["Flashcards"])
def create_flashcard(flashcard_data: FlashcardCreate):
    """Create a new flashcard"""
    try:
        return FlashcardService.create_flashcard(flashcard_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/flashcards", response_model=FlashcardList, tags=["Flashcards"])
def get_all_flashcards():
    """Get all flashcards with summary statistics"""
    flashcards = FlashcardService.get_all_flashcards()
    due_cards = FlashcardService.get_due_flashcards()
    
    return FlashcardList(
        flashcards=flashcards,
        total=len(flashcards),
        due_count=len(due_cards)
    )

@app.get("/api/flashcards/{flashcard_id}", response_model=Flashcard, tags=["Flashcards"])
def get_flashcard(flashcard_id: str):
    """Get a specific flashcard by ID"""
    flashcard = FlashcardService.get_flashcard(flashcard_id)
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    return flashcard

@app.put("/api/flashcards/{flashcard_id}", response_model=Flashcard, tags=["Flashcards"])
def update_flashcard(flashcard_id: str, update_data: FlashcardUpdate):
    """Update an existing flashcard"""
    flashcard = FlashcardService.update_flashcard(flashcard_id, update_data)
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    return flashcard

@app.delete("/api/flashcards/{flashcard_id}", tags=["Flashcards"])
def delete_flashcard(flashcard_id: str):
    """Delete a flashcard"""
    success = FlashcardService.delete_flashcard(flashcard_id)
    if not success:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    return {"message": "Flashcard deleted successfully"}

# ============================================================================
# STUDY SESSION ENDPOINTS
# ============================================================================

@app.get("/api/study/due", response_model=List[Flashcard], tags=["Study"])
def get_due_flashcards():
    """Get flashcards that are due for review"""
    return FlashcardService.get_due_flashcards()

@app.post("/api/study/session", response_model=StudySession, tags=["Study"])
def start_study_session():
    """Start a new study session"""
    return StudySessionService.start_session()

@app.get("/api/study/session/{session_id}", response_model=StudySession, tags=["Study"])
def get_study_session(session_id: str):
    """Get study session information"""
    session = StudySessionService.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Study session not found")
    return session

@app.post("/api/study/session/{session_id}/end", response_model=StudySession, tags=["Study"])
def end_study_session(session_id: str):
    """End a study session"""
    session = StudySessionService.end_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Study session not found")
    return session

@app.post("/api/study/review", response_model=ReviewResponse, tags=["Study"])
def review_flashcard(review_data: ReviewRequest, session_id: str = None):
    """Submit a review for a flashcard and update SRS parameters"""
    try:
        # Process the review
        response = FlashcardService.review_flashcard(review_data)
        
        # Update study session if provided
        if session_id:
            StudySessionService.record_review(session_id, review_data.correct)
        
        return response
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ============================================================================
# ANALYTICS ENDPOINTS
# ============================================================================

@app.get("/api/analytics/stats", response_model=StudyStats, tags=["Analytics"])
def get_study_statistics():
    """Get comprehensive study statistics"""
    stats = AnalyticsService.get_study_stats()
    return StudyStats(**stats)

@app.get("/api/analytics/cards/{flashcard_id}/history", tags=["Analytics"])
def get_flashcard_history(flashcard_id: str):
    """Get review history for a specific flashcard"""
    history = AnalyticsService.get_flashcard_history(flashcard_id)
    if not history:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    return history

# ============================================================================
# ROOT ENDPOINT
# ============================================================================

@app.get("/", tags=["System"])
def root():
    """API root endpoint with feature overview"""
    return {
        "message": "Spaced Repetition Flashcards API",
        "version": "1.0.0",
        "features": [
            "SM-2 algorithm implementation",
            "Flashcard management (CRUD)",
            "Study session tracking",
            "Progress analytics",
            "RESTful API design"
        ],
        "docs_url": "/docs",
        "endpoints": {
            "flashcards": "/api/flashcards",
            "study": "/api/study",
            "analytics": "/api/analytics"
        }
    }
