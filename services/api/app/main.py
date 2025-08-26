from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Agent Benchmark API")

class QuizItem(BaseModel):
    question: str
    answer: str

# Fixed: Added proper validation
@app.post("/quiz/create")
def quiz_create(item: QuizItem):
    # Validate that question/answer are present and non-empty
    if not item.question or not item.question.strip():
        raise HTTPException(status_code=400, detail="Question is required and cannot be empty")
    if not item.answer or not item.answer.strip():
        raise HTTPException(status_code=400, detail="Answer is required and cannot be empty")
    return {"status": "ok", "item": item}

@app.get("/healthz")
def healthz():
    return {"ok": True}
