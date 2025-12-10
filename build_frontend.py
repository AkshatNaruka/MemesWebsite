# Build script for frontend integration
import os
import subprocess
import shutil
from pathlib import Path

def build_frontend():
    """Build the React frontend and copy to Flask static directory"""
    frontend_dir = Path(__file__).parent / 'frontend'
    static_dir = Path(__file__).parent / 'static'
    
    # Ensure static directory exists
    static_dir.mkdir(exist_ok=True)
    
    # Change to frontend directory and build
    os.chdir(frontend_dir)
    
    # Install dependencies if node_modules doesn't exist
    if not (frontend_dir / 'node_modules').exists():
        print("Installing frontend dependencies...")
        subprocess.run(['npm', 'install'], check=True)
    
    # Build the frontend
    print("Building frontend...")
    subprocess.run(['npm', 'run', 'build'], check=True)
    
    # Copy built files to Flask static directory
    dist_dir = frontend_dir / 'dist'
    if dist_dir.exists():
        # Remove existing files in static directory
        for item in static_dir.iterdir():
            if item.is_file():
                item.unlink()
            elif item.is_dir():
                shutil.rmtree(item)
        
        # Copy new build
        for item in dist_dir.iterdir():
            if item.is_dir():
                shutil.copytree(item, static_dir / item.name)
            else:
                shutil.copy2(item, static_dir / item.name)
        
        print("Frontend build copied to Flask static directory")
    else:
        raise Exception("Frontend build directory not found")

if __name__ == '__main__':
    build_frontend()