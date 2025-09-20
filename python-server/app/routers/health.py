from fastapi import APIRouter

router = APIRouter(prefix="", tags=["health"])

@router.get("/health")
def health():
    return {"status": "ok"}
