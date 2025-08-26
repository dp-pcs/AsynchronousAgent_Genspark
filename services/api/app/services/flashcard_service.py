from datetime import datetime
from typing import List, Optional
from ..models.flashcard import (
    Flashcard, 
    FlashcardCreate, 
    FlashcardUpdate, 
    ReviewRequest, 
    ReviewResponse,
    StudySession
)
from ..storage.memory_store import store


class FlashcardService:
    """Service for flashcard business logic"""
    
    @staticmethod
    def create_flashcard(flashcard_data: FlashcardCreate) -> Flashcard:
        """Create a new flashcard with default SRS parameters"""
        flashcard = Flashcard(
            question=flashcard_data.question,
            answer=flashcard_data.answer,
            tags=flashcard_data.tags
        )
        return store.create_flashcard(flashcard)
    
    @staticmethod
    def get_flashcard(flashcard_id: str) -> Optional[Flashcard]:
        """Get a flashcard by ID"""
        return store.get_flashcard(flashcard_id)
    
    @staticmethod
    def get_all_flashcards() -> List[Flashcard]:
        """Get all flashcards"""
        return store.get_all_flashcards()
    
    @staticmethod
    def update_flashcard(flashcard_id: str, update_data: FlashcardUpdate) -> Optional[Flashcard]:
        """Update an existing flashcard"""
        existing = store.get_flashcard(flashcard_id)
        if not existing:
            return None
        
        # Update only provided fields
        update_dict = update_data.dict(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(existing, field, value)
        
        existing.updated_at = datetime.now()
        return store.update_flashcard(flashcard_id, existing)
    
    @staticmethod
    def delete_flashcard(flashcard_id: str) -> bool:
        """Delete a flashcard"""
        return store.delete_flashcard(flashcard_id)
    
    @staticmethod
    def get_due_flashcards() -> List[Flashcard]:
        """Get flashcards due for review"""
        return store.get_due_flashcards()
    
    @staticmethod
    def review_flashcard(review_data: ReviewRequest) -> ReviewResponse:
        """Process a flashcard review and update SRS parameters"""
        flashcard = store.get_flashcard(review_data.flashcard_id)
        if not flashcard:
            raise ValueError(f"Flashcard {review_data.flashcard_id} not found")
        
        # Store original values for comparison
        original_ease = flashcard.ease_factor
        
        # Apply SM-2 algorithm
        if review_data.quality >= 3:
            # Correct response (quality 3-5)
            if flashcard.repetition == 0:
                flashcard.interval = 1
            elif flashcard.repetition == 1:
                flashcard.interval = 6
            else:
                flashcard.interval = max(1, int(flashcard.interval * flashcard.ease_factor))
            
            flashcard.repetition += 1
            
            # Adjust ease factor based on quality
            flashcard.ease_factor += (0.1 - (5 - review_data.quality) * (0.08 + (5 - review_data.quality) * 0.02))
            
        else:
            # Incorrect response (quality 0-2)
            flashcard.repetition = 0
            flashcard.interval = 1
            flashcard.ease_factor = max(1.3, flashcard.ease_factor - 0.2)
        
        # Ensure ease factor bounds
        flashcard.ease_factor = max(1.3, min(5.0, flashcard.ease_factor))
        flashcard.ease_factor = round(flashcard.ease_factor, 2)
        
        # Update review timestamps
        flashcard.last_reviewed = datetime.now()
        flashcard.next_review = datetime.now()
        flashcard.next_review = flashcard.next_review.replace(
            day=flashcard.next_review.day + flashcard.interval
        )
        flashcard.total_reviews += 1
        
        # Save updated flashcard
        store.update_flashcard(review_data.flashcard_id, flashcard)
        
        # Generate response message
        ease_change = flashcard.ease_factor - original_ease
        if review_data.quality >= 4:
            message = f"Great! Next review in {flashcard.interval} days."
        elif review_data.quality == 3:
            message = f"Good. Next review in {flashcard.interval} days."
        else:
            message = f"Keep practicing. You'll see this card again tomorrow."
        
        return ReviewResponse(
            flashcard=flashcard,
            next_interval=flashcard.interval,
            ease_factor_change=ease_change,
            message=message
        )


class StudySessionService:
    """Service for managing study sessions"""
    
    @staticmethod
    def start_session() -> StudySession:
        """Start a new study session"""
        session = StudySession()
        return store.create_study_session(session)
    
    @staticmethod
    def get_session(session_id: str) -> Optional[StudySession]:
        """Get a study session by ID"""
        return store.get_study_session(session_id)
    
    @staticmethod
    def end_session(session_id: str) -> Optional[StudySession]:
        """End a study session"""
        session = store.get_study_session(session_id)
        if not session:
            return None
        
        session.end_time = datetime.now()
        session.total_time = int((session.end_time - session.start_time).total_seconds() * 1000)
        
        return store.update_study_session(session_id, session)
    
    @staticmethod
    def record_review(session_id: str, was_correct: bool) -> Optional[StudySession]:
        """Record a review in the current session"""
        session = store.get_study_session(session_id)
        if not session:
            return None
        
        session.cards_reviewed += 1
        if was_correct:
            session.cards_correct += 1
        
        return store.update_study_session(session_id, session)


class AnalyticsService:
    """Service for analytics and statistics"""
    
    @staticmethod
    def get_study_stats():
        """Get comprehensive study statistics"""
        return store.get_stats()
    
    @staticmethod
    def get_flashcard_history(flashcard_id: str) -> dict:
        """Get review history for a specific flashcard"""
        flashcard = store.get_flashcard(flashcard_id)
        if not flashcard:
            return {}
        
        return {
            "flashcard_id": flashcard_id,
            "total_reviews": flashcard.total_reviews,
            "current_interval": flashcard.interval,
            "ease_factor": flashcard.ease_factor,
            "repetition": flashcard.repetition,
            "last_reviewed": flashcard.last_reviewed,
            "next_review": flashcard.next_review,
            "created_at": flashcard.created_at
        }