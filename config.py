import os
basedir = os.path.abspath(os.path.dirname(__file__))

SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'app.db')
SQLALCHEMY_MIGRATE_REPO = os.path.join(basedir, 'db_repository')

CSRF_ENABLED = True
SECRET_KEY = b'}?\x06$\xa5\xcf]\xd8\xe1\x8e[\xcdX\x0c\x85m\xee\xd1\xf2\x8b\xa2\x1c+\xd4'