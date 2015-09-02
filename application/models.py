from application import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    login = db.Column(db.String(32), unique=True)
    password_hash = db.Column(db.String(64))
    salt = db.Column(db.String(128))