# API v1 Implementation Notes

## Overview

This document describes the implementation of the Template and Asset APIs for the Meme Generator application.

## Architecture

### Blueprints
- `main` (routes.py): Original Flask blueprint with "/" and "/memes" endpoints
- `api_v1` (api_v1.py): New REST API blueprint with versioned endpoints at `/api/v1`

### Project Structure
```
.
├── app.py                          # Flask app factory
├── config.py                       # Configuration
├── extensions.py                   # Extensions (db, migrate, redis_client)
├── models.py                       # SQLAlchemy models
├── routes.py                       # Main blueprint
├── api_v1.py                       # API v1 blueprint
├── schemas.py                      # Marshmallow validation schemas
├── services/                       # External API integrations
│   ├── __init__.py
│   ├── reddit_service.py          # Reddit API service
│   └── giphy_service.py           # Giphy API service
├── migrations/                     # Database migrations
├── tests/
│   ├── test_models.py             # Model tests
│   └── test_api_v1.py             # API endpoint tests
└── requirements.txt                # Python dependencies
```

## Implementation Details

### 1. External API Integrations

#### Reddit Service (services/reddit_service.py)
- Fetches hot posts from r/memes subreddit
- Implements retry mechanism with exponential backoff (max 3 retries)
- Filters for image-only posts (.jpg, .png, .gif, .jpeg)
- Extracts: id, title, image_url, score, author, created_at, subreddit
- Caches results in Redis for 1 hour (configurable)

#### Giphy Service (services/giphy_service.py)
- Searches GIFs using Giphy API
- Requires GIPHY_API_KEY in environment
- Implements retry mechanism with exponential backoff
- Filters for G-rated content only
- Caches results per query in Redis for 30 minutes (configurable)
- Returns: id, title, url, embed_url, image_url

### 2. Validation & Serialization

Marshmallow schemas in `schemas.py`:
- **TemplateSchema**: Template listing with nested categories
- **TemplateDetailSchema**: Detailed template with fields/layers metadata
- **StickerSchema**, **FontSchema**: Asset schemas
- **TrendingItemSchema**: Trending content with source tracking
- **GifSchema**: GIF search results
- **MemeSchema**, **MemeCreateSchema**: Meme creation and retrieval
- **DraftCreateSchema**: Draft composition state
- **ErrorSchema**: Standardized error responses

**Note**: Used `data_key='fields'` to avoid shadowing the built-in `fields` import from marshmallow.

### 3. Database Models

New model added:
- **MemeDraft**: Stores draft compositions with:
  - title: Draft name
  - user_id: Foreign key to User (optional)
  - template_id: Foreign key to MemeTemplate (optional)
  - data: JSON column for raw composition state
  - created_at, updated_at: Timestamps

### 4. API Endpoints

#### Templates
- `GET /api/v1/templates` - List with pagination, filtering, search
- `GET /api/v1/templates/<id>` - Get with metadata and fields

#### Assets
- `GET /api/v1/stickers` - Sticker library with category filtering
- `GET /api/v1/fonts` - Available fonts
- `GET /api/v1/assets/categories` - All asset categories

#### Trending
- `GET /api/v1/trending` - Aggregated trending content (currently Reddit only)
  - Future: Could extend to include MemeAPI, Twitter, TikTok, etc.
  - Caching: 1 hour TTL in Redis

#### GIF Search
- `GET /api/v1/gifs?query=cat` - Giphy GIF search
  - Requires query parameter
  - Optional limit parameter (max 50)
  - Caching: 30 minutes per query in Redis

#### Memes
- `GET /api/v1/memes` - List saved memes with pagination
- `GET /api/v1/memes/<id>` - Get specific meme with all layers
- `POST /api/v1/memes` - Save finalized meme with layers

#### Drafts
- `POST /api/v1/memes/draft` - Create draft
- `GET /api/v1/memes/draft/<id>` - Get draft
- `PUT /api/v1/memes/draft/<id>` - Update draft
- `DELETE /api/v1/memes/draft/<id>` - Delete draft
- `GET /api/v1/memes/drafts` - List drafts with pagination

### 5. Error Handling

