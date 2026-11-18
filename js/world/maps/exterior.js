/* DEO GRATIAS — tela inicial: fachada da Capela São Pio X (Priorado Padre Anchieta, São Paulo)
   Desenhada a partir de fotografias da capela: fachada creme de frontão com cunhais ocre,
   torre central com janela ogival e rosácea, dois janelões góticos com vitrais, alpendre
   de madeira escura com a placa "CAPELA SÃO PIO X" e o emblema da Fraternidade, gradil de
   ferro em losangos, calçada e árvores da rua. */
(function (DG) {
  'use strict';
  const G = DG.gfx, U = DG.util;

  const CX = 318, GY = 236;                   // eixo da capela e linha do chão
  const FX0 = CX - 88, FX1 = CX + 88, EY = 138; // corpo da fachada e beiral
  const TX0 = CX - 17, TX1 = CX + 17, TY = 58;  // torre
  const C = {
    cream: '#ebe0c6', cream2: '#ddd0b0', cream3: '#c9b994',
    ochre: '#c9973e', ochre2: '#a8782a', ochre3: '#e0b25a',
    wood: '#3a2418', wood2: '#5a3a26', wood3: '#24160e', iron: '#1c1a1a', iron2: '#3a3634',
    glass: ['#2f56b0', '#c23a3a', '#e8c040', '#3a8a4a', '#7a3a9a', '#6a8ee0'],
  };

  // fonte de 3×5 pixels para a placa
  const FONT = {
    C: ['.11', '1..', '1..', '1..', '.11'], A: ['.1.', '1.1', '111', '1.1', '1.1'], P: ['11.', '1.1', '11.', '1..', '1..'],
    E: ['111', '1..', '11.', '1..', '111'], L: ['1..', '1..', '1..', '1..', '111'], S: ['.11', '1..', '.1.', '..1', '11.'],
    O: ['.1.', '1.1', '1.1', '1.1', '.1.'], I: ['111', '.1.', '.1.', '.1.', '111'], X: ['1.1', '1.1', '.1.', '1.1', '1.1'],
  };
  const textW = (str) => [...str].reduce((w, ch) => w + (ch === ' ' ? 3 : 4), 0) - 1;
  function text(x, str, X, Y, col) {
    let px0 = X;
    for (const ch of str) {
      if (ch === ' ') { px0 += 3; continue; }
      const g = FONT[ch === 'Ã' ? 'A' : ch]; if (!g) { px0 += 4; continue; }
      g.forEach((row, j) => { for (let i = 0; i < 3; i++) if (row[i] === '1') G.px(x, px0 + i, Y + j, col); });
      if (ch === 'Ã') { G.px(x, px0, Y - 2, col); G.px(x, px0 + 1, Y - 3, col); G.px(x, px0 + 2, Y - 2, col); }
      px0 += 4;
    }
  }

  // janelão ogival com moldura ocre e dois lumes de vitral
  function gothicWindow(x, cx, top, w, h, seed) {
    const X = cx - Math.floor(w / 2);
    G.shape(x, X - 2, top - 2, w + 4, h + 4, G.gothicMask(w + 4, h + 4, Math.ceil((w + 4) / 2)), C.ochre);
    G.shape(x, X - 1, top - 1, w + 2, h + 2, G.gothicMask(w + 2, h + 2, Math.ceil((w + 2) / 2)), C.ochre2);
    const mask = G.gothicMask(w, h, Math.ceil(w / 2));
    G.shape(x, X, top, w, h, (i, j) => {
      if (!mask(i, j)) return false;
      if (Math.abs(i - (w - 1) / 2) < 1 && j > h * 0.3) return '#4a4450';          // mainel
      if (j % 9 === 0 || (i % 7 === 0 && j > h * 0.3)) return '#4a4450';           // chumbo
      const fig = Math.abs(i - (i < w / 2 ? w * 0.25 : w * 0.75)) < w * 0.12 && j > h * 0.4;
      if (fig) return j < h * 0.5 ? '#f0c8a0' : C.glass[(seed + (i < w / 2 ? 0 : 3)) % 6];
      return C.glass[(Math.floor(i / 4) + Math.floor(j / 6) + seed) % 6];
    });
    G.ellipse(x, cx, top + Math.floor(h * 0.2), 2.5, 2.5, '#e8c040'); G.px(x, cx, top + Math.floor(h * 0.2), '#c23a3a');
  }

  let staticLayer = null;
  function buildStatic() {
    const cv = G.canvas(DG.W, DG.H), x = cv.x;
    // céu claro de manhã
    G.vgrad(x, 0, 0, DG.W, GY, ['#3f6fc4', '#5a88d4', '#7aa4e0', '#9cc0ea', '#bcd6f0']);
    // prédios ao longe (São Paulo), bem esmaecidos
    for (const [bx, bw, bh] of [[150, 26, 150], [178, 18, 120], [60, 30, 130], [96, 22, 100], [430, 30, 160], [462, 24, 110]]) {
      G.rect(x, bx, GY - bh, bw, bh, '#a9bcd6');
      for (let j = GY - bh + 4; j < GY - 10; j += 6) for (let i = bx + 3; i < bx + bw - 3; i += 5) G.rect(x, i, j, 2, 3, '#98aecb');
    }
    // vizinho à esquerda: prédio baixo cinza
    G.rect(x, 104, 112, 92, GY - 112, '#4a4c52'); for (let j = 118; j < GY - 6; j += 5) G.hline(x, 104, j, 92, '#3e4046');
    G.rect(x, 104, 108, 92, 4, '#5a5c62');
    // árvores da rua à direita, com um jacarandá florido
    const leaf = ['#2a5a2a', '#3a7a3a', '#4f8f44', '#6aa856'];
    for (let k = 0; k < 120; k++) {
      const a = U.hash2(k, 1) * Math.PI * 2, d = Math.sqrt(U.hash2(k, 2)) * 44;
      G.ellipse(x, 452 + Math.cos(a) * d, 118 + Math.sin(a) * d * 0.8, 4 + U.hash2(k, 3) * 6, (4 + U.hash2(k, 3) * 6) * 0.85, leaf[Math.floor(U.hash2(k, 4) * 4)]);
    }
    for (let k = 0; k < 70; k++) { const a = U.hash2(k, 5) * Math.PI * 2, d = Math.sqrt(U.hash2(k, 6)) * 26; G.ellipse(x, 430 + Math.cos(a) * d, 92 + Math.sin(a) * d * 0.7, 2.5, 2, U.hash2(k, 7) > 0.5 ? '#8a6ac8' : '#a888e0'); }
    G.rect(x, 448, 150, 6, GY - 150, '#4a3424'); G.rect(x, 430, 160, 4, GY - 160, '#4a3424');

    // ---------- fachada ----------
    G.rect(x, FX0, EY, FX1 - FX0, GY - EY, C.cream);
    const gH = 38; // frontão de duas águas que encontra a torre
    for (let i = FX0; i <= TX0; i++) { const y = Math.round(EY - (i - FX0) * gH / (TX0 - FX0)); G.rect(x, i, y, 1, EY - y + 1, C.cream); G.rect(x, i, y - 3, 1, 3, C.ochre); G.px(x, i, y, C.ochre2); }
    for (let i = TX1; i <= FX1; i++) { const y = Math.round(EY - (FX1 - i) * gH / (FX1 - TX1)); G.rect(x, i, y, 1, EY - y + 1, C.cream); G.rect(x, i, y - 3, 1, 3, C.ochre); G.px(x, i, y, C.ochre2); }
    G.dither(x, FX0, EY, FX1 - FX0, GY - EY, C.cream2, 0.08);
    G.hline(x, FX0, EY + 1, FX1 - FX0, C.cream3);
    // cunhais ocre nos cantos
    for (const px0 of [FX0, FX1 - 7]) { G.rect(x, px0, EY - 3, 7, GY - EY + 3, C.ochre); G.vline(x, px0 + (px0 === FX0 ? 6 : 0), EY - 3, GY - EY + 3, C.ochre2); G.vline(x, px0 + (px0 === FX0 ? 0 : 6), EY - 3, GY - EY + 3, C.ochre3); }
    // torre central com faixas ocre
    G.rect(x, TX0, TY, TX1 - TX0, 150 - TY, C.cream);
    G.dither(x, TX0, TY, TX1 - TX0, 150 - TY, C.cream2, 0.06);
    for (const px0 of [TX0, TX1 - 5]) { G.rect(x, px0, TY, 5, 152 - TY, C.ochre); G.vline(x, px0 + (px0 === TX0 ? 4 : 0), TY, 152 - TY, C.ochre2); }
    G.rect(x, TX0 - 3, TY - 4, TX1 - TX0 + 6, 5, C.ochre); G.hline(x, TX0 - 3, TY - 4, TX1 - TX0 + 6, C.ochre3); G.hline(x, TX0 - 3, TY, TX1 - TX0 + 6, C.ochre2);
    G.rect(x, TX0 - 1, TY - 7, TX1 - TX0 + 2, 3, C.cream2);
    // cruz no alto da torre
    G.rect(x, CX - 1, TY - 26, 3, 19, '#e8e2d2'); G.rect(x, CX - 6, TY - 20, 13, 3, '#e8e2d2'); G.vline(x, CX + 1, TY - 26, 19, '#b8b0a0'); G.hline(x, CX - 6, TY - 18, 13, '#b8b0a0');
    // janela ogival da torre, com venezianas
    G.shape(x, CX - 8, 68, 17, 38, G.gothicMask(17, 38, 9), C.cream3);
    const tw = G.gothicMask(15, 36, 8);
    G.shape(x, CX - 7, 69, 15, 36, (i, j) => tw(i, j) ? ((j % 3 === 0 && j > 8) ? '#4a4a5a' : '#262632') : false);
    // rosácea
    G.ellipse(x, CX, 122, 10, 10, C.ochre2); G.ellipse(x, CX, 122, 9, 9, C.cream3); G.ellipse(x, CX, 122, 8, 8, '#24346a');
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; G.line(x, CX, 122, CX + Math.cos(a) * 8, 122 + Math.sin(a) * 8, '#7a90c8'); }
    G.ellipse(x, CX, 122, 2.5, 2.5, '#e8c040');
    // janelões góticos com vitrais
    gothicWindow(x, CX - 58, 148, 26, 64, 0);
    gothicWindow(x, CX + 58, 148, 26, 64, 2);

    // ---------- alpendre de madeira com a placa ----------
    const RY = 168;
    G.shape(x, CX - 40, 146, 81, RY - 146 + 1, (i, j) => { const e = Math.abs(i - 40) * 0.55; return j >= e - 1 && j <= e + 4 ? (j <= e + 0.5 ? C.wood2 : C.wood) : false; });
    G.shape(x, CX - 34, 152, 69, RY - 152, (i, j) => j >= Math.abs(i - 34) * 0.55 + 4 ? C.wood3 : false);
    G.vline(x, CX, 153, RY - 153, C.wood2); G.line(x, CX - 30, RY - 1, CX, 156, C.wood2); G.line(x, CX + 30, RY - 1, CX, 156, C.wood2);
    G.hline(x, CX - 36, RY, 73, C.wood2); G.hline(x, CX - 36, RY + 1, 73, C.wood);
    for (const px0 of [CX - 35, CX + 32]) { G.rect(x, px0, RY + 2, 4, GY - RY - 2, '#2a2420'); G.vline(x, px0, RY + 2, GY - RY - 2, '#4a403a'); }
    // porta aberta, com a luz da capela lá dentro
    G.rect(x, CX - 18, 194, 37, GY - 194, '#3a2a1e');
    G.vgrad(x, CX - 14, 196, 29, GY - 196, ['#8a6a44', '#c09060', '#e0b880']);
    G.rect(x, CX - 18, 196, 4, GY - 196, '#5a3420'); G.rect(x, CX + 15, 196, 4, GY - 196, '#5a3420');
    G.rect(x, CX - 2, 206, 5, 16, '#f0e4c8'); G.rect(x, CX - 1, 203, 3, 3, '#f0e4c8');
    G.rect(x, CX, 198, 1, 6, '#5a3420'); G.rect(x, CX - 2, 199, 5, 1, '#5a3420');
    // placa preta com o emblema e o nome em dourado
    const sw = 66, sx0 = CX - sw / 2, sy0 = RY + 3;
    G.rect(x, sx0, sy0, sw, 21, '#121010'); G.frame(x, sx0, sy0, sw, 21, '#a8822a'); G.frame(x, sx0 + 1, sy0 + 1, sw - 2, 19, '#2a2420');
    DG.emblem.draw(x, CX, sy0 + 2, 11, 'goldFlat');
    const label = 'CAPELA SÃO PIO X';
    text(x, label, Math.round(CX - textW(label) / 2), sy0 + 14, '#e2c060');

    // ---------- gradil de ferro em losangos ----------
    const FY = 176;
    const gap = (i) => i > CX - 36 && i < CX + 36; // portão aberto entre os pilares do alpendre
    for (let i = 196; i < 446; i++) {
      if (gap(i)) continue;
      for (let j = FY + 3; j < GY - 2; j++) { if ((i + j) % 14 === 0 || (i - j + 1400) % 14 === 0) G.px(x, i, j, '#2a2626'); }
      if (i % 14 === 0) { G.px(x, i, FY - 2, C.iron); G.px(x, i, FY - 1, C.iron); }
    }
    for (const [a, b] of [[196, CX - 36], [CX + 36, 446]]) { G.rect(x, a, FY, b - a, 2, C.iron); G.rect(x, a, GY - 3, b - a, 2, C.iron); for (let i = a + 42; i < b - 4; i += 42) G.rect(x, i, FY, 2, GY - FY, C.iron2); }
    // pilar ocre à esquerda e portão alto de ferro à direita
    G.rect(x, 184, 150, 12, GY - 150, C.ochre); G.vline(x, 195, 150, GY - 150, C.ochre2); G.rect(x, 182, 146, 16, 5, C.ochre3); G.hline(x, 182, 150, 16, C.ochre2);
    G.shape(x, 446, 132, 30, GY - 132, (i, j) => { const top = 12 - Math.sqrt(Math.max(0, 1 - ((i - 14.5) / 15) ** 2)) * 12; if (j < top) return false; return (i === 0 || i === 29 || j < top + 2 || (i + j) % 8 === 0 || (i - j + 400) % 8 === 0) ? C.iron : false; });

    // ---------- calçada ----------
    G.rect(x, 0, GY, DG.W, DG.H - GY, '#a9a59c');
    for (let j = GY + 4; j < DG.H; j += 7) G.hline(x, 0, j, DG.W, '#99958c');
    for (let j = GY, k = 0; j < DG.H; j += 7, k++) for (let i = (k % 2) * 12; i < DG.W; i += 24) G.vline(x, i, j, 7, '#99958c');
    G.rect(x, 0, 262, DG.W, 3, '#c4c0b6'); G.rect(x, 0, 265, DG.W, 5, '#5a5856');
    // fiéis chegando para a Missa
    const folk = [[CX - 30, 'veilW', '#3a3a4a'], [CX - 44, 'm', '#2a2a34'], [CX + 30, 'veilB', '#5a2a3a'], [CX + 42, 'veilW', '#2e3a5a'], [CX + 60, 'm', '#3a3428'], [CX - 64, 'veilW', '#6a4a3a']];
    for (const [fx, kind, coat] of folk) {
      const fy = GY + 18;
      G.rect(x, fx - 3, fy - 13, 7, 13, coat); G.rect(x, fx - 2, fy, 2, 3, '#1a1a1a'); G.rect(x, fx + 1, fy, 2, 3, '#1a1a1a');
      G.ellipse(x, fx, fy - 16, 2.5, 3, '#e2bd96');
      if (kind === 'veilW') { G.rect(x, fx - 3, fy - 19, 7, 6, '#f4efe4'); G.px(x, fx - 3, fy - 13, '#f4efe4'); G.px(x, fx + 3, fy - 13, '#f4efe4'); }
      else if (kind === 'veilB') G.rect(x, fx - 3, fy - 19, 7, 6, '#1e1a1c');
      else G.rect(x, fx - 2, fy - 19, 5, 2, '#2a1a10');
    }
    // fios da rua, discretos
    x.save(); x.globalAlpha = 0.35;
    for (const [y0, y1, sag] of [[40, 70, 16], [52, 30, 10]]) for (let i = 0; i < DG.W; i++) { const t = i / DG.W; G.px(x, i, Math.round(y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * sag), '#1a1a22'); }
    x.restore();
    staticLayer = cv.c;
    return staticLayer;
  }

  const birds = [];
  DG.exterior = {
    t: 0, nextBell: 1.5, rings: 0,
    render(x, t, dt) {
      if (!staticLayer) buildStatic();
      x.drawImage(staticLayer, 0, 0);
      // nuvens claras à deriva (só no céu aberto)
      x.save(); x.globalAlpha = 0.55;
      for (let k = 0; k < 4; k++) {
        const cx = ((t * (2 + k) + k * 150) % (DG.W + 120)) - 60, cy = 14 + k * 11;
        if (cx > TX0 - 30 && cx < TX1 + 30) continue;
        G.ellipse(x, cx, cy, 20 + k * 4, 4, '#ffffff'); G.ellipse(x, cx + 14, cy - 2, 12, 3, '#f4f8ff');
      }
      x.restore();
      // pássaros
      if (Math.random() < dt * 0.2 && birds.length < 5) birds.push({ x: -10, y: 16 + Math.random() * 40, v: 18 + Math.random() * 14, ph: Math.random() * 6 });
      for (let i = birds.length - 1; i >= 0; i--) {
        const b = birds[i]; b.x += b.v * dt; b.ph += dt * 9;
        const up = Math.sin(b.ph) > 0;
        G.px(x, b.x, b.y, '#1a1418'); G.px(x, b.x - 1, b.y + (up ? -1 : 0), '#1a1418'); G.px(x, b.x + 1, b.y + (up ? -1 : 0), '#1a1418');
        if (b.x > DG.W + 10) birds.splice(i, 1);
      }
      // sol da manhã
      x.save(); x.globalCompositeOperation = 'lighter';
      const sun = x.createRadialGradient(80, 30, 0, 80, 30, 260); sun.addColorStop(0, 'rgba(255,240,200,0.14)'); sun.addColorStop(1, 'rgba(255,240,200,0)');
      x.fillStyle = sun; x.fillRect(0, 0, DG.W, DG.H);
      x.restore();
    },
    update(dt) {
      this.t += dt;
      this.nextBell -= dt;
      if (this.rings < 3 && this.nextBell <= 0) { this.nextBell = 3.2; this.rings++; if (DG.sfx) DG.sfx.towerBell({ vol: 0.45 }); }
    },
  };
})(window.DG = window.DG || {});
