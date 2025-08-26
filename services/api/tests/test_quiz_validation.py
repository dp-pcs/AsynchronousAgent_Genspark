import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestQuizValidation:
    """Comprehensive tests for quiz creation input validation"""
    
    def test_valid_quiz_creation(self):
        """Test successful quiz creation with valid input"""
        valid_data = {
            "question": "What is 2+2?",
            "answer": "4"
        }
        
        response = client.post('/quiz/create', json=valid_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["item"]["question"] == "What is 2+2?"
        assert data["item"]["answer"] == "4"
        assert "metadata" in data
        assert data["metadata"]["question_length"] == 12
        assert data["metadata"]["answer_length"] == 1

    def test_empty_payload(self):
        """Test rejection of completely empty payload"""
        response = client.post('/quiz/create', json={})
        
        assert response.status_code == 422  # Pydantic validation error
        
    def test_missing_question(self):
        """Test rejection when question field is missing"""
        response = client.post('/quiz/create', json={"answer": "42"})
        
        assert response.status_code == 422
        
    def test_missing_answer(self):
        """Test rejection when answer field is missing"""
        response = client.post('/quiz/create', json={"question": "What is life?"})
        
        assert response.status_code == 422

    def test_empty_string_question(self):
        """Test rejection of empty string question"""
        response = client.post('/quiz/create', json={
            "question": "",
            "answer": "Some answer"
        })
        
        assert response.status_code == 422
        
    def test_empty_string_answer(self):
        """Test rejection of empty string answer"""
        response = client.post('/quiz/create', json={
            "question": "Valid question?",
            "answer": ""
        })
        
        assert response.status_code == 422

    def test_whitespace_only_question(self):
        """Test rejection of whitespace-only question"""
        whitespace_questions = ["   ", "\t\t", "\n\n", " \t \n "]
        
        for question in whitespace_questions:
            response = client.post('/quiz/create', json={
                "question": question,
                "answer": "Valid answer"
            })
            
            assert response.status_code == 422  # Pydantic validation error
            detail = response.json()["detail"]
            # Check that validation failed appropriately
            assert isinstance(detail, list) or "at least 3 characters" in str(detail)

    def test_whitespace_only_answer(self):
        """Test rejection of whitespace-only answer"""
        whitespace_answers = ["   ", "\t\t", "\n\n", " \t \n "]
        
        for answer in whitespace_answers:
            response = client.post('/quiz/create', json={
                "question": "Valid question?",
                "answer": answer
            })
            
            assert response.status_code == 422  # Pydantic validation error
            detail = response.json()["detail"]
            # Check that validation failed appropriately  
            assert isinstance(detail, list) or "at least 1 character" in str(detail)

    def test_too_short_question(self):
        """Test rejection of questions that are too short"""
        short_questions = ["A", "Hi", "??"]
        
        for question in short_questions:
            response = client.post('/quiz/create', json={
                "question": question,
                "answer": "Valid answer"
            })
            
            assert response.status_code == 422  # Pydantic validation error
            detail = response.json()["detail"] 
            assert isinstance(detail, list) or "at least 3 characters" in str(detail)

    def test_too_long_question(self):
        """Test rejection of questions that are too long"""
        long_question = "A" * 1001  # Exceeds 1000 character limit
        
        response = client.post('/quiz/create', json={
            "question": long_question,
            "answer": "Valid answer"
        })
        
        assert response.status_code == 422  # Pydantic validation

    def test_too_long_answer(self):
        """Test rejection of answers that are too long"""
        long_answer = "A" * 1001  # Exceeds 1000 character limit
        
        response = client.post('/quiz/create', json={
            "question": "Valid question?",
            "answer": long_answer
        })
        
        assert response.status_code == 422  # Pydantic validation

    def test_punctuation_only_question(self):
        """Test rejection of questions with only punctuation"""
        punctuation_questions = ["???", "!!!", "...", "---", "###"]
        
        for question in punctuation_questions:
            response = client.post('/quiz/create', json={
                "question": question,
                "answer": "Valid answer"
            })
            
            assert response.status_code == 422  # Pydantic validation error
            detail = response.json()["detail"]
            assert isinstance(detail, list) or "meaningful text" in str(detail) or "at least 3 characters" in str(detail)

    def test_numbers_only_question(self):
        """Test rejection of questions with only numbers"""
        number_questions = ["123", "456789", "0"]
        
        for question in number_questions:
            response = client.post('/quiz/create', json={
                "question": question,
                "answer": "Valid answer"
            })
            
            assert response.status_code == 422  # Pydantic validation error
            detail = response.json()["detail"]
            assert isinstance(detail, list) or "meaningful text" in str(detail) or "at least 3 characters" in str(detail)

    def test_identical_question_and_answer(self):
        """Test rejection when question and answer are identical"""
        identical_text = "Same content"
        
        response = client.post('/quiz/create', json={
            "question": identical_text,
            "answer": identical_text
        })
        
        assert response.status_code == 400
        assert "cannot be identical" in response.json()["detail"]

    def test_case_insensitive_identical_check(self):
        """Test case-insensitive identical question/answer check"""
        response = client.post('/quiz/create', json={
            "question": "HELLO WORLD",
            "answer": "hello world"
        })
        
        assert response.status_code == 400
        assert "cannot be identical" in response.json()["detail"]

    def test_xss_prevention(self):
        """Test prevention of XSS patterns"""
        xss_patterns = [
            "<script>alert('xss')</script>",
            "javascript:alert('xss')",
            "data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4=",
        ]
        
        for pattern in xss_patterns:
            # Test in question
            response = client.post('/quiz/create', json={
                "question": f"Is this safe? {pattern}",
                "answer": "No"
            })
            
            assert response.status_code == 400
            assert "potentially harmful patterns" in response.json()["detail"]
            
            # Test in answer
            response = client.post('/quiz/create', json={
                "question": "Is this safe?",
                "answer": f"No: {pattern}"
            })
            
            assert response.status_code == 400
            assert "potentially harmful patterns" in response.json()["detail"]

    def test_whitespace_normalization(self):
        """Test that excessive whitespace is normalized"""
        response = client.post('/quiz/create', json={
            "question": "What    is     2+2?",  # Multiple spaces
            "answer": " 4 "  # Leading/trailing spaces
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["item"]["question"] == "What is 2+2?"  # Normalized
        assert data["item"]["answer"] == "4"  # Trimmed

    def test_unicode_support(self):
        """Test proper handling of Unicode characters"""
        unicode_data = {
            "question": "What is 你好 in English?",
            "answer": "Hello 🌍"
        }
        
        response = client.post('/quiz/create', json=unicode_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["item"]["question"] == "What is 你好 in English?"
        assert data["item"]["answer"] == "Hello 🌍"

    def test_null_values(self):
        """Test rejection of null values"""
        response = client.post('/quiz/create', json={
            "question": None,
            "answer": "Valid answer"
        })
        
        assert response.status_code == 422
        
        response = client.post('/quiz/create', json={
            "question": "Valid question?",
            "answer": None
        })
        
        assert response.status_code == 422

    def test_invalid_data_types(self):
        """Test rejection of invalid data types"""
        invalid_types = [123, True, [], {}]
        
        for invalid_value in invalid_types:
            response = client.post('/quiz/create', json={
                "question": invalid_value,
                "answer": "Valid answer"
            })
            
            assert response.status_code == 422
            
            response = client.post('/quiz/create', json={
                "question": "Valid question?",
                "answer": invalid_value
            })
            
            assert response.status_code == 422

    def test_malformed_json(self):
        """Test handling of malformed JSON - simplified version"""
        # Test with invalid content type to simulate malformed request
        response = client.post(
            '/quiz/create',
            content='{"question": "Valid?", "answer":}',  # Malformed JSON
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 422

    def test_boundary_values(self):
        """Test boundary values for string lengths"""
        # Test minimum valid lengths
        response = client.post('/quiz/create', json={
            "question": "Hi?",  # Exactly 3 chars
            "answer": "Y"       # Exactly 1 char
        })
        
        assert response.status_code == 200
        
        # Test maximum valid lengths
        max_question = "Q" + "x" * 998 + "?"  # Exactly 1000 chars
        max_answer = "A" * 1000               # Exactly 1000 chars
        
        response = client.post('/quiz/create', json={
            "question": max_question,
            "answer": max_answer
        })
        
        assert response.status_code == 200