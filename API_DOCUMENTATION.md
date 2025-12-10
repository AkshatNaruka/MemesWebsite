# Meme API v1 Documentation

## Base URL
```
/api/v1
```

## Endpoints

### Templates

#### GET /templates
Fetch all templates with optional filtering and pagination.

**Query Parameters:**
- `page` (int, optional): Page number (default: 1)
- `per_page` (int, optional): Items per page (default: 10)
- `category_id` (int, optional): Filter by category ID
- `search` (string, optional): Search templates by name

**Response (200 OK):**
```json
{
  "page": 1,
  "per_page": 10,
  "total": 25,
  "items": [
    {
      "id": 1,
      "name": "Drake Hotline Bling",
      "image_url": "https://i.imgflip.com/30b1gx.jpg",
      "category_id": 1,
      "category": {
        "id": 1,
        "name": "Classic"
      },
      "fields": [],
      "created_at": "2024-01-01T12:00:00"
    }
  ]
}
```

---

#### GET /templates/{id}
Fetch a specific template with all metadata and fields.

**Parameters:**
- `id` (int, required): Template ID

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Drake Hotline Bling",
  "image_url": "https://i.imgflip.com/30b1gx.jpg",
  "category": {
    "id": 1,
    "name": "Classic"
  },
  "fields": [
    {
      "id": 1,
      "name": "Top Text",
      "x_pos": 10,
      "y_pos": 20,
      "width": 300,
      "height": 100,
      "default_font_id": 1,
      "default_color": "#FFFFFF"
    }
  ],
  "created_at": "2024-01-01T12:00:00"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Not Found",
  "message": "Template not found",
  "status_code": 404
}
```

---

### Stickers

#### GET /stickers
Fetch all stickers with optional category filter.

**Query Parameters:**
- `category_id` (int, optional): Filter by category ID

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Sunglass",
    "image_url": "stickers/sunglass.png",
    "category_id": 1,
    "category": {
      "id": 1,
      "name": "Objects"
    }
  }
]
```

---

### Fonts

#### GET /fonts
Fetch all available fonts.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Impact",
    "file_path": "fonts/Impact.ttf"
  },
  {
    "id": 2,
    "name": "Arial",
    "file_path": "fonts/Arial.ttf"
  }
]
```

---

### Asset Categories

#### GET /assets/categories
Fetch all available asset categories (templates and stickers).

**Response (200 OK):**
```json
{
  "templates": [
    {
      "id": 1,
      "name": "Classic"
    },
    {
      "id": 2,
      "name": "Modern"
    }
  ],
  "stickers": [
    {
      "id": 1,
      "name": "Faces"
    },
    {
      "id": 2,
      "name": "Objects"
    }
  ]
}
```

---

### Trending

#### GET /trending
Fetch trending memes from aggregated sources (Reddit, etc.) with caching.

**Query Parameters:**
None

**Response (200 OK):**
```json
[
  {
    "id": "abc123",
    "title": "Meme Title",
    "image_url": "https://example.com/meme.jpg",
    "score": 5000,
    "author": "username",
    "created_at": 1234567890,
    "subreddit": "memes",
    "source": "reddit"
  }
]
```

**Error Response (502 Service Unavailable):**
```json
{
  "error": "ServiceUnavailable",
  "message": "Failed to fetch trending content: ...",
  "status_code": 502
}
```

**Caching:** Results are cached for 1 hour (3600 seconds) in Redis.

---

### GIFs

#### GET /gifs
Search for GIFs from Giphy API.

**Query Parameters:**
- `query` (string, required): Search query
- `limit` (int, optional): Number of results (default: 20, max: 50)

**Response (200 OK):**
```json
[
  {
    "id": "gif123",
    "title": "Cat GIF",
    "url": "https://giphy.com/gifs/...",
    "embed_url": "https://giphy.com/embed/...",
    "image_url": "https://media.giphy.com/...",
    "source": "giphy"
  }
]
```

**Error Response (400 Bad Request):**
```json
{
  "error": "BadRequest",
  "message": "Query parameter is required",
  "status_code": 400
}
```

**Caching:** Results are cached for 30 minutes (1800 seconds) per query in Redis.

---

### Memes

#### GET /memes
Fetch all saved memes with pagination.

**Query Parameters:**
- `page` (int, optional): Page number (default: 1)
- `per_page` (int, optional): Items per page (default: 10)
- `user_id` (int, optional): Filter by user ID

**Response (200 OK):**
```json
{
  "page": 1,
  "per_page": 10,
  "total": 50,
  "items": [
    {
      "id": 1,
      "title": "My Awesome Meme",
      "image_url": "https://example.com/meme.jpg",
      "user_id": 1,
      "template_id": 1,
      "created_at": "2024-01-01T12:00:00",
      "layers": [
        {
          "id": 1,
          "layer_type": "text",
          "content": "Top Text",
          "properties": {},
          "z_index": 1
        }
      ]
    }
  ]
}
```

---

#### GET /memes/{id}
Fetch a specific meme with all layers.

**Parameters:**
- `id` (int, required): Meme ID

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "My Awesome Meme",
  "image_url": "https://example.com/meme.jpg",
  "user_id": 1,
  "template_id": 1,
  "created_at": "2024-01-01T12:00:00",
  "layers": [
    {
      "id": 1,
      "layer_type": "text",
      "content": "Top Text",
      "properties": {
        "color": "#FFFFFF",
        "font": "Impact"
      },
      "z_index": 1
    }
  ]
}
```

