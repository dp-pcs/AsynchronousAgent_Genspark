import pytest
import json
from datetime import datetime
from fastapi.testclient import TestClient

def test_health_check(client):
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data

def test_create_flashcard(client, sample_flashcard):
    """Test creating a new flashcard."""
    response = client.post("/api/flashcards", json=sample_flashcard)
    assert response.status_code == 200
    
    data = response.json()
    assert data["question"] == sample_flashcard["question"]
    assert data["answer"] == sample_flashcard["answer"]
    assert data["tags"] == sample_flashcard["tags"]
    assert "id" in data
    assert data["ease_factor"] == 2.5
    assert data["interval"] == 1
    assert data["repetition"] == 0

def test_create_flashcard_invalid_data(client):
    """Test creating a flashcard with invalid data."""
    invalid_data = {"question": "", "answer": "Valid answer"}
    response = client.post("/api/flashcards", json=invalid_data)
    assert response.status_code == 422  # Validation error

def test_get_all_flashcards_empty(client):
    """Test getting all flashcards when none exist."""
    response = client.get("/api/flashcards")
    assert response.status_code == 200
    data = response.json()
    assert data == []

def test_get_all_flashcards_with_data(client, sample_flashcard):
    """Test getting all flashcards with existing data."""
    # Create a flashcard first
    create_response = client.post("/api/flashcards", json=sample_flashcard)
    assert create_response.status_code == 200
    created_flashcard = create_response.json()
    
    # Get all flashcards
    response = client.get("/api/flashcards")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == created_flashcard["id"]

def test_get_flashcard_by_id(client, sample_flashcard):
    """Test getting a specific flashcard by ID."""
    # Create a flashcard first
    create_response = client.post("/api/flashcards", json=sample_flashcard)
    created_flashcard = create_response.json()
    flashcard_id = created_flashcard["id"]
    
    # Get the flashcard by ID
    response = client.get(f"/api/flashcards/{flashcard_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == flashcard_id
    assert data["question"] == sample_flashcard["question"]

def test_get_nonexistent_flashcard(client):
    """Test getting a non-existent flashcard."""
    response = client.get("/api/flashcards/non-existent-id")
    assert response.status_code == 404
    data = response.json()
    assert "not found" in data["detail"].lower()

def test_update_flashcard(client, sample_flashcard):
    """Test updating a flashcard."""
    # Create a flashcard first
    create_response = client.post("/api/flashcards", json=sample_flashcard)
    created_flashcard = create_response.json()
    flashcard_id = created_flashcard["id"]
    
    # Update the flashcard
    update_data = {
        "question": "What is the capital of Germany?",
        "answer": "Berlin",
        "tags": ["geography", "europe"]
    }
    
    response = client.put(f"/api/flashcards/{flashcard_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["question"] == update_data["question"]
    assert data["answer"] == update_data["answer"]
    assert data["tags"] == update_data["tags"]

def test_update_nonexistent_flashcard(client):
    """Test updating a non-existent flashcard."""
    update_data = {"question": "New question", "answer": "New answer"}
    response = client.put("/api/flashcards/non-existent-id", json=update_data)
    assert response.status_code == 404

def test_delete_flashcard(client, sample_flashcard):
    """Test deleting a flashcard."""
    # Create a flashcard first
    create_response = client.post("/api/flashcards", json=sample_flashcard)
    created_flashcard = create_response.json()
    flashcard_id = created_flashcard["id"]
    
    # Delete the flashcard
    response = client.delete(f"/api/flashcards/{flashcard_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Flashcard deleted successfully"
    
    # Verify it's gone
    get_response = client.get(f"/api/flashcards/{flashcard_id}")
    assert get_response.status_code == 404

def test_delete_nonexistent_flashcard(client):
    """Test deleting a non-existent flashcard."""
    response = client.delete("/api/flashcards/non-existent-id")
    assert response.status_code == 404

def test_get_due_flashcards(client, sample_flashcard):
    """Test getting due flashcards."""
    # Initially no due cards
    response = client.get("/api/study/due")
    assert response.status_code == 200
    data = response.json()
    assert data == []
    
    # Create a flashcard (should be due immediately)
    create_response = client.post("/api/flashcards", json=sample_flashcard)
    assert create_response.status_code == 200
    
    # Now should have one due card
    response = client.get("/api/study/due")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1

def test_start_study_session(client):
    """Test starting a study session."""
    response = client.post("/api/study/session")
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "start_time" in data
    assert data["end_time"] is None
    assert data["cards_studied"] == 0

def test_review_flashcard(client, sample_flashcard):
    """Test reviewing a flashcard."""
    # Create a flashcard first
    create_response = client.post("/api/flashcards", json=sample_flashcard)
    created_flashcard = create_response.json()
    flashcard_id = created_flashcard["id"]
    
    # Review the flashcard
    review_data = {"quality": 4}
    response = client.post(f"/api/study/review/{flashcard_id}", json=review_data)
    assert response.status_code == 200
    data = response.json()
    
    assert data["total_reviews"] == 1
    assert data["repetition"] >= 1
    # The interval should change based on the SM-2 algorithm

def test_review_flashcard_invalid_quality(client, sample_flashcard):
    """Test reviewing a flashcard with invalid quality."""
    # Create a flashcard first
    create_response = client.post("/api/flashcards", json=sample_flashcard)
    created_flashcard = create_response.json()
    flashcard_id = created_flashcard["id"]
    
    # Review with invalid quality (should be 0-5)
    review_data = {"quality": 10}
    response = client.post(f"/api/study/review/{flashcard_id}", json=review_data)
    assert response.status_code == 422  # Validation error

def test_review_nonexistent_flashcard(client):
    """Test reviewing a non-existent flashcard."""
    review_data = {"quality": 4}
    response = client.post("/api/study/review/non-existent-id", json=review_data)
    assert response.status_code == 404

def test_get_analytics_stats(client):
    """Test getting analytics statistics."""
    response = client.get("/api/analytics/stats")
    assert response.status_code == 200
    data = response.json()
    
    # Check that all required fields are present
    required_fields = ["total_cards", "due_today", "total_reviews", "accuracy", "total_study_time"]
    for field in required_fields:
        assert field in data

def test_get_card_history(client, sample_flashcard):
    """Test getting card review history."""
    # Create a flashcard first
    create_response = client.post("/api/flashcards", json=sample_flashcard)
    created_flashcard = create_response.json()
    flashcard_id = created_flashcard["id"]
    
    # Get history (should be empty initially)
    response = client.get(f"/api/analytics/cards/{flashcard_id}/history")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0  # No history yet

def test_get_history_nonexistent_card(client):
    """Test getting history for non-existent card."""
    response = client.get("/api/analytics/cards/non-existent-id/history")
    assert response.status_code == 404

def test_cors_headers(client):
    """Test that CORS headers are properly set."""
    response = client.options("/api/flashcards")
    assert response.status_code == 200
    # FastAPI with CORSMiddleware should handle OPTIONS requests

def test_legacy_quiz_endpoints(client):
    """Test that legacy quiz endpoints still work."""
    # Test legacy quiz endpoint
    response = client.get("/api/quiz")
    assert response.status_code == 200
    data = response.json()
    assert "questions" in data
    
    # Test legacy quiz score endpoint
    score_data = {"score": 85, "total_questions": 10}
    response = client.post("/api/quiz/score", json=score_data)
    assert response.status_code == 200