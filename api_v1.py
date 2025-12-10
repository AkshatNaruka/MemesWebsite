from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from extensions import db
from models import (
    MemeTemplate, TemplateCategory, TemplateField, 
    Sticker, StickerCategory, Font, Meme, MemeLayer, MemeDraft, User
)
from schemas import (
    TemplateSchema, TemplateDetailSchema, TemplateCategorySchema,
    StickerSchema, StickerCategorySchema, FontSchema,
    AssetCategorySchema, TrendingItemSchema, GifSchema,
    MemeSchema, MemeCreateSchema, MemeLayerSchema,
    DraftCreateSchema, PaginatedSchema, ErrorSchema
)
from services.reddit_service import get_trending_content
from services.giphy_service import get_cached_gifs
from datetime import datetime


api_v1 = Blueprint('api_v1', __name__, url_prefix='/api/v1')


# Error handler
def error_response(message, status_code=400, error_type='BadRequest'):
    """Generate a standardized error response."""
    schema = ErrorSchema()
    return jsonify(schema.dump({
        'error': error_type,
        'message': message,
        'status_code': status_code
    })), status_code


# Template endpoints
@api_v1.route('/templates', methods=['GET'])
def get_templates():
    """Get templates with optional filtering and pagination."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    category_id = request.args.get('category_id', type=int)
    search = request.args.get('search', '')
    
    query = MemeTemplate.query
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    if search:
        query = query.filter(MemeTemplate.name.ilike(f'%{search}%'))
    
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    
    schema = TemplateSchema(many=True)
    return jsonify({
        'page': page,
        'per_page': per_page,
        'total': paginated.total,
        'items': schema.dump(paginated.items)
    }), 200


@api_v1.route('/templates/<int:template_id>', methods=['GET'])
def get_template(template_id):
    """Get a specific template with metadata."""
    template = MemeTemplate.query.get_or_404(template_id)
    
    result = {
        'id': template.id,
        'name': template.name,
        'image_url': template.image_url,
        'category': {'id': template.category.id, 'name': template.category.name} if template.category else None,
        'fields': [
            {
                'id': f.id,
                'name': f.name,
                'x_pos': f.x_pos,
                'y_pos': f.y_pos,
                'width': f.width,
                'height': f.height,
                'default_font_id': f.default_font_id,
                'default_color': f.default_color
            }
            for f in template.fields
        ],
        'created_at': template.created_at.isoformat()
    }
    return jsonify(result), 200


# Stickers endpoint
@api_v1.route('/stickers', methods=['GET'])
def get_stickers():
    """Get all stickers with optional category filter."""
    category_id = request.args.get('category_id', type=int)
    
    query = Sticker.query
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    stickers = query.all()
    schema = StickerSchema(many=True)
    return jsonify(schema.dump(stickers)), 200


# Fonts endpoint
@api_v1.route('/fonts', methods=['GET'])
def get_fonts():
    """Get all available fonts."""
    fonts = Font.query.all()
    schema = FontSchema(many=True)
    return jsonify(schema.dump(fonts)), 200


# Asset categories endpoint
@api_v1.route('/assets/categories', methods=['GET'])
def get_asset_categories():
    """Get all asset categories."""
    template_categories = TemplateCategory.query.all()
    sticker_categories = StickerCategory.query.all()
    
    schema = AssetCategorySchema()
    return jsonify(schema.dump({
        'templates': template_categories,
        'stickers': sticker_categories
    })), 200


# Trending endpoint
@api_v1.route('/trending', methods=['GET'])
def get_trending():
    """Get trending memes from aggregated sources."""
    try:
        trending = get_trending_content(cache_ttl=3600)
        schema = TrendingItemSchema(many=True)
        return jsonify(schema.dump(trending)), 200
    except Exception as e:
        return error_response(f'Failed to fetch trending content: {str(e)}', 502, 'ServiceUnavailable')


# GIF search endpoint
@api_v1.route('/gifs', methods=['GET'])
def search_gifs():
    """Search for GIFs."""
    query = request.args.get('query', '')
    limit = request.args.get('limit', 20, type=int)
    
    if not query:
        return error_response('Query parameter is required', 400, 'BadRequest')
    
    if limit > 50:
        limit = 50
    
    try:
        gifs = get_cached_gifs(query, cache_ttl=1800)
        schema = GifSchema(many=True)
        return jsonify(schema.dump(gifs)), 200
    except Exception as e:
        return error_response(f'Failed to fetch GIFs: {str(e)}', 502, 'ServiceUnavailable')


# Meme endpoints
@api_v1.route('/memes', methods=['GET'])
def get_memes():
    """Get user memes with pagination."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    user_id = request.args.get('user_id', type=int)
    
    query = Meme.query
    if user_id:
        query = query.filter_by(user_id=user_id)
    
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    schema = MemeSchema(many=True)
    
    return jsonify({
        'page': page,
        'per_page': per_page,
        'total': paginated.total,
        'items': schema.dump(paginated.items)
    }), 200


