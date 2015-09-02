from application.forms import LoginForm
from application import app
from application.identity import get_user_info
from application import service_manager

from flask import render_template
from flask import session
from flask import redirect
from flask import request
from flask import Response

from os import path
from os import mkdir

import json


def auth():

    login = session.get('login')
    password = session.get('password')

    if login is None or password is None:
        return False

    user_info = get_user_info(login, password)

    return user_info is not False and user_info is not None


@app.route('/', methods=['GET'])
@app.route('/onlide', methods=['GET'])
def onlide():
    if not auth():
        return redirect('/login')

    # Если у пользователя еще нет своего каталога, создадим его
    userpath = "userdata/"+session['login']
    if not path.exists(userpath):
        mkdir(userpath)
        mkdir(userpath+"/projects")

    return render_template('onlide/onlide.html', title='Среда разработки onlide')


@app.route('/logout', methods=['GET'])
def logout():
    session.pop('login', None)
    session.pop('password', None)
    return redirect('/login')


@app.route('/api', methods=["POST"])
def api():
    data = request.get_data()
    data = json.loads(data.decode('utf-8'))

    service = data.get('service')
    method = data.get('method')
    params = data.get('params')

    if service is None or method is None or params is None:
        return "Некорректные данные"

    service_info = service_manager.get_service_info(service)
    service_methods = service_info.get('methods')

    need_auth = service_info.get('need_auth')
    add_login = service_info.get('add_login')

    if need_auth is True and not auth():
        return "Требуемая методом сервиса аутентификация не удалась"

    if add_login is True:
                    params['login'] = session['login']

    if service_methods is not None:

        method_info = service_methods.get(method)

        if method_info is not None:

            if need_auth is None:

                need_auth = method_info.get('need_auth')

                if need_auth is True and not auth():
                    return "Требуемая методом сервиса аутентификация не удалась"

            if add_login is None:

                add_login = method_info.get('add_login')

                if add_login is True:
                    params['login'] = session['login']

    result = service_manager.call(service, method, params)
    return Response(json.dumps(result), mimetype="application/json")


@app.route('/login', methods=['POST', 'GET'])
def login():

    form = LoginForm(request.form)

    # POST
    if request.method == 'POST':

        if not form.validate():
            return render_template('login.html', form=form, message='Введены некорректные данные')

        login = form.login.data
        password = form.password.data
        remember_me = form.remember_me.data

        result = get_user_info(login, password)

        if result is not False and result is not None:
            session.permanent = remember_me
            session['login'] = login
            session['password'] = password
            return redirect('/')
        return render_template('login.html',
                               title="Вход",
                               form=form,
                               message='Вход не удался. Возможно введены неверные данные')

    # GET
    if auth():
        return redirect('/')
    return render_template('login.html', title="Вход", form=form)