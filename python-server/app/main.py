from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="CodeHealth AI Python API", version="0.1.0")

# Allow local frontend/backend; adjust ports as needed
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    repo: str = Field(..., min_length=1)
    branch: str = "main"
    threshold: float = Field(0.5, ge=0.0, le=1.0)

class AnalyzeResponse(BaseModel):
    ok: bool
    score: float
    message: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/v1/analyze", response_model=AnalyzeResponse)
def analyze(payload: AnalyzeRequest):
    # dummy scoring based on repo length as a placeholder for real logic
    score = min(1.0, max(0.0, len(payload.repo) / 100.0))
    return AnalyzeResponse(
        ok=True,
        score=score,
        message=f"Analyzed {payload.repo} on {payload.branch}",
    )

@app.get("/")
def root():
    return {"message": "Welcome to CodeHealth AI Python API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8002")), reload=True)
