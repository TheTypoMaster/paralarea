from tornado.wsgi import WSGIContainer
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
from application import app


app.secret_key = b'\xb2_\xb14H\xbe~\xe6\xda\xca\x99\x80\x16\xb5B\x1b\x98n\xa0\xa4\x83\r\xe6L'

ADDRESS = 'localhost'
PORT = 80

http_server = HTTPServer(WSGIContainer(app))
http_server.listen(address=ADDRESS, port=PORT)
print('http://{0}:{1}'.format(ADDRESS, PORT))
IOLoop.instance().start()