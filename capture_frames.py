"""Deterministically capture THE CHAIN ENDURES to a JPEG sequence at 24 fps."""
import json, os, sys, time, base64, subprocess, signal
import websocket
from cdp import start, C

OUT = "/home/sidewayz8/.cache/chain-endures/frames"
FPS = 24
DUR = 140.0
TOTAL = int(round(DUR * FPS))          # 3360
START = int(sys.argv[1]) if len(sys.argv) > 1 else 0
END = int(sys.argv[2]) if len(sys.argv) > 2 else TOTAL

os.makedirs(OUT, exist_ok=True)

p, ws = start(["--allow-file-access-from-files", "--force-device-scale-factor=1"])
ws.settimeout(120)
c = C(ws)
c.send("Page.enable"); c.send("Runtime.enable")
c.send("Emulation.setDeviceMetricsOverride", width=1920, height=1080, deviceScaleFactor=1, mobile=False)
c.send("Page.navigate", url="file:///home/sidewayz8/Documents/Default Project/index.html?t=0")
time.sleep(3.0)

c.eval("""(()=>{
  const s=document.createElement('style');
  s.textContent='*{transition-duration:0s!important;transition-delay:0s!important;animation:none!important}'+
                '.grain{display:none!important}#replayBtn{display:none!important}'+
                'html,body{overflow:hidden!important}';
  document.head.appendChild(s);
  window.__film.seek(0);
  window.__film.pause();
  return {t: __film.state.t, phase: __film.state.phase};
})()""")
print("ready", flush=True)

def capture(path):
    r = c.send("Page.captureScreenshot", format="jpeg", quality=92)
    open(path, "wb").write(base64.b64decode(r["data"]))

t_start = time.time()
done = 0
for i in range(START, END):
    path = os.path.join(OUT, "f%05d.jpg" % i)
    if os.path.exists(path) and os.path.getsize(path) > 20000:
        continue
    t = i / FPS
    c.eval("__film.seek(%r)" % t)
    capture(path)
    done += 1
    if done % 48 == 0:
        el = time.time() - t_start
        rate = done / el
        left = (END - i - 1) / rate if rate else 0
        print("frame %d/%d  %.0fs elapsed  %.2f fps  eta %.0fs" % (i + 1, END, el, rate, left), flush=True)

print("done %d frames in %.0fs" % (done, time.time() - t_start), flush=True)
ws.close()
try:
    p.send_signal(signal.SIGTERM)
except Exception:
    pass
time.sleep(1.5)
subprocess.run("ps -eo pid,comm --no-headers | awk '$2==\"chromium\"{print $1}' | xargs -r kill -9", shell=True)
