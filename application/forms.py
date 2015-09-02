from flask.ext.wtf import Form
from wtforms import StringField, PasswordField, BooleanField
from wtforms import validators


class LoginForm(Form):
    login = StringField('login', validators=[validators.DataRequired()])
    password = PasswordField('password', validators=[validators.DataRequired()])
    remember_me = BooleanField('remember_me', default=False)

