from application import service_manager

import requests
import json


def jsonrpc2_require_handler(url, method, params):
    data = {
        'id': 0,
        'jsonrpc': '2.0',
        'method': method,
        'params': params
    }
    data = json.dumps(data)

    return requests.post(url, data=data,
                         headers={'content-type': 'application/json'}).json()

service_manager.register_service_type("jsonrpc2", jsonrpc2_require_handler)