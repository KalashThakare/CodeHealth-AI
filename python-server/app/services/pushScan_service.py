from app.schemas.pushScan_model import PushScanPayload, PushScanResponse
from app.services.github_auth import get_installation_token
from app.services.github_api import fetch_changed_files_code


async def ScanFiles(req:PushScanPayload)->PushScanResponse:
    try:
        token = await get_installation_token(req.installationId)
        files = await fetch_changed_files_code(
            repoFullName=req.repoName,
            repoId=req.repoId,
            token=token,
            addedFiles=req.filesAdded,
            modifiedFiles=req.filesModified
        )

        print("Files you modified and added in the repo are ==============",files)

        return PushScanResponse(ok=True)
    
    except Exception as e:
        print(f"Error in ScanFiles: {str(e)}")
        return PushScanResponse(ok=False)
    