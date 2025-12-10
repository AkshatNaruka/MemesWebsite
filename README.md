# MemesWebsite
Random Reddit memes using Flask, Python and Reddit API.

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Configuration:
   Copy `.env.example` to `.env` and update the values.
   ```bash
   cp .env.example .env
   ```

3. Database:
   Initialize the database and apply migrations:
   ```bash
   flask db upgrade
   ```
   
   Seed the database with initial data:
   ```bash
   flask seed
   ```

4. Run the app:
   ```bash
   flask run
   ```

## Development

- Create a migration: `flask db migrate -m "message"`
- Apply migrations: `flask db upgrade`
