from fastapi import FastAPI
from app.core.cors import setup_cors
from app.core.config import settings
from app.routers import health, analyze, llmInsights, scan

app = FastAPI(title="CodeHealth AI Python API", version="0.1.0")
setup_cors(app, settings.ALLOWED_ORIGINS)

app.include_router(health.router)
app.include_router(analyze.router)
app.include_router(llmInsights.router)
app.include_router(scan.router)

@app.get("/")
def root():
    return {"message": "Welcome to CodeHealth AI Python API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=True,
    )
