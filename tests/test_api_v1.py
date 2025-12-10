import unittest
import json
from datetime import datetime
from app import create_app
from extensions import db
from models import (
    User, MemeTemplate, TemplateCategory, TemplateField,
    Sticker, StickerCategory, Font, Meme, MemeLayer, MemeDraft
)
from config import Config


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    REDIS_URL = None


class APITestCase(unittest.TestCase):
    """Test cases for the API v1 endpoints."""

    def setUp(self):
        self.app = create_app(TestConfig)
        self.app_context = self.app.app_context()
        self.app_context.push()
        self.client = self.app.test_client()
        
        db.create_all()
        self.setup_test_data()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def setup_test_data(self):
        """Create test data."""
        # Categories
        template_cat = TemplateCategory(name='Classic')
        sticker_cat = StickerCategory(name='Faces')
        db.session.add(template_cat)
        db.session.add(sticker_cat)
        db.session.flush()

        # Templates
        template = MemeTemplate(
            name='Drake Hotline Bling',
            image_url='https://i.imgflip.com/30b1gx.jpg',
            category=template_cat
        )
        db.session.add(template)
        db.session.flush()

        # Template fields
        field = TemplateField(
            template=template,
            name='Top Text',
            x_pos=10,
            y_pos=20,
            width=300,
            height=100,
            default_color='#FFFFFF'
        )
        db.session.add(field)

        # Fonts
        font = Font(name='Impact', file_path='fonts/Impact.ttf')
        db.session.add(font)

        # Stickers
        sticker = Sticker(
            name='Sunglass',
            image_url='stickers/sunglass.png',
            category=sticker_cat
        )
        db.session.add(sticker)

        # Users
        user = User(username='testuser', email='test@example.com')
        db.session.add(user)
        db.session.flush()

        # Meme
        meme = Meme(
            title='Test Meme',
            image_url='https://example.com/meme.jpg',
            author=user,
            template=template
        )
        db.session.add(meme)
        db.session.flush()

        # Meme layers
        layer = MemeLayer(
            meme=meme,
            layer_type='text',
            content='Top Text',
            z_index=1
        )
        db.session.add(layer)

        db.session.commit()

    # Template tests
    def test_get_templates(self):
        """Test GET /api/v1/templates."""
        response = self.client.get('/api/v1/templates')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIn('items', data)
        self.assertIn('page', data)
        self.assertIn('per_page', data)
        self.assertIn('total', data)
        self.assertEqual(len(data['items']), 1)
        self.assertEqual(data['items'][0]['name'], 'Drake Hotline Bling')

    def test_get_templates_pagination(self):
        """Test GET /api/v1/templates with pagination."""
        # Create more templates
        cat = TemplateCategory.query.first()
        for i in range(15):
            template = MemeTemplate(
                name=f'Template {i}',
                image_url=f'https://example.com/template{i}.jpg',
                category=cat
            )
            db.session.add(template)
        db.session.commit()

        response = self.client.get('/api/v1/templates?page=1&per_page=10')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['page'], 1)
        self.assertEqual(data['per_page'], 10)
        self.assertEqual(len(data['items']), 10)

    def test_get_templates_with_category_filter(self):
        """Test GET /api/v1/templates with category filter."""
        cat = TemplateCategory.query.first()
        response = self.client.get(f'/api/v1/templates?category_id={cat.id}')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertGreater(len(data['items']), 0)

    def test_get_template_by_id(self):
        """Test GET /api/v1/templates/<id>."""
        template = MemeTemplate.query.first()
        response = self.client.get(f'/api/v1/templates/{template.id}')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['name'], template.name)
        self.assertIn('fields', data)

    def test_get_template_not_found(self):
        """Test GET /api/v1/templates/<id> with invalid ID."""
        response = self.client.get('/api/v1/templates/9999')
        self.assertEqual(response.status_code, 404)

    # Stickers test
    def test_get_stickers(self):
        """Test GET /api/v1/stickers."""
        response = self.client.get('/api/v1/stickers')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], 'Sunglass')

    def test_get_stickers_by_category(self):
        """Test GET /api/v1/stickers with category filter."""
        sticker_cat = StickerCategory.query.first()
        response = self.client.get(f'/api/v1/stickers?category_id={sticker_cat.id}')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIsInstance(data, list)

    # Fonts test
    def test_get_fonts(self):
        """Test GET /api/v1/fonts."""
        response = self.client.get('/api/v1/fonts')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], 'Impact')

    # Asset categories test
    def test_get_asset_categories(self):
        """Test GET /api/v1/assets/categories."""
        response = self.client.get('/api/v1/assets/categories')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIn('templates', data)
        self.assertIn('stickers', data)
        self.assertIsInstance(data['templates'], list)
        self.assertIsInstance(data['stickers'], list)

    # Trending test
    def test_get_trending(self):
        """Test GET /api/v1/trending."""
        response = self.client.get('/api/v1/trending')
        # Will be 200 if API call succeeds, 502 if external service unavailable
        self.assertIn(response.status_code, [200, 502])
        
        if response.status_code == 200:
            data = json.loads(response.data)
            self.assertIsInstance(data, list)

    # GIF search test
    def test_get_gifs_missing_query(self):
        """Test GET /api/v1/gifs without query parameter."""
        response = self.client.get('/api/v1/gifs')
        self.assertEqual(response.status_code, 400)
        
        data = json.loads(response.data)
        self.assertIn('error', data)

    def test_get_gifs_with_query(self):
        """Test GET /api/v1/gifs with query parameter."""
        response = self.client.get('/api/v1/gifs?query=cat')
        # Will be 200 or 502 depending on API key availability
        self.assertIn(response.status_code, [200, 502])

    # Meme tests
    def test_get_memes(self):
        """Test GET /api/v1/memes."""
        response = self.client.get('/api/v1/memes')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIn('items', data)
        self.assertIn('page', data)
        self.assertEqual(len(data['items']), 1)
        self.assertEqual(data['items'][0]['title'], 'Test Meme')

    def test_get_meme_by_id(self):
        """Test GET /api/v1/memes/<id>."""
        meme = Meme.query.first()
        response = self.client.get(f'/api/v1/memes/{meme.id}')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['title'], 'Test Meme')
        self.assertIn('layers', data)

    def test_create_meme(self):
        """Test POST /api/v1/memes."""
        template = MemeTemplate.query.first()
        user = User.query.first()
        
        payload = {
            'title': 'New Meme',
            'image_url': 'https://example.com/new_meme.jpg',
            'user_id': user.id,
            'template_id': template.id,
            'layers': [
                {
                    'layer_type': 'text',
                    'content': 'Hello',
                    'z_index': 1
                }
            ]
        }
        
        response = self.client.post(
            '/api/v1/memes',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        
        data = json.loads(response.data)
        self.assertEqual(data['title'], 'New Meme')
        self.assertIn('id', data)

    def test_create_meme_validation(self):
        """Test POST /api/v1/memes with invalid data."""
        payload = {
            'image_url': 'https://example.com/meme.jpg'
            # Missing required 'title'
        }
        
        response = self.client.post(
            '/api/v1/memes',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

    # Draft tests
    def test_create_draft(self):
        """Test POST /api/v1/memes/draft."""
        template = MemeTemplate.query.first()
        
        payload = {
            'title': 'Draft Meme',
            'template_id': template.id,
            'data': {'composition': 'test'}
        }
        
        response = self.client.post(
            '/api/v1/memes/draft',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        
        data = json.loads(response.data)
        self.assertEqual(data['title'], 'Draft Meme')
        self.assertIn('id', data)

    def test_get_draft(self):
        """Test GET /api/v1/memes/draft/<id>."""
        # Create a draft first
        template = MemeTemplate.query.first()
        draft = MemeDraft(
            title='Test Draft',
            template=template,
            data={'test': 'data'}
        )
        db.session.add(draft)
        db.session.commit()
        
        response = self.client.get(f'/api/v1/memes/draft/{draft.id}')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['title'], 'Test Draft')

    def test_update_draft(self):
        """Test PUT /api/v1/memes/draft/<id>."""
        # Create a draft first
        template = MemeTemplate.query.first()
        draft = MemeDraft(
            title='Test Draft',
            template=template,
            data={'test': 'data'}
        )
        db.session.add(draft)
        db.session.commit()
        
        payload = {
            'title': 'Updated Draft',
            'data': {'updated': 'data'}
        }
        
        response = self.client.put(
            f'/api/v1/memes/draft/{draft.id}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['title'], 'Updated Draft')

    def test_delete_draft(self):
        """Test DELETE /api/v1/memes/draft/<id>."""
        # Create a draft first
        template = MemeTemplate.query.first()
        draft = MemeDraft(
            title='Test Draft',
            template=template,
            data={'test': 'data'}
        )
        db.session.add(draft)
        db.session.commit()
        draft_id = draft.id
        
        response = self.client.delete(f'/api/v1/memes/draft/{draft_id}')
        self.assertEqual(response.status_code, 200)
        
        # Verify it's deleted
        response = self.client.get(f'/api/v1/memes/draft/{draft_id}')
        self.assertEqual(response.status_code, 404)

    def test_get_drafts(self):
        """Test GET /api/v1/memes/drafts."""
        # Create a draft first
        template = MemeTemplate.query.first()
        draft = MemeDraft(
            title='Test Draft',
            template=template,
            data={'test': 'data'}
        )
        db.session.add(draft)
        db.session.commit()
        
        response = self.client.get('/api/v1/memes/drafts')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIn('items', data)
        self.assertGreater(len(data['items']), 0)


if __name__ == '__main__':
    unittest.main()
