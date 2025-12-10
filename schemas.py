from marshmallow import Schema, fields, ValidationError, validate, post_load
from datetime import datetime


class TemplateFieldSchema(Schema):
    """Schema for template fields/layers metadata."""
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    x_pos = fields.Int()
    y_pos = fields.Int()
    width = fields.Int()
    height = fields.Int()
    default_font_id = fields.Int(allow_none=True)
    default_color = fields.Str(validate=validate.Regexp(r'^#[0-9A-Fa-f]{6}$'))


class TemplateCategorySchema(Schema):
    """Schema for template categories."""
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)


class TemplateSchema(Schema):
    """Schema for meme templates."""
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    image_url = fields.Url()
    category_id = fields.Int()
    category = fields.Nested(TemplateCategorySchema, dump_only=True)
    template_fields = fields.Nested(TemplateFieldSchema, many=True, dump_only=True, data_key='fields')
    created_at = fields.DateTime(dump_only=True)


class TemplateDetailSchema(Schema):
    """Detailed schema including layers."""
    id = fields.Int(dump_only=True)
    name = fields.Str()
    image_url = fields.Url()
    category = fields.Nested(TemplateCategorySchema)
    template_fields = fields.Nested(TemplateFieldSchema, many=True, data_key='fields')
    created_at = fields.DateTime()


class StickerCategorySchema(Schema):
    """Schema for sticker categories."""
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)


class StickerSchema(Schema):
    """Schema for stickers."""
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    image_url = fields.Url()
    category_id = fields.Int()
    category = fields.Nested(StickerCategorySchema, dump_only=True)


class FontSchema(Schema):
    """Schema for fonts."""
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    file_path = fields.Str()


class AssetCategorySchema(Schema):
    """Schema for asset categories response."""
    templates = fields.List(fields.Nested(TemplateCategorySchema))
    stickers = fields.List(fields.Nested(StickerCategorySchema))


class TrendingItemSchema(Schema):
    """Schema for trending items."""
    id = fields.Str()
    title = fields.Str()
    image_url = fields.Url()
    score = fields.Int()
    author = fields.Str(allow_none=True)
    created_at = fields.Float(allow_none=True)
    subreddit = fields.Str(allow_none=True)
    source = fields.Str()


class GifSchema(Schema):
    """Schema for GIF search results."""
    id = fields.Str()
    title = fields.Str()
    url = fields.Url()
    embed_url = fields.Url()
    image_url = fields.Url()
    source = fields.Str()


class MemeLayerSchema(Schema):
    """Schema for meme layers."""
    id = fields.Int(dump_only=True)
    layer_type = fields.Str(required=True, validate=validate.OneOf(['text', 'sticker', 'image']))
    content = fields.Str(required=True)
    properties = fields.Dict()
    z_index = fields.Int(missing=0)


class MemeCreateSchema(Schema):
    """Schema for creating memes."""
    title = fields.Str(required=True)
    template_id = fields.Int(allow_none=True)
    image_url = fields.Url(allow_none=True)
    user_id = fields.Int(allow_none=True)
    layers = fields.Nested(MemeLayerSchema, many=True)


class MemeSchema(Schema):
    """Schema for memes."""
    id = fields.Int(dump_only=True)
    title = fields.Str()
    image_url = fields.Url(allow_none=True)
    user_id = fields.Int(allow_none=True)
    template_id = fields.Int(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    layers = fields.Nested(MemeLayerSchema, many=True)


class DraftCreateSchema(Schema):
    """Schema for creating/updating drafts."""
    title = fields.Str(required=True)
    template_id = fields.Int(allow_none=True)
    data = fields.Dict(required=True)
    user_id = fields.Int(allow_none=True)


class PaginatedSchema(Schema):
    """Schema for paginated responses."""
    page = fields.Int(dump_only=True)
    per_page = fields.Int(dump_only=True)
    total = fields.Int(dump_only=True)
    items = fields.List(fields.Dict())


class ErrorSchema(Schema):
    """Schema for error responses."""
    error = fields.Str()
    message = fields.Str(allow_none=True)
    status_code = fields.Int()
