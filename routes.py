from flask import Blueprint, render_template, jsonify
import requests
from config import Config

main = Blueprint('main', __name__)

@main.route('/')
def home():
    return render_template('index.html')

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
