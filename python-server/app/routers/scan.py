from fastapi import APIRouter, HTTPException
from app.schemas.pushScan_model import PushScanResponse, PushScanPayload
from app.services.pushScan_service import ScanFiles

router = APIRouter(prefix="/v3", tags=["scan"])

@router.post("/internal/pushScan/run", response_model=PushScanResponse)
async def scan(payload:PushScanPayload)->PushScanResponse:
    try:
        result = await ScanFiles(payload)
        print(result)
        return result
    except Exception as e:
        print(f"Error in scan endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))