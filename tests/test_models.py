import unittest
from app import create_app
from extensions import db
from models import User, MemeTemplate, TemplateCategory, Meme, MemeLayer
from config import Config

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

class ModelTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_user_creation(self):
        u = User(username='test', email='test@example.com')
        db.session.add(u)
        db.session.commit()
        self.assertEqual(User.query.count(), 1)
        self.assertEqual(User.query.first().username, 'test')

    def test_category_template_relationship(self):
        c = TemplateCategory(name='TestCat')
        t = MemeTemplate(name='TestTempl', category=c)
        db.session.add(c)
        db.session.add(t)
        db.session.commit()
        
        self.assertEqual(c.templates.count(), 1)
        self.assertEqual(t.category.name, 'TestCat')

    def test_meme_creation(self):
        u = User(username='memer', email='memer@example.com')
        t = MemeTemplate(name='Templ')
        m = Meme(title='My Meme', author=u, template=t)
        
        db.session.add(u)
        db.session.add(t)
        db.session.add(m)
        db.session.commit()
        
        self.assertEqual(u.memes.count(), 1)
        self.assertEqual(m.author.username, 'memer')
        self.assertEqual(m.template.name, 'Templ')

    def test_meme_layers(self):
        m = Meme(title='Layered Meme')
        l1 = MemeLayer(meme=m, layer_type='text', content='Top Text')
        l2 = MemeLayer(meme=m, layer_type='sticker', content='sunglasses')
        
        db.session.add(m)
        db.session.add(l1)
        db.session.add(l2)
        db.session.commit()
        
        self.assertEqual(m.layers.count(), 2)
        
        # Order is not guaranteed without order_by, but usually insertion order in simple cases
        # Let's check filter
        text_layer = m.layers.filter_by(layer_type='text').first()
        self.assertEqual(text_layer.content, 'Top Text')

if __name__ == '__main__':
    unittest.main()
