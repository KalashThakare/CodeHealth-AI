import os
import sys

def convert_pem_to_env_format(pem_file_path: str) -> str:
    """Convert a PEM file to .env format"""
    try:
        with open(pem_file_path, 'r') as f:
            pem_content = f.read().strip()
        
        # Replace newlines with \n
        env_format = pem_content.replace('\n', '\\n')
        
        # Return the .env line
        return f'GITHUB_PRIVATE_KEY="{env_format}"'
    
    except FileNotFoundError:
        return f"Error: File '{pem_file_path}' not found"
    except Exception as e:
        return f"Error: {str(e)}"

def main():
    if len(sys.argv) != 2:
        print("Usage: python convert_pem_to_env.py <path_to_pem_file>")
        print("Example: python convert_pem_to_env.py my-app.2023-12-01.private-key.pem")
        return
    
    pem_file_path = sys.argv[1]
    result = convert_pem_to_env_format(pem_file_path)
    
    print("Copy this line to your .env file:")
    print("-" * 50)
    print(result)
    print("-" * 50)
    
    # Also save to a file for easy copying
    with open('.env.github_key', 'w') as f:
        f.write(result + '\n')
    
    print(f"Also saved to '.env.github_key' file for easy copying")

if __name__ == "__main__":
    main()