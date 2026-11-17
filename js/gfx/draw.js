/* DEO GRATIAS — primitivas de pixel art (sem antisserrilhado) */
(function (DG) {
  'use strict';
  const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);

  const G = DG.gfx = {
    BAYER4,
    canvas(w, h) {
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
      const x = c.getContext('2d');
      x.imageSmoothingEnabled = false;
      return { c, x };
    },
    cache: new Map(),
    cached(key, w, h, fn) {
      let e = G.cache.get(key);
      if (!e) { const cv = G.canvas(w, h); fn(cv.x, w, h); e = cv.c; G.cache.set(key, e); }
      return e;
    },
    clearCache(prefix) { for (const k of [...G.cache.keys()]) if (!prefix || k.startsWith(prefix)) G.cache.delete(k); },

    rect(x, X, Y, W, H, col) { if (W <= 0 || H <= 0) return; x.fillStyle = col; x.fillRect(Math.round(X), Math.round(Y), Math.round(W), Math.round(H)); },
    px(x, X, Y, col) { x.fillStyle = col; x.fillRect(Math.round(X), Math.round(Y), 1, 1); },
    hline(x, X, Y, W, col) { G.rect(x, X, Y, W, 1, col); },
    vline(x, X, Y, H, col) { G.rect(x, X, Y, 1, H, col); },
    frame(x, X, Y, W, H, col) { G.rect(x, X, Y, W, 1, col); G.rect(x, X, Y + H - 1, W, 1, col); G.rect(x, X, Y, 1, H, col); G.rect(x, X + W - 1, Y, 1, H, col); },
    // retângulo com luz no topo/esquerda e sombra embaixo/direita
    bevel(x, X, Y, W, H, mid, hi, lo) {
      G.rect(x, X, Y, W, H, mid);
      G.rect(x, X, Y, W, 1, hi); G.rect(x, X, Y, 1, H, hi);
      G.rect(x, X, Y + H - 1, W, 1, lo); G.rect(x, X + W - 1, Y, 1, H, lo);
    },
    line(x, x0, y0, x1, y1, col) {
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let err = dx + dy; x.fillStyle = col;
      for (let i = 0; i < 2000; i++) {
        x.fillRect(x0, y0, 1, 1);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
      }
    },
    // preenchimento por predicado: fn(dx, dy) -> cor | true | false (coordenadas locais)
    shape(x, X, Y, W, H, fn, col) {
      X = Math.round(X); Y = Math.round(Y);
      for (let j = 0; j < H; j++) {
        let run = -1, runCol = null;
        for (let i = 0; i <= W; i++) {
          let v = i < W ? fn(i, j) : false;
          if (v === true) v = col;
          if (v !== runCol) {
            if (runCol) { x.fillStyle = runCol; x.fillRect(X + run, Y + j, i - run, 1); }
            run = i; runCol = v || null;
          }
        }
      }
    },
    ellipse(x, cx, cy, rx, ry, col) {
      const W = Math.ceil(rx * 2) + 1, H = Math.ceil(ry * 2) + 1;
      G.shape(x, cx - rx, cy - ry, W, H, (i, j) => { const dx = (i - rx) / (rx + 0.5), dy = (j - ry) / (ry + 0.5); return dx * dx + dy * dy <= 1; }, col);
    },
    // arco ogival (gótico): largura W, altura total H, altura do arco ah
    gothicMask(W, H, ah) {
      return (i, j) => {
        if (j >= ah) return true;
        // dois arcos de círculo com raio = W, centros nas bordas opostas
        const r = W * 0.85;
        const cxL = W - r, cxR = r - 1;
        const cy = ah;
        const y = cy - j;
        const inL = (i - cxL) * (i - cxL) + y * y <= r * r;
        const inR = (i - cxR) * (i - cxR) + y * y <= r * r;
        return inL && inR;
      };
    },
    roundArchMask(W, H) {
      const r = W / 2;
      return (i, j) => { if (j >= r) return true; const dx = i - (W - 1) / 2, dy = r - j - 0.5; return dx * dx + dy * dy <= r * r; };
    },
    dither(x, X, Y, W, H, colB, t) {
      // t: número (0..1) ou função (i,j)->0..1 — pinta colB onde o limiar Bayer < t
      x.fillStyle = colB;
      for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
        const th = typeof t === 'function' ? t(i, j) : t;
        if (th <= 0) continue;
        if (BAYER4[((Y + j) & 3) * 4 + ((X + i) & 3)] < th) x.fillRect(X + i, Y + j, 1, 1);
      }
    },
    // gradiente vertical em faixas com transição pontilhada
    vgrad(x, X, Y, W, H, cols) {
      const n = cols.length - 1;
      for (let j = 0; j < H; j++) {
        const t = (j / Math.max(1, H - 1)) * n;
        const k = Math.min(n - 1, Math.floor(t));
        const f = t - k;
        for (let i = 0; i < W; i++) {
          const b = BAYER4[((Y + j) & 3) * 4 + ((X + i) & 3)];
          x.fillStyle = f > b ? cols[k + 1] : cols[k];
          x.fillRect(X + i, Y + j, 1, 1);
        }
      }
    },
    hgrad(x, X, Y, W, H, cols) {
      const n = cols.length - 1;
      for (let i = 0; i < W; i++) {
        const t = (i / Math.max(1, W - 1)) * n;
        const k = Math.min(n - 1, Math.floor(t));
        const f = t - k;
        for (let j = 0; j < H; j++) {
          const b = BAYER4[((Y + j) & 3) * 4 + ((X + i) & 3)];
          x.fillStyle = f > b ? cols[k + 1] : cols[k];
          x.fillRect(X + i, Y + j, 1, 1);
        }
      }
    },
    noise(x, X, Y, W, H, cols, seed, prob) {
      const r = DG.util.seeded(seed || 7);
      for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
        if (r() < prob) { x.fillStyle = cols[Math.floor(r() * cols.length)]; x.fillRect(X + i, Y + j, 1, 1); }
      }
    },
    // sprite em ASCII: cada caractere -> cor da paleta (espaço ou '.' = transparente)
    ascii(x, rows, pal, X, Y, flip) {
      for (let j = 0; j < rows.length; j++) {
        const row = rows[j];
        for (let i = 0; i < row.length; i++) {
          const ch = row[flip ? row.length - 1 - i : i];
          if (ch === ' ' || ch === '.') continue;
          const c = pal[ch];
          if (!c) continue;
          x.fillStyle = c; x.fillRect(X + i, Y + j, 1, 1);
        }
      }
    },
    asciiCanvas(key, rows, pal) {
      const w = Math.max(...rows.map(r => r.length)), h = rows.length;
      return G.cached('ascii:' + key, w, h, (x) => G.ascii(x, rows, pal, 0, 0));
    },
    // sombra elíptica no chão
    shadow(x, cx, cy, rx, ry, alpha) {
      x.save(); x.globalAlpha = alpha == null ? 0.35 : alpha;
      G.ellipse(x, cx, cy, rx, ry, '#000');
      x.restore();
    },
    // mistura de cores hex
    mix(a, b, t) {
      const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
      const r = Math.round(((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t);
      const g = Math.round(((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t);
      const bl = Math.round((pa & 255) * (1 - t) + (pb & 255) * t);
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
    },
    rgba(hex, a) { const p = parseInt(hex.slice(1), 16); return 'rgba(' + ((p >> 16) & 255) + ',' + ((p >> 8) & 255) + ',' + (p & 255) + ',' + a + ')'; },
  };
})(window.DG = window.DG || {});