Consistent error response format:
```json
{
  "error": "ErrorType",
  "message": "Detailed message",
  "status_code": 400
}
```

Common error types:
- BadRequest (400): Invalid parameters or validation failure
- NotFound (404): Resource not found
- ValidationError (400): Marshmallow validation failure
- ServiceUnavailable (502): External API unreachable
- InternalServerError (500): Unexpected server error

### 6. Caching Strategy

**Redis Configuration:**
- Set via `REDIS_URL` environment variable
- Defaults to `redis://localhost:6379/0`
- Gracefully handles missing Redis (no caching)

**Cache Keys:**
- `trending:reddit:hot` - Trending Reddit content (1 hour)
- `gifs:{query}` - GIF search results (30 minutes)

**Cache Implementation:**
- Uses `extensions.redis_client` singleton
- Respects TTL configuration
- Handles missing keys gracefully (returns empty list, then fetches)

### 7. Configuration

Required environment variables:
- `SECRET_KEY` - Flask secret key
- `DATABASE_URL` - Database connection string
- `REDIS_URL` - Redis connection string (optional)
- `REDDIT_CLIENT_ID` - Reddit API credentials
- `REDDIT_CLIENT_SECRET` - Reddit API credentials
- `GIPHY_API_KEY` - Giphy API key

### 8. Database Migrations

Migration generated with Alembic:
```bash
python -m flask db migrate -m "Add MemeDraft model"
python -m flask db upgrade
```

Ensures backward compatibility with existing tables.

## Testing

Comprehensive test suite in `tests/test_api_v1.py`:
- 21 test cases covering all endpoints
- Tests pagination, filtering, error handling
- In-memory SQLite for isolation
- No external API calls in tests

Run tests:
```bash
python -m unittest tests.test_api_v1 -v
```

## Future Enhancements

1. **Authentication**: Implement JWT/OAuth2
2. **Rate Limiting**: Add per-user/IP rate limits
3. **Webhooks**: Notify when memes are created
4. **Batch Operations**: Create multiple memes at once
5. **Advanced Filtering**: More granular search options
6. **Performance**: Add database indexes, query optimization
7. **Additional Providers**: Twitter, TikTok, Instagram trending
8. **Caching Headers**: ETag, Cache-Control for client-side caching
9. **Versioning**: Support multiple API versions

## Known Limitations

1. Reddit API calls are unauthenticated (rate limited)
2. No pagination in GIF search results
3. Caching requires Redis (gracefully disabled if unavailable)
4. No authentication/authorization on endpoints
5. Single threading for background refresh (blocking)

## Performance Considerations

- **Pagination**: Templates and memes queries use SQLAlchemy pagination (limit/offset)
- **Caching**: External API responses cached in Redis to reduce load
- **Lazy Loading**: Relationships use `lazy='dynamic'` for deferred loading
- **Query Optimization**: Fields are explicitly selected in schemas

## Security Considerations

- No authentication/authorization implemented
- Input validation via Marshmallow schemas
- SQL injection protection via SQLAlchemy ORM
- XSS protection not applicable (JSON-only responses)
- CSRF protection should be added at gateway level

## Deployment Notes

1. Install dependencies: `pip install -r requirements.txt`
2. Set environment variables from `.env.example`
3. Run migrations: `python -m flask db upgrade`
4. Seed database: `python -m flask seed`
5. Start application: `python app.py` or `gunicorn app:app`

## Troubleshooting

**Redis Connection Error**
- Check Redis is running: `redis-cli ping`
- Verify REDIS_URL: `echo $REDIS_URL`
- If Redis unavailable, app continues without caching

**Missing GIFs**
- Verify GIPHY_API_KEY environment variable
- Check API key is valid at giphy.com
- If key missing, endpoint returns empty array gracefully

**Trending Returns 502**
- Reddit API may be temporarily unavailable
- Check network connectivity: `curl -I https://api.reddit.com`
- Retry after 60 seconds

**Database Errors**
- Ensure migrations are up to date: `python -m flask db upgrade`
- Check DATABASE_URL: `echo $DATABASE_URL`
- For PostgreSQL, ensure psycopg2-binary is installed
