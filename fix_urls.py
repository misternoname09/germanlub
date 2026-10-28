import os
import re

FRONTEND_APP_DIR = r"c:\germanlub_shop\frontend\src\app"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip interceptor itself
    if "url.interceptor.ts" in filepath:
        return

    # Check if there's any http://localhost:8000/api
    if "http://localhost:8000/api" not in content:
        # Check for admin
        if "http://localhost:8000/admin" in content:
            content = content.replace("http://localhost:8000/admin", "https://germanlub.com/admin")
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed admin URL in {filepath}")
        return

    # Replace hardcoded URLs with environment.apiUrl
    # Pattern: 'http://localhost:8000/api/...' -> `${environment.apiUrl}/...`
    # Pattern: `http://localhost:8000/api/...` -> `${environment.apiUrl}/...`
    
    # Simple replace for exact strings
    content = content.replace("'http://localhost:8000/api/", "`${environment.apiUrl}/")
    content = content.replace("`http://localhost:8000/api/", "`${environment.apiUrl}/")
    
    # We might have left some trailing quotes if it was a single quote string without variables
    # e.g. `${environment.apiUrl}/categories/' -> `${environment.apiUrl}/categories/`
    content = re.sub(r"(`\$\{environment\.apiUrl\}/.*?)(')", r"\1`", content)
    
    # Ensure environment is imported
    if "import { environment }" not in content:
        # Calculate depth for relative import
        # frontend/src/app = 0
        rel_path = os.path.relpath(filepath, FRONTEND_APP_DIR)
        depth = rel_path.count(os.sep)
        import_path = "../" * depth + "environments/environment"
        if depth == 0:
            import_path = "./environments/environment"
            
        import_stmt = f"import {{ environment }} from '{import_path}';\n"
        
        # Insert after the last import
        lines = content.split('\n')
        last_import_idx = -1
        for i, line in enumerate(lines):
            if line.startswith('import '):
                last_import_idx = i
                
        if last_import_idx != -1:
            lines.insert(last_import_idx + 1, import_stmt)
        else:
            lines.insert(0, import_stmt)
            
        content = '\n'.join(lines)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed API URL in {filepath}")

def main():
    print("Fixing hardcoded localhost URLs...")
    for root, dirs, files in os.walk(FRONTEND_APP_DIR):
        for file in files:
            if file.endswith('.ts'):
                process_file(os.path.join(root, file))
    print("Done!")

if __name__ == "__main__":
    main()
