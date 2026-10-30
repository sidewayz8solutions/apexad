/* ============================================================
   APEX ASCENSION — "THE CHAIN ENDURES"
   A hand-built animated short. No libraries, no video, no build.
   Timeline engine + procedural vector art + WebAudio score.
   ============================================================ */
(() => {
"use strict";

const NS = "http://www.w3.org/2000/svg";
const $ = (s) => document.querySelector(s);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const TAU = Math.PI * 2;

const ease = {
  lin: (p) => p,
  out: (p) => 1 - Math.pow(1 - p, 3),
  outQuint: (p) => 1 - Math.pow(1 - p, 5),
  in: (p) => p * p * p,
  inOut: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  outBack: (p) => { const c = 1.7; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); },
  outExpo: (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
};

/* progress of t between a and b */
function seg(t, a, b, fn = ease.out) {
  if (b === a) return t >= b ? 1 : 0;
  return fn(clamp((t - a) / (b - a)));
}
/* trapezoid window with soft edges, in absolute seconds */
function win(t, a, b, edge = 0.8) {
  return clamp(seg(t, a, a + edge) * (1 - seg(t, b - edge, b)));
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function el(tag, attrs = {}, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
const setA = (n, attrs) => { for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };

/* ------------------------------------------------------------
   TIMELINE
   ------------------------------------------------------------ */
const DUR = 140;
const SCENES = [
  { id: "s-reach",     name: "THE REACH",              start: 8.0,  end: 27.6 },
  { id: "s-break",     name: "THE DISCONNECTION",      start: 26.8, end: 39.6 },
  { id: "s-silence",   name: "THE SILENCE",            start: 39.2, end: 47.4 },
  { id: "s-temple",    name: "THE DISCOVERY",          start: 46.8, end: 71.4 },
  { id: "s-alliance",  name: "THE TREATY",             start: 70.8, end: 90.4 },
  { id: "s-guardian",  name: "THE GUARDIAN",           start: 89.8, end: 104.6 },
  { id: "s-ascend",    name: "THE ASCENSION",          start: 104.0,end: 126.4 },
  { id: "s-end",       name: "THE CHAIN ENDURES",      start: 125.6,end: 140.0 },
].map(s => ({ ...s, node: document.getElementById(s.id) }));

const sceneAt = (t) => {
  for (let i = SCENES.length - 1; i >= 0; i--) if (t >= SCENES[i].start) return i;
  return 0;
};

/* ------------------------------------------------------------
   PROCEDURAL ART BUILDERS
   ------------------------------------------------------------ */
const ART = {};

/* -- chain ring helper ------------------------------------- */
function chainRing(parent, o = {}) {
  const {
    cx = 0, cy = 0, r = 180, count = 14, linkW = 26, linkH = 12,
    color = "#38f0ff", op = 0.7, startAngle = 0, ringRotate = 0,
  } = o;
  const g = el("g", { transform: `translate(${cx} ${cy}) rotate(${ringRotate})` }, parent);
  const links = [];
  for (let i = 0; i < count; i++) {
    const a = startAngle + (i / count) * 360;
    const rad = (a * Math.PI) / 180;
    const x = Math.cos(rad) * r;
    const y = Math.sin(rad) * r;
    const lg = el("g", { transform: `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(a + 90).toFixed(2)})` }, g);
    el("rect", { x: -linkW / 2, y: -linkH / 2, width: linkW, height: linkH, rx: linkH / 2,
      fill: "none", stroke: color, "stroke-width": 1.7, opacity: op }, lg);
    el("rect", { x: -linkW / 2 + 4, y: -linkH / 2 + 3, width: linkW - 8, height: linkH - 6, rx: (linkH - 6) / 2,
      fill: "none", stroke: color, "stroke-width": 0.8, opacity: op * 0.55 }, lg);
    links.push(lg);
  }
  return { g, links };
}

/* -- 01 THE REACH ------------------------------------------ */
function buildReach() {
  const net = $("#reachNet");
  net.setAttribute("transform", "translate(960 486)");
  const rng = mulberry32(11);
  const nodes = [], paths = [];

  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * TAU + rng() * 0.12;
    const r = 280 + (i % 4) * 62 + rng() * 70;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r * 0.8;
    const path = el("path", {
      d: `M0 0 Q ${(x * 0.42 - y * 0.16).toFixed(1)} ${(y * 0.42 + x * 0.16).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`,
      fill: "none", stroke: i % 3 === 0 ? "#ff5a72" : "#ff2f4d", "stroke-width": i % 5 === 0 ? 2 : 1.2,
      opacity: i % 3 === 0 ? 0.5 : 0.28,
    }, net);
    const len = path.getTotalLength();
    path.setAttribute("stroke-dasharray", len);
    path.setAttribute("stroke-dashoffset", len);
    paths.push({ path, len, delay: rng() * 0.5 });

    const g = el("g", { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` }, net);
    el("circle", { r: 12, fill: "none", stroke: "#ff2f4d", "stroke-width": 1, opacity: 0.35 }, g);
    el("circle", { r: 4.2, fill: "#ff5a72" }, g);
    el("path", { d: "M0 -9 L4 0 L0 9 L-4 0 Z", fill: "none", stroke: "#ffb3bd", "stroke-width": 1, opacity: 0.7 }, g);
    nodes.push({ g, x, y, seed: rng() * TAU, delay: rng() * 0.7 });
  }
  ART.reach = { nodes, paths, net };
}

/* -- 02 BREAK ---------------------------------------------- */
function buildBreak() {
  const rng = mulberry32(23);
  const shards = [];
  const sg = $("#breakShards");
  for (let i = 0; i < 46; i++) {
    const a = rng() * TAU;
    const dist = 30 + rng() * 120;
    const size = 6 + rng() * 26;
    const pts = [];
    const sides = 3 + ((rng() * 3) | 0);
    for (let k = 0; k < sides; k++) {
      const aa = (k / sides) * TAU + rng() * 0.6;
      const rr = size * (0.5 + rng() * 0.6);
      pts.push(`${(Math.cos(aa) * rr).toFixed(1)},${(Math.sin(aa) * rr).toFixed(1)}`);
    }
    const g = el("g", { opacity: 0 }, sg);
    el("path", { d: `M${pts.join(" L")} Z`, fill: rng() > 0.72 ? "#2a0710" : "#0e1222",
      stroke: rng() > 0.5 ? "rgba(255,47,77,.55)" : "rgba(120,155,225,.3)", "stroke-width": 1 }, g);
    shards.push({ g, a, dist, size, spin: (rng() - 0.5) * 90, speed: 60 + rng() * 130, seed: rng() });
  }
  const nodes = [];
  const ng = $("#breakNodes");
  for (let i = 0; i < 12; i++) {
    const a = rng() * TAU, r = 180 + rng() * 520;
    const g = el("g", { transform: `translate(${960 + Math.cos(a) * r} ${480 + Math.sin(a) * r * 0.7})` }, ng);
    el("circle", { r: 3, fill: "#ff5a72" }, g);
    el("circle", { r: 10, fill: "none", stroke: "#ff2f4d", "stroke-width": 1, opacity: 0.3 }, g);
    nodes.push({ g, a, r, seed: rng() });
  }
  ART.break = { shards, nodes };
}

/* -- 03 SILENCE -------------------------------------------- */
function buildSilence() {
  const rng = mulberry32(31);
  const g = $("#silenceNodes");
  const nodes = [];
  for (let i = 0; i < 8; i++) {
    const a = rng() * TAU, r = 220 + rng() * 560;
    const n = el("g", { transform: `translate(${960 + Math.cos(a) * r} ${520 + Math.sin(a) * r * 0.6})` }, g);
    el("circle", { r: 2.2, fill: "#6f7ea8", opacity: 0.5 }, n);
    el("circle", { r: 8, fill: "none", stroke: "#6f7ea8", "stroke-width": 0.8, opacity: 0.2 }, n);
    nodes.push({ n, seed: rng(), a, r });
  }
  ART.silence = { nodes };
}

/* -- 04 TEMPLE --------------------------------------------- */
function buildTemple() {
  const rng = mulberry32(47);
  const stars = $("#templeStars");
  for (let i = 0; i < 90; i++) {
    const x = 380 + rng() * 1160;
    const y = 250 + rng() * 540;
    el("circle", { cx: x.toFixed(0), cy: y.toFixed(0), r: (0.6 + rng() * 1.6).toFixed(1),
      fill: "#cfe6ff", opacity: (0.25 + rng() * 0.6).toFixed(2) }, stars);
  }

  // Chain sphere — three interlocking rings of links
  const sphere = $("#chainSphere");
  const rings = [];
  const specs = [
    { rx: 200, ry: 200, rot: 0, count: 16 },
    { rx: 200, ry: 200, rot: 60, count: 16 },
    { rx: 200, ry: 200, rot: 120, count: 16 },
    { rx: 268, ry: 78, rot: -18, count: 14, small: true },
    { rx: 268, ry: 78, rot: 18, count: 14, small: true },
  ];
  specs.forEach((s, si) => {
    const g = el("g", { transform: `rotate(${s.rot})` }, sphere);
    const rr = chainRing(g, { r: s.rx, count: s.count, linkW: s.small ? 18 : 22, linkH: s.small ? 9 : 11,
      color: si % 2 ? "#b57bff" : "#38f0ff", op: 0.55 });
    if (s.ry !== s.rx) g.setAttribute("transform", `rotate(${s.rot}) scale(1 ${(s.ry / s.rx).toFixed(3)})`);
    rings.push({ g, links: rr.links, rot: s.rot, small: s.small });
  });
  // faint network lines
  const lines = el("g", { opacity: 0.35 }, sphere);
  for (let i = 0; i < 16; i++) {
    const a1 = rng() * TAU, a2 = a1 + 0.7 + rng() * 1.2;
    const p = el("line", {
      x1: (Math.cos(a1) * 200).toFixed(1), y1: (Math.sin(a1) * 200).toFixed(1),
      x2: (Math.cos(a2) * 200).toFixed(1), y2: (Math.sin(a2) * 200).toFixed(1),
      stroke: "#38f0ff", "stroke-width": 0.8, opacity: 0,
    }, lines);
    p.dataset.delay = i * 0.06;
  }
  ART.temple = { rings, lines: [...lines.children], stars };
}

/* -- 05 ALLIANCE ------------------------------------------- */
function buildAlliance() {
  const apeG = $("#apeLegion"), pepeG = $("#pepeLegion");
  const apes = [], pepes = [];

  const apeSpec = [
    { x: 190, s: 0.92, y: 992, delay: 0.0 },
    { x: 400, s: 1.06, y: 1000, delay: 0.35 },
    { x: 590, s: 0.84, y: 986, delay: 0.7 },
  ];
  apeSpec.forEach((a, i) => {
    const g = el("g", { transform: `translate(${a.x - 240} ${a.y})` }, apeG);
    const inner = el("g", { transform: `scale(${a.s})` }, g);
    el("use", { href: "#apeSil", x: -105, y: -315, width: 210, height: 315, fill: "url(#apeFill)",
      filter: "drop-shadow(0 0 12px rgba(56,240,255,.3))" }, inner);
    // headband band + goggles glint applied over the silhouette
    el("rect", { x: -36, y: -278, width: 72, height: 9, rx: 4, fill: "#2a44c9", opacity: 0.75 }, inner);
    el("rect", { x: -30, y: -244, width: 22, height: 8, rx: 4, fill: "#ff2f4d", opacity: 0.9,
      filter: "drop-shadow(0 0 7px #ff2f4d)" }, inner);
    el("rect", { x: 8, y: -244, width: 22, height: 8, rx: 4, fill: "#ff2f4d", opacity: 0.9,
      filter: "drop-shadow(0 0 7px #ff2f4d)" }, inner);
    // staff
    const st = el("g", { transform: "translate(86 -190) rotate(7)" }, inner);
    el("line", { x1: 0, y1: 0, x2: 0, y2: -150, stroke: "#0d1a2e", "stroke-width": 7 }, st);
    el("line", { x1: 0, y1: 0, x2: 0, y2: -150, stroke: "rgba(56,240,255,.42)", "stroke-width": 1.5 }, st);
    el("circle", { cx: 0, cy: -158, r: 2.6, fill: "#38f0ff", opacity: 0.85 }, st);
    el("path", { d: "M0 -186 L12 -160 L0 -132 L-12 -160 Z", fill: "#38f0ff", opacity: 0.9,
      filter: "drop-shadow(0 0 9px #38f0ff)" }, st);
    apes.push({ g, inner, x: a.x, y: a.y, delay: a.delay, staff: st });
  });

  const pepeSpec = [
    { x: 1710, s: 0.9, y: 992, delay: 0.2 },
    { x: 1520, s: 1.06, y: 1004, delay: 0.5 },
    { x: 1330, s: 0.86, y: 988, delay: 0.8 },
  ];
  pepeSpec.forEach((p, i) => {
    const g = el("g", { transform: `translate(${p.x + 240} ${p.y})` }, pepeG);
    const inner = el("g", { transform: `scale(${p.s})` }, g);
    el("use", { href: "#pepeSil", x: -105, y: -315, width: 210, height: 315, fill: "#020705",
      filter: "drop-shadow(0 0 11px rgba(20,241,149,.34))" }, inner);
    // banner
    const bn = el("g", { transform: "translate(-84 -170)" }, inner);
    el("line", { x1: 0, y1: 0, x2: 0, y2: -150, stroke: "#0a1a14", "stroke-width": 5 }, bn);
    el("line", { x1: 0, y1: 0, x2: 0, y2: -150, stroke: "rgba(20,241,149,.38)", "stroke-width": 1.3 }, bn);
    el("path", { d: "M0 -144 L62 -136 L62 -78 L0 -86 Z", fill: "#04120d", stroke: "rgba(20,241,149,.5)", "stroke-width": 1.5 }, bn);
    el("path", { d: "M10 -124 L48 -119 M10 -108 L38 -104 M10 -92 L30 -89", stroke: "#14f195", "stroke-width": 2, opacity: 0.6 }, bn);
    el("path", { d: "M10 -140 L20 -132 L36 -150", stroke: "#14f195", "stroke-width": 2, fill: "none", opacity: 0.8 }, bn);
    pepes.push({ g, inner, x: p.x, y: p.y, delay: p.delay, banner: bn });
  });

  // bridge links along cubic curve
  const bl = $("#bridgeLinks");
  const links = [];
  const N = 15;
  const P = [660, 928, 800, 830, 1120, 830, 1260, 928];
  const bez = (p) => {
    const u = 1 - p;
    return {
      x: u*u*u*P[0] + 3*u*u*p*P[2] + 3*u*p*p*P[4] + p*p*p*P[6],
      y: u*u*u*P[1] + 3*u*u*p*P[3] + 3*u*p*p*P[5] + p*p*p*P[7],
    };
  };
  for (let i = 0; i < N; i++) {
    const p = i / (N - 1);
    const pt = bez(p);
    const g = el("g", { transform: `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})` }, bl);
    const rot = (p - 0.5) * 80 + (i % 2 ? 90 : 0);
    const l = el("g", { transform: `rotate(${rot}) scale(0)` }, g);
    el("rect", { x: -19, y: -9, width: 38, height: 18, rx: 9, fill: "none", stroke: "#38f0ff", "stroke-width": 2.6,
      filter: "drop-shadow(0 0 6px rgba(56,240,255,.75))" }, l);
    el("rect", { x: -13, y: -5, width: 26, height: 10, rx: 5, fill: "none", stroke: "#bff9ff", "stroke-width": 1, opacity: 0.6 }, l);
    links.push({ l, delay: p * 2.4 });
  }
  const line = $("#bridgeLine");
  const len = line.getTotalLength();
  line.setAttribute("stroke-dasharray", len);
  line.setAttribute("stroke-dashoffset", len);

  ART.alliance = { apes, pepes, links, line, len, sigil: $("#allySigil"), bridgeGlow: $("#bridgeGlow") };
}

/* -- 06 GUARDIAN ------------------------------------------- */
function buildGuardian() {
  const halo = $("#guardHalo");
  const ring = chainRing(halo, { r: 358, count: 26, linkW: 22, linkH: 10, color: "#38f0ff", op: 0.5 });
  const ring2 = chainRing(halo, { r: 306, count: 22, linkW: 16, linkH: 8, color: "#b57bff", op: 0.35, startAngle: 8 });

  const gl = $("#guardLegion");
  const units = [];
  const rng = mulberry32(89);
  for (let i = 0; i < 14; i++) {
    const side = i < 7 ? -1 : 1;
    const k = side < 0 ? i : i - 7;
    const x = side < 0 ? 280 + k * 96 : 1920 - 280 - k * 96;
    const y = 1000 + (rng() - 0.5) * 16;
    const g = el("g", { transform: `translate(${x} ${y + 60})` }, gl);
    el("use", { href: side < 0 ? "#apeSil" : "#pepeSil", x: -34, y: -110, width: 68, height: 102,
      fill: "#03050b", filter: `drop-shadow(0 0 8px rgba(${side < 0 ? "56,240,255" : "20,241,149"},.35))` }, g);
    el("ellipse", { cx: -10, cy: -78, rx: 5, ry: 2.4, fill: "#ff2f4d", filter: "url(#softGlow)" }, g);
    el("ellipse", { cx: 10, cy: -78, rx: 5, ry: 2.4, fill: "#ff2f4d", filter: "url(#softGlow)" }, g);
    units.push({ g, seed: rng(), baseY: y });
  }
  ART.guardian = { halo, ring, ring2, units, bust: $("#guardBust") };
}

/* -- 07 ASCENSION ------------------------------------------ */
function buildAscend() {
  const rng = mulberry32(104);
  const root = $("#ascendCity");
  const islands = [];

  const specs = [
    { cx: 480,  cy: 830, w: 330, h: 30, depth: 150, sc: 1.06, delay: 0.0, towers: 7 },
    { cx: 980,  cy: 720, w: 640, h: 42, depth: 230, sc: 1.08, delay: 0.8, towers: 13, grand: true },
    { cx: 1540, cy: 840, w: 300, h: 28, depth: 150, sc: 1.0,  delay: 1.7, towers: 6 },
    { cx: 810,  cy: 490, w: 300, h: 24, depth: 120, sc: 0.72, delay: 2.5, towers: 5 },
    { cx: 1330, cy: 540, w: 240, h: 20, depth: 110, sc: 0.62, delay: 3.1, towers: 4 },
  ];

  specs.forEach((s) => {
    const g = el("g", { transform: `translate(${s.cx} ${s.cy}) scale(${s.sc})` }, root);
    // glow under island
    el("ellipse", { cx: 0, cy: 60, rx: s.w * 0.5, ry: 70, fill: "#0e2b4a", opacity: 0.5, filter: "url(#blur40)" }, g);
    // light waterfall
    el("path", { d: `M-${s.w * 0.16} 8 L${s.w * 0.16} 8 L${s.w * 0.08} ${260 + s.depth} L-${s.w * 0.08} ${260 + s.depth} Z`,
      fill: "url(#beamGrad)", opacity: 0.45 }, g);
    el("path", { d: `M-4 8 L4 8 L2 ${250 + s.depth} L-2 ${250 + s.depth} Z`, fill: "#8ff8ff", opacity: 0.35 }, g);

    // rock body — organic tapered spire
    const half = s.w / 2;
    const d1 = s.depth;
    const tip = s.h + s.depth + 60;
    const d = `M${-half} 0
      C${(-half * 0.86).toFixed(1)} ${(d1 * 0.34).toFixed(1)} ${(-half * 0.52).toFixed(1)} ${(d1 * 0.62).toFixed(1)} ${(-half * 0.20).toFixed(1)} ${(d1 * 0.86).toFixed(1)}
      C${(-half * 0.13).toFixed(1)} ${(d1 * 0.98).toFixed(1)} ${(-half * 0.07).toFixed(1)} ${(tip - 20).toFixed(1)} ${(-half * 0.02).toFixed(1)} ${tip.toFixed(1)}
      L${(half * 0.02).toFixed(1)} ${tip.toFixed(1)}
      C${(half * 0.07).toFixed(1)} ${(tip - 20).toFixed(1)} ${(half * 0.13).toFixed(1)} ${(d1 * 0.98).toFixed(1)} ${(half * 0.20).toFixed(1)} ${(d1 * 0.86).toFixed(1)}
      C${(half * 0.52).toFixed(1)} ${(d1 * 0.62).toFixed(1)} ${(half * 0.86).toFixed(1)} ${(d1 * 0.34).toFixed(1)} ${half} 0 Z`;
    el("path", { d, fill: "#060a14", stroke: "rgba(56,240,255,.10)", "stroke-width": 1.2 }, g);
    // facets
    for (let i = 0; i < 5; i++) {
      const fx = -half + (s.w / 5) * i + rng() * 18;
      el("path", { d: `M${fx.toFixed(0)} 0 C${(fx * 0.7).toFixed(0)} ${(d1 * 0.4).toFixed(0)} ${(fx * 0.35).toFixed(0)} ${(d1 * 0.7).toFixed(0)} ${(fx * 0.08).toFixed(0)} ${(d1 * 0.95).toFixed(0)}`,
        stroke: "rgba(70,110,180,.13)", "stroke-width": 1.5, fill: "none" }, g);
    }
    // hanging lights on the rock
    for (let i = 0; i < 4; i++) {
      const lx = -half * 0.5 + rng() * s.w * 0.5;
      const ly = d1 * (0.35 + rng() * 0.4);
      el("circle", { cx: lx.toFixed(0), cy: ly.toFixed(0), r: 1.4, fill: "#38f0ff", opacity: 0.45 + rng() * 0.3 }, g);
    }

    // plaza edge
    el("path", { d: `M-${s.w / 2} 0 L${s.w / 2} 0 L${s.w / 2 - 10} 14 L-${s.w / 2 + 10} 14 Z`, fill: "#0a1120" }, g);
    el("path", { d: `M-${s.w / 2} 0 L${s.w / 2} 0`, stroke: "#38f0ff", "stroke-width": 1.8, opacity: 0.55 }, g);

    // towers
    const towers = [];
    const n = s.towers;
    for (let i = 0; i < n; i++) {
      const tx = -s.w * 0.4 + (s.w * 0.8) * (i / Math.max(1, n - 1)) + (rng() - 0.5) * 10;
      const tw = 8 + rng() * (s.grand ? 26 : 16);
      const th = (s.grand ? 80 : 50) + rng() * (s.grand ? 190 : 110);
      const tg = el("g", { transform: `translate(${tx.toFixed(1)} 0)` }, g);
      el("path", {
        d: `M${-tw / 2} 0 L${-tw / 2} ${-th} L0 ${-th - 8 - rng() * 20} L${tw / 2} ${-th} L${tw / 2} 0 Z`,
        fill: i % 4 === 0 ? "#0e1a36" : "#091226", stroke: "rgba(120,170,255,.22)", "stroke-width": 1,
      }, tg);
      // lit window columns
      const cols = tw > 18 ? 3 : 2;
      const rows = Math.max(2, Math.floor(th / 18));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const lit = rng() > 0.4;
          el("rect", {
            x: -tw / 2 + 4 + c * ((tw - 6) / cols), y: -th + 8 + r * 15,
            width: 2.4, height: 4, fill: lit ? (rng() > 0.72 ? "#b57bff" : "#38f0ff") : "#101c34",
            opacity: lit ? 0.5 + rng() * 0.5 : 0.5,
          }, tg);
        }
      }
      if (i % 4 === 1) {
        el("ellipse", { cx: 0, cy: -th - 2, rx: tw * 0.62, ry: tw * 0.28, fill: "#0d1730", stroke: "rgba(56,240,255,.3)", "stroke-width": 1.2 }, tg);
        el("path", { d: `M${-tw * 0.3} ${-th - 8} Q0 ${-th - tw * 0.55} ${tw * 0.3} ${-th - 8}`, stroke: "rgba(56,240,255,.35)", "stroke-width": 1.2, fill: "none" }, tg);
      }
      if (s.grand && i > 0 && i % 2 === 0) {
        el("path", { d: `M${(tx - 40).toFixed(0)} ${(-th * 0.62).toFixed(0)} L${tx.toFixed(0)} ${(-th * 0.62).toFixed(0)}`,
          stroke: "rgba(56,240,255,.20)", "stroke-width": 1, "stroke-dasharray": "3 4" }, g);
      }
      if (s.grand && i === Math.floor(n / 2)) {
        // central spire + ring
        el("path", { d: `M0 ${-th - 30} L0 ${-th - 150}`, stroke: "rgba(56,240,255,.5)", "stroke-width": 2 }, tg);
        el("ellipse", { cx: 0, cy: -th - 96, rx: 46, ry: 14, fill: "none", stroke: "#38f0ff", "stroke-width": 1.6, opacity: 0.7 }, tg);
        el("circle", { cx: 0, cy: -th - 150, r: 3, fill: "#bff9ff", filter: "url(#softGlow)" }, tg);
      }
      const beacon = el("circle", { cx: 0, cy: -th - 14, r: 1.8, fill: "#8ff8ff", opacity: 0.9 }, tg);
      towers.push({ beacon, seed: rng() });
    }

    // hanging gardens light
    el("path", { d: `M-${s.w * 0.2} 12 L-${s.w * 0.08} ${140 + s.depth} L${s.w * 0.08} ${140 + s.depth} L${s.w * 0.2} 12 Z`,
      fill: "url(#beamGrad2)", opacity: 0.5 }, g);

    islands.push({ g, towers, spec: s });
  });

  // distant chain-rings in the sky
  const sky = el("g", { opacity: 0.35 }, root);
  chainRing(sky, { cx: 1560, cy: 240, r: 70, count: 10, linkW: 14, linkH: 7, color: "#38f0ff", op: 0.5 });

  // constellations
  const cg = $("#ascendConstel");
  const stars = [];
  for (let i = 0; i < 18; i++) {
    const x = 180 + rng() * 1560;
    const y = 120 + rng() * 420;
    const c = el("circle", { cx: x.toFixed(0), cy: y.toFixed(0), r: 1.6, fill: "#cfe6ff", opacity: 0 }, cg);
    stars.push({ c, x, y });
  }
  const lines = [];
  for (let i = 1; i < stars.length; i++) {
    if (rng() > 0.55) continue;
    const l = el("line", { x1: stars[i - 1].x, y1: stars[i - 1].y, x2: stars[i].x, y2: stars[i].y,
      stroke: "#7fd8ff", "stroke-width": 0.8, opacity: 0 }, cg);
    lines.push(l);
  }

  ART.ascend = { islands, stars, lines };
}

/* -- 08 END / POSTER RINGS -------------------------------- */
function buildRings() {
  chainRing($("#endLinks"), { r: 262, count: 20, linkW: 22, linkH: 10, color: "#38f0ff", op: 0.22 });
  chainRing($("#posterLinks"), { r: 178, count: 16, linkW: 24, linkH: 11, color: "#38f0ff", op: 0.45 });
  chainRing($("#posterLinks"), { r: 236, count: 22, linkW: 14, linkH: 7, color: "#b57bff", op: 0.3 });
}

/* ------------------------------------------------------------
   CANVAS : stars, dust, embers, sparks
   ------------------------------------------------------------ */
const cv = $("#fx");
const ctx = cv.getContext("2d");
const W = 1920, H = 1080;
const rngC = mulberry32(7);

const STARS = Array.from({ length: 300 }, () => ({
  x: rngC() * W, y: rngC() * H, r: 0.3 + rngC() * 1.5, a: 0.25 + rngC() * 0.7,
  ph: rngC() * TAU, sp: 0.4 + rngC() * 1.4, depth: 0.3 + rngC() * 0.7,
}));
const DUST = Array.from({ length: 110 }, () => ({
  x: rngC() * W, y: rngC() * H, r: 0.6 + rngC() * 1.6, ph: rngC() * TAU, sp: 3 + rngC() * 9, drift: 6 + rngC() * 22,
}));
const EMBERS = Array.from({ length: 100 }, () => ({
  x: rngC() * W, y: rngC() * H, r: 0.7 + rngC() * 2.1, sp: 12 + rngC() * 40, ph: rngC() * TAU, amp: 10 + rngC() * 40,
}));
const SPARKS = Array.from({ length: 150 }, () => ({
  x: rngC() * W, y: rngC() * H, r: 0.6 + rngC() * 2.2, sp: 22 + rngC() * 80, ph: rngC() * TAU, amp: 8 + rngC() * 30,
}));
const ORBS = Array.from({ length: 70 }, () => ({
  a: rngC() * TAU, ph: rngC(), sp: 0.08 + rngC() * 0.2, r0: 320 + rngC() * 260,
}));

function glow(x, y, r, color, alpha) {
  if (alpha <= 0.001) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color.replace("ALPHA", alpha.toFixed(3)));
  g.addColorStop(1, color.replace("ALPHA", "0"));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

function drawCanvas(t) {
  ctx.clearRect(0, 0, W, H);

  /* deep space */
  const spaceA = 1 - 0.45 * win(t, 90, 126);
  for (const s of STARS) {
    const tw = 0.55 + 0.45 * Math.sin(t * s.sp + s.ph);
    const x = (s.x - t * 2.2 * s.depth + W) % W;
    ctx.globalAlpha = s.a * tw * spaceA;
    ctx.fillStyle = s.depth > 0.8 ? "#dcecff" : "#9fb4e8";
    ctx.beginPath();
    ctx.arc(x, s.y, s.r, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  /* scene atmosphere */
  const wReach = win(t, 8, 27.6);
  const wBreak = win(t, 27, 39.2, 1.2);
  const wTemple = win(t, 47, 71);
  const wAlliance = win(t, 71, 90);
  const wGuard = win(t, 90, 104.5);
  const wAscend = win(t, 104, 126);
  const wPoster = state.phase === "poster" ? 1 : 0;

  if (wReach > 0) {
    glow(960, 486, 640, "rgba(255,47,77,ALPHA)", 0.16 * wReach);
    for (const o of ORBS) {
      const ph = ((t * o.sp + o.ph) % 1);
      const r = o.r0 * (1 - ph);
      const x = 960 + Math.cos(o.a) * r;
      const y = 486 + Math.sin(o.a) * r * 0.8;
      ctx.globalAlpha = (1 - ph) * 0.5 * wReach;
      ctx.fillStyle = "#ff5a72";
      ctx.beginPath(); ctx.arc(x, y, 1.6, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (wBreak > 0) {
    glow(960, 470, 560, "rgba(255,47,77,ALPHA)", 0.10 * wBreak);
    for (const e of EMBERS) {
      const y = ((e.y - t * e.sp) % H + H) % H;
      const x = e.x + Math.sin(t * 0.5 + e.ph) * e.amp;
      ctx.globalAlpha = 0.35 * wBreak * (0.4 + 0.6 * Math.sin(e.ph + t));
      ctx.fillStyle = "#ff5a72";
      ctx.beginPath(); ctx.arc(x, y, e.r, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (wTemple > 0) {
    glow(960, 620, 560, "rgba(56,240,255,ALPHA)", 0.13 * wTemple);
    for (const d of DUST) {
      const x = (d.x + t * d.drift * 0.4) % W;
      const y = (d.y - t * d.sp * 0.35 + H) % H;
      ctx.globalAlpha = 0.28 * wTemple * (0.5 + 0.5 * Math.sin(t * 0.8 + d.ph));
      ctx.fillStyle = "#bfe9ff";
      ctx.beginPath(); ctx.arc(x, y, d.r, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (wAlliance > 0) {
    glow(700, 820, 420, "rgba(56,240,255,ALPHA)", 0.10 * wAlliance);
    glow(1220, 820, 420, "rgba(20,241,149,ALPHA)", 0.10 * wAlliance);
    for (const d of DUST) {
      const x = (d.x - t * d.drift * 0.2) % W;
      const y = (d.y - t * d.sp * 0.2 + H) % H;
      ctx.globalAlpha = 0.24 * wAlliance;
      ctx.fillStyle = d.x > 960 ? "#8bffcf" : "#8ff8ff";
      ctx.beginPath(); ctx.arc(x, y, d.r * 1.2, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (wGuard > 0) {
    glow(960, 520, 620, "rgba(90,120,255,ALPHA)", 0.14 * wGuard);
  }

  if (wAscend > 0) {
    glow(1100, 560, 700, "rgba(56,240,255,ALPHA)", 0.10 * wAscend);
    glow(700, 420, 500, "rgba(155,77,255,ALPHA)", 0.08 * wAscend);
    for (const s of SPARKS) {
      const y = ((s.y - t * s.sp) % (H + 120) + H + 120) % (H + 120);
      const x = s.x + Math.sin(t * 0.7 + s.ph) * s.amp;
      ctx.globalAlpha = 0.5 * wAscend * (0.3 + 0.7 * Math.sin(s.ph + t * 1.3));
      ctx.fillStyle = s.ph > 3 ? "#b57bff" : "#8ff8ff";
      ctx.beginPath(); ctx.arc(x, y, s.r * 0.9, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (wPoster > 0) {
    glow(1250, 380, 620, "rgba(155,77,255,ALPHA)", 0.13);
    glow(500, 760, 520, "rgba(56,240,255,ALPHA)", 0.07);
  }
}

/* ------------------------------------------------------------
   SCENE UPDATERS
   ------------------------------------------------------------ */
function updReach(t) {
  const { nodes, paths, net } = ART.reach;
  const cam = document.querySelector("#s-reach .cam");
  cam.style.transform = `scale(${(1.03 + seg(t, 8, 27) * 0.05).toFixed(3)}) translateY(${(seg(t, 8, 27) * 12).toFixed(1)}px)`;
  const draw = seg(t, 8.4, 13.2, ease.out);
  const pull = seg(t, 18, 22.4, ease.inOut);
  const shatter = seg(t, 24.5, 27.3, ease.out);
  const tremor = seg(t, 22.2, 24.4) * (t > 22.2 ? 1 : 0);
  const shakeX = tremor * Math.sin(t * 47) * 9 + shatter * Math.sin(t * 31) * 14;
  const shakeY = tremor * Math.cos(t * 41) * 7 + shatter * Math.cos(t * 37) * 10;

  paths.forEach((p, i) => {
    p.path.setAttribute("stroke-dashoffset", (p.len * (1 - clamp((draw - p.delay) / 0.75))).toFixed(1));
    p.path.setAttribute("opacity", (0.34 * (1 - shatter * 0.9)).toFixed(3));
  });

  nodes.forEach((n, i) => {
    const app = seg(t, 8.5 + n.delay, 9.6 + n.delay, ease.outBack);
    const fx = 1 - 0.44 * pull + 2.4 * shatter;
    const wob = Math.sin(t * 3 + n.seed) * 3;
    const x = n.x * fx + wob + shakeX;
    const y = n.y * fx + Math.cos(t * 2.4 + n.seed) * 3 + shakeY;
    const sc = app * (1 - shatter) * (1 + 0.2 * Math.sin(t * 4 + n.seed));
    n.g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${sc.toFixed(3)})`);
    n.g.setAttribute("opacity", (1 - shatter).toFixed(3));
  });

  const rings = document.getElementById("reachRings");
  rings.setAttribute("transform", `rotate(${(t * 3).toFixed(1)}) scale(${(1 + 0.03 * Math.sin(t * 2)).toFixed(3)})`);

  const core = document.getElementById("reachCore");
  const coreIn = seg(t, 8.1, 10.4, ease.outBack);
  core.setAttribute("transform", `translate(${(960 + shakeX * 0.6).toFixed(1)} ${(486 + shakeY * 0.6).toFixed(1)}) scale(${coreIn.toFixed(3)})`);

  const eye = document.getElementById("reachEye");
  eye.setAttribute("opacity", (0.65 + 0.35 * Math.sin(t * 2.2)).toFixed(3));
  net.setAttribute("opacity", (1 - shatter * 0.5).toFixed(3));
}

function updBreak(t) {
  const { shards, nodes } = ART.break;
  const cam = document.querySelector("#s-break .cam");
  cam.style.transform = `scale(${(1.04 + seg(t, 26.8, 39) * 0.05).toFixed(3)})`;
  const dt = Math.max(0, t - 26.8);
  const inA = seg(t, 26.9, 28.2);
  const fade = 1 - seg(t, 33, 39.4, ease.in) * 0.85;
  shards.forEach((s) => {
    const d = s.dist + dt * s.speed;
    const x = 960 + Math.cos(s.a) * d;
    const y = 480 + Math.sin(s.a) * d * 0.72 + Math.sin(dt * 0.9 + s.seed * 6) * 8;
    const o = inA * fade * (0.55 + 0.45 * s.seed);
    s.g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(dt * s.spin).toFixed(1)})`);
    s.g.setAttribute("opacity", o.toFixed(3));
  });
  nodes.forEach((n, i) => {
    const d = n.r + dt * 7;
    const x = 960 + Math.cos(n.a) * d;
    const y = 480 + Math.sin(n.a) * d * 0.7;
    const flick = Math.max(0, Math.sin(t * 9 + n.seed * 12)) ;
    n.g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    n.g.setAttribute("opacity", (fade * (0.2 + 0.6 * flick)).toFixed(3));
  });
  const shock = (id, maxR, w) => {
    const el2 = document.getElementById(id);
    const p = seg(t, 24.5, 28.6, ease.out);
    el2.setAttribute("r", (maxR * p).toFixed(1));
    el2.setAttribute("opacity", ((1 - p) * 0.7).toFixed(3));
    el2.setAttribute("stroke-width", (w * (1 - p * 0.6)).toFixed(2));
  };
  shock("breakShock", 820, 3.2);
  shock("breakShock2", 620, 1.6);
}

function updSilence(t) {
  const { nodes } = ART.silence;
  const cam = document.querySelector("#s-silence .cam");
  cam.style.transform = `scale(${(1.02 + seg(t, 39, 47) * 0.04).toFixed(3)})`;
  nodes.forEach((n, i) => {
    const flick = 0.4 + 0.6 * Math.max(0, Math.sin(t * (0.7 + n.seed) + i));
    n.n.setAttribute("opacity", (flick * 0.5).toFixed(3));
  });
  const seed = document.getElementById("silenceSeed");
  const p = seg(t, 43.6, 47.2, ease.inOut);
  seed.setAttribute("transform", `translate(960 740) scale(${(0.6 + p * 0.9).toFixed(3)})`);
  seed.setAttribute("opacity", (0.25 + 0.75 * p * (0.75 + 0.25 * Math.sin(t * 3))).toFixed(3));
}

function updTemple(t) {
  const wide = $("#templeSet"), klar = $("#templeKlar"), bust = $("#templeBust");
  const chain = $("#templeChain");
  const cam = $("#s-temple .cam");

  // camera push
  const cp = seg(t, 47.6, 58.2, ease.inOut);
  cam.style.transform = `scale(${(1 + cp * 0.1).toFixed(3)}) translateY(${(-cp * 26).toFixed(1)}px)`;

  // K'lar walks in
  const walk = seg(t, 47.8, 51.9, ease.inOut);
  const wx = lerp(1430, 960, walk);
  const bob = Math.sin(t * 7) * 4 * (walk > 0 && walk < 1 ? 1 : 0);
  klar.setAttribute("transform", `translate(${wx.toFixed(1)} ${(700 + bob).toFixed(1)}) scale(1.18)`);

  // wide view dissolves, close-up arrives
  const cut = seg(t, 57.5, 58.9, ease.inOut);
  wide.setAttribute("opacity", (1 - cut).toFixed(3));
  chain.setAttribute("opacity", (1 - cut).toFixed(3));
  const bp = seg(t, 58.1, 60.2, ease.out);
  bust.setAttribute("opacity", bp.toFixed(3));
  bust.setAttribute("transform", `translate(960 ${(612 + (1 - bp) * 26).toFixed(1)}) scale(${(1.03 + (1 - bp) * 0.07).toFixed(3)})`);

  // chain core + sphere
  const core = $("#chainCore");
  const coreP = seg(t, 52.2, 54.2, ease.outBack);
  core.setAttribute("r", (11 * coreP).toFixed(1));
  core.setAttribute("opacity", (0.9 - 0.4 * Math.sin(t * 2.4)).toFixed(2));
  const sp = seg(t, 52.8, 58.4, ease.out);
  const sphere = $("#chainSphere");
  sphere.setAttribute("opacity", (sp * (1 - cut * 0.65)).toFixed(3));

  ART.temple.rings.forEach((r, i) => {
    const rot = r.rot + t * (i < 3 ? 6 : -4) * (i % 2 ? -1 : 1);
    const s = r.small ? `rotate(${rot}) scale(1 ${(78 / 268).toFixed(3)})` : `rotate(${rot})`;
    r.g.setAttribute("transform", s);
    r.links.forEach((l, k) => {
      const pop = seg(t, 53 + k * 0.025 + i * 0.1, 53.6 + k * 0.025 + i * 0.1, ease.outBack);
      const prev = l.style.opacity;
      l.style.opacity = pop.toFixed(3);
      // pop via scale of the existing transform is not stored; use opacity only
      if (prev === "") l.style.opacity = "0";
    });
  });
  const lineP = seg(t, 54.6, 58.2);
  ART.temple.lines.forEach((l) => {
    const d = parseFloat(l.dataset.delay || 0);
    l.setAttribute("opacity", (clamp((lineP - d) / 0.4) * 0.55).toFixed(3));
  });

  // chain sphere drifts behind the bust for the portrait
  if (t > 57.4) {
    const k = seg(t, 57.4, 59.4);
    chain.setAttribute("transform", `translate(960 560) scale(${(1 + k * 1.05).toFixed(3)})`);
    chain.setAttribute("opacity", (k * 0.32).toFixed(3));
  } else {
    chain.setAttribute("transform", "translate(960 740) scale(1)");
  }

  // goggle glow
  const gg = $("#bustGoggleGlow");
  if (gg) gg.setAttribute("opacity", (0.18 + 0.22 * seg(t, 59, 61) + 0.06 * Math.sin(t * 2.2)).toFixed(3));
}

function updAlliance(t) {
  const A = ART.alliance;
  A.apes.forEach((a, i) => {
    const p = seg(t, 71.6 + a.delay, 78.6 + a.delay, ease.inOut);
    const x = lerp(a.x - 270, a.x - 10, p);
    const bob = Math.sin(t * 6.5 + i) * 3 * (p < 0.98 ? 1 : 0.2);
    a.g.setAttribute("transform", `translate(${x.toFixed(1)} ${(a.y + bob).toFixed(1)})`);
  });
  A.pepes.forEach((p, i) => {
    const pr = seg(t, 71.6 + p.delay, 78.6 + p.delay, ease.inOut);
    const x = lerp(p.x + 270, p.x + 10, pr);
    const bob = Math.sin(t * 6 + i) * 3 * (pr < 0.98 ? 1 : 0.2);
    p.g.setAttribute("transform", `translate(${x.toFixed(1)} ${(p.y + bob).toFixed(1)})`);
  });

  const linkP = seg(t, 78.8, 82.6, ease.out);
  A.links.forEach((k) => {
    const p = clamp((linkP - k.delay / 3.2) / 0.5);
    k.l.setAttribute("transform", `rotate(${(1 - p) * 40}) scale(${ease.outBack(p).toFixed(3)})`);
  });
  A.line.setAttribute("stroke-dashoffset", (A.len * (1 - linkP)).toFixed(1));
  A.bridgeGlow.setAttribute("opacity", (linkP * 0.45).toFixed(3));

  const sp = seg(t, 82.8, 85.2, ease.outBack);
  A.sigil.setAttribute("opacity", clamp(sp).toFixed(3));
  A.sigil.setAttribute("transform", `translate(960 760) scale(${(0.6 + 0.4 * sp).toFixed(3)}) rotate(${(t * 4) % 360})`);

  // staff raise
  const raise = seg(t, 82.6, 84.4, ease.outBack);
  A.apes.forEach((a) => a.staff.setAttribute("transform", `translate(86 -190) rotate(${7 + raise * 42})`));
}

function updGuardian(t) {
  const G = ART.guardian;
  const enter = seg(t, 90, 93.2, ease.out);
  G.bust.setAttribute("transform", `translate(1080 ${(540 + (1 - enter) * 60).toFixed(1)}) scale(${(0.93 + enter * 0.03 + seg(t, 90, 104) * 0.02).toFixed(3)})`);
  G.halo.setAttribute("transform", `translate(1080 440) rotate(${(t * 1.6) % 360}) scale(${(1 + 0.01 * Math.sin(t * 1.6)).toFixed(3)})`);
  G.ring2.g.setAttribute("transform", `translate(0 0) rotate(${(t * -2.4) % 360})`);

  G.units.forEach((u, i) => {
    const p = seg(t, 91 + i * 0.18, 94 + i * 0.18, ease.outBack);
    u.g.setAttribute("transform", `translate(${u.g.dataset.x || 0} ${(u.baseY + 60 - p * 60).toFixed(1)})`);
    u.g.setAttribute("opacity", p.toFixed(3));
    if (!u.g.dataset.x) {
      const tr = u.g.getAttribute("transform");
      const m = /translate\(([-\d.]+)/.exec(tr);
      // store x from initial transform on first build pass
    }
  });

  const staff = $("#guardStaff");
  staff.setAttribute("transform", `translate(1610 430) rotate(${(Math.sin(t * 0.8) * 1.2).toFixed(2)})`);
}

function updAscend(t) {
  const A = ART.ascend;
  const cam = $("#s-ascend .cam");
  cam.style.transform = `scale(${(1.02 + seg(t, 104, 126) * 0.07).toFixed(3)}) translateY(${(seg(t, 104, 126) * -26).toFixed(1)}px)`;

  A.islands.forEach((isl, i) => {
    const p = seg(t, 104.8 + isl.spec.delay, 116 + isl.spec.delay, ease.outQuint);
    const y = (1 - p) * (260 + i * 20);
    isl.g.setAttribute("transform", `translate(${isl.spec.cx} ${(isl.spec.cy + y).toFixed(1)}) scale(${isl.spec.sc})`);
    isl.g.setAttribute("opacity", (0.25 + 0.75 * p).toFixed(3));
    isl.towers.forEach((tw) => {
      tw.beacon.setAttribute("opacity", (0.35 + 0.65 * Math.max(0, Math.sin(t * 1.6 + tw.seed * 9))).toFixed(3));
    });
  });

  const cp = seg(t, 112, 121, ease.out);
  A.stars.forEach((s, i) => s.c.setAttribute("opacity", (clamp((cp - i * 0.02) * 2) * 0.8).toFixed(3)));
  A.lines.forEach((l, i) => l.setAttribute("opacity", (clamp((cp - 0.25 - i * 0.02) * 1.6) * 0.35).toFixed(3)));

  const ring = $("#endRing");
  ring.setAttribute("transform", `translate(960 500) rotate(${(t * 2) % 360})`);
}

/* ------------------------------------------------------------
   END CARD
   ------------------------------------------------------------ */
function updEnd(t) {
  const E = {
    eyebrow: document.querySelector("#endcard .e-eyebrow"),
    l1: document.querySelector("#endcard h1 .l1"),
    l2: document.querySelector("#endcard h1 .l2"),
    tag: document.querySelector("#endcard .e-tag"),
    rule: document.querySelector("#endcard .e-rule"),
    line: document.querySelector("#endcard .e-line"),
    final: document.querySelector("#endcard .e-final"),
    credit: document.querySelector("#endcard .e-credit"),
    replay: document.getElementById("replayBtn"),
  };
  const show = (node, at, dur = 0.9, dy = 24) => {
    const p = seg(t, at, at + dur, ease.out);
    node.style.opacity = p.toFixed(3);
    node.style.transform = `translateY(${((1 - p) * dy).toFixed(1)}px)`;
  };
  show(E.eyebrow, 128.0, 0.9, 14);
  show(E.l1, 129.0, 1.0, 34);
  show(E.l2, 129.7, 1.0, 34);
  show(E.tag, 131.2, 0.9, 12);
  const rp = seg(t, 132.2, 133.6, ease.out);
  E.rule.style.width = `${(rp * 620).toFixed(0)}px`;
  show(E.line, 133.0, 0.9, 12);
  const fp = seg(t, 134.6, 135.4);
  E.final.style.opacity = fp.toFixed(3);
  show(E.credit, 136.0, 0.9, 8);
  const q = seg(t, 137.0, 137.8);
  E.replay.style.opacity = q.toFixed(3);
  E.replay.style.transform = `translateY(${((1 - q) * 10).toFixed(1)}px)`;
  E.replay.classList.toggle("on", q > 0.8 && t > 136);
}

/* ------------------------------------------------------------
   CUES
   ------------------------------------------------------------ */
const CUES = [...document.querySelectorAll(".cue")].map((node) => {
  const lines = [...node.querySelectorAll(".ln > i")];
  const eyebrow = node.querySelector(".eyebrow");
  const sub = node.querySelector(".sub");
  return {
    node, lines, eyebrow, sub,
    in: parseFloat(node.dataset.in), out: parseFloat(node.dataset.out),
    center: node.classList.contains("center"),
  };
});

function updCues(t) {
  for (const c of CUES) {
    const live = t > c.in - 0.1 && t < c.out + 0.1;
    if (!live) { if (c.node.style.opacity !== "0") c.node.style.opacity = "0"; continue; }
    const inP = seg(t, c.in, c.in + 0.45);
    const outP = seg(t, c.out - 0.45, c.out);
    c.node.style.opacity = (inP * (1 - outP)).toFixed(3);

    c.lines.forEach((ln, i) => {
      const p = seg(t, c.in + i * 0.13, c.in + i * 0.13 + 0.85, ease.out);
      ln.style.transform = `translateY(${((1 - p) * 108).toFixed(2)}%)`;
      ln.style.opacity = p.toFixed(3);
    });
    if (c.eyebrow) {
      const p = seg(t, c.in, c.in + 0.7, ease.out);
      c.eyebrow.style.opacity = p.toFixed(3);
      c.eyebrow.style.transform = `translateY(${((1 - p) * 14).toFixed(1)}px)`;
    }
    if (c.sub) {
      const p = seg(t, c.in + 0.45, c.in + 1.15, ease.out);
      c.sub.style.opacity = (p * 0.95).toFixed(3);
      c.sub.style.transform = `translateY(${((1 - p) * 10).toFixed(1)}px)`;
    }
  }
}

/* ------------------------------------------------------------
   SCORE (WebAudio)
   ------------------------------------------------------------ */
const Score = {
  ctx: null, master: null, bed: null, padNodes: [], padGain: null,
  muted: false, lastScene: -1, started: false,

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;
    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : 0.85;
    master.connect(ctx.destination);
    this.master = master;

    // ---- drone bed
    const bedGain = ctx.createGain();
    bedGain.gain.value = 0;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 210; lp.Q.value = 4;
    bedGain.connect(lp); lp.connect(master);

    const o1 = ctx.createOscillator(); o1.type = "sawtooth"; o1.frequency.value = 55;
    const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = 27.5;
    const o3 = ctx.createOscillator(); o3.type = "sine"; o3.frequency.value = 55.4;
    const g1 = ctx.createGain(); g1.gain.value = 0.05;
    const g2 = ctx.createGain(); g2.gain.value = 0.16;
    const g3 = ctx.createGain(); g3.gain.value = 0.05;
    o1.connect(g1).connect(bedGain);
    o2.connect(g2).connect(bedGain);
    o3.connect(g3).connect(bedGain);
    o1.start(); o2.start(); o3.start();

    // slow filter motion
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.06;
    const lfoG = ctx.createGain(); lfoG.gain.value = 70;
    lfo.connect(lfoG).connect(lp.frequency); lfo.start();

    this.bed = bedGain;
    bedGain.gain.setTargetAtTime(0.55, ctx.currentTime, 3);

    // ---- noise buffer
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this.noise = buf;
    this.started = true;
  },

  chord(freqs) {
    if (!this.ctx) return;
    const ctx = this.ctx, now = ctx.currentTime;
    if (this.padGain) {
      const old = this.padGain;
      old.gain.cancelScheduledValues(now);
      old.gain.setTargetAtTime(0, now, 0.9);
      setTimeout(() => { this.padNodes.forEach(n => { try { n.stop(); } catch (e) {} }); }, 4200);
    }
    const g = ctx.createGain();
    g.gain.value = 0;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 900; lp.Q.value = 0.7;
    g.connect(lp); lp.connect(this.master);
    g.gain.setTargetAtTime(0.11, now, 1.4);
    const nodes = [];
    freqs.forEach((f, i) => {
      for (let k = 0; k < 2; k++) {
        const o = ctx.createOscillator();
        o.type = k ? "sine" : "triangle";
        o.frequency.value = f * (k ? 2 : 1);
        o.detune.value = (Math.random() - 0.5) * 9;
        const og = ctx.createGain();
        og.gain.value = (k ? 0.18 : 0.42) / freqs.length;
        o.connect(og).connect(g);
        o.start();
        nodes.push(o);
      }
    });
    this.padGain = g;
    this.padNodes = nodes;
  },

  setScene(i, t) {
    if (!this.ctx || i === this.lastScene) return;
    this.lastScene = i;
    const chords = [
      [55, 82.41, 110, 164.81],      // reach
      [49, 73.42, 98, 146.83],       // break
      [55, 77.78, 110, 155.56],      // silence
      [65.41, 98, 130.81, 196],      // temple
      [73.42, 110, 146.83, 220],     // alliance
      [55, 82.41, 130.81, 164.81],   // guardian
      [65.41, 98, 130.81, 196, 261.63], // ascension
      [55, 82.41, 110, 164.81, 220], // end
    ];
    this.chord(chords[clamp(i, 0, chords.length - 1)]);
  },

  boom(strength = 1, t0 = 0) {
    if (!this.ctx) return;
    const ctx = this.ctx, now = ctx.currentTime + t0;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(92, now);
    o.frequency.exponentialRampToValueAtTime(26, now + 1.5);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.5 * strength, now + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.9);
    o.connect(g).connect(this.master);
    o.start(now); o.stop(now + 2);
    // air
    const src = ctx.createBufferSource(); src.buffer = this.noise;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass";
    bp.frequency.setValueAtTime(1400, now); bp.frequency.exponentialRampToValueAtTime(240, now + 1.4);
    bp.Q.value = 0.9;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.0001, now);
    ng.gain.exponentialRampToValueAtTime(0.09 * strength, now + 0.06);
    ng.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
    src.connect(bp).connect(ng).connect(this.master);
    src.start(now); src.stop(now + 1.6);
  },

  chime(freq = 523.25, strength = 0.5) {
    if (!this.ctx) return;
    const ctx = this.ctx, now = ctx.currentTime;
    [1, 2, 3].forEach((h, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq * h;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime((strength * 0.09) / (i + 1), now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 2.4 - i * 0.4);
      o.connect(g).connect(this.master);
      o.start(now); o.stop(now + 2.6);
    });
  },

  rise(strength = 0.5) {
    if (!this.ctx) return;
    const ctx = this.ctx, now = ctx.currentTime;
    const src = ctx.createBufferSource(); src.buffer = this.noise;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(300, now);
    bp.frequency.exponentialRampToValueAtTime(5200, now + 2.4);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.06 * strength, now + 1.8);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 2.7);
    src.connect(bp).connect(g).connect(this.master);
    src.start(now); src.stop(now + 2.8);
  },

  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.85, this.ctx.currentTime, 0.15);
  },

  resume() { if (this.ctx && this.ctx.state === "suspended") this.ctx.resume(); },

  stopAll() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.master) this.master.gain.setTargetAtTime(0, now, 0.3);
  },
};

/* audio cues: [time, key, arg] */
const CUES_AUDIO = [
  [7.2, "rise", 0.55],
  [8.0, "boom", 0.55],
  [16.2, "chime", 196],
  [22.4, "boom", 0.35],
  [24.4, "rise", 0.9],
  [26.6, "boom", 1.15],
  [33.2, "boom", 0.5],
  [43.6, "chime", 523.25],
  [46.8, "rise", 0.7],
  [52.2, "chime", 659.25],
  [57.6, "boom", 0.75],
  [59.0, "chime", 783.99],
  [64.0, "chime", 1046.5],
  [70.6, "rise", 0.5],
  [78.8, "boom", 0.6],
  [82.8, "chime", 880],
  [84.4, "rise", 0.6],
  [89.8, "boom", 0.9],
  [96.4, "chime", 220],
  [103.9, "rise", 0.85],
  [112.0, "boom", 0.7],
  [116.0, "chime", 523.25],
  [125.6, "boom", 1.0],
  [131.8, "rise", 0.7],
  [134.6, "chime", 659.25],
];
let audioIdx = 0;

function tickAudio(t, prevT) {
  if (!Score.ctx) return;
  if (t < prevT || t - prevT > 1.2) {
    // seek / jump: resync without replaying old hits
    audioIdx = 0;
    while (audioIdx < CUES_AUDIO.length && CUES_AUDIO[audioIdx][0] < t) audioIdx++;
    Score.lastScene = -1;
  }
  while (audioIdx < CUES_AUDIO.length && CUES_AUDIO[audioIdx][0] <= t) {
    const [, key, arg] = CUES_AUDIO[audioIdx++];
    if (key === "boom") Score.boom(arg);
    else if (key === "chime") Score.chime(arg);
    else if (key === "rise") Score.rise(arg);
  }
  Score.setScene(sceneAt(t), t);
}

/* ------------------------------------------------------------
   STATE / PLAYBACK
   ------------------------------------------------------------ */
const state = { t: 0, playing: false, phase: "poster", prev: 0, seeking: false };

const stage = $("#stage");
const poster = $("#poster");
const flashEl = $("#flash");
const controls = $("#controls");

function fitStage() {
  const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  stage.style.transform = `translate(-50%, -50%) scale(${s})`;
}
fitStage();
window.addEventListener("resize", fitStage);

function setFlash(color, amount) {
  flashEl.className = "flash" + (color ? " " + color : "");
  flashEl.style.opacity = String(clamp(amount) * 0.9);
}

function updHud(t, idx) {
  const mm = String(Math.floor(t / 60)).padStart(2, "0");
  const ss = String(Math.floor(t % 60)).padStart(2, "0");
  const ff = String(Math.floor((t % 1) * 24)).padStart(2, "0");
  const tc = document.getElementById("tc");
  if (tc) tc.textContent = `${mm}:${ss}:${ff}`;
  const si = document.getElementById("sceneIdx");
  const sn = document.getElementById("sceneName");
  if (si) si.textContent = String(idx + 1).padStart(2, "0");
  if (sn) sn.textContent = SCENES[idx].name;

  const ct = document.getElementById("cTime");
  if (ct) ct.textContent = `${mm}:${ss}`;
  const cs = document.getElementById("cScene");
  if (cs) cs.textContent = SCENES[idx].name;
  const pf = document.getElementById("pfill");
  if (pf) pf.style.width = `${((t / DUR) * 100).toFixed(2)}%`;
  document.getElementById("hud").style.opacity = state.phase === "poster" ? "0" : (t > 136.5 ? "0" : "1");
}

function render(t) {
  t = clamp(t, 0, DUR);
  const idx = sceneAt(t);

  /* scenes */
  SCENES.forEach((s, i) => {
    const o = win(t, s.start, s.end, 0.9);
    s.node.style.opacity = o.toFixed(3);
    s.node.style.visibility = o <= 0.001 ? "hidden" : "visible";
    // end scene has its own DOM; no updater
  });

  updReach(t);
  updBreak(t);
  updSilence(t);
  updTemple(t);
  updAlliance(t);
  updGuardian(t);
  updAscend(t);
  updEnd(t);
  updCues(t);
  drawCanvas(t);

  /* flashes */
  let fl = 0, col = "";
  fl = Math.max(fl, seg(t, 26.55, 26.72, ease.out) * (1 - seg(t, 26.74, 27.7, ease.out)));
  if (fl > 0) col = "red";
  let fl2 = seg(t, 57.55, 57.78, ease.out) * (1 - seg(t, 57.78, 58.8));
  if (fl2 > fl) { fl = fl2; col = "cyan"; }
  let fl3 = seg(t, 125.4, 125.7, ease.out) * (1 - seg(t, 125.7, 127));
  if (fl3 > fl) { fl = fl3; col = ""; }
  setFlash(col, fl * 0.75);

  updHud(t, idx);
}

/* ------------------------------------------------------------
   PLAYBACK CONTROL
   ------------------------------------------------------------ */
let rafId = null, lastTs = 0;
let audioPrev = 0;

function start() {
  if (state.phase === "poster") {
    state.phase = "film";
    poster.classList.add("hidden");
    stage.classList.remove("poster-mode");
    setTimeout(() => { poster.style.display = "none"; }, 1200);
    Score.init();
    Score.resume();
    Score.lastScene = -1;
    audioIdx = 0;
    audioPrev = state.t;
    state.t = 0;
    state.prev = 0;
    controls.classList.add("show");
  }
  if (state.playing) return;
  state.playing = true;
  lastTs = 0;
  Score.resume();
  if (Score.ctx) Score.setMuted(Score.muted);
  if (Score.ctx && Score.ctx.state === "running") {
    // if we've been paused >2s, the pad may have kept playing; fine.
  }
  rafId = requestAnimationFrame(loop);
  setPlayIcon(true);
}

function pause() {
  state.playing = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
  setPlayIcon(false);
  if (Score.ctx && Score.master) Score.master.gain.setTargetAtTime(0, Score.ctx.currentTime, 0.12);
}

function toggle() {
  if (state.phase === "poster") { start(); return; }
  if (state.t >= DUR - 0.05) { seek(0); start(); return; }
  state.playing ? pause() : start();
}

function loop(ts) {
  if (!state.playing) return;
  if (!lastTs) lastTs = ts;
  let dt = (ts - lastTs) / 1000;
  lastTs = ts;
  if (dt > 0.25) dt = 0.25;
  state.t += dt;
  if (state.t >= DUR) {
    state.t = DUR;
    render(state.t);
    pause();
    state.playing = false;
    setPlayIcon(false);
    controls.classList.add("show");
    Score.stopAll();
    return;
  }
  tickAudio(state.t, audioPrev);
  audioPrev = state.t;
  render(state.t);
  rafId = requestAnimationFrame(loop);
}

function seek(t) {
  state.t = clamp(t, 0, DUR);
  audioPrev = state.t;
  audioIdx = 0;
  while (audioIdx < CUES_AUDIO.length && CUES_AUDIO[audioIdx][0] < state.t) audioIdx++;
  if (state.phase === "poster") {
    state.phase = "film";
    poster.classList.add("hidden");
  }
  render(state.t);
}

const icPlay = document.getElementById("icPlay");
function setPlayIcon(playing) {
  if (!icPlay) return;
  icPlay.innerHTML = playing
    ? '<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>'
    : '<path d="M8 5l11 7-11 7z"/>';
}

/* controls */
document.getElementById("playBtn")?.addEventListener("click", () => { state.t = 0; start(); });
document.getElementById("rotateSkip")?.addEventListener("click", () => {
  document.getElementById("rotate").classList.add("dismissed");
});
document.getElementById("btnPlay")?.addEventListener("click", toggle);
document.getElementById("replayBtn")?.addEventListener("click", () => { seek(0); start(); });
document.getElementById("btnBack")?.addEventListener("click", () => { seek(0); if (!state.playing) start(); });

document.getElementById("btnMute")?.addEventListener("click", () => {
  const m = !Score.muted;
  Score.setMuted(m);
  document.getElementById("icVol").innerHTML = m
    ? '<path d="M4 9v6h4l5 4V5L8 9H4zm15.5 3-2.2-2.2 1.4-1.4L21 10.6l2.2-2.2 1.4 1.4L22.4 12l2.2 2.2-1.4 1.4L21 13.4l-2.3 2.2-1.4-1.4z"/>'
    : '<path d="M4 9v6h4l5 4V5L8 9H4zm11.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/>';
});

document.getElementById("btnFull")?.addEventListener("click", () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
  else document.exitFullscreen?.();
});

document.getElementById("phit")?.addEventListener("click", (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  seek(((e.clientX - r.left) / r.width) * DUR);
});

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") { e.preventDefault(); toggle(); }
  else if (e.key === "m" || e.key === "M") document.getElementById("btnMute")?.click();
  else if (e.key === "r" || e.key === "R") { seek(0); start(); }
  else if (e.key === "f" || e.key === "F") document.getElementById("btnFull")?.click();
  else if (e.key === "ArrowRight") { seek(state.t + 5); if (state.phase === "film") { audioPrev = state.t; } }
  else if (e.key === "ArrowLeft") { seek(state.t - 5); if (state.phase === "film") { audioPrev = state.t; } }
});

/* control bar auto-hide */
let hideTimer = null;
function wake() {
  if (state.phase !== "film") return;
  controls.classList.add("show");
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    if (state.playing) controls.classList.remove("show");
  }, 2800);
}
window.addEventListener("mousemove", wake);
window.addEventListener("click", wake);
stage.classList.add("poster-mode");

/* ------------------------------------------------------------
   BOOT
   ------------------------------------------------------------ */
buildReach();
buildBreak();
buildSilence();
buildTemple();
buildAlliance();
buildGuardian();
buildAscend();
buildRings();

// extra glow layer behind bust goggles
(() => {
  const bust = document.getElementById("templeBust");
  const e = el("ellipse", { id: "bustGoggleGlow", cx: 0, cy: -112, rx: 190, ry: 62,
    fill: "#ff2f4d", opacity: 0.16, filter: "url(#blur22)" });
  bust.appendChild(e);
})();

// guardian units: remember base x
ART.guardian.units.forEach((u) => {
  const m = /translate\(([-\d.]+)\s+([-\d.]+)\)/.exec(u.g.getAttribute("transform"));
  if (m) { u.g.dataset.x = m[1]; u.baseY = parseFloat(m[2]); u.g.setAttribute("transform", `translate(${m[1]} ${m[2] + 60})`); u.g.style.opacity = "0"; }
});

/* QA / deep-link helpers */
const q = new URLSearchParams(location.search);
if (q.has("mute")) { Score.muted = true; }
if (q.has("t")) {
  document.body.classList.add("qa");
  poster.style.display = "none";
  stage.classList.remove("poster-mode");
  state.phase = "film";
  state.t = clamp(parseFloat(q.get("t")) || 0, 0, DUR);
  audioPrev = state.t;
  render(state.t);
  if (q.has("play")) { state.playing = true; state.phase = "film"; rafId = requestAnimationFrame(loop); }
} else {
  render(0);
  if (q.has("poster")) { /* keep poster */ }
}
if (q.has("poster")) {
  state.phase = "poster";
  poster.style.display = "";
  poster.classList.remove("hidden");
  document.body.classList.remove("qa");
  stage.classList.add("poster-mode");
}

// poster is animated with the t=0 frame already rendered
window.__film = { state, render, seek, start, pause, Score, DUR };
})();
