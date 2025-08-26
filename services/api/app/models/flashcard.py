from datetime import datetime
from typing import List, Optional
from uuid import uuid4
from pydantic import BaseModel, Field


class FlashcardBase(BaseModel):
    question: str = Field(..., min_length=3, max_length=1000, description="Question text")
    answer: str = Field(..., min_length=1, max_length=1000, description="Answer text")
    tags: List[str] = Field(default_factory=list, description="Tags for categorization")


class FlashcardCreate(FlashcardBase):
    pass


class FlashcardUpdate(BaseModel):
    question: Optional[str] = Field(None, min_length=3, max_length=1000)
    answer: Optional[str] = Field(None, min_length=1, max_length=1000)
    tags: Optional[List[str]] = None


class Flashcard(FlashcardBase):
    id: str = Field(default_factory=lambda: str(uuid4()))
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # SRS Properties
    ease_factor: float = Field(default=2.5, ge=1.0, le=5.0, description="SM-2 ease factor")
    interval: int = Field(default=1, ge=0, description="Days until next review")
    repetition: int = Field(default=0, ge=0, description="Successful repetitions")
    last_reviewed: Optional[datetime] = Field(None, description="Last review timestamp")
    next_review: datetime = Field(default_factory=datetime.now, description="Next review date")
    total_reviews: int = Field(default=0, ge=0, description="Total number of reviews")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class ReviewRequest(BaseModel):
    flashcard_id: str = Field(..., description="ID of the flashcard being reviewed")
    quality: int = Field(..., ge=0, le=5, description="SM-2 quality rating (0-5)")
    response_time: int = Field(..., ge=0, description="Response time in milliseconds")
    correct: bool = Field(..., description="Whether the answer was correct")


class ReviewResponse(BaseModel):
    flashcard: Flashcard
    next_interval: int
    ease_factor_change: float
    message: str


class StudySession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    start_time: datetime = Field(default_factory=datetime.now)
    end_time: Optional[datetime] = None
    cards_reviewed: int = Field(default=0)
    cards_correct: int = Field(default=0)
    total_time: int = Field(default=0, description="Total time in milliseconds")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class StudyStats(BaseModel):
    total_cards: int
    due_today: int
    total_reviews: int
    accuracy: float
    average_ease_factor: float
    sessions_completed: int
    total_study_time: int  # in milliseconds
    interval_distribution: dict
    upcoming_reviews: dict  # next 7 days


class FlashcardList(BaseModel):
    flashcards: List[Flashcard]
    total: int
    due_count: int