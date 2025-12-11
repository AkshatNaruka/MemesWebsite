from flask import Blueprint, send_from_directory, jsonify, send_file
import os
import requests
from config import Config

main = Blueprint('main', __name__)

@main.route('/')
def home():
    """Serve the SPA frontend"""
    # Check if we're in development mode (frontend dev server running)
    if os.environ.get('FLASK_ENV') == 'development' and os.environ.get('DEV_FRONTEND_URL'):
        return f'''
        <!DOCTYPE html>
        <html>
        <head>
            <title>Meme Editor - Development</title>
            <meta http-equiv="refresh" content="0; url={os.environ.get('DEV_FRONTEND_URL')}" />
        </head>
        <body>
            <p>Redirecting to development server at {os.environ.get('DEV_FRONTEND_URL')}</p>
            <p>If you are not redirected automatically, <a href="{os.environ.get('DEV_FRONTEND_URL')}">click here</a>.</p>
        </body>
        </html>
        '''
    
    # Serve the built SPA
    try:
        return send_from_directory('static', 'index.html')
    except:
        # Fallback to old template if static build doesn't exist
        return '''
        <!DOCTYPE html>
        <html>
        <head>
            <title>Meme Editor - Setup Required</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    text-align: center; 
                    padding: 50px; 
                    background: #f5f5f5; 
                }
                .container {
                    background: white;
                    padding: 40px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    max-width: 500px;
                    margin: 0 auto;
                }
                .btn {
                    background: #3b82f6;
                    color: white;
                    padding: 12px 24px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                    margin: 10px;
                    text-decoration: none;
                    display: inline-block;
                }
                .btn:hover {
                    background: #2563eb;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 Meme Editor Setup</h1>
                <p>The frontend needs to be built before the editor can be used.</p>
                <p><strong>To get started:</strong></p>
                <ol style="text-align: left; margin: 20px 0;">
                    <li>Install frontend dependencies: <code>cd frontend && npm install</code></li>
                    <li>Build the frontend: <code>python build_frontend.py</code></li>
                    <li>Or run in development mode: <code>cd frontend && npm run dev</code></li>
                </ol>
                <a href="/memes" class="btn">View Old Memes Page</a>
                <a href="/api/v1" class="btn">API Documentation</a>
            </div>
        </body>
        </html>
        '''

@main.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files from the built frontend"""
    return send_from_directory('static', filename)

@main.route('/memes')
def get_memes():
    # Fetch memes from Reddit API
    # Using the Config might be overkill for this simple logic but good practice if we parameterized the subreddit
    url = 'https://api.reddit.com/r/memes/hot'
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            
            # Extract relevant information from the response
            memes = []
            if 'data' in data and 'children' in data['data']:
                for post in data['data']['children']:
                    post_data = post.get('data', {})
                    # Filter for images
                    url_val = post_data.get('url', '')
                    if url_val.endswith(('.jpg', '.png', '.gif', '.jpeg')):
                        meme = {
                            'title': post_data.get('title'),
                            'image': url_val,
                            'score': post_data.get('score')
                        }
                        memes.append(meme)
            return jsonify(memes)
        else:
            return jsonify({'error': 'Failed to fetch memes from Reddit'}), 502
    except Exception as e:
         return jsonify({'error': str(e)}), 500
