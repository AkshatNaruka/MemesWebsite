import requests
import time
from functools import wraps
from typing import List, Dict, Any
import extensions


def retry_with_backoff(max_retries=3, backoff_factor=1):
    """Decorator for retrying with exponential backoff."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            retries = 0
            while retries < max_retries:
                try:
                    return func(*args, **kwargs)
                except requests.RequestException as e:
                    retries += 1
                    if retries >= max_retries:
                        raise
                    wait_time = backoff_factor * (2 ** (retries - 1))
                    time.sleep(wait_time)
            return None
        return wrapper
    return decorator


@retry_with_backoff(max_retries=3, backoff_factor=1)
def fetch_reddit_hot_feed(subreddit='memes', limit=25) -> List[Dict[str, Any]]:
    """Fetch hot posts from a Reddit subreddit."""
    url = f'https://api.reddit.com/r/{subreddit}/hot'
    headers = {'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36'}
    
    response = requests.get(url, headers=headers, timeout=10, params={'limit': limit})
    response.raise_for_status()
    
    data = response.json()
    memes = []
    
    if 'data' in data and 'children' in data['data']:
        for post in data['data']['children']:
            post_data = post.get('data', {})
            url_val = post_data.get('url', '')
            
            # Only include image posts
            if url_val.endswith(('.jpg', '.png', '.gif', '.jpeg')):
                meme = {
                    'id': post_data.get('id'),
                    'title': post_data.get('title'),
                    'image_url': url_val,
                    'score': post_data.get('score'),
                    'author': post_data.get('author'),
                    'created_at': post_data.get('created_utc'),
                    'subreddit': post_data.get('subreddit'),
                    'source': 'reddit'
                }
                memes.append(meme)
    
    return memes


def get_trending_content(cache_ttl=3600) -> List[Dict[str, Any]]:
    """Get trending memes from Reddit with caching."""
    cache_key = 'trending:reddit:hot'
    
    if extensions.redis_client:
        cached = extensions.redis_client.get(cache_key)
        if cached:
            import json
            return json.loads(cached)
    
    memes = fetch_reddit_hot_feed(subreddit='memes', limit=25)
    
    if extensions.redis_client and memes:
        import json
        extensions.redis_client.setex(
            cache_key, 
            cache_ttl, 
            json.dumps(memes)
        )
    
    return memes
