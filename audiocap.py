"""Capture the WebAudio score of the film in real time to score.webm."""
import time, base64, sys
from cdp import start, C

OUT = "/tmp/opencode/score.webm"
DUR = 141.5

p, ws = start(["--allow-file-access-from-files", "--autoplay-policy=no-user-gesture-required"])
c = C(ws)
c.send("Page.enable"); c.send("Runtime.enable")
c.send("Emulation.setDeviceMetricsOverride", width=1280, height=720, deviceScaleFactor=1, mobile=False)
c.send("Page.navigate", url="file:///home/sidewayz8/Documents/Default Project/index.html?t=0")
time.sleep(2.5)

boot = """
(async () => {
  const S = __film.Score;
  __film.seek(0);
  S.init(); S.resume(); S.lastScene = -1; S.setScene(0, 0);
  const dest = S.ctx.createMediaStreamDestination();
  S.master.connect(dest);
  const rec = new MediaRecorder(dest.stream, { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 192000 });
  window.__chunks = []; window.__rec = rec;
  rec.ondataavailable = e => { if (e.data.size) window.__chunks.push(e.data); };
  window.__recDone = new Promise(res => { rec.onstop = res; });
  rec.start(1000);
  await new Promise(r => setTimeout(r, 120));
  __film.start();
  return S.ctx.state;
})()
"""
print("ctx:", c.eval(boot, awaitPromise=True), flush=True)
for i in range(int(DUR)):
    time.sleep(1)
    if i % 15 == 0:
        print(f"  audio {i}s t={c.eval('__film.state.t')}", flush=True)

c.eval("window.__rec.stop()")
c.eval("window.__recDone.then(()=>1)", awaitPromise=True)
b64 = c.eval("""
(async () => {
  const buf = await new Blob(window.__chunks, {type:'audio/webm'}).arrayBuffer();
  const b = new Uint8Array(buf); let s = '';
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
  return btoa(s);
})()
""", awaitPromise=True)
open(OUT, "wb").write(base64.b64decode(b64))
print("wrote", OUT, len(b64) * 3 // 4, "bytes", flush=True)
ws.close(); p.kill()
