# Build and Run Scripts

## Frontend Development

### Start Frontend Development Server
```bash
cd frontend
npm run dev
# Frontend will run on http://localhost:3000
# Ensure Flask backend is running on http://localhost:5000
```

### Build Frontend for Production
```bash
python build_frontend.py
# This will build the React app and copy it to Flask's static directory
```

### Frontend Dependencies
```bash
cd frontend
npm install
```

## Flask Backend

### Run Flask Development Server
```bash
export FLASK_ENV=development
export DEV_FRONTEND_URL=http://localhost:3000  # Optional: redirect to frontend dev server
python app.py
```

### Run with Production Frontend
```bash
# Build frontend first
python build_frontend.py

# Then run Flask (it will serve the built frontend)
python app.py
```

## Database Setup

### Initialize Database
```bash
python -m flask db init
python -m flask db migrate -m "Initial migration"
python -m flask db upgrade
```

### Seed Sample Data
```bash
python -m flask seed
```

## API Testing

### Test API Endpoints
```bash
# Templates
curl http://localhost:5000/api/v1/templates

# Stickers  
curl http://localhost:5000/api/v1/stickers

# Fonts
curl http://localhost:5000/api/v1/fonts

# Trending
curl http://localhost:5000/api/v1/trending

# GIFs
curl "http://localhost:5000/api/v1/gifs?query=cats"
```