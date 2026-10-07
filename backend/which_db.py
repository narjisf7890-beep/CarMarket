from app import app, db

with app.app_context():
    print("App is using:", db.engine.url.database)