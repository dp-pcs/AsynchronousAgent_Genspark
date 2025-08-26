from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, field_validator
import re

app = FastAPI(title="Agent Benchmark API")

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

# Enhanced validation with comprehensive error handling
@app.post("/quiz/create")
def quiz_create(item: QuizItem):
    """
    Create a quiz item with comprehensive validation.
    
    - Question: 3-1000 characters, meaningful text required
    - Answer: 1-1000 characters, non-empty
    - Both fields are trimmed of excess whitespace
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

@app.get("/healthz")
def healthz():
    return {"ok": True}
