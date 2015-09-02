from tornado.wsgi import WSGIContainer
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop

from service import app

ADDRESS = 'localhost'
PORT = 9292

http_server = HTTPServer(WSGIContainer(app))
http_server.listen(address=ADDRESS, port=PORT)
print("http://{0}:{1}".format(ADDRESS, PORT))
IOLoop.instance().start()