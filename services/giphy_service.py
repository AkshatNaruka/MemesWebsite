import requests
import time
from functools import wraps
from typing import List, Dict, Any
import extensions
from config import Config


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
def search_gifs(query: str, limit: int = 20) -> List[Dict[str, Any]]:
    """Search for GIFs on Giphy."""
    api_key = Config.GIPHY_API_KEY
    if not api_key:
        return []
    
    url = 'https://api.giphy.com/v1/gifs/search'
    params = {
        'api_key': api_key,
        'q': query,
        'limit': limit,
        'offset': 0,
        'rating': 'g'  # Keep it family-friendly
    }
    
    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    
    data = response.json()
    gifs = []
    
    if 'data' in data:
        for gif in data['data']:
            gif_data = {
                'id': gif.get('id'),
                'title': gif.get('title', ''),
                'url': gif.get('url', ''),
                'embed_url': gif.get('embed_url', ''),
                'image_url': gif.get('images', {}).get('fixed_height', {}).get('url', ''),
                'source': 'giphy'
            }
            gifs.append(gif_data)
    
    return gifs


def get_cached_gifs(query: str, cache_ttl=1800) -> List[Dict[str, Any]]:
    """Get cached GIF search results."""
    cache_key = f'gifs:{query}'
    
    if extensions.redis_client:
        cached = extensions.redis_client.get(cache_key)
        if cached:
            import json
            return json.loads(cached)
    
    gifs = search_gifs(query)
    
    if extensions.redis_client and gifs:
        import json
        extensions.redis_client.setex(
            cache_key, 
            cache_ttl, 
            json.dumps(gifs)
        )
    
    return gifs
