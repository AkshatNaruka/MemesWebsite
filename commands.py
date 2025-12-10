import click
from flask.cli import with_appcontext
from extensions import db
from models import TemplateCategory, MemeTemplate, Font, StickerCategory, Sticker

@click.command(name='seed')
@with_appcontext
def seed():
    """Seeds the database with initial data."""
    # Clear existing data (optional, but good for idempotency if we check existence first, 
    # but for simple seed, maybe just create if not exists)
    
    # Categories
    categories = ['Classic', 'Modern', 'Dank']
    cat_objs = {}
    for name in categories:
        cat = TemplateCategory.query.filter_by(name=name).first()
        if not cat:
            cat = TemplateCategory(name=name)
            db.session.add(cat)
        cat_objs[name] = cat
    
    # Fonts
    fonts = [
        {'name': 'Impact', 'file': 'fonts/Impact.ttf'},
        {'name': 'Arial', 'file': 'fonts/Arial.ttf'},
        {'name': 'Comic Sans', 'file': 'fonts/Comic.ttf'}
    ]
    for font_data in fonts:
        font = Font.query.filter_by(name=font_data['name']).first()
        if not font:
            font = Font(name=font_data['name'], file_path=font_data['file'])
            db.session.add(font)
            
    # Sticker Categories
    sticker_cats = ['Faces', 'Objects', 'Symbols']
    sticker_cat_objs = {}
    for name in sticker_cats:
        cat = StickerCategory.query.filter_by(name=name).first()
        if not cat:
            cat = StickerCategory(name=name)
            db.session.add(cat)
        sticker_cat_objs[name] = cat

    db.session.commit()

    # Templates
    # Canonical templates: Impact text (usually just a background, but let's assume specific image), Drake, Expanding Brain
    templates = [
        {
            'name': 'Drake Hotline Bling', 
            'image_url': 'https://i.imgflip.com/30b1gx.jpg', 
            'category': cat_objs['Classic']
        },
        {
            'name': 'Expanding Brain', 
            'image_url': 'https://i.imgflip.com/1jwhww.jpg', 
            'category': cat_objs['Classic']
        },
        {
            'name': 'Distracted Boyfriend', 
            'image_url': 'https://i.imgflip.com/1ur9b0.jpg', 
            'category': cat_objs['Modern']
        }
    ]
    
    for tmpl_data in templates:
        tmpl = MemeTemplate.query.filter_by(name=tmpl_data['name']).first()
        if not tmpl:
            tmpl = MemeTemplate(name=tmpl_data['name'], image_url=tmpl_data['image_url'], category=tmpl_data['category'])
            db.session.add(tmpl)
            
    # Stickers
    stickers = [
        {'name': 'Sunglass', 'image_url': 'stickers/sunglass.png', 'category': sticker_cat_objs['Objects']},
        {'name': 'Troll Face', 'image_url': 'stickers/trollface.png', 'category': sticker_cat_objs['Faces']}
    ]
    
    for sticker_data in stickers:
        sticker = Sticker.query.filter_by(name=sticker_data['name']).first()
        if not sticker:
            sticker = Sticker(name=sticker_data['name'], image_url=sticker_data['image_url'], category=sticker_data['category'])
            db.session.add(sticker)

    db.session.commit()
    print('Database seeded!')
