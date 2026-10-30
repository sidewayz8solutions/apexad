import json, subprocess, time, urllib.request, base64, sys, os
import websocket

PORT = 9333
def start(extra=None):
    args = ["chromium", "--headless=new", "--no-sandbox", "--disable-gpu", f"--remote-debugging-port={PORT}",
            "--window-size=1440,900", "--autoplay-policy=no-user-gesture-required"]
    if extra: args += extra
    p = subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(80):
        try:
            tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json"))
            page = [t for t in tabs if t["type"] == "page"][0]
            return p, websocket.create_connection(page["webSocketDebuggerUrl"], timeout=60)
        except Exception:
            time.sleep(0.25)
    raise RuntimeError("no chrome")

class C:
    def __init__(self, ws):
        self.ws = ws; self.i = 0
    def send(self, method, **params):
        self.i += 1
        self.ws.send(json.dumps({"id": self.i, "method": method, "params": params}))
        while True:
            m = json.loads(self.ws.recv())
            if m.get("id") == self.i:
                if "error" in m: raise RuntimeError(m["error"])
                return m.get("result", {})
    def eval(self, expr, awaitPromise=False):
        r = self.send("Runtime.evaluate", expression=expr, returnByValue=True, awaitPromise=awaitPromise)
        return r.get("result", {}).get("value")
    def shot(self, path, clip=None):
        p = {"format": "png"}
        if clip: p["clip"] = clip
        r = self.send("Page.captureScreenshot", **p)
        open(path, "wb").write(base64.b64decode(r["data"]))
