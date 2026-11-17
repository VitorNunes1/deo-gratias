/* DEO GRATIAS — Fachada da igreja ao amanhecer (tela inicial) */
(function (DG) {
  'use strict';
  const G = DG.gfx, P = DG.pal, U = DG.util;

  let staticLayer = null;
  function buildStatic() {
    const cv = G.canvas(DG.W, DG.H), x = cv.x;
    // céu de aurora
    G.vgrad(x, 0, 0, DG.W, 200, ['#0b1030', '#1a2350', '#3b3462', '#7a4a6a', '#c46a5a', '#e9a66a', '#f6d79a']);
    // estrelas que se apagam
    const r = U.seeded(42);
    for (let i = 0; i < 70; i++) { const sx = r() * DG.W, sy = r() * 80; G.px(x, sx, sy, sy < 40 ? '#e8ecff' : '#9aa0c8'); }
    // montes e casario distantes
    G.shape(x, 0, 150, DG.W, 60, (i, j) => j > 30 + Math.sin(i * 0.02) * 10 + Math.sin(i * 0.07) * 4, '#3a2a3a');
    for (let i = 0; i < DG.W; i += 14) { const h = 8 + Math.floor(U.hash2(i, 1) * 14); if (i > 120 && i < 360) continue; G.rect(x, i, 196 - h, 12, h + 10, '#2a1e2c'); G.rect(x, i + 2, 196 - h + 3, 2, 2, U.hash2(i, 5) > 0.6 ? '#f1c070' : '#3a2a3a'); }
    // praça (adro) em pedra
    G.vgrad(x, 0, 206, DG.W, 64, ['#6a5a52', '#544640', '#3a302c']);
    for (let j = 210; j < 270; j += 6) G.hline(x, 0, j, DG.W, '#4a3e38');
    for (let j = 210, k = 0; j < 270; j += 6, k++) for (let i = (k % 2) * 8; i < DG.W; i += 16) G.vline(x, i, j, 6, '#4a3e38');
    // igreja
    const cx = 240;
    const stone = ['#d8c7a6', '#c4b08c', '#a99372', '#8a7558'];
    // nave (frontão central)
    G.rect(x, cx - 70, 92, 140, 116, stone[1]);
    G.shape(x, cx - 74, 50, 149, 46, (i, j) => j >= Math.abs(i - 74) * 0.58, stone[0]);
    G.shape(x, cx - 70, 54, 141, 42, (i, j) => j >= Math.abs(i - 70) * 0.58 + 2, stone[1]);
    G.rect(x, cx - 3, 30, 6, 26, stone[0]); G.rect(x, cx - 9, 36, 18, 5, stone[0]); // cruz no frontão
    G.rect(x, cx - 2, 31, 4, 24, '#efe3c8'); G.rect(x, cx - 8, 37, 16, 3, '#efe3c8');
    // torres
    for (const tx of [cx - 108, cx + 72]) {
      G.rect(x, tx, 60, 36, 148, stone[2]); G.vline(x, tx, 60, 148, stone[3]); G.vline(x, tx + 35, 60, 148, stone[3]);
      G.rect(x, tx - 3, 56, 42, 6, stone[0]); G.rect(x, tx - 3, 122, 42, 4, stone[0]);
      // campanário
      G.shape(x, tx + 6, 70, 24, 40, G.roundArchMask(24, 40), '#1a1216');
      // flecha / coruchéu
      G.shape(x, tx - 2, 16, 40, 42, (i, j) => j >= Math.abs(i - 19.5) * 2.1 - 2, '#5a3a2a');
      G.shape(x, tx + 1, 20, 34, 38, (i, j) => j >= Math.abs(i - 16.5) * 2.2, '#6e4a36');
      G.rect(x, tx + 17, 0, 2, 18, P.g4); G.rect(x, tx + 14, 5, 8, 2, P.g4);
      // janelinhas
      G.shape(x, tx + 12, 140, 12, 24, G.roundArchMask(12, 24), '#2a1e24');
      G.shape(x, tx + 13, 141, 10, 22, G.roundArchMask(10, 22), '#f0b860');
    }
    // relógio na torre esquerda
    G.ellipse(x, cx - 90, 134, 7, 7, '#efe3c8'); G.ellipse(x, cx - 90, 134, 5.5, 5.5, '#2a2a30'); G.line(x, cx - 90, 134, cx - 90, 130, '#efe3c8'); G.line(x, cx - 90, 134, cx - 87, 135, '#efe3c8');
    // rosácea
    DG.art.rose(x, cx, 98, 18);
    // portal gótico com arquivoltas
    for (let k = 0; k < 4; k++) G.shape(x, cx - 26 + k * 3, 140 + k * 3, 53 - k * 6, 68 - k * 3, G.gothicMask(53 - k * 6, 68 - k * 3, 26 - k * 3), k % 2 ? stone[0] : stone[2]);
    G.shape(x, cx - 14, 152, 29, 56, G.gothicMask(29, 56, 15), '#3a2214');
    G.rect(x, cx - 14, 168, 29, 40, '#5a3a24'); G.vline(x, cx, 168, 40, '#2a1a10');
    for (let j = 172; j < 206; j += 8) G.hline(x, cx - 13, j, 27, '#4a2e1c');
    G.rect(x, cx - 4, 186, 2, 2, P.g4); G.rect(x, cx + 2, 186, 2, 2, P.g4);
    // tímpano com Agnus Dei
    G.ellipse(x, cx, 160, 5, 3, '#efe3c8'); G.ellipse(x, cx + 4, 157, 1.5, 1.5, '#efe3c8');
    // janelas laterais da fachada
    for (const wx of [cx - 56, cx + 40]) { G.shape(x, wx, 140, 16, 34, G.gothicMask(16, 34, 9), '#2a1e24'); G.shape(x, wx + 2, 142, 12, 30, G.gothicMask(12, 30, 7), '#e6a860'); G.vline(x, wx + 8, 142, 30, '#2a1e24'); }
    // escadaria
    for (let k = 0; k < 4; k++) { G.rect(x, cx - 60 - k * 8, 208 + k * 4, 120 + k * 16, 4, k % 2 ? '#9a8a74' : '#b4a48a'); G.hline(x, cx - 60 - k * 8, 208 + k * 4, 120 + k * 16, '#d0c0a4'); }
    // fiadas de cantaria (linhas discretas nas paredes de pedra)
    for (let j = 100; j < 206; j += 9) { G.hline(x, cx - 70, j, 140, 'rgba(0,0,0,0)'); }
    x.save(); x.globalAlpha = 0.18;
    for (let j = 100; j < 206; j += 9) { G.hline(x, cx - 68, j, 136, '#8a7558'); }
    for (const tx of [cx - 108, cx + 72]) for (let j = 64; j < 206; j += 9) G.hline(x, tx + 1, j, 34, '#6e5a42');
    x.restore();
    // árvores (ciprestes) e lampiões
    for (const tx of [40, 90, 390, 440]) { G.shape(x, tx - 7, 120, 15, 92, (i, j) => Math.abs(i - 7) <= 1 + j * 0.08, '#1d2a22'); G.dither(x, tx - 7, 120, 15, 92, '#2e4234', 0.2); }
    for (const lx of [150, 330]) { G.vline(x, lx, 180, 34, '#1a1414'); G.rect(x, lx - 3, 174, 7, 7, '#2a2020'); G.rect(x, lx - 2, 175, 5, 5, '#ffd27a'); }
    staticLayer = cv.c;
    return staticLayer;
  }

  const birds = [];
  DG.exterior = {
    t: 0, bellPhase: 0, nextBell: 1.5,
    render(x, t, dt) {
      if (!staticLayer) buildStatic();
      x.drawImage(staticLayer, 0, 0);
      // nuvens à deriva
      x.save(); x.globalAlpha = 0.45;
      for (let k = 0; k < 4; k++) { const cx = ((t * (3 + k) + k * 140) % (DG.W + 120)) - 60, cy = 30 + k * 18; G.ellipse(x, cx, cy, 26 + k * 4, 4, k % 2 ? '#e7a888' : '#c98a8a'); G.ellipse(x, cx + 18, cy - 2, 16, 3, '#f0c0a0'); }
      x.restore();
      // sino a balançar na torre direita
      const tx = 240 + 72 + 18, ty = 96;
      const sw = Math.sin(this.bellPhase) * 0.6;
      const bx = tx + Math.sin(sw) * 6;
      G.line(x, tx, ty - 22, bx, ty - 6, '#2a1a10');
      DG.spr.lathe(x, Math.round(bx), ty - 8, 12, j => (j < 3 ? 2 + j : j < 9 ? 4.5 + (j - 3) * 0.35 : 7), [P.g1, P.g2, P.g4, P.g5, P.g3, P.g2, P.g1]);
      G.px(x, Math.round(bx), ty + 5, P.g1);
      // pássaros
      if (Math.random() < dt * 0.25 && birds.length < 6) birds.push({ x: -10, y: 40 + Math.random() * 60, v: 18 + Math.random() * 14, ph: Math.random() * 6 });
      for (let i = birds.length - 1; i >= 0; i--) {
        const b = birds[i]; b.x += b.v * dt; b.ph += dt * 9;
        const up = Math.sin(b.ph) > 0;
        G.px(x, b.x, b.y, '#1a1418'); G.px(x, b.x - 1, b.y + (up ? -1 : 0), '#1a1418'); G.px(x, b.x + 1, b.y + (up ? -1 : 0), '#1a1418');
        if (b.x > DG.W + 10) birds.splice(i, 1);
      }
      // brilho quente da rosácea e das janelas
      x.save(); x.globalCompositeOperation = 'lighter';
      const g = x.createRadialGradient(240, 98, 0, 240, 98, 40); g.addColorStop(0, 'rgba(255,190,120,0.25)'); g.addColorStop(1, 'rgba(255,190,120,0)');
      x.fillStyle = g; x.fillRect(190, 50, 100, 100);
      const sun = x.createRadialGradient(240, 210, 0, 240, 210, 260); sun.addColorStop(0, 'rgba(255,200,140,0.18)'); sun.addColorStop(1, 'rgba(255,200,140,0)');
      x.fillStyle = sun; x.fillRect(0, 0, DG.W, DG.H);
      x.restore();
    },
    update(dt) {
      this.t += dt;
      this.bellPhase += dt * 1.8;
      this.nextBell -= dt;
      if (this.nextBell <= 0) { this.nextBell = 4.2; if (DG.sfx) DG.sfx.towerBell({ vol: 0.6 }); }
    },
  };
})(window.DG = window.DG || {});
