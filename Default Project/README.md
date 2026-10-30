# APEX ASCENSION — "THE CHAIN ENDURES"

An original animated short film inspired by the visual language and lore of
[apexascension.vercel.app](https://apexascension.vercel.app).

Runtime **02:20**. No video files, no libraries, no build step — the entire film is
hand-built SVG, CSS and Canvas, sequenced by a small timeline engine in plain
JavaScript, with a WebAudio score generated live in the browser.

## Run it

Open `index.html` in a modern browser (Chrome, Edge, Firefox, Safari).

```bash
# from this folder
xdg-open index.html        # Linux
open index.html            # macOS
start index.html           # Windows
```

Or serve it locally if your browser restricts local files:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Controls

| Input | Action |
| --- | --- |
| **PLAY THE FILM** | Start from the beginning (also unlocks audio) |
| `Space` / play button | Play / pause |
| `R` | Restart |
| `M` | Mute / unmute |
| `F` | Fullscreen |
| `←` / `→` | Seek 5 seconds |
| Click the progress bar | Scrub |
| `Esc` | Exit fullscreen |

Controls fade out during playback and return on mouse movement or pause.

Phones held in portrait get a "turn sideways" card first; landscape plays the
full 16:9 frame.

## Timeline

| Time | Scene | Beat |
| --- | --- | --- |
| 00:00 | Cold open | *THE CHAIN ENDURES.* |
| 00:08 | 01 The Reach | One power decides who may connect |
| 00:27 | 02 The Disconnection | The network collapses into isolation |
| 00:39 | 03 The Silence | Isolation was not peace |
| 00:47 | 04 The Discovery | K'lar finds the Chain in an ancient temple |
| 01:11 | 05 The Treaty | The ApeX and the Pepe Legion choose alliance |
| 01:30 | 06 The Guardian | K'lar, guardian — not ruler |
| 01:44 | 07 The Ascension | Lily-Pad City and the sectors beyond |
| 02:06 | 08 The Chain Endures | End card / replay |

## How it is made

- **Stage** — a fixed 1920×1080 composition scaled to fit any viewport.
- **Art** — every frame is original vector work: procedural chain links, star
  fields, shard fields, city islands, constellations, busts and silhouettes.
- **Motion** — a single `render(t)` function drives every scene, camera move,
  cue and particle from one time value, so seeking is exact and deterministic.
- **Score** — WebAudio oscillators and filtered noise: a drone bed, per-scene
  pads, impact booms and chimes, all synthesised at runtime.
- **FX** — a Canvas layer for drifting stars, embers, sparks and light blooms.

Deep links for review or screenshots:

```
index.html?t=84          # jump to 01:24, poster and controls hidden
index.html?t=84&play     # same, auto-playing
index.html?poster        # force the poster
index.html?mute          # start muted
```

## Credits

An original fan-inspired short, made for study and demonstration. The story,
artwork, animation and sound are original and generated in code. *ApeX Ascension*,
its characters, names and site assets belong to their respective creators; no
site assets are included here.

> "We do not ascend by standing alone."
