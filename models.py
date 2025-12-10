from datetime import datetime
from sqlalchemy.dialects.postgresql import JSONB
from extensions import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    memes = db.relationship('Meme', backref='author', lazy='dynamic')

class TemplateCategory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True)
    templates = db.relationship('MemeTemplate', backref='category', lazy='dynamic')

class MemeTemplate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), index=True)
    image_url = db.Column(db.String(256))
    category_id = db.Column(db.Integer, db.ForeignKey('template_category.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    fields = db.relationship('TemplateField', backref='template', lazy='dynamic')
    memes = db.relationship('Meme', backref='template', lazy='dynamic')

class TemplateField(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    template_id = db.Column(db.Integer, db.ForeignKey('meme_template.id'))
    name = db.Column(db.String(64)) # e.g. "Top Text", "Bottom Text"
    x_pos = db.Column(db.Integer)
    y_pos = db.Column(db.Integer)
    width = db.Column(db.Integer)
    height = db.Column(db.Integer)
    # Default styling metadata
    default_font_id = db.Column(db.Integer, db.ForeignKey('font.id'), nullable=True)
    default_color = db.Column(db.String(7), default="#FFFFFF")

class StickerCategory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True)
    stickers = db.relationship('Sticker', backref='category', lazy='dynamic')

class Sticker(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64))
    image_url = db.Column(db.String(256))
    category_id = db.Column(db.Integer, db.ForeignKey('sticker_category.id'))

class Font(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True)
    file_path = db.Column(db.String(256)) # Path to ttf/otf file

class Meme(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(128))
    image_url = db.Column(db.String(256)) # Final rendered image
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True) # Nullable for anonymous
    template_id = db.Column(db.Integer, db.ForeignKey('meme_template.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    layers = db.relationship('MemeLayer', backref='meme', lazy='dynamic')

class MemeLayer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    meme_id = db.Column(db.Integer, db.ForeignKey('meme.id'))
    layer_type = db.Column(db.String(32)) # 'text', 'sticker', 'image'
    content = db.Column(db.Text) # Text content or image URL
    # JSON for positioning, scaling, rotation, color, etc.
    # Using simple Text/String if JSONB is not available (SQLite), but user asked for persistent storage Foundation. 
    # Since we added psycopg2, we might aim for Postgres, but for broad compatibility in dev environment 
    # (which might be sqlite), I'll use JSON type from generic sqlalchemy if possible or just Text.
    # But I imported JSONB. Let's stick to generic JSON for SQLAlchemy to handle different DBs or just string.
    properties = db.Column(db.JSON) 
    z_index = db.Column(db.Integer, default=0)
