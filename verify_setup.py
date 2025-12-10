#!/usr/bin/env python
"""Verification script to ensure API setup is complete."""

from app import create_app
from extensions import db

app = create_app()

print("✓ Application created successfully")

with app.app_context():
    # Check database tables
    tables = sorted([t for t in db.metadata.tables.keys()])
    print(f"\n✓ Database tables ({len(tables)} total):")
    for table in tables:
        print(f"  - {table}")
    
    # Verify MemeDraft table exists
    if 'meme_draft' in tables:
        print("\n✓ MemeDraft model registered correctly")
    else:
        print("\n✗ ERROR: MemeDraft model not found!")
    
    # Check blueprints
    blueprints = list(app.blueprints.keys())
    print(f"\n✓ Blueprints registered ({len(blueprints)} total):")
    for bp in sorted(blueprints):
        print(f"  - {bp}")
    
    # Check API endpoints
    api_endpoints = [
        rule for rule in app.url_map.iter_rules() 
        if rule.rule.startswith('/api/v1')
    ]
    print(f"\n✓ API v1 endpoints ({len(api_endpoints)} total):")
    for rule in sorted(api_endpoints, key=lambda r: r.rule):
        methods = list(rule.methods - {'HEAD', 'OPTIONS'})
        print(f"  - {rule.rule}: {methods}")

print("\n✅ Setup verification complete!")
