import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_healthz():
    r = client.get('/healthz')
    assert r.status_code == 200
    assert r.json().get('ok') is True

def test_quiz_create_allows_empty_payload_but_shouldnt():
    # This test intentionally encodes the *desired* behavior (should reject empty payload).
    r = client.post('/quiz/create', json={})
    assert r.status_code == 422  # FastAPI returns 422 for validation errors
