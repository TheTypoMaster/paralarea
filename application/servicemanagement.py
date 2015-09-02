import json


class ServiceManager:

    def __init__(self, filepath="services.json"):
        self.type_handler_map = {}
        self.service_list = []
        self.reload(filepath)

    def register_service_type(self, service_type, require_handler):
        self.type_handler_map[service_type] = require_handler

    def reload(self, filepath="services.json"):
        with open(filepath, 'r') as f:
            self.service_list = json.load(f)

    def call(self, service, method, params):
        service_info = self.service_list[service]
        require_handler = self.type_handler_map[service_info["type"]]
        result = require_handler(service_info["url"], method, params)
        return result

    def get_service_info(self, url):
        return self.service_list[url]