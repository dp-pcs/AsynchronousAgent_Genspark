import pytest
from datetime import datetime, timedelta
from app.services.flashcard_service import FlashcardService, StudySessionService, AnalyticsService
from app.models.flashcard import FlashcardCreate
from app.storage.memory_store import MemoryStore

@pytest.fixture
def flashcard_service(temp_storage):
    """Create a flashcard service for testing."""
    return FlashcardService(temp_storage)

@pytest.fixture
def study_service(temp_storage):
    """Create a study session service for testing."""
    return StudySessionService(temp_storage)

@pytest.fixture
def analytics_service(temp_storage):
    """Create an analytics service for testing."""
    return AnalyticsService(temp_storage)

def test_create_flashcard_service(flashcard_service, sample_flashcard):
    """Test creating a flashcard through the service."""
    flashcard = flashcard_service.create_flashcard(FlashcardCreate(**sample_flashcard))
    
    assert flashcard.question == sample_flashcard["question"]
    assert flashcard.answer == sample_flashcard["answer"]
    assert flashcard.ease_factor == 2.5
    assert flashcard.interval == 1

def test_review_flashcard_quality_0(flashcard_service, sample_flashcard):
    """Test reviewing a flashcard with quality 0 (complete blackout)."""
    flashcard = flashcard_service.create_flashcard(FlashcardCreate(**sample_flashcard))
    original_ease = flashcard.ease_factor
    
    # Review with quality 0
    updated_flashcard = flashcard_service.review_flashcard(flashcard.id, 0)
    
    assert updated_flashcard.repetition == 0
    assert updated_flashcard.interval == 1
    assert updated_flashcard.ease_factor < original_ease  # Should decrease
    assert updated_flashcard.total_reviews == 1

def test_review_flashcard_quality_3(flashcard_service, sample_flashcard):
    """Test reviewing a flashcard with quality 3 (correct response)."""
    flashcard = flashcard_service.create_flashcard(FlashcardCreate(**sample_flashcard))
    
    # Review with quality 3
    updated_flashcard = flashcard_service.review_flashcard(flashcard.id, 3)
    
    assert updated_flashcard.repetition == 1
    assert updated_flashcard.interval == 1
    assert updated_flashcard.ease_factor == 2.5  # Should remain same
    assert updated_flashcard.total_reviews == 1

def test_review_flashcard_quality_4(flashcard_service, sample_flashcard):
    """Test reviewing a flashcard with quality 4 (easy response)."""
    flashcard = flashcard_service.create_flashcard(FlashcardCreate(**sample_flashcard))
    original_ease = flashcard.ease_factor
    
    # Review with quality 4
    updated_flashcard = flashcard_service.review_flashcard(flashcard.id, 4)
    
    assert updated_flashcard.repetition == 1
    assert updated_flashcard.interval == 1
    assert updated_flashcard.ease_factor > original_ease  # Should increase
    assert updated_flashcard.total_reviews == 1

def test_review_flashcard_quality_5(flashcard_service, sample_flashcard):
    """Test reviewing a flashcard with quality 5 (perfect response)."""
    flashcard = flashcard_service.create_flashcard(FlashcardCreate(**sample_flashcard))
    original_ease = flashcard.ease_factor
    
    # Review with quality 5
    updated_flashcard = flashcard_service.review_flashcard(flashcard.id, 5)
    
    assert updated_flashcard.repetition == 1
    assert updated_flashcard.interval == 1
    assert updated_flashcard.ease_factor > original_ease  # Should increase significantly
    assert updated_flashcard.total_reviews == 1

def test_review_progression(flashcard_service, sample_flashcard):
    """Test the progression of intervals through multiple reviews."""
    flashcard = flashcard_service.create_flashcard(FlashcardCreate(**sample_flashcard))
    
    # First review with quality 4
    flashcard = flashcard_service.review_flashcard(flashcard.id, 4)
    assert flashcard.repetition == 1
    assert flashcard.interval == 1
    
    # Second review with quality 4
    flashcard = flashcard_service.review_flashcard(flashcard.id, 4)
    assert flashcard.repetition == 2
    assert flashcard.interval == 6  # Should jump to 6 days
    
    # Third review with quality 4
    flashcard = flashcard_service.review_flashcard(flashcard.id, 4)
    assert flashcard.repetition == 3
    assert flashcard.interval > 6  # Should increase based on ease factor

def test_get_due_cards(study_service, temp_storage, sample_flashcard):
    """Test getting due cards for study."""
    # Create flashcards
    flashcard1 = temp_storage.create_flashcard(FlashcardCreate(**sample_flashcard))
    flashcard2 = temp_storage.create_flashcard(FlashcardCreate(
        question="What is 2+2?",
        answer="4"
    ))
    
    # Both should be due initially
    due_cards = study_service.get_due_cards()
    assert len(due_cards) == 2
    
    # Update one to not be due
    tomorrow = datetime.now() + timedelta(days=1)
    temp_storage.update_flashcard(flashcard1.id, {"next_review": tomorrow})
    
    due_cards = study_service.get_due_cards()
    assert len(due_cards) == 1
    assert due_cards[0].id == flashcard2.id

def test_start_study_session(study_service):
    """Test starting a study session."""
    session = study_service.start_session()
    
    assert session.id is not None
    assert isinstance(session.start_time, datetime)
    assert session.end_time is None
    assert session.cards_studied == 0
    assert session.total_reviews == 0

def test_end_study_session(study_service):
    """Test ending a study session."""
    session = study_service.start_session()
    session_id = session.id
    
    # End the session
    ended_session = study_service.end_session(session_id, 5, 20)
    
    assert ended_session.id == session_id
    assert ended_session.end_time is not None
    assert ended_session.cards_studied == 5
    assert ended_session.total_reviews == 20

def test_get_analytics_stats(analytics_service, temp_storage):
    """Test getting analytics statistics."""
    # Initially empty
    stats = analytics_service.get_stats()
    assert stats.total_cards == 0
    assert stats.due_today == 0
    assert stats.total_reviews == 0
    
    # Add some flashcards
    flashcard1 = temp_storage.create_flashcard(FlashcardCreate(
        question="Test 1", answer="Answer 1"
    ))
    flashcard2 = temp_storage.create_flashcard(FlashcardCreate(
        question="Test 2", answer="Answer 2"
    ))
    
    # Update stats
    temp_storage.update_flashcard(flashcard1.id, {"total_reviews": 3})
    temp_storage.update_flashcard(flashcard2.id, {"total_reviews": 5})
    
    stats = analytics_service.get_stats()
    assert stats.total_cards == 2
    assert stats.total_reviews == 8
    assert stats.due_today == 2

def test_get_card_history(analytics_service, temp_storage, sample_flashcard):
    """Test getting card review history."""
    flashcard = temp_storage.create_flashcard(FlashcardCreate(**sample_flashcard))
    
    # Initially no history
    history = analytics_service.get_card_history(flashcard.id)
    assert history == []
    
    # Add some review history (this would normally be done by the review process)
    # For now, just verify the method exists and returns expected type
    assert isinstance(history, list)