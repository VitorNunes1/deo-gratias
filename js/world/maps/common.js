/* DEO GRATIAS — primitivas de arquitetura e mobiliário sacro (pixel art procedural) */
(function (DG) {
  'use strict';
  const G = DG.gfx, P = DG.pal, U = DG.util;
  const H = U.hash2;
  const GOLD = [P.g1, P.g2, P.g4, P.g6, P.g5, P.g4, P.g3, P.g2, P.g1];

  const A = DG.art = {
    // ---------- pisos ----------
    marbleChecker(x, X, Y, W, H_, size, cA, cB, seed) {
      for (let j = 0; j < H_; j += size) for (let i = 0; i < W; i += size) {
        const dark = ((i / size + j / size) & 1) === 1;
        const pal = dark ? cB : cA;
        G.rect(x, X + i, Y + j, Math.min(size, W - i), Math.min(size, H_ - j), pal[1]);
        // veios
        const r = U.seeded((seed || 1) * 977 + i * 31 + j * 7);
        for (let k = 0; k < 3; k++) {
          let vx = X + i + r() * size, vy = Y + j + r() * size;
          const ang = r() * Math.PI;
          for (let s = 0; s < size * 0.8; s++) { vx += Math.cos(ang) + (r() - 0.5); vy += Math.sin(ang) * 0.6 + (r() - 0.5); if (vx >= X + i && vx < X + i + size && vy >= Y + j && vy < Y + j + size && r() < 0.7) G.px(x, vx, vy, pal[2]); }
        }
        G.noise(x, X + i, Y + j, Math.min(size, W - i), Math.min(size, H_ - j), [pal[0], pal[2]], (seed || 1) + i * 13 + j * 17, 0.05);
        G.hline(x, X + i, Y + j, Math.min(size, W - i), pal[0]);
        G.vline(x, X + i, Y + j, Math.min(size, H_ - j), pal[0]);
      }
    },
    // piso de lajes quadradas (nave): pedra clara com rejunte fino e losangos escuros nos cantos
    squareTiles(x, X, Y, W, H_, size, pal, seed) {
      pal = pal || ['#b8a68a', '#ab9a7e', '#c4b396', '#8d7c64'];
      G.rect(x, X, Y, W, H_, pal[3]);
      const r = U.seeded(seed || 17);
      for (let j = 0; j < H_; j += size) for (let i = 0; i < W; i += size) {
        const c = pal[Math.floor(r() * 3)];
        const w = Math.min(size - 1, W - i), h = Math.min(size - 1, H_ - j);
        G.rect(x, X + i, Y + j, w, h, c);
        G.hline(x, X + i, Y + j, w, G.mix(c, '#ffffff', 0.12));
        G.noise(x, X + i, Y + j + 1, w, h - 1, [G.mix(c, '#000000', 0.07), G.mix(c, '#ffffff', 0.06)], (seed || 17) + i * 3 + j * 7, 0.07);
        // losango escuro no canto (cabochão)
        const cx = X + i + size - 1, cy = Y + j + size - 1;
        if (cx < X + W - 1 && cy < Y + H_ - 1) { G.px(x, cx, cy - 1, pal[4] || '#4a3a2c'); G.px(x, cx - 1, cy, pal[4] || '#4a3a2c'); G.px(x, cx, cy, pal[4] || '#4a3a2c'); G.px(x, cx + 1, cy, pal[4] || '#4a3a2c'); G.px(x, cx, cy + 1, pal[4] || '#4a3a2c'); }
      }
    },
    flagstones(x, X, Y, W, H_, seed, pal) {
      pal = pal || [P.st3, P.st4, P.st5, P.st2];
      G.rect(x, X, Y, W, H_, pal[3]);
      const r = U.seeded(seed || 3);
      for (let j = 0; j < H_; j += 12) {
        let i = -Math.floor(r() * 14);
        while (i < W) {
          const w = 14 + Math.floor(r() * 12);
          const x0 = Math.max(0, i), x1 = Math.min(W, i + w - 1);
          if (x1 > x0) {
            const base = pal[Math.floor(r() * 3)];
            G.rect(x, X + x0, Y + j, x1 - x0, Math.min(11, H_ - j), base);
            G.hline(x, X + x0, Y + j, x1 - x0, G.mix(base, '#ffffff', 0.12));
            G.noise(x, X + x0, Y + j + 1, x1 - x0, Math.min(10, H_ - j - 1), [pal[0], pal[2], G.mix(base, '#000000', 0.15)], (seed || 3) + i + j * 31, 0.08);
          }
          i += w;
        }
      }
    },
    // assoalho de tábuas largas (6 px), emendas espaçadas, veios discretos
    woodFloor(x, X, Y, W, H_, seed, horiz) {
      const cols = ['#5e3a1f', '#664024', '#5a371d', '#6b4426'];
      const r = U.seeded(seed || 9);
      const PL = 6;
      if (horiz) {
        for (let j = 0; j < H_; j += PL) {
          let i = -Math.floor(r() * 60);
          const h = Math.min(PL - 1, H_ - j);
          while (i < W) {
            const len = 48 + Math.floor(r() * 40); const c = cols[Math.floor(r() * cols.length)];
            const a = Math.max(0, i), w = Math.min(len, W - a);
            G.rect(x, X + a, Y + j, w, h, c);
            G.hline(x, X + a, Y + j, w, G.mix(c, '#ffffff', 0.08));
            if (r() < 0.7) G.hline(x, X + a + 4, Y + j + 2 + Math.floor(r() * 2), Math.max(0, w - 10), G.mix(c, '#000000', 0.12));
            if (i > 0) G.vline(x, X + i, Y + j, h, '#2e1b0f');
            i += len;
          }
          G.hline(x, X, Y + j + PL - 1, W, '#2e1b0f');
        }
      } else {
        for (let i = 0; i < W; i += PL) {
          let j = -Math.floor(r() * 60);
          const w = Math.min(PL - 1, W - i);
          while (j < H_) {
            const len = 48 + Math.floor(r() * 40); const c = cols[Math.floor(r() * cols.length)];
            const a = Math.max(0, j), hh = Math.min(len, H_ - a);
            G.rect(x, X + i, Y + a, w, hh, c);
            G.vline(x, X + i, Y + a, hh, G.mix(c, '#ffffff', 0.08));
            if (r() < 0.7) G.vline(x, X + i + 2 + Math.floor(r() * 2), Y + a + 4, Math.max(0, hh - 10), G.mix(c, '#000000', 0.12));
            if (j > 0) G.hline(x, X + i, Y + j, w, '#2e1b0f');
            j += len;
          }
          G.vline(x, X + i + PL - 1, Y, H_, '#2e1b0f');
        }
      }
    },
    carpet(x, X, Y, W, H_, main, border, pattern) {
      main = main || ['#7a1a22', '#62131b', '#4a0e14'];
      border = border || [P.g4, P.g2];
      G.rect(x, X, Y, W, H_, main[1]);
      G.rect(x, X, Y, W, 2, border[1]); G.rect(x, X, Y + H_ - 2, W, 2, border[1]); G.rect(x, X, Y, 2, H_, border[1]); G.rect(x, X + W - 2, Y, 2, H_, border[1]);
      G.rect(x, X + 2, Y + 2, W - 4, 1, border[0]); G.rect(x, X + 2, Y + H_ - 3, W - 4, 1, border[0]); G.rect(x, X + 2, Y + 2, 1, H_ - 4, border[0]); G.rect(x, X + W - 3, Y + 2, 1, H_ - 4, border[0]);
      if (pattern !== false) {
        for (let j = 6; j < H_ - 6; j += 8) for (let i = 6; i < W - 6; i += 8) {
          const cx = X + i, cy = Y + j;
          G.px(x, cx, cy, main[0]); G.px(x, cx - 1, cy, main[2]); G.px(x, cx + 1, cy, main[2]); G.px(x, cx, cy - 1, main[2]); G.px(x, cx, cy + 1, main[2]);
        }
      }
    },
    // ---------- paredes ----------
    ashlarWall(x, X, Y, W, H_, seed, pal, rowH) {
      pal = pal || [P.st5, P.st4, P.st6, P.st3];
      rowH = rowH || 8;
      G.rect(x, X, Y, W, H_, pal[3]);
      const r = U.seeded(seed || 5);
      for (let j = 0; j < H_; j += rowH) {
        const off = ((j / rowH) & 1) ? 10 : 0;
        for (let i = -off; i < W; i += 20) {
          const x0 = Math.max(0, i), x1 = Math.min(W, i + 19);
          if (x1 <= x0) continue;
          const c = pal[Math.floor(r() * 3)];
          G.rect(x, X + x0, Y + j, x1 - x0, Math.min(rowH - 1, H_ - j), c);
          G.hline(x, X + x0, Y + j, x1 - x0, G.mix(c, '#ffffff', 0.15));
          G.noise(x, X + x0, Y + j + 1, x1 - x0, Math.min(rowH - 2, H_ - j - 1), [G.mix(c, '#000000', 0.12), G.mix(c, '#ffffff', 0.08)], (seed || 5) + i * 7 + j * 13, 0.12);
        }
      }
      // escurece para cima (abóbada na penumbra) — gradiente suave
      const gr = x.createLinearGradient(0, Y, 0, Y + Math.min(H_, 46));
      gr.addColorStop(0, 'rgba(14,9,7,0.82)'); gr.addColorStop(1, 'rgba(14,9,7,0)');
      x.fillStyle = gr; x.fillRect(X, Y, W, Math.min(H_, 46));
    },
    wainscot(x, X, Y, W, H_) { // lambri de madeira
      G.rect(x, X, Y, W, H_, P.w2);
      G.hline(x, X, Y, W, P.w5); G.hline(x, X, Y + 1, W, P.w4); G.hline(x, X, Y + H_ - 1, W, P.w1);
      for (let i = 4; i < W - 10; i += 22) { G.frame(x, X + i, Y + 4, 18, H_ - 8, P.w1); G.rect(x, X + i + 1, Y + 5, 16, H_ - 10, P.w3); G.hline(x, X + i + 1, Y + 5, 16, P.w4); }
    },
    // topo de parede vista de cima (espessura)
    wallTop(x, X, Y, W, H_) {
      G.rect(x, X, Y, W, H_, P.st1);
      G.dither(x, X, Y, W, H_, P.st2, 0.35);
      G.frame(x, X, Y, W, H_, P.st0);
    },
    // ---------- vitral ----------
    // design: 'maria' | 'cor' | 'joseph' | 'agnus' | 'petrus' | 'spiritus' | 'geo'
    lancet(x, X, Y, W, H_, design, seed) {
      const ah = Math.floor(W * 0.9);
      const mask = G.gothicMask(W, H_, ah);
      // moldura de pedra
      G.shape(x, X - 2, Y - 2, W + 4, H_ + 4, G.gothicMask(W + 4, H_ + 4, ah + 2), P.st6);
      G.shape(x, X - 1, Y - 1, W + 2, H_ + 2, G.gothicMask(W + 2, H_ + 2, ah + 1), P.st2);
      const r = U.seeded(seed || 11);
      const bgCols = [P.gl_b2, P.gl_b, P.gl_b2, '#1b3590'];
      // fundo em losangos
      G.shape(x, X, Y, W, H_, (i, j) => {
        if (!mask(i, j)) return false;
        const di = ((i + j) % 6 === 0) || ((i - j + 600) % 6 === 0);
        if (di) return P.gl_lead;
        const cell = Math.floor((i + j) / 6) * 7 + Math.floor((i - j + 600) / 6);
        return bgCols[Math.abs(cell) % bgCols.length];
      });
      // borda vermelha e dourada
      G.shape(x, X, Y, W, H_, (i, j) => (mask(i, j) && (!mask(i - 2, j) || !mask(i + 2, j) || !mask(i, j - 2))) ? (j % 5 === 0 ? P.gl_y : P.gl_r) : false);
      // figura central
      const cx = X + Math.floor(W / 2), top = Y + ah + 4, fh = H_ - ah - 12;
      A.glassFigure(x, cx, top, fh, design, W);
      // rosácea no arco
      const rx = cx, ry = Y + Math.floor(ah * 0.6);
      G.ellipse(x, rx, ry, 3, 3, P.gl_y); G.ellipse(x, rx, ry, 1.5, 1.5, P.gl_r); G.px(x, rx, ry, P.gl_w);
      // chumbos horizontais
      for (let j = ah + 2; j < H_; j += 14) G.shape(x, X, Y + j, W, 1, (i) => mask(i, j) ? P.gl_lead : false);
      // brilho
      G.dither(x, X + 1, Y + ah, 2, H_ - ah - 2, '#ffffff', 0.18);
      void r;
    },
    glassFigure(x, cx, top, fh, design, W) {
      const half = Math.max(3, Math.floor(W / 2) - 3);
      const robe = { maria: [P.gl_b, '#5d82e0', P.gl_w], cor: [P.gl_r, '#e34a5a', P.gl_w], joseph: ['#8a5a22', P.gl_y, P.gl_p], agnus: [P.gl_w, P.gl_y, P.gl_r], petrus: [P.gl_y, P.gl_g, P.gl_w], spiritus: [P.gl_r, P.gl_y, P.gl_w], geo: [P.gl_g, P.gl_y, P.gl_r] }[design] || [P.gl_g, P.gl_y, P.gl_r];
      if (design === 'agnus') {
        G.ellipse(x, cx, top + fh * 0.45, half, half * 0.7, P.gl_w); G.ellipse(x, cx + half - 1, top + fh * 0.32, 2, 2, P.gl_w);
        G.line(x, cx - 1, top + fh * 0.15, cx - 1, top + fh * 0.6, P.gl_y); G.rect(x, cx - 1, top + fh * 0.15, 4, 3, P.gl_r);
        G.ellipse(x, cx + half - 1, top + fh * 0.32 - 3, 3, 1, P.gl_y);
        return;
      }
      if (design === 'spiritus') {
        G.ellipse(x, cx, top + fh * 0.3, half + 1, half + 1, P.gl_y);
        G.ellipse(x, cx, top + fh * 0.3, 2, 1.5, P.gl_w); G.line(x, cx - half, top + fh * 0.3, cx + half, top + fh * 0.3 - 2, P.gl_w);
        for (let k = 0; k < 5; k++) G.px(x, cx - 4 + k * 2, top + fh * 0.6 + (k & 1), P.gl_r);
        return;
      }
      // auréola e cabeça
      G.ellipse(x, cx, top + 3, 3.5, 3.5, P.gl_y);
      G.ellipse(x, cx, top + 3, 2, 2, '#f2c9a0');
      // manto
      G.shape(x, cx - half, top + 6, half * 2 + 1, Math.floor(fh - 8), (i, j) => Math.abs(i - half) <= 2 + j * 0.25 ? (Math.abs(i - half) > 1 + j * 0.25 ? robe[0] : robe[1]) : false);
      if (design === 'cor') { G.rect(x, cx - 1, top + 9, 3, 3, P.gl_r); G.px(x, cx, top + 8, P.gl_y); }
      if (design === 'maria') { G.rect(x, cx - 1, top + 8, 3, Math.floor(fh * 0.5), P.gl_w); G.rect(x, cx - 2, top, 5, 1, P.gl_y); }
      if (design === 'joseph') { G.vline(x, cx + 3, top + 7, Math.floor(fh * 0.6), P.gl_g); G.px(x, cx + 3, top + 6, P.gl_w); G.px(x, cx + 4, top + 7, P.gl_w); }
      if (design === 'petrus') { G.rect(x, cx + 2, top + 10, 3, 1, P.gl_y); G.rect(x, cx + 4, top + 9, 1, 3, P.gl_y); }
    },
    rose(x, cx, cy, R) {
      G.ellipse(x, cx, cy, R + 2, R + 2, P.st6); G.ellipse(x, cx, cy, R + 1, R + 1, P.st2);
      G.shape(x, cx - R, cy - R, R * 2 + 1, R * 2 + 1, (i, j) => {
        const dx = i - R, dy = j - R, d = Math.hypot(dx, dy);
        if (d > R) return false;
        const a = (Math.atan2(dy, dx) + Math.PI) / (Math.PI * 2);
        const pet = Math.floor(a * 12);
        if (d < R * 0.25) return d < R * 0.12 ? P.gl_w : P.gl_y;
        if (Math.abs((a * 12) % 1 - 0.5) > 0.44) return P.gl_lead;
        if (Math.abs(d - R * 0.62) < 0.6) return P.gl_lead;
        return d < R * 0.62 ? (pet % 2 ? P.gl_r : P.gl_b) : (pet % 2 ? P.gl_b2 : P.gl_g);
      });
    },
    // ---------- coluna (como objeto ordenado) ----------
    columnProp(scene, cx, baseY, height, opts) {
      opts = opts || {};
      const w = opts.w || 14;
      const key = 'col:' + w + ':' + height + ':' + (opts.marble ? 'm' : 's');
      const img = G.cached(key, w + 8, height + 12, (x) => {
        const ramp = opts.marble ? ['#3a4a43', '#55665d', '#728a7e', '#98b0a3', '#7c9387', '#5f7468', '#46564e'] : [P.st3, P.st5, P.st7, P.st8, P.st7, P.st5, P.st3];
        // fuste com sombreamento cilíndrico
        for (let i = 0; i < w; i++) { const k = Math.floor(i / w * ramp.length); G.vline(x, 4 + i, 8, height - 10, ramp[k]); }
        if (!opts.marble) for (let i = 2; i < w; i += 3) G.vline(x, 4 + i, 10, height - 14, G.mix(ramp[Math.floor(i / w * ramp.length)], '#000000', 0.15));
        else G.noise(x, 4, 8, w, height - 10, ['#8fa79a', '#2e3a34'], 77, 0.05);
        // capitel coríntio dourado simplificado
        G.rect(x, 1, 0, w + 6, 4, P.st7); G.rect(x, 0, 0, w + 8, 2, P.st8);
        G.rect(x, 3, 4, w + 2, 4, P.g3); for (let i = 3; i < w + 5; i += 2) G.px(x, i, 5 + (i % 4 === 1 ? 0 : 1), P.g5);
        // base
        G.rect(x, 2, height - 2, w + 4, 3, P.st6); G.rect(x, 0, height + 1, w + 8, 4, P.st7); G.hline(x, 0, height + 1, w + 8, P.st8); G.hline(x, 0, height + 4, w + 8, P.st3);
      });
      scene.block(cx - w / 2 - 2, baseY - 4, w + 4, 6);
      return scene.addProp({ id: opts.id, x: cx, y: baseY, sortY: baseY, draw(x, sx, sy) { x.drawImage(img, Math.round(sx - w / 2 - 4), Math.round(sy - height - 7)); } });
    },
    // ---------- imagens de santos ----------
    statue(x, cx, baseY, kind, scale) {
      const s = scale || 1;
      const h = Math.round(30 * s);
      // pedestal
      G.bevel(x, cx - 7, baseY - 8, 15, 8, P.st6, P.st8, P.st4); G.rect(x, cx - 8, baseY - 9, 17, 2, P.st7);
      G.rect(x, cx - 5, baseY - 6, 11, 4, P.g3); G.hline(x, cx - 5, baseY - 6, 11, P.g5);
      const top = baseY - 9 - h;
      const C = {
        maria: { robe: '#2e4d9c', robe2: '#1d3270', inner: '#f3eee2', skin: '#f0d4b8', hair: '#5a3a20', crown: true },
        joseph: { robe: '#7a4a24', robe2: '#5a3416', inner: '#5f3a72', skin: '#e2bd96', hair: '#4a3020', lily: true },
        cor: { robe: '#a3212b', robe2: '#73141b', inner: '#f3eee2', skin: '#efd0ae', hair: '#4a2c18', heart: true },
        angel: { robe: '#efe9dc', robe2: '#cfc6b3', inner: '#d6ae4a', skin: '#f2d6bb', hair: '#c79a4a', wings: true },
        petrus: { robe: '#c99a3a', robe2: '#8a6a24', inner: '#2e4d9c', skin: '#e2bd96', hair: '#c9c4ba', keys: true },
        paulus: { robe: '#a3212b', robe2: '#73141b', inner: '#2e5a3a', skin: '#e2bd96', hair: '#3a2a1a', sword: true },
        antonius: { robe: '#5a3c26', robe2: '#3e2818', inner: '#5a3c26', skin: '#e9c7a2', hair: '#3a2a1a', lily: true },
        pius: { robe: '#f4f0e6', robe2: '#d2cabb', inner: '#f4f0e6', skin: '#ecc9a6', hair: '#f4f0e6', pius: true },
      }[kind] || {};
      if (C.wings) { G.shape(x, cx - 9, top + 6, 6, 14, (i, j) => j > (5 - i) * 1.2, '#f7f2e6'); G.shape(x, cx + 4, top + 6, 6, 14, (i, j) => j > i * 1.2, '#e6dfcf'); }
      // corpo
      G.shape(x, cx - 6, top + 7, 13, h - 7, (i, j) => Math.abs(i - 6) <= 3 + j * 0.12 ? (Math.abs(i - 6) > 2 + j * 0.1 ? C.robe2 : C.robe) : false);
      G.rect(x, cx - 1, top + 8, 3, h - 12, C.inner);
      if (kind === 'maria') { G.shape(x, cx - 6, top + 2, 13, 8, (i, j) => Math.abs(i - 6) <= 2 + j * 0.6, C.robe); }
      // cabeça
      G.ellipse(x, cx, top + 4, 2.5, 3, C.skin); G.rect(x, cx - 2, top + 1, 5, 2, C.hair || '#5a3a20');
      if (kind === 'maria') G.rect(x, cx - 3, top + 1, 7, 2, C.robe);
      // auréola
      G.shape(x, cx - 5, top - 3, 11, 11, (i, j) => { const d = Math.hypot(i - 5, j - 5); return d <= 5.3 && d >= 4.2; }, P.g5);
      if (C.crown) { G.rect(x, cx - 2, top - 1, 5, 2, P.g5); G.px(x, cx - 2, top - 2, P.g6); G.px(x, cx, top - 2, P.g6); G.px(x, cx + 2, top - 2, P.g6); }
      // mãos
      G.rect(x, cx - 1, top + 11, 3, 2, C.skin);
      if (C.heart) { G.rect(x, cx - 1, top + 9, 3, 2, '#e8303a'); G.px(x, cx, top + 8, P.g6); }
      if (C.lily) { G.vline(x, cx + 3, top + 6, 12, '#3d7a3a'); G.px(x, cx + 3, top + 5, '#ffffff'); G.px(x, cx + 4, top + 6, '#ffffff'); G.px(x, cx + 2, top + 6, '#ffffff'); }
      if (C.keys) { G.rect(x, cx + 2, top + 10, 4, 1, P.g5); G.px(x, cx + 5, top + 11, P.g5); }
      if (C.pius) { // murça vermelha sobre os ombros e cruz peitoral
        G.shape(x, cx - 5, top + 7, 11, 5, (i, j) => Math.abs(i - 5) <= 3 + j * 0.6, '#b0202a');
        G.hline(x, cx - 4, top + 11, 9, '#7a141c');
        G.vline(x, cx, top + 9, 4, P.g5); G.hline(x, cx - 1, top + 10, 3, P.g5);
      }
      if (C.sword) { G.vline(x, cx - 4, top + 6, 14, '#c9ccd4'); G.rect(x, cx - 5, top + 9, 3, 1, P.g5); }
      // base sob os pés: nuvem/lua para Nossa Senhora
      if (kind === 'maria') { G.ellipse(x, cx, baseY - 10, 5, 1.5, '#e9e4d6'); G.px(x, cx - 4, baseY - 11, '#cfc8b6'); }
    },
    // ---------- retrato emoldurado (16x20 por dentro) ----------
    portrait(x, X, Y, kind) {
      G.bevel(x, X - 2, Y - 2, 20, 24, P.g3, P.g5, P.g1); G.frame(x, X - 1, Y - 1, 18, 22, P.g2);
      G.vgrad(x, X, Y, 16, 20, ['#1e1712', '#33261c', '#1a130e']);
      const cx = X + 8;
      if (kind === 'pius') {
        G.shape(x, cx - 6, Y + 1, 13, 13, (i, j) => { const d = Math.hypot(i - 6, j - 6); return d <= 6.2 && d >= 5.2; }, P.g4); // auréola
        G.shape(x, cx - 7, Y + 12, 15, 8, (i, j) => Math.abs(i - 7) <= 3 + j * 0.9, '#b0202a'); // murça
        G.rect(x, cx - 1, Y + 13, 3, 7, '#f1ece0'); // batina
        G.ellipse(x, cx, Y + 7, 3, 3.6, '#ecc9a6');
        G.rect(x, cx - 3, Y + 4, 2, 4, '#e9e5dc'); G.rect(x, cx + 2, Y + 4, 2, 4, '#e9e5dc'); // cabelos brancos
        G.rect(x, cx - 2, Y + 3, 5, 2, '#fbf8f0'); // solidéu branco
        G.px(x, cx - 1, Y + 7, '#3a2a20'); G.px(x, cx + 1, Y + 7, '#3a2a20'); G.px(x, cx, Y + 9, '#c89a7e');
        G.vline(x, cx, Y + 14, 4, P.g5); G.hline(x, cx - 1, Y + 15, 3, P.g5);
        G.px(x, cx - 2, Y + 12, P.g4); G.px(x, cx + 2, Y + 12, P.g4);
      } else if (kind === 'lefebvre') {
        G.shape(x, cx - 7, Y + 12, 15, 8, (i, j) => Math.abs(i - 7) <= 3 + j * 0.9, '#6a2a62'); // murça violácea
        G.rect(x, cx - 7, Y + 18, 15, 2, '#f1ece0'); for (let i = 0; i < 15; i += 2) G.px(x, cx - 7 + i, Y + 18, '#d8d0c0'); // roquete
        G.rect(x, cx - 1, Y + 13, 3, 5, '#4a1a44');
        G.ellipse(x, cx, Y + 7, 3, 3.6, '#e8c4a0');
        G.px(x, cx - 3, Y + 6, '#c9c4ba'); G.px(x, cx + 3, Y + 6, '#c9c4ba'); G.px(x, cx - 3, Y + 7, '#c9c4ba'); G.px(x, cx + 3, Y + 7, '#c9c4ba');
        G.rect(x, cx - 1, Y + 3, 3, 1, '#7a2a6e'); // solidéu violáceo
        G.px(x, cx - 1, Y + 7, '#3a2a20'); G.px(x, cx + 1, Y + 7, '#3a2a20'); G.hline(x, cx - 1, Y + 9, 3, '#c08a70');
        G.vline(x, cx, Y + 14, 4, P.g5); G.hline(x, cx - 1, Y + 15, 3, P.g5); // cruz peitoral
        G.line(x, cx - 3, Y + 12, cx, Y + 14, P.g3); G.line(x, cx + 3, Y + 12, cx, Y + 14, P.g3);
      }
    },
    // ---------- estandarte com o emblema da Fraternidade ----------
    banner(x, cx, top, w, h) {
      const X = Math.round(cx - w / 2);
      G.rect(x, X - 3, top, w + 6, 2, P.g3); G.hline(x, X - 3, top, w + 6, P.g5); // travessa
      G.rect(x, X - 5, top - 1, 3, 4, P.g4); G.rect(x, X + w + 2, top - 1, 3, 4, P.g4); G.px(x, X - 4, top - 2, P.g6); G.px(x, X + w + 3, top - 2, P.g6);
      G.vline(x, cx, top - 6, 6, P.g3); G.rect(x, cx - 1, top - 8, 3, 3, P.g5);
      const tip = Math.round(w * 0.45);
      const cloth = (i, j) => j < h - tip ? true : Math.abs(i - (w - 1) / 2) <= (w / 2) * (1 - (j - (h - tip)) / tip);
      G.shape(x, X, top + 2, w, h, cloth, '#5b1220');
      G.dither(x, X, top + 2, w, h, '#6e1a2a', (i, j) => cloth(i, j) ? ((i + j) % 6 === 0 ? 1 : 0.12) : 0);
      // galão dourado
      G.shape(x, X, top + 2, w, h, (i, j) => cloth(i, j) && (!cloth(i - 1, j) || !cloth(i + 1, j) || !cloth(i, j + 1) || i === 1 || i === w - 2), P.g4);
      G.shape(x, X + 3, top + 5, w - 6, h - 6, (i, j) => { const ii = i + 3, jj = j + 3; return cloth(ii, jj) && cloth(ii, jj + 3) && (!cloth(ii - 1, jj + 3) || !cloth(ii + 1, jj + 3) || jj === 3 || i === 0 || i === w - 7) && (i === 0 || i === w - 7 || j === 0 || !cloth(ii, jj + 4)); }, P.g2);
      const eh = Math.min(Math.round(h * 0.5), Math.round((w - 8) / 0.75));
      DG.emblem.draw(x, cx, top + 8, eh, 'gold');
      // cordões com borlas
      for (const s of [-1, 1]) { const bx = cx + s * (w / 2 + 1); G.vline(x, bx, top + 2, Math.round(h * 0.55), P.g3); G.rect(x, bx - 1, top + 2 + Math.round(h * 0.55), 3, 4, P.g4); G.px(x, bx, top + 6 + Math.round(h * 0.55), P.g2); }
    },
    // ---------- quadro de avisos da capela ----------
    noticeBoard(x, cx, baseY) {
      const X = cx - 12, Y = baseY - 34;
      G.rect(x, X + 2, baseY - 8, 2, 8, P.w2); G.rect(x, X + 20, baseY - 8, 2, 8, P.w2);
      G.rect(x, X, Y, 24, 26, P.w2); G.frame(x, X, Y, 24, 26, P.w5); G.rect(x, X + 2, Y + 2, 20, 22, '#efe3c8');
      DG.emblem.draw(x, cx, Y + 3, 12, 'red');
      for (let k = 0; k < 4; k++) G.hline(x, X + 4, Y + 16 + k * 2, k === 3 ? 10 : 16, '#7a6a58');
      G.rect(x, X - 1, Y - 2, 26, 2, P.w4); G.hline(x, X - 1, Y - 2, 26, P.w6);
    },
    // ---------- castiçal de pé / tocheiro ----------
    floorCandle(x, cx, baseY, lit, t) {
      DG.spr.lathe(x, cx, baseY - 22, 22, j => (j < 2 ? 2.5 : j < 16 ? 1 + (j % 5 === 0 ? 1 : 0) : 1.5 + (j - 16) * 0.7), GOLD);
      G.rect(x, cx - 1, baseY - 30, 3, 8, P.l4); G.vline(x, cx - 1, baseY - 30, 8, P.l2);
      if (lit) { const f = Math.sin((t || 0) * 12 + cx) > 0; G.px(x, cx, baseY - 32, P.flame1); G.px(x, cx, baseY - 31, P.flame0); if (f) G.px(x, cx, baseY - 33, P.flame2); }
    },
    // ---------- porta ----------
    door(x, X, Y, W, H_, open) {
      G.rect(x, X - 2, Y - 2, W + 4, H_ + 2, P.st6); G.rect(x, X - 1, Y - 1, W + 2, H_ + 1, P.st3);
      if (open) { G.rect(x, X, Y, W, H_, '#0d0907'); G.rect(x, X, Y, 3, H_, P.w3); return; }
      G.rect(x, X, Y, W, H_, P.w3);
      for (let i = 2; i < W - 1; i += 4) G.vline(x, X + i, Y + 1, H_ - 2, P.w2);
      G.hline(x, X, Y + 4, W, P.w5); G.hline(x, X, Y + H_ - 5, W, P.w5);
      G.rect(x, X + W - 4, Y + Math.floor(H_ / 2), 2, 2, P.g4);
    },
    // ---------- banco (vista de trás: encosto) ----------
    pewBack(x, X, Y, W) {
      G.rect(x, X, Y - 9, W, 9, P.w3);
      G.hline(x, X, Y - 9, W, P.w6); G.hline(x, X, Y - 8, W, P.w5); G.hline(x, X, Y - 1, W, P.w1);
      G.rect(x, X, Y - 10, 3, 10, P.w4); G.rect(x, X + W - 3, Y - 10, 3, 10, P.w4); // braços laterais
      G.px(x, X + 1, Y - 11, P.w5); G.px(x, X + W - 2, Y - 11, P.w5);
      for (let i = 8; i < W - 6; i += 16) G.frame(x, X + i, Y - 7, 10, 5, P.w2);
    },
    pewSeat(x, X, Y, W) { // assento + genuflexório visto de cima
      G.rect(x, X, Y - 5, W, 5, P.w4); G.hline(x, X, Y - 5, W, P.w6); G.hline(x, X, Y - 1, W, P.w2);
      G.rect(x, X + 2, Y - 16, W - 4, 3, P.w2); G.hline(x, X + 2, Y - 16, W - 4, P.w4); // genuflexório
    },
    // ---------- quadro / via-sacra ----------
    station(x, X, Y, n) {
      G.bevel(x, X, Y, 10, 12, P.g3, P.g5, P.g1); G.rect(x, X + 1, Y + 1, 8, 10, '#3a2a20');
      G.rect(x, X + 4, Y + 3, 2, 6, P.w5); G.rect(x, X + 2, Y + 4, 6, 1, P.w5);
      G.rect(x, X + 3, Y - 3, 4, 3, P.g4); G.px(x, X + 4, Y - 4, P.g5);
      void n;
    },
    painting(x, X, Y, W, H_, kind) {
      G.bevel(x, X - 2, Y - 2, W + 4, H_ + 4, P.g3, P.g5, P.g1);
      G.vgrad(x, X, Y, W, H_, ['#3a2a1e', '#5a3a28', '#2a1c14']);
      if (kind === 'ceia') { G.rect(x, X + 2, Y + H_ - 6, W - 4, 3, P.l3); for (let i = 3; i < W - 3; i += 3) { G.rect(x, X + i, Y + H_ - 10, 2, 4, i % 2 ? '#8a3a2a' : '#3a5a8a'); G.px(x, X + i, Y + H_ - 11, '#e9c7a2'); } G.ellipse(x, X + W / 2, Y + H_ - 11, 2, 2, P.g5); }
      else { G.ellipse(x, X + W / 2, Y + H_ / 2 - 2, 3, 3, P.g5); G.rect(x, X + W / 2 - 2, Y + H_ / 2, 5, H_ / 2 - 2, '#2e4d9c'); }
    },
    // chama de vela pequena animada (para objetos)
    flame(x, X, Y, t, seed) {
      const f = Math.sin(t * 12 + seed) + Math.sin(t * 7.7 + seed * 2);
      G.px(x, X, Y, P.flame0); G.px(x, X, Y - 1, P.flame1); if (f > -0.4) G.px(x, X + (f > 1 ? 1 : 0), Y - 2, P.flame2);
    },
  };
})(window.DG = window.DG || {});
