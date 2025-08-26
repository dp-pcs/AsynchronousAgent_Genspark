import pytest
import tempfile
import os
from fastapi.testclient import TestClient
from app.main import app
from app.storage.memory_store import MemoryStore

@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)

@pytest.fixture
def temp_storage():
    """Create a temporary storage file for testing."""
    with tempfile.NamedTemporaryFile(suffix='.json', delete=False) as tmp:
        temp_file = tmp.name
    
    yield MemoryStore(temp_file)
    
    # Cleanup
    if os.path.exists(temp_file):
        os.unlink(temp_file)

@pytest.fixture
def sample_flashcard():
    """Sample flashcard data for testing."""
    return {
        "question": "What is the capital of France?",
        "answer": "Paris",
        "tags": ["geography", "capitals"]
    }