import os
import re
import base64
from typing import Optional
from dotenv import load_dotenv
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.serialization import load_pem_private_key

def diagnose_private_key() -> None:
    """Diagnose issues with the private key from environment."""
    load_dotenv()
    
    private_key = os.getenv('GITHUB_PRIVATE_KEY')
    
    if not private_key:
        print("❌ GITHUB_PRIVATE_KEY not found in environment variables")
        return
    
    print(f"✅ Key found in environment, length: {len(private_key)} characters")
    print(f"First 50 characters: {repr(private_key[:50])}")
    print(f"Last 50 characters: {repr(private_key[-50:])}")
    
    # Check for common issues
    issues = []
    
    # Check for quotes
    if private_key.startswith('"') and private_key.endswith('"'):
        print("⚠️  Key is wrapped in quotes")
        private_key = private_key[1:-1]  # Remove quotes
        issues.append("wrapped_in_quotes")
    
    # Check for escaped newlines
    if '\\n' in private_key:
        print("✅ Found escaped newlines (\\n)")
        private_key = private_key.replace('\\n', '\n')
        issues.append("escaped_newlines")
    
    # Check headers
    if not private_key.strip().startswith('-----BEGIN'):
        print("❌ Key doesn't start with -----BEGIN")
        
        # Maybe it's base64 encoded?
        try:
            decoded = base64.b64decode(private_key).decode('utf-8')
            if decoded.startswith('-----BEGIN'):
                print("✅ Key appears to be base64 encoded")
                private_key = decoded
                issues.append("base64_encoded")
            else:
                print("❌ Not a valid base64 encoded PEM key either")
                return
        except:
            print("❌ Not base64 encoded")
            return
    else:
        print("✅ Key starts with proper PEM header")
    
    if not private_key.strip().endswith('-----END PRIVATE KEY-----') and not private_key.strip().endswith('-----END RSA PRIVATE KEY-----'):
        print("❌ Key doesn't end with proper PEM footer")
        return
    else:
        print("✅ Key ends with proper PEM footer")
    
    # Check for invalid characters
    lines = private_key.split('\n')
    for i, line in enumerate(lines):
        if line.startswith('-----'):
            continue  # Skip header/footer lines
        if line.strip() == '':
            continue  # Skip empty lines
        
        # Check if line contains only valid base64 characters
        if not re.match(r'^[A-Za-z0-9+/=]*$', line.strip()):
            print(f"❌ Line {i+1} contains invalid characters: {repr(line)}")
            return
    
    print("✅ All lines contain valid characters")
    
    # Try to load the key
    try:
        key_bytes = private_key.encode('utf-8')
        loaded_key = load_pem_private_key(key_bytes, password=None)
        print("✅ Key loaded successfully!")
        print(f"Key type: {type(loaded_key).__name__}")
        print(f"Key size: {loaded_key.key_size} bits")
        
        # Generate the corrected .env format
        print("\n" + "="*50)
        print("CORRECTED .env FORMAT:")
        print("="*50)
        corrected_key = private_key.replace('\n', '\\n')
        print(f'GITHUB_PRIVATE_KEY="{corrected_key}"')
        
    except Exception as e:
        print(f"❌ Failed to load key: {str(e)}")
        
        # Try to provide more specific help
        if "InvalidData" in str(e):
            print("\n🔧 TROUBLESHOOTING STEPS:")
            print("1. Make sure you copied the ENTIRE private key including headers")
            print("2. Check that there are no extra characters or spaces")
            print("3. Verify the key file wasn't corrupted during copy/paste")
            print("4. Try re-downloading the private key from GitHub")

def clean_private_key(raw_key: str) -> str:
    """Clean and format a private key string."""
    # Remove quotes if present
    if raw_key.startswith('"') and raw_key.endswith('"'):
        raw_key = raw_key[1:-1]
    
    # Handle escaped newlines
    if '\\n' in raw_key:
        raw_key = raw_key.replace('\\n', '\n')
    
    # Try base64 decode if it doesn't start with -----BEGIN
    if not raw_key.strip().startswith('-----BEGIN'):
        try:
            raw_key = base64.b64decode(raw_key).decode('utf-8')
        except:
            pass
    
    # Remove any extra whitespace
    raw_key = raw_key.strip()
    
    return raw_key

if __name__ == "__main__":
    diagnose_private_key()