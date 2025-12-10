from flask import Flask
from config import Config
from extensions import db, migrate
from routes import main
import redis
import extensions

# Import models so that they are registered with SQLAlchemy
from models import User, MemeTemplate, TemplateCategory, TemplateField, Sticker, StickerCategory, Font, Meme, MemeLayer

from commands import seed

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Initialize Redis
    if app.config.get('REDIS_URL'):
        try:
            pool = redis.ConnectionPool.from_url(app.config['REDIS_URL'])
            extensions.redis_client = redis.Redis(connection_pool=pool)
            app.redis = extensions.redis_client
        except Exception as e:
            print(f"Failed to connect to Redis: {e}")
            extensions.redis_client = None

    # Register blueprints
    app.register_blueprint(main)
    
    # Register commands
    app.cli.add_command(seed)

    return app

app = create_app()

if __name__ == '__main__':
    app.run()