@api_v1.route('/memes', methods=['POST'])
def create_meme():
    """Create and save a finalized meme."""
    schema = MemeCreateSchema()
    
    try:
        data = schema.load(request.get_json() or {})
    except ValidationError as err:
        return error_response(f'Validation failed: {err.messages}', 400, 'ValidationError')
    
    try:
        meme = Meme(
            title=data.get('title'),
            image_url=data.get('image_url'),
            user_id=data.get('user_id'),
            template_id=data.get('template_id')
        )
        
        db.session.add(meme)
        db.session.flush()  # Get the meme ID
        
        # Add layers
        for layer_data in data.get('layers', []):
            layer = MemeLayer(
                meme_id=meme.id,
                layer_type=layer_data.get('layer_type'),
                content=layer_data.get('content'),
                properties=layer_data.get('properties'),
                z_index=layer_data.get('z_index', 0)
            )
            db.session.add(layer)
        
        db.session.commit()
        
        schema = MemeSchema()
        return jsonify(schema.dump(meme)), 201
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to create meme: {str(e)}', 500, 'InternalServerError')


@api_v1.route('/memes/<int:meme_id>', methods=['GET'])
def get_meme(meme_id):
    """Get a specific meme with all layers."""
    meme = Meme.query.get_or_404(meme_id)
    schema = MemeSchema()
    return jsonify(schema.dump(meme)), 200


# Draft endpoints
@api_v1.route('/memes/draft', methods=['POST'])
def create_draft():
    """Create or update a meme draft."""
    schema = DraftCreateSchema()
    
    try:
        data = schema.load(request.get_json() or {})
    except ValidationError as err:
        return error_response(f'Validation failed: {err.messages}', 400, 'ValidationError')
    
    try:
        draft = MemeDraft(
            title=data.get('title'),
            user_id=data.get('user_id'),
            template_id=data.get('template_id'),
            data=data.get('data')
        )
        
        db.session.add(draft)
        db.session.commit()
        
        return jsonify({
            'id': draft.id,
            'title': draft.title,
            'created_at': draft.created_at.isoformat(),
            'updated_at': draft.updated_at.isoformat()
        }), 201
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to save draft: {str(e)}', 500, 'InternalServerError')


@api_v1.route('/memes/draft/<int:draft_id>', methods=['GET'])
def get_draft(draft_id):
    """Get a specific draft."""
    draft = MemeDraft.query.get_or_404(draft_id)
    return jsonify({
        'id': draft.id,
        'title': draft.title,
        'user_id': draft.user_id,
        'template_id': draft.template_id,
        'data': draft.data,
        'created_at': draft.created_at.isoformat(),
        'updated_at': draft.updated_at.isoformat()
    }), 200


@api_v1.route('/memes/draft/<int:draft_id>', methods=['PUT'])
def update_draft(draft_id):
    """Update a draft."""
    draft = MemeDraft.query.get_or_404(draft_id)
    schema = DraftCreateSchema(partial=True)
    
    try:
        data = schema.load(request.get_json() or {})
    except ValidationError as err:
        return error_response(f'Validation failed: {err.messages}', 400, 'ValidationError')
    
    try:
        if 'title' in data:
            draft.title = data['title']
        if 'data' in data:
            draft.data = data['data']
        if 'template_id' in data:
            draft.template_id = data['template_id']
        
        draft.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'id': draft.id,
            'title': draft.title,
            'created_at': draft.created_at.isoformat(),
            'updated_at': draft.updated_at.isoformat()
        }), 200
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to update draft: {str(e)}', 500, 'InternalServerError')


@api_v1.route('/memes/draft/<int:draft_id>', methods=['DELETE'])
def delete_draft(draft_id):
    """Delete a draft."""
    draft = MemeDraft.query.get_or_404(draft_id)
    
    try:
        db.session.delete(draft)
        db.session.commit()
        return jsonify({'message': 'Draft deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to delete draft: {str(e)}', 500, 'InternalServerError')


@api_v1.route('/memes/drafts', methods=['GET'])
def get_drafts():
    """Get user drafts with pagination."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    user_id = request.args.get('user_id', type=int)
    
    query = MemeDraft.query
    if user_id:
        query = query.filter_by(user_id=user_id)
    
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'page': page,
        'per_page': per_page,
        'total': paginated.total,
        'items': [
            {
                'id': d.id,
                'title': d.title,
                'created_at': d.created_at.isoformat(),
                'updated_at': d.updated_at.isoformat()
            }
            for d in paginated.items
        ]
    }), 200
