import pytest
import json
import tempfile
import os
from datetime import datetime, timedelta
from app.storage.memory_store import MemoryStore
from app.models.flashcard import Flashcard, FlashcardCreate

def test_memory_store_initialization(temp_storage):
    """Test memory store initialization."""
    assert temp_storage.flashcards == {}
    assert temp_storage.sessions == {}

def test_create_flashcard(temp_storage, sample_flashcard):
    """Test creating a flashcard."""
    flashcard = temp_storage.create_flashcard(FlashcardCreate(**sample_flashcard))
    
    assert flashcard.id is not None
    assert flashcard.question == sample_flashcard["question"]
    assert flashcard.answer == sample_flashcard["answer"]
    assert flashcard.tags == sample_flashcard["tags"]
    assert flashcard.ease_factor == 2.5
    assert flashcard.interval == 1
    assert flashcard.repetition == 0
    assert flashcard.total_reviews == 0

def test_get_flashcard(temp_storage, sample_flashcard):
    """Test retrieving a flashcard."""
    created_flashcard = temp_storage.create_flashcard(FlashcardCreate(**sample_flashcard))
    retrieved_flashcard = temp_storage.get_flashcard(created_flashcard.id)
    
    assert retrieved_flashcard is not None
    assert retrieved_flashcard.id == created_flashcard.id
    assert retrieved_flashcard.question == created_flashcard.question

def test_get_nonexistent_flashcard(temp_storage):
    """Test retrieving a non-existent flashcard."""
    result = temp_storage.get_flashcard("non-existent-id")
    assert result is None

def test_list_flashcards(temp_storage, sample_flashcard):
    """Test listing flashcards."""
    # Initially empty
    assert temp_storage.list_flashcards() == []
    
    # Create flashcards
    flashcard1 = temp_storage.create_flashcard(FlashcardCreate(**sample_flashcard))
    flashcard2 = temp_storage.create_flashcard(FlashcardCreate(
        question="What is 2+2?",
        answer="4",
        tags=["math"]
    ))
    
    flashcards = temp_storage.list_flashcards()
    assert len(flashcards) == 2
    assert flashcard1 in flashcards
    assert flashcard2 in flashcards

def test_update_flashcard(temp_storage, sample_flashcard):
    """Test updating a flashcard."""
    created_flashcard = temp_storage.create_flashcard(FlashcardCreate(**sample_flashcard))
    
    # Update the flashcard
    updates = {
        "question": "What is the capital of Germany?",
        "answer": "Berlin",
        "ease_factor": 2.8,
        "interval": 5,
        "repetition": 2
    }
    
    updated_flashcard = temp_storage.update_flashcard(created_flashcard.id, updates)
    
    assert updated_flashcard is not None
    assert updated_flashcard.question == updates["question"]
    assert updated_flashcard.answer == updates["answer"]
    assert updated_flashcard.ease_factor == updates["ease_factor"]
    assert updated_flashcard.interval == updates["interval"]
    assert updated_flashcard.repetition == updates["repetition"]

def test_update_nonexistent_flashcard(temp_storage):
    """Test updating a non-existent flashcard."""
    result = temp_storage.update_flashcard("non-existent-id", {"question": "New question"})
    assert result is None

def test_delete_flashcard(temp_storage, sample_flashcard):
    """Test deleting a flashcard."""
    created_flashcard = temp_storage.create_flashcard(FlashcardCreate(**sample_flashcard))
    
    # Delete the flashcard
    success = temp_storage.delete_flashcard(created_flashcard.id)
    assert success is True
    
    # Verify it's gone
    assert temp_storage.get_flashcard(created_flashcard.id) is None

def test_delete_nonexistent_flashcard(temp_storage):
    """Test deleting a non-existent flashcard."""
    success = temp_storage.delete_flashcard("non-existent-id")
    assert success is False

def test_get_due_flashcards(temp_storage, sample_flashcard):
    """Test getting due flashcards."""
    # Create flashcard
    flashcard = temp_storage.create_flashcard(FlashcardCreate(**sample_flashcard))
    
    # Should be due (next_review is set to now on creation)
    due_cards = temp_storage.get_due_flashcards()
    assert len(due_cards) == 1
    assert due_cards[0].id == flashcard.id
    
    # Update to be due tomorrow
    tomorrow = datetime.now() + timedelta(days=1)
    temp_storage.update_flashcard(flashcard.id, {"next_review": tomorrow})
    
    # Should not be due now
    due_cards = temp_storage.get_due_flashcards()
    assert len(due_cards) == 0

def test_persistence(sample_flashcard):
    """Test that data persists to file."""
    with tempfile.NamedTemporaryFile(suffix='.json', delete=False) as tmp:
        temp_file = tmp.name
    
    try:
        # Create store and add data
        store1 = MemoryStore(temp_file)
        flashcard = store1.create_flashcard(FlashcardCreate(**sample_flashcard))
        
        # Create new store instance and verify data persists
        store2 = MemoryStore(temp_file)
        retrieved = store2.get_flashcard(flashcard.id)
        
        assert retrieved is not None
        assert retrieved.question == sample_flashcard["question"]
    finally:
        if os.path.exists(temp_file):
            os.unlink(temp_file)

def test_calculate_stats(temp_storage):
    """Test statistics calculation."""
    # Initially no stats
    stats = temp_storage.calculate_stats()
    assert stats.total_cards == 0
    assert stats.due_today == 0
    assert stats.total_reviews == 0
    assert stats.accuracy == 0.0
    
    # Add some flashcards with reviews
    flashcard1 = temp_storage.create_flashcard(FlashcardCreate(
        question="Test 1", answer="Answer 1"
    ))
    flashcard2 = temp_storage.create_flashcard(FlashcardCreate(
        question="Test 2", answer="Answer 2"
    ))
    
    # Update with some review data
    temp_storage.update_flashcard(flashcard1.id, {
        "total_reviews": 5,
        "repetition": 3
    })
    temp_storage.update_flashcard(flashcard2.id, {
        "total_reviews": 3,
        "repetition": 2
    })
    
    stats = temp_storage.calculate_stats()
    assert stats.total_cards == 2
    assert stats.total_reviews == 8
    assert stats.due_today == 2  # Both cards should be due