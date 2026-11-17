/* DEO GRATIAS — emblema da Fraternidade Sacerdotal São Pio X em pixel art
   Dois corações entrelaçados (Sagrados Corações de Jesus e de Maria),
   encimados por uma coroa com a cruz. Desenhado por geometria, em qualquer altura. */
(function (DG) {
  'use strict';
  const RW = 960, RH = 1285; // proporção de referência

  // coração: dois lóbulos circulares e a ponta inferior
  function inHeart(px, py, cx, top, bottom, hw) {
    const r = 0.538 * hw, d = 0.462 * hw, cy = top + r;
    if (py < top || py > bottom) return false;
    if (py <= cy) return Math.hypot(px - (cx - d), py - cy) <= r || Math.hypot(px - (cx + d), py - cy) <= r;
    const t = (py - cy) / (bottom - cy);
    return Math.abs(px - cx) <= hw * (1 - t * t);
  }
  const T = 75; // espessura do traço
  function ring(px, py, cx) {
    return inHeart(px, py, cx, 447, 1285, 390) && !inHeart(px, py, cx, 447 + T, 1285 - T * 1.45, 390 - T);
  }
  function bar(px, py, ax, ay, bx, by, half) {
    const vx = bx - ax, vy = by - ay, L2 = vx * vx + vy * vy;
    const t = ((px - ax) * vx + (py - ay) * vy) / L2;
    if (t < 0 || t > 1) return false;
    const qx = ax + vx * t, qy = ay + vy * t;
    return Math.hypot(px - qx, py - qy) <= half;
  }
  function crown(px, py) {
    if (px >= 450 && px <= 510 && py >= 0 && py <= 250) return true;            // haste da cruz
    if (px >= 386 && px <= 574 && py >= 63 && py <= 122) return true;           // braço da cruz
    const dx = px - 480;
    if (px >= 225 && px <= 735 && py >= 242 + 0.00045 * dx * dx && py <= 305 + 0.00061 * dx * dx) return true; // aro
    const mx = px < 480 ? px : RW - px;                                         // simetria
    if (bar(mx, py, 168, 232, 250, 442, 36)) return true;                       // pontas externas
    if (bar(mx, py, 318, 182, 334, 262, 35)) return true;                       // pontas internas
    return false;
  }

  // máscara em pixels: 0 vazio, 1 coração esq., 2 coração dir., 3 coroa/cruz
  const maskCache = {};
  function mask(h) {
    if (maskCache[h]) return maskCache[h];
    const w = Math.max(3, Math.round(h * RW / RH));
    const sx = RW / w, sy = RH / h, N = 4;
    const L = new Float32Array(w * h), R = new Float32Array(w * h), C = new Float32Array(w * h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      let l = 0, r = 0, c = 0;
      for (let b = 0; b < N; b++) for (let a = 0; a < N; a++) {
        const px = (i + (a + 0.5) / N) * sx, py = (j + (b + 0.5) / N) * sy;
        if (crown(px, py)) c++;
        if (ring(px, py, 390)) l++;
        if (ring(px, py, 570)) r++;
      }
      const k = j * w + i; L[k] = l / (N * N); R[k] = r / (N * N); C[k] = c / (N * N);
    }
    const thr = h < 20 ? 0.3 : 0.45;
    const out = new Uint8Array(w * h);
    const yMid = Math.round(h * 0.70);
    const both = new Uint8Array(w * h);
    for (let k = 0; k < w * h; k++) {
      const l = L[k] >= thr, r = R[k] >= thr, c = C[k] >= (h < 20 ? 0.25 : 0.4);
      if (c) { out[k] = 3; continue; }
      if (l && r) { const j = Math.floor(k / w); out[k] = j < yMid ? 2 : 1; both[k] = 1; }
      else if (l) out[k] = 1; else if (r) out[k] = 2;
    }
    // entrelaçamento: abre uma fresta no coração de baixo, junto ao de cima
    if (h >= 26) {
      const gap = new Uint8Array(w * h);
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const k = j * w + i, v = out[k];
        if (v !== 1 && v !== 2) continue;
        if (both[k]) continue;
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= w || jj >= h) continue;
          const kk = jj * w + ii;
          if (both[kk] && out[kk] !== v) { gap[k] = 1; break; }
        }
      }
      for (let k = 0; k < w * h; k++) if (gap[k]) out[k] = 0;
    }
    return (maskCache[h] = { w, h, d: out });
  }

  const STYLES = {
    gold: { hi: '#fff0b0', mid: '#e2b850', lo: '#9a6a1c', outline: '#3a2408' },
    goldFlat: { hi: '#f1d887', mid: '#d6ab4a', lo: '#a07428', outline: null },
    red: { hi: '#d8383e', mid: '#a3161c', lo: '#6a0c12', outline: null },
    redOut: { hi: '#d8383e', mid: '#a3161c', lo: '#6a0c12', outline: '#2a0508' },
    ivory: { hi: '#ffffff', mid: '#efe3c8', lo: '#b9a988', outline: '#2a1a10' },
    ink: { hi: '#3a2a1c', mid: '#1e140d', lo: '#100a06', outline: null },
  };
  const canvasCache = {};
  function canvas(h, style) {
    const key = h + ':' + style;
    if (canvasCache[key]) return canvasCache[key];
    const S = STYLES[style] || STYLES.gold;
    const m = mask(h), pad = S.outline ? 1 : 0;
    const c = document.createElement('canvas'); c.width = m.w + pad * 2; c.height = m.h + pad * 2;
    const x = c.getContext('2d');
    const at = (i, j) => (i < 0 || j < 0 || i >= m.w || j >= m.h) ? 0 : m.d[j * m.w + i];
    if (S.outline) {
      x.fillStyle = S.outline;
      for (let j = -1; j <= m.h; j++) for (let i = -1; i <= m.w; i++) {
        if (at(i, j)) continue;
        let n = false;
        for (let dj = -1; dj <= 1 && !n; dj++) for (let di = -1; di <= 1; di++) if (at(i + di, j + dj)) { n = true; break; }
        if (n) x.fillRect(i + pad, j + pad, 1, 1);
      }
    }
    for (let j = 0; j < m.h; j++) for (let i = 0; i < m.w; i++) {
      const v = at(i, j); if (!v) continue;
      const up = at(i, j - 1) === v, dn = at(i, j + 1) === v, lf = at(i - 1, j) === v;
      x.fillStyle = !up || !lf ? S.hi : !dn ? S.lo : S.mid;
      if (m.h < 16) x.fillStyle = !up ? S.hi : S.mid;
      x.fillRect(i + pad, j + pad, 1, 1);
    }
    return (canvasCache[key] = c);
  }

  DG.emblem = {
    mask, canvas, STYLES,
    width: h => Math.max(3, Math.round(h * RW / RH)),
    // desenha centrado em cx, com o topo em y
    draw(x, cx, y, h, style) {
      const c = canvas(h, style || 'gold');
      x.drawImage(c, Math.round(cx - c.width / 2), Math.round(y) - (STYLES[style || 'gold'].outline ? 1 : 0));
    },
    // escudo (cartela) com o emblema, para quadros e brasões
    shield(x, cx, y, h, field, border, style) {
      const w = Math.round(h * 0.82);
      const X = Math.round(cx - w / 2), Y = Math.round(y);
      const fieldMask = (i, j) => { const t = j / h; if (t < 0.62) return true; const k = (t - 0.62) / 0.38; return Math.abs(i - (w - 1) / 2) <= (w / 2) * Math.sqrt(Math.max(0, 1 - k * k)); };
      DG.gfx.shape(x, X - 1, Y - 1, w + 2, h + 2, (i, j) => fieldMask(i - 1, j - 1) || fieldMask(i, j - 1) || fieldMask(i - 2, j - 1) || fieldMask(i - 1, j) || fieldMask(i - 1, j - 2), border);
      DG.gfx.shape(x, X, Y, w, h, fieldMask, field);
      const eh = Math.round(h * 0.8);
      DG.emblem.draw(x, cx, Y + Math.round(h * 0.08), eh, style || 'red');
    },
    // ícone da enciclopédia (32x32)
    icon(x) {
      DG.emblem.shield(x, 16, 1, 30, '#efe3c8', '#9a6a1c', 'red');
    },
  };
})(window.DG = window.DG || {});
