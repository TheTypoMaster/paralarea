from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from application.servicemanagement import ServiceManager

app = Flask(__name__)
app.config.from_object('config')
db = SQLAlchemy(app)
service_manager = ServiceManager()

from application import servicerequirehandlers
from application import views, models



