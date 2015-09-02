from flask import Flask

import sqlite3
import hashlib
import random


conn = sqlite3.connect('idm.db')
conn.execute('''
CREATE TABLE IF NOT EXISTS user(
    ID          INTEGER PRIMARY KEY NOT NULL,
    LOGIN       TEXT    UNIQUE      NOT NULL,
    PASSWORD    TEXT                NOT NULL,
    ADMIN       INTEGER DEFAULT 0   NOT NULL,
    SALT        TEXT                NOT NULL
)''')


def generate_salt():
    chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPRQSTUVWXYZ0123456789"
    chars_length = len(chars)
    salt = ""
    length = random.randint(8, 10)
    for i in range(0, length):
        salt += chars[random.randint(0, chars_length-1)]
    return salt


def get_user_info_from_row(row):
    return {
        'login': row[1]
    }


def get_user_info(login, password):

    login = login.strip()
    password = password.strip()

    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user WHERE login='{0}'".format(login))

    row = cursor.fetchone()

    if row is None:
        return None

    password = hashlib.sha1(password.encode("utf-8")).hexdigest()
    salt = row[4]
    password = hashlib.sha1((password+salt).encode("utf-8")).hexdigest()

    if row[2] != password:
        return None
    return get_user_info_from_row(row)