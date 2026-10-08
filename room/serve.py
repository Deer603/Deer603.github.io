"""本机预览：青蛙的角落站点。"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

directory = Path(__file__).resolve().parent
handler = partial(SimpleHTTPRequestHandler, directory=str(directory))
server = ThreadingHTTPServer(("127.0.0.1", 8765), handler)
print("青蛙的角落：http://127.0.0.1:8765/", flush=True)
server.serve_forever()
