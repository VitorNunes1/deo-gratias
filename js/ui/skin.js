/* DEO GRATIAS — pele tradicional da interface
   Gera em pixel art as molduras douradas, as texturas de pergaminho e de madeira,
   o cursor e os marcadores, e os entrega ao CSS como variáveis. */
(function (DG) {
  'use strict';
  const C = {
    o: '#1a0d05', gd: '#7d5a1c', g: '#c9a043', gh: '#f1d887', gs: '#9a7228', in: '#4a2e10',
    red: '#a3161c', redh: '#d8383e', ink: '#2a1708',
  };

  function cv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; }
  function px(x, i, j, col) { x.fillStyle = col; x.fillRect(i, j, 1, 1); }
  function scaleUp(src, k) { const [c, x] = cv(src.width * k, src.height * k); x.drawImage(src, 0, 0, src.width * k, src.height * k); return c; }
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function ascii(rows, pal) {
    const [c, x] = cv(rows[0].length, rows.length);
    rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const col = pal[r[i]]; if (col) px(x, i, j, col); } });
    return c;
  }

  // ---------- moldura (border-image) ----------
  // n = espessura (fatia); camadas de fora para dentro; cantos com uma pedra engastada
  function frame(n, dark) {
    const S = n * 3;
    const [c, x] = cv(S, S);
    const outer = dark ? '#0a0604' : C.ink;
    const inner = dark ? '#120a06' : C.in;
    const layers = n >= 7
      ? [[outer, outer], [C.gh, C.gs], [C.g, C.g], [C.gs, C.gh], [inner, inner]]
      : [[outer, outer], [C.gh, C.gs], [C.gs, C.gh], [inner, inner]];
    layers.forEach(([lt, rb], t) => {
      x.fillStyle = lt; x.fillRect(t, t, S - 2 * t, 1); x.fillRect(t, t, 1, S - 2 * t);
      x.fillStyle = rb; x.fillRect(t, S - 1 - t, S - 2 * t, 1); x.fillRect(S - 1 - t, t, 1, S - 2 * t);
    });
    // cantos: pedra quadrada dourada com cruz vermelha
    const b = n >= 7 ? 7 : 5;
    for (const [cx0, cy0] of [[0, 0], [S - b, 0], [0, S - b], [S - b, S - b]]) {
      x.fillStyle = outer; x.fillRect(cx0, cy0, b, b);
      x.fillStyle = C.g; x.fillRect(cx0 + 1, cy0 + 1, b - 2, b - 2);
      x.fillStyle = C.gh; x.fillRect(cx0 + 1, cy0 + 1, b - 2, 1); x.fillRect(cx0 + 1, cy0 + 1, 1, b - 2);
      x.fillStyle = C.gs; x.fillRect(cx0 + 1, cy0 + b - 2, b - 2, 1); x.fillRect(cx0 + b - 2, cy0 + 1, 1, b - 2);
      const m = Math.floor(b / 2);
      if (b >= 7) { x.fillStyle = C.red; x.fillRect(cx0 + m - 1, cy0 + m, 3, 1); x.fillRect(cx0 + m, cy0 + m - 1, 1, 3); px(x, cx0 + m, cy0 + m, C.redh); }
      else px(x, cx0 + m, cy0 + m, C.red);
    }
    return c;
  }

  // ---------- texturas ----------
  function parchment() {
    const N = 64, [c, x] = cv(N, N), r = rng(7);
    // grão discreto do papel: variação pequena por pixel, fibras raras
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const d = Math.floor(r() * 7) - 3;
      px(x, i, j, 'rgb(' + (236 + d) + ',' + (225 + d) + ',' + (197 + d) + ')');
    }
    for (let k = 0; k < 18; k++) { const i = Math.floor(r() * N), j = Math.floor(r() * N), L = 2 + Math.floor(r() * 5); x.fillStyle = 'rgba(150,118,70,0.10)'; x.fillRect(i, j, L, 1); }
    return c;
  }
  function wood() {
    const N = 32, [c, x] = cv(N, N), r = rng(11);
    for (let j = 0; j < N; j++) {
      const band = Math.sin(j * 0.9) * 0.5 + 0.5;
      for (let i = 0; i < N; i++) {
        const v = band * 0.6 + r() * 0.4;
        px(x, i, j, v > 0.72 ? '#2a1b12' : v > 0.4 ? '#22160f' : '#1d120c');
      }
    }
    for (let k = 0; k < 14; k++) { x.fillStyle = 'rgba(70,44,24,0.35)'; x.fillRect(Math.floor(r() * N), Math.floor(r() * N), 3 + Math.floor(r() * 8), 1); }
    return c;
  }
  function dither() { const [c, x] = cv(2, 2); px(x, 0, 0, 'rgba(0,0,0,0.55)'); px(x, 1, 1, 'rgba(0,0,0,0.55)'); return c; }

  // ---------- cursores e marcadores ----------
  const PAL = { o: C.o, g: '#d6ab4a', h: '#f6e2a0', r: C.red, R: C.redh, d: '#5a3a14' };
  const ARROW = [
    'o...........', 'oo..........', 'oho.........', 'ohgo........', 'ohggo.......', 'ohgggo......', 'ohggggo.....', 'ohgggggo....',
    'ohggggggo...', 'ohgggggggo..', 'ohggggoooo..', 'ohgoggo.....', 'ogo.oggo....', 'oo..oggo....', 'o....oggo...', '.....oggo...', '......oo....'];
  const HAND = [
    '.....oo.........', '....ohho........', '....ohgo........', '....ohgo........', '....ohgoooo.....', '....ohgohgooo...',
    '.oo.ohgohgohgo..', 'ohhoohggggghgo..', 'ohggohgggggggo..', '.ohgggggggggo...', '..ohggggggggo...', '..ohgggggggo....',
    '...ohggggggo....', '...oggggggo.....', '....oooooo......'];
  const POINTER = ['o.....', 'oo....', 'ogo...', 'ohgo..', 'ohggo.', 'ohgo..', 'ogo...', 'oo....', 'o.....'];
  const POINTER_RED = ['o.....', 'oo....', 'oRo...', 'oRro..', 'oRrro.', 'oRro..', 'oRo...', 'oo....', 'o.....'];
  const SEL = ['ooooooo', '.ogggo.', '..ogo..', '...o...'];
  const SEL_DARK = ['ddddddd', '.ddddd.', '..ddd..', '...d...'];
  const CHECK = ['..rr..', '..rr..', 'rrrrrr', 'rrrrrr', '..rr..', '..rr..'];

  const url = (c) => 'url(' + c.toDataURL('image/png') + ')';
  let lastK = 0;
  DG.skin = {
    apply() {
      const k = Math.max(1, Math.round(DG.ui.scale || 2));
      if (k === lastK) return;
      lastK = k;
      const R = document.documentElement.style;
      R.setProperty('--frame-parch', url(scaleUp(frame(8, false), k)));
      R.setProperty('--frame-dark', url(scaleUp(frame(8, true), k)));
      R.setProperty('--frame-parch-s', url(scaleUp(frame(5, false), k)));
      R.setProperty('--frame-dark-s', url(scaleUp(frame(5, true), k)));
      R.setProperty('--fs', String(8 * k)); R.setProperty('--fs-s', String(5 * k));
      R.setProperty('--tex-parch', url(scaleUp(parchment(), k)));
      R.setProperty('--tex-dark', url(scaleUp(wood(), k)));
      R.setProperty('--dither', url(scaleUp(dither(), k)));
      R.setProperty('--ptr', url(scaleUp(ascii(POINTER, PAL), k)));
      R.setProperty('--ptr-red', url(scaleUp(ascii(POINTER_RED, PAL), k)));
      R.setProperty('--sel-arrow', url(scaleUp(ascii(SEL_DARK, PAL), k)));
      R.setProperty('--sel-arrow-gold', url(scaleUp(ascii(SEL, PAL), k)));
      R.setProperty('--chk', url(scaleUp(ascii(CHECK, PAL), k)));
      // cursores: tamanho fixo (2x) para não passar do limite dos navegadores
      R.setProperty('--cur', url(scaleUp(ascii(ARROW, PAL), 2)) + ' 1 1, auto');
      R.setProperty('--cur-hand', url(scaleUp(ascii(HAND, PAL), 2)) + ' 10 2, pointer');
    },
    // emblema da Fraternidade como elemento de interface
    emblem(h, style) {
      const src = DG.emblem.canvas(h, style || 'gold');
      const [c, x] = cv(src.width, src.height); x.drawImage(src, 0, 0);
      c.className = 'emblem';
      c.style.width = 'calc(var(--u) * ' + src.width + ')'; c.style.height = 'calc(var(--u) * ' + src.height + ')';
      return c;
    },
  };
})(window.DG = window.DG || {});
