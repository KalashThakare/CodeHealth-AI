from app.schemas.pushScan_model import PushScanPayload, PushScanResponse
from app.services.github_auth import get_installation_token
from app.services.github_api import fetch_changed_files_code
from app.services.scanning import analysisClass
import aiohttp


async def ScanFiles(req: PushScanPayload) -> PushScanResponse:
    try:
        token = await get_installation_token(req.installationId)
        files = await fetch_changed_files_code(
            repoFullName=req.repoName,
            repoId=req.repoId,
            token=token,
            addedFiles=req.filesAdded,
            modifiedFiles=req.filesModified
        )

        print("Files you modified and added in the repo are ==============", files)

        exts = {'.py', '.js', '.ts', '.jsx', '.tsx'}

        filtered_files = [
            file for file in files
            if any(file['path'].endswith(ext) for ext in exts)
        ]

        python_files = [f for f in filtered_files if f['path'].endswith('.py')]
        js_files = [f for f in filtered_files if f['path'].endswith(('.js', '.ts', '.tsx', '.jsx'))]

        print(f"Found {len(python_files)} Python files and {len(js_files)} JS/TS files")

        async with aiohttp.ClientSession() as session:
            # Process Python files
            if python_files:
                analysis = []
                for py_file in python_files:
                    path = py_file["path"]
                    content = py_file["content"]
                    
                    try:
                        analysis_result = await analysisClass.analyze_py_code(path, content)
                        analysis.append(analysis_result)
                        
                        print(f"Analyzed Python file: {path}")
                        print("=" * 100)
                        print(f"Analysis result: {analysis_result}")
                        print("=" * 100)
                        
                    except Exception as e:
                        print(f"Error analyzing {path}: {str(e)}")
                        continue

                if analysis:
                    try:
                        # Convert Pydantic models to dicts for JSON serialization
                        serialized_analysis = [
                            a.model_dump() if hasattr(a, 'model_dump') else a.dict()
                            for a in analysis
                        ]
                        
                        async with session.post(
                            "http://localhost:8080/scanning/python-batch",
                            json={
                                "Metrics": serialized_analysis,
                                "repoId": req.repoId,
                                "branch": "main"  
                            }
                        ) as resp:
                            result = await resp.json()
                            print(f"Python batch result: {result}")
                            print(f"Successfully sent {len(analysis)} Python files to batch API")
                    
                    except Exception as e:
                        print(f"Error sending Python batch: {str(e)}")

            # Process JS/TS files
            if js_files:
                try:
                    async with session.post(
                        "http://localhost:8080/scanning/enqueue-batch",
                        json={
                            "files": js_files,
                            "repoId": req.repoId,
                            "isPushEvent":True
                        }
                    ) as resp:
                        result = await resp.json()
                        print(f"JS/TS batch result: {result}")
                        print(f"Successfully enqueued {len(js_files)} JS/TS files")
                
                except Exception as e:
                    print(f"Error processing JS/TS files: {str(e)}")

        return PushScanResponse(
            ok=True,
            filesScanned=len(filtered_files),
            message=f"Processed {len(python_files)} Python and {len(js_files)} JS/TS files"
        )
    
    except Exception as e:
        print(f"Error in ScanFiles: {str(e)}")
        import traceback
        traceback.print_exc()
        return PushScanResponse(ok=False, filesScanned=0, message=f"Error: {str(e)}")