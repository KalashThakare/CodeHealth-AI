import jwt
from typing import Optional, List, Dict, Any
from app.schemas.githubSchema import GitHubSettings
import time
import httpx
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.serialization import load_pem_private_key

gs = GitHubSettings()

GITHUB_API_VERSION = "2022-11-28"
GITHUB_APP_ID = gs.github_app_id
GITHUB_PRIVATE_KEY = gs.github_private_key

def _prepare_private_key(pem_content: str) -> str:
    """
    Prepare and validate the private key for JWT signing.
    Handles various PEM formats and ensures proper formatting.
    """
    try:

        pem_content = pem_content.strip()
        
        if not pem_content.startswith('-----BEGIN'):
            raise ValueError("Private key must be in PEM format starting with -----BEGIN")
        
        key_bytes = pem_content.encode('utf-8')
        private_key = load_pem_private_key(key_bytes, password=None)
        
        pem_bytes = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        
        return pem_bytes.decode('utf-8')
        
    except Exception as e:
        raise ValueError(f"Invalid private key format: {str(e)}")

def _make_app_jwt(app_id: str, pem: str) -> str:
    """
    Create a JWT for GitHub App authentication.
    """
    try:
        # Prepare the private key
        prepared_key = _prepare_private_key(pem)
        
        now = int(time.time())
        payload = {
            "iat": now - 60,         
            "exp": now + 9 * 60,     
            "iss": app_id,           
        }
        
        return jwt.encode(payload, prepared_key, algorithm="RS256")
        
    except Exception as e:
        raise RuntimeError(f"Failed to create JWT token: {str(e)}")

async def get_installation_token(installation_id: int, *, app_id: Optional[str] = None, pem: Optional[str] = None) -> str:
    """
    Get an installation access token for the GitHub App.
    """
    app_id = app_id or GITHUB_APP_ID
    pem = pem or GITHUB_PRIVATE_KEY
    
    if not app_id:
        raise RuntimeError("Missing GitHub App ID")
    if not pem:
        raise RuntimeError("Missing GitHub Private Key")
    
    try:

        jwt_token = _make_app_jwt(app_id, pem)

        url = f"https://api.github.com/app/installations/{installation_id}/access_tokens"
        headers = {
            "Authorization": f"Bearer {jwt_token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": GITHUB_API_VERSION,
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data["token"]
            
    except httpx.HTTPStatusError as e:
        error_detail = ""
        try:
            error_data = e.response.json()
            error_detail = f": {error_data.get('message', 'Unknown error')}"
        except:
            pass
        raise RuntimeError(f"GitHub API error ({e.response.status_code}){error_detail}")
    
    except Exception as e:
        raise RuntimeError(f"Failed to get installation token: {str(e)}")

def _gh_headers(token: str) -> Dict[str, str]:
    """
    Create standard headers for GitHub API requests.
    """
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": GITHUB_API_VERSION,
    }
