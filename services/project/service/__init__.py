from jsonrpc import dispatcher, JSONRPCResponseManager

from flask import Flask
from flask import request
from flask import Response

from os import path
from os import mkdir
from os import remove as remove_file
from os import listdir

import json
import shutil

app = Flask(__name__)
HEAD_PATH = "../../userdata"


@app.route('/', methods=['POST'])
def api():
    response = JSONRPCResponseManager.handle(request.get_data(), dispatcher)
    response = Response(response.json, mimetype="application/json")
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


@dispatcher.add_method
def get_project_list(login):

    fullpath = "{0}/{1}/projects".format(HEAD_PATH, login)

    if not path.exists(fullpath):
        return False

    return listdir(fullpath)


@dispatcher.add_method
def create_project(login, proj_name, proj_type, proj_configs):

    fullpath = "{0}/{1}/projects/{2}".format(HEAD_PATH, login, proj_name)

    if path.exists(fullpath):
        return False

    mkdir(fullpath)

    fullpath = '{0}/{1}.proj'.format(fullpath, proj_name)

    with open(fullpath, 'w', encoding='utf-8') as proj_file:
        json.dump({
            'name': proj_name,
            'type': proj_type,
            'configs': proj_configs
        }, proj_file)

    return True


@dispatcher.add_method
def load_project(login, proj_name):

    fullpath = "{0}/{1}/projects/{2}".format(HEAD_PATH, login, proj_name)

    if not path.exists(fullpath):
        return False

    with open('{0}/{1}.proj'.format(fullpath, proj_name), 'r', encoding='utf-8') as f:
        return json.load(f)


@dispatcher.add_method
def remove_project(login, proj_name):

    proj_path = "{0}/{1}/projects/{2}".format(HEAD_PATH, login, proj_name)

    if not path.exists(proj_path):
        return False

    shutil.rmtree(proj_path)
    return True


@dispatcher.add_method
def create_file(login, proj_name, file_path, data):

    proj_fullpath = "{0}/{1}/projects/{2}".format(HEAD_PATH, login, proj_name)
    fullpath = "{0}/{1}".format(proj_fullpath, file_path)

    if not path.exists(proj_fullpath) or path.exists(fullpath):
        return False

    with open(fullpath, 'w', encoding='utf-8') as new_file:
        new_file.write(data)
    return True


@dispatcher.add_method
def create_folder(login, proj_name, folder_path):

    proj_fullpath = "{0}/{1}/projects/{2}".format(HEAD_PATH, login, proj_name)
    fullpath = "{0}/{1}".format(proj_fullpath, folder_path)

    if not path.exists(proj_fullpath) or path.exists(fullpath):
        return False

    mkdir(fullpath)

    return True


@dispatcher.add_method
def move(login, proj_name, src, dst, copy, overwrite):

    proj_path = "{0}/{1}/projects/{2}".format(HEAD_PATH, login, proj_name)

    if not path.exists(proj_path):
        return False

    src = "{0}/{1}".format(proj_path, src)
    dst = "{0}/{1}".format(proj_path, dst)

    if not path.exists(src):
        return False

    if path.exists(dst) and not overwrite:
        return False

    if copy:
        if path.isdir(src):
            copy_func = shutil.copytree
        else:
            copy_func = shutil.copy2
        copy_func(src, dst)
    else:
        shutil.move(src, dst)

    return True


@dispatcher.add_method
def remove(login, proj_name, fullpath):

    proj_path = "{0}/{1}/projects/{2}".format(HEAD_PATH, login, proj_name)

    if not path.exists(proj_path):
        return False

    fullpath = '{0}/{1}'.format(proj_path, fullpath)

    if not path.exists(fullpath):
        return False

    if path.isdir(fullpath):
        shutil.rmtree(fullpath)
    else:
        remove_file(fullpath)

    return True


@dispatcher.add_method
def read_file(login, proj_name, fullpath):

    proj_path = "{0}/{1}/projects/{2}".format(HEAD_PATH, login, proj_name)

    if not path.exists(proj_path):
        return False

    fullpath = '{0}/{1}'.format(proj_path, fullpath)

    if not path.exists(fullpath):
        return False

    with open(fullpath, 'r', encoding='utf-8') as f:
        return f.read()


@dispatcher.add_method
def read_folder(login, proj_name, fullpath):

    proj_path = "{0}/{1}/projects/{2}".format(HEAD_PATH, login, proj_name)

    if not path.exists(proj_path):
        return False

    orig_fullpath = fullpath
    fullpath = '{0}/{1}'.format(proj_path, fullpath)

    if not path.exists(fullpath):
        return False

    content = listdir(fullpath)

    cutpath = lambda x: x[1:] if x[0] == '/' else x

    content = [{'path': cutpath(orig_fullpath+'/'+x), 'folder': path.isdir(fullpath+'/'+x)}
               for x in content if x != proj_name+'.proj']
    return content


@dispatcher.add_method
def write_file(login, proj_name, fullpath, data):

    proj_path = "{0}/{1}/projects/{2}".format(HEAD_PATH, login, proj_name)

    if not path.exists(proj_path):
        return False

    fullpath = '{0}/{1}'.format(proj_path, fullpath)

    if not path.exists(fullpath):
        return False

    with open(fullpath, 'w', encoding='utf-8') as f:
        f.write(data)

    return True


@dispatcher.add_method
def exists(login, proj_name, fullpath):

    proj_path = "{0}/{1}/projects/{2}".format(HEAD_PATH, login, proj_name)

    if not path.exists(proj_path):
        return False

    fullpath = '{0}/{1}'.format(proj_path, fullpath)

    return path.exists(fullpath)