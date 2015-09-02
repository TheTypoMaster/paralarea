from tornado.wsgi import WSGIContainer
from tornado.ioloop import IOLoop
from tornado.web import Application, FallbackHandler
from tornado import websocket
from flask import Flask
from jsonrpc import dispatcher, JSONRPCResponseManager

app = Flask(__name__)


@dispatcher.add_method
def upper(text):
    return text.upper()


class Service(websocket.WebSocketHandler):
    def open(self):
        print("WebSocket opened")

    def on_message(self, message):
        result = JSONRPCResponseManager.handle(message, dispatcher)
        self.write_message(result.json)

    def on_close(self):
        print("WebSocket closed")

    def check_origin(self, origin):
        return True


ADDRESS = 'localhost'
PORT = 9292

container = WSGIContainer(app)
server = Application([
    (r'/', Service)
])
server.listen(address=ADDRESS, port=PORT)
print("http://{0}:{1}".format(ADDRESS, PORT))
IOLoop.instance().start()