---

#### POST /memes
Create and save a finalized meme.

**Request Body:**
```json
{
  "title": "My Awesome Meme",
  "image_url": "https://example.com/meme.jpg",
  "user_id": 1,
  "template_id": 1,
  "layers": [
    {
      "layer_type": "text",
      "content": "Top Text",
      "properties": {
        "color": "#FFFFFF",
        "font": "Impact"
      },
      "z_index": 1
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "title": "My Awesome Meme",
  "image_url": "https://example.com/meme.jpg",
  "user_id": 1,
  "template_id": 1,
  "created_at": "2024-01-01T12:00:00",
  "layers": [...]
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "ValidationError",
  "message": "Validation failed: {'title': ['Missing data for required field.']}",
  "status_code": 400
}
```

---

### Drafts

#### POST /memes/draft
Create a new meme draft.

**Request Body:**
```json
{
  "title": "Draft Meme",
  "template_id": 1,
  "user_id": 1,
  "data": {
    "composition": {
      "layers": [],
      "width": 800,
      "height": 600
    }
  }
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "title": "Draft Meme",
  "created_at": "2024-01-01T12:00:00",
  "updated_at": "2024-01-01T12:00:00"
}
```

---

#### GET /memes/draft/{id}
Fetch a specific draft.

**Parameters:**
- `id` (int, required): Draft ID

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Draft Meme",
  "user_id": 1,
  "template_id": 1,
  "data": {
    "composition": {
      "layers": [],
      "width": 800,
      "height": 600
    }
  },
  "created_at": "2024-01-01T12:00:00",
  "updated_at": "2024-01-01T12:00:00"
}
```

---

#### PUT /memes/draft/{id}
Update a draft.

**Parameters:**
- `id` (int, required): Draft ID

**Request Body:**
```json
{
  "title": "Updated Draft",
  "data": {
    "composition": {
      "layers": [],
      "width": 1000,
      "height": 800
    }
  }
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Updated Draft",
  "created_at": "2024-01-01T12:00:00",
  "updated_at": "2024-01-01T12:00:01"
}
```

---

#### DELETE /memes/draft/{id}
Delete a draft.

**Parameters:**
- `id` (int, required): Draft ID

**Response (200 OK):**
```json
{
  "message": "Draft deleted successfully"
}
```

---

#### GET /memes/drafts
Fetch all drafts with pagination.

**Query Parameters:**
- `page` (int, optional): Page number (default: 1)
- `per_page` (int, optional): Items per page (default: 10)
- `user_id` (int, optional): Filter by user ID

**Response (200 OK):**
```json
{
  "page": 1,
  "per_page": 10,
  "total": 5,
  "items": [
    {
      "id": 1,
      "title": "Draft Meme",
      "created_at": "2024-01-01T12:00:00",
      "updated_at": "2024-01-01T12:00:00"
    }
  ]
}
```

---

## Error Handling

All endpoints follow a consistent error format:

```json
{
  "error": "ErrorType",
  "message": "Detailed error message",
  "status_code": 400
}
```

### Common Status Codes

- **200 OK**: Successful GET request
- **201 Created**: Successful POST request that creates a resource
- **400 Bad Request**: Invalid request parameters or validation failure
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side error
- **502 Bad Gateway**: External API service unavailable

---

## Authentication

Currently, the API does not require authentication. In production, implement JWT or OAuth2.

---

## Rate Limiting

No rate limiting is currently implemented. Consider adding in production.

---

## Caching Strategy

- **Templates**: Not cached (can be cached in future releases)
- **Trending**: Cached for 1 hour (configurable via `cache_ttl` parameter)
- **GIFs**: Cached for 30 minutes per query (configurable via `cache_ttl` parameter)
- **Stickers, Fonts, Categories**: Not cached (static data)

---

## Future Enhancements

1. Add pagination support to GIF search results
2. Implement user authentication and authorization
3. Add rate limiting per user/IP
4. Add filtering/sorting options to meme endpoints
5. Add webhook support for when memes are created
6. Add batch operations for creating multiple memes
7. Integrate with additional trending sources (Twitter, TikTok, etc.)
8. Add caching headers (ETag, Cache-Control) to responses
