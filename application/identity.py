from flask import Flask
from application import db
from application import models

import hashlib
import random


def generate_salt():
    chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPRQSTUVWXYZ0123456789"
    chars_length = len(chars)
    salt = ""
    length = random.randint(8, 10)
    for i in range(0, length):
        salt += chars[random.randint(0, chars_length-1)]
    return salt


def add_user():
    pass


def get_user_info_from_row(row):
    return {
        'login': row.login
    }


def get_user_info(login, password):

    login = login.strip()
    password = password.strip()

    user = models.User.query.filter_by(login=login).first()

    if user is None:
        return None

    password = hashlib.sha1(password.encode("utf-8")).hexdigest()
    salt = user.salt
    password = hashlib.sha1((password+salt).encode("utf-8")).hexdigest()

    if user.password_hash != password:
        return None
    return get_user_info_from_row(user)