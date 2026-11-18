/* DEO GRATIAS — tela inicial: interior da Capela São Pio X (Priorado Padre Anchieta, São Paulo)
   Vista do fundo da nave para o altar, em perspectiva, desenhada a partir de uma fotografia
   da capela: paredes de reboco creme, vitrais em arco com molduras de pedra, arandelas de
   ferro, altar branco com frontal de renda, colunas de mármore verde, portas de madeira
   escura, mesa de comunhão entalhada, piso de pedra clara e bancos de madeira. */
(function (DG) {
  'use strict';
  const G = DG.gfx, P = DG.pal, U = DG.util;

  // ---------- perspectiva ----------
  // mundo: X lateral (-240..240), Y altura (chão 0, teto 270), profundidade pela escala s
  const VX = 240, VY = 150, SB = 0.5; // ponto de fuga e escala da parede do fundo
  const sx = (X, s) => VX + X * s;
  const sy = (Y, s) => VY + (120 - Y) * s;
  const BW = { x0: sx(-240, SB), x1: sx(240, SB), y0: sy(270, SB), y1: sy(0, SB) }; // 120..360 × 15..210

  const C = {
    ceil: '#ddd0b0', ceil2: '#e9dfc6', wall: '#e8d9b4', wall2: '#d9c79c', wall3: '#c4ae82', back: '#eddfbd', back2: '#e2d1a8',
    base: '#9c8664', floor: '#d3c7ab', floor2: '#c6b999', floorLine: '#b3a585',
    stone: '#b8b4ac', stone2: '#8e8a84', wood: '#6e2a20', wood2: '#4e1a14', wood3: '#8a3a2a',
    pew: '#7a4a2a', pew2: '#9a6438', pew3: '#4a2a16', rail: '#5a2a18', rail2: '#7a3e24',
    marbleG: '#2f5a4e', marbleG2: '#1e3e36', marbleS: '#8a948c', marbleS2: '#6f7a74',
    altar: '#f2efe6', altar2: '#d9d4c6', lace: '#fbf8f0', lace2: '#e4ddcc', iron: '#2a2220',
  };

  // preenche colunas entre duas funções de y (polígonos limpos, sem antisserrilhado)
  function cols(x, x0, x1, top, bot, col) {
    for (let i = Math.floor(x0); i <= Math.ceil(x1); i++) {
      const a = Math.round(top(i)), b = Math.round(bot(i));
      if (b <= a) continue;
      if (typeof col === 'function') { for (let j = a; j < b; j++) { const c = col(i, j); if (c) G.px(x, i, j, c); } }
      else G.rect(x, i, a, 1, b - a, col);
    }
  }

  // ---------- vitral em arco numa parede lateral ----------
  function sideWindow(x, side, s0, s1, seed) {
    const sgn = side < 0 ? -1 : 1;
    const X = 240 * sgn;
    const xa = sx(X, s0), xb = sx(X, s1);
    const lo = Math.min(xa, xb), hi = Math.max(xa, xb);
    const z0 = 1 / s0, z1 = 1 / s1;
    const Ylo = 112, Yhi = 206, R = 14; // peitoril, início do arco, raio do arco (em altura)
    const pal = [['#2f56b0', '#6a8ee0', '#e8c040', '#c23a3a'], ['#3a8a4a', '#e8c040', '#c23a3a', '#5a7ad0'], ['#7a3a9a', '#e8c040', '#3a6ac0', '#d8d0c0']][seed % 3];
    const frame = 3;
    for (let i = Math.floor(lo) - frame; i <= Math.ceil(hi) + frame; i++) {
      const s = (i - VX) / X; if (s <= 0) continue;
      const z = 1 / s;
      const u = (z - z0) / (z1 - z0); // 0..1 ao longo da janela
      const inFrame = u > -0.08 && u < 1.08, inGlass = u >= 0 && u <= 1;
      if (!inFrame) continue;
      const arch = Math.sqrt(Math.max(0, 1 - (2 * U.clamp(u, 0, 1) - 1) ** 2));
      const topY = Yhi + R * arch, topF = topY + 8;
      const yT = Math.round(sy(inGlass ? topY : topF - 4, s)), yB = Math.round(sy(Ylo, s));
      const yTF = Math.round(sy(topF, s)), yBF = Math.round(sy(Ylo - 6, s));
      G.rect(x, i, yTF, 1, yBF - yTF, (u < 0.02 || u > 0.98) ? C.stone2 : C.stone); // moldura de pedra
      if (!inGlass) continue;
      for (let j = yT; j < yB; j++) {
        const v = (j - yT) / Math.max(1, yB - yT);
        let c;
        if (u < 0.14 || u > 0.86 || v < 0.07 || v > 0.93) c = pal[(Math.floor(v * 9) + (u < 0.5 ? 0 : 1)) % 4];       // borda
        else if (Math.abs(u - 0.5) < 0.2 && v > 0.36 && v < 0.88) c = (Math.abs(u - 0.5) < 0.06 && v < 0.6) ? '#f0e8d0' : pal[0]; // manto
        else if (Math.abs(u - 0.5) < 0.1 && v > 0.24 && v <= 0.36) c = '#f0c8a0';                                       // rosto
        else if (Math.hypot((u - 0.5) * 1.6, v - 0.3) < 0.16 && v < 0.3) c = '#f0d050';                                // auréola
        else c = ((Math.floor(u * 6) + Math.floor(v * 10)) % 2) ? '#cfe0ec' : '#e2ecf2';                              // fundo claro
        const lead = Math.abs(u - 0.14) < 0.025 || Math.abs(u - 0.86) < 0.025 || (Math.floor(v * 10) !== Math.floor((v + 1 / Math.max(1, yB - yT)) * 10) && (u < 0.14 || u > 0.86));
        G.px(x, i, j, lead ? '#4a4450' : c);
      }
      G.px(x, i, yT, '#4a4450');
    }
    // peitoril
    cols(x, lo - 2, hi + 2, (i) => sy(Ylo - 2, (i - VX) / X), (i) => sy(Ylo - 7, (i - VX) / X), C.stone2);
  }

  // arandela de ferro batido e quadrinho da via-sacra
  function sconce(x, side, s) {
    const X = 240 * side, px0 = sx(X, s), y = sy(176, s);
    const k = Math.min(2, Math.max(1, Math.round(2 * s)));
    const ox = Math.round(px0 - side * 3 * k);
    G.line(x, px0, y + 3 * k, ox, y + k, C.iron); G.px(x, px0, y + 3 * k + 1, C.iron);
    G.rect(x, ox - 1, y + k - 1, 3, 1, C.iron);
    G.rect(x, ox, y - k, 1, k + 1, '#f4ecd8'); // vela elétrica
    G.px(x, ox, y - k - 1, '#ffe7a0');
  }
  function station(x, side, s) {
    const X = 240 * side, px0 = sx(X, s), y0 = sy(212, s), y1 = sy(184, s);
    const w = Math.max(2, Math.round(10 * s));
    for (let i = 0; i < w; i++) { const xx = Math.round(px0 - side * (2 + i)); G.rect(x, xx, Math.round(y0 + i * 0.12 * side * 0), 1, Math.round(y1 - y0), i === 0 || i === w - 1 ? '#a08040' : '#5a4a3a'); }
  }

  // ---------- banco visto de trás ----------
  function pew(x, s, X0, X1) {
    const xa = Math.round(sx(X0, s)), xb = Math.round(sx(X1, s));
    const top = Math.round(sy(48, s)), mid = Math.round(sy(40, s)), bot = Math.round(sy(22, s));
    G.rect(x, xa, top, xb - xa, bot - top, C.pew);
    G.rect(x, xa, top, xb - xa, Math.max(1, Math.round(3 * s)), C.pew2);
    G.hline(x, xa, mid, xb - xa, C.pew3);
    G.rect(x, xa, bot, xb - xa, Math.max(1, Math.round(4 * s)), C.pew3);
    // cabeceiras dos bancos: madeira com friso escuro, só até o assento
    const ew = Math.max(2, Math.round(4 * s)), up = Math.max(1, Math.round(3 * s)), seat = Math.round(sy(18, s));
    for (const ex of [xa - 1, xb - ew + 1]) { G.rect(x, ex, top - up, ew, seat - top + up, C.pew2); G.vline(x, ex === xa - 1 ? ex : ex + ew - 1, top - up, seat - top + up, C.pew3); G.hline(x, ex, top - up, ew, '#b07a48'); }
  }
  // fiel de costas: cabeça (com ou sem véu) e ombros
  function person(x, s, X, kind, seed) {
    const cx = Math.round(sx(X, s)), headY = Math.round(sy(70, s));
    const r = Math.max(2, Math.round(9 * s)), sh = Math.round(22 * s);
    const coat = ['#2a2a34', '#3a2a24', '#4a3a5a', '#5a2a2a', '#2e3a4a', '#6a5a4a'][seed % 6];
    G.shape(x, cx - sh, headY + r - 1, sh * 2 + 1, Math.round(sy(46, s)) - headY - r + 2, (i, j) => Math.abs(i - sh) <= sh - Math.max(0, 4 - j) * 1.5, coat);
    if (kind === 'veilW' || kind === 'veilB') {
      const v = kind === 'veilW' ? ['#f4efe4', '#d9d0bf'] : ['#1e1a1c', '#3a3436'];
      G.shape(x, cx - r - 2, headY - r, (r + 2) * 2 + 1, r * 3, (i, j) => { const d = Math.hypot(i - r - 2, (j - r) * 0.8); return (d <= r + 1 || (j > r && Math.abs(i - r - 2) <= r + 2 - (j - r) * 0.1)) ? (((i + j) % 3 === 0) ? v[1] : v[0]) : false; });
    } else {
      G.ellipse(x, cx, headY, r, r, ['#3a2618', '#1e1612', '#6a4a2a', '#8a8078'][seed % 4]);
    }
  }

  let staticLayer = null;
  function buildStatic() {
    const cv = G.canvas(DG.W, DG.H), x = cv.x;
    // teto
    G.vgrad(x, 0, 0, DG.W, BW.y0 + 1, [C.ceil, C.ceil2]);
    G.line(x, 0, 0, BW.x0, BW.y0, '#c4b490'); G.line(x, DG.W - 1, 0, BW.x1, BW.y0, '#c4b490');
    for (const s of [0.62, 0.8]) { const y = Math.round(sy(270, s)); G.hline(x, Math.round(sx(-240, s)), y, Math.round(480 * s), '#cdbf9c'); G.hline(x, Math.round(sx(-240, s)), y + 1, Math.round(480 * s), '#efe6cf'); }
    // paredes laterais
    cols(x, 0, BW.x0, (i) => BW.y0 * i / BW.x0, (i) => 270 - (270 - BW.y1) * i / BW.x0, (i, j) => (j + i) % 7 === 0 && i < 60 ? C.wall2 : (i < 40 ? C.wall2 : C.wall));
    cols(x, BW.x1, DG.W - 1, (i) => BW.y0 * (DG.W - 1 - i) / (DG.W - 1 - BW.x1), (i) => 270 - (270 - BW.y1) * (DG.W - 1 - i) / (DG.W - 1 - BW.x1), (i, j) => (j + i) % 7 === 0 && i > 420 ? C.wall2 : (i > 440 ? C.wall2 : C.wall));
    // rodapé das paredes
    cols(x, 0, BW.x0, (i) => 270 - (270 - BW.y1) * i / BW.x0 - Math.max(2, 8 * (1 - i / BW.x0 * 0.5)), (i) => 270 - (270 - BW.y1) * i / BW.x0, C.base);
    cols(x, BW.x1, DG.W - 1, (i) => { const t = (DG.W - 1 - i) / (DG.W - 1 - BW.x1); return 270 - (270 - BW.y1) * t - Math.max(2, 8 * (1 - t * 0.5)); }, (i) => 270 - (270 - BW.y1) * (DG.W - 1 - i) / (DG.W - 1 - BW.x1), C.base);
    // parede do fundo (presbitério)
    G.vgrad(x, BW.x0, BW.y0, BW.x1 - BW.x0, BW.y1 - BW.y0, [C.back2, C.back, C.back]);
    G.vline(x, BW.x0, BW.y0, BW.y1 - BW.y0, C.wall3); G.vline(x, BW.x1, BW.y0, BW.y1 - BW.y0, C.wall3);
    G.hline(x, BW.x0, BW.y0, BW.x1 - BW.x0, '#c4b490');
    // chão de pedra clara com juntas em perspectiva
    cols(x, 0, DG.W - 1, (i) => i < BW.x0 ? 270 - (270 - BW.y1) * i / BW.x0 : i > BW.x1 ? 270 - (270 - BW.y1) * (DG.W - 1 - i) / (DG.W - 1 - BW.x1) : BW.y1, () => 270, (i, j) => ((i * 7 + j * 3) % 11 === 0 ? C.floor2 : C.floor));
    for (let z = 1.9; z > 0.7; z -= 0.14) { const s = 1 / z; if (s <= SB) continue; const y = Math.round(sy(0, s)); G.hline(x, Math.round(sx(-240, s)), y, Math.round(480 * s), C.floorLine); }
    for (let X = -240; X <= 240; X += 48) G.line(x, sx(X, SB), sy(0, SB), sx(X, 1.0), sy(0, 1.0), C.floorLine);

    // ---------- presbitério ----------
    const fl = BW.y1; // linha do chão no fundo (210)
    // tapete vermelho de padrão oriental diante do altar
    cols(x, sx(-80, 0.56), sx(80, 0.56), (i) => sy(0, 0.515), (i) => sy(0, 0.585), (i, j) => {
      const b = (j === Math.round(sy(0, 0.515)) || j === Math.round(sy(0, 0.585)) - 1 || i <= sx(-80, 0.56) + 1 || i >= sx(80, 0.56) - 1);
      return b ? '#c9a043' : ((i + j * 2) % 6 === 0 ? '#e0b860' : (i + j) % 4 === 0 ? '#2a3a6a' : '#8a1c22');
    });
    // portas laterais de madeira escura com bandeira (vidro) e arco
    for (const [dx, plaque] of [[BW.x0 + 6, false], [BW.x1 - 30, true]]) {
      const w = 24, top = 84, bot = fl;
      G.rect(x, dx - 2, top - 14, w + 4, 12, '#cfc3a6'); G.rect(x, dx, top - 12, w, 8, '#e8eef0'); G.vline(x, dx + w / 2, top - 12, 8, '#9aa4a8'); // bandeira
      G.rect(x, dx - 2, top - 2, w + 4, bot - top + 2, '#5a2a1c');
      G.rect(x, dx, top, w, bot - top, C.wood);
      G.shape(x, dx + 2, top + 2, w - 4, 10, (i, j) => j >= 10 - Math.sqrt(Math.max(0, 1 - ((i - (w - 5) / 2) / ((w - 4) / 2)) ** 2)) * 10, C.wood3);
      G.frame(x, dx + 3, top + 14, w - 6, bot - top - 20, C.wood2);
      G.vline(x, dx + w / 2, top + 2, bot - top - 2, C.wood2);
      if (plaque) { G.rect(x, dx + 7, top + 34, 10, 12, '#4a1a12'); G.frame(x, dx + 7, top + 34, 10, 12, '#a07040'); G.hline(x, dx + 9, top + 38, 6, '#c9a043'); G.hline(x, dx + 9, top + 41, 6, '#c9a043'); }
      G.px(x, plaque ? dx + 4 : dx + w - 5, top + 60, '#c9a043');
    }
    // colunas de mármore verde ladeando o altar
    for (const cx of [174, 306]) {
      const top = 70, bot = fl;
      G.rect(x, cx - 7, top, 14, 7, C.marbleG2); G.rect(x, cx - 6, top + 1, 12, 5, C.marbleG); G.hline(x, cx - 7, top + 7, 14, C.marbleG2); // capitel
      G.rect(x, cx - 5, top + 8, 10, bot - top - 18, C.marbleS);
      for (let j = top + 8; j < bot - 10; j++) { const v = Math.sin(j * 0.31 + cx) * 3; G.px(x, Math.round(cx + v), j, C.marbleS2); if (j % 5 === 0) G.px(x, Math.round(cx - v * 0.6 - 2), j, '#a4aca6'); }
      G.vline(x, cx - 5, top + 8, bot - top - 18, '#a8b0aa'); G.vline(x, cx + 4, top + 8, bot - top - 18, C.marbleS2);
      G.rect(x, cx - 7, bot - 10, 14, 10, C.marbleG); G.hline(x, cx - 7, bot - 10, 14, '#4a7a6a'); G.rect(x, cx - 8, bot - 3, 16, 3, C.marbleG2); // base
    }
    // altar: degrau, base de mármore branco com painéis escuros, frontal de renda
    const AX0 = 196, AX1 = 284;
    G.rect(x, AX0 - 10, fl - 5, AX1 - AX0 + 20, 5, '#d8d2c4'); G.hline(x, AX0 - 10, fl - 5, AX1 - AX0 + 20, '#f0ece2');
    G.rect(x, AX0, fl - 28, AX1 - AX0, 23, C.altar); G.hline(x, AX0, fl - 28, AX1 - AX0, C.altar2);
    for (let k = 0; k < 6; k++) { const px0 = AX0 + 9 + k * 14; G.rect(x, px0, fl - 22, 3, 13, '#2a2a2a'); G.px(x, px0 + 1, fl - 22, '#5a5a5a'); }
    G.rect(x, AX1 - 2, fl - 34, 5, 29, C.altar); G.vline(x, AX1 + 2, fl - 34, 29, C.altar2); // coluninha lateral
    G.rect(x, AX0 - 2, fl - 50, AX1 - AX0 + 4, 22, C.lace); // frontal de renda
    for (let j = 0; j < 22; j++) for (let i = 0; i < AX1 - AX0 + 4; i++) { const p = ((i % 8) - 4) ** 2 + ((j % 8) - 4) ** 2; if (p > 6 && p < 12) G.px(x, AX0 - 2 + i, fl - 50 + j, C.lace2); }
    G.hline(x, AX0 - 2, fl - 29, AX1 - AX0 + 4, C.lace2);
    for (let i = 0; i < AX1 - AX0 + 4; i += 2) G.px(x, AX0 - 2 + i, fl - 28, C.lace2); // franja de renda
    G.rect(x, AX0 - 4, fl - 52, AX1 - AX0 + 8, 3, '#f8f6f0'); // toalha sobre a mesa
    // banquetas (degraus) com castiçais, flores, sacras e sacrário
    G.rect(x, AX0 + 4, fl - 60, AX1 - AX0 - 8, 8, '#e4dccb'); G.hline(x, AX0 + 4, fl - 60, AX1 - AX0 - 8, '#f4efe4');
    G.rect(x, AX0 + 12, fl - 66, AX1 - AX0 - 24, 6, '#d8cfbc'); G.hline(x, AX0 + 12, fl - 66, AX1 - AX0 - 24, '#ece6d8');
    // sacras (cartas do altar) douradas
    G.rect(x, 230, fl - 62, 20, 10, '#c9a043'); G.rect(x, 232, fl - 60, 16, 6, '#f2e8cc');
    G.rect(x, AX0 + 10, fl - 59, 8, 7, '#c9a043'); G.rect(x, AX0 + 11, fl - 58, 6, 5, '#f2e8cc');
    G.rect(x, AX1 - 18, fl - 59, 8, 7, '#c9a043'); G.rect(x, AX1 - 17, fl - 58, 6, 5, '#f2e8cc');
    // sacrário com conopeu
    G.rect(x, 232, fl - 88, 16, 22, '#c9a043'); G.rect(x, 233, fl - 87, 14, 20, '#e2b850');
    G.shape(x, 230, fl - 92, 20, 6, (i, j) => j >= Math.abs(i - 9.5) * 0.6, '#c9a043');
    G.rect(x, 234, fl - 85, 6, 18, '#f4f0e6'); G.rect(x, 240, fl - 85, 6, 18, '#b0202a'); // véu branco e vermelho
    G.vline(x, 240, fl - 85, 18, '#7a141c');
    // crucifixo sobre o sacrário
    G.rect(x, 239, fl - 122, 3, 30, '#3a2416'); G.rect(x, 232, fl - 114, 17, 3, '#3a2416');
    G.rect(x, 240, fl - 112, 1, 9, '#efdcc2'); G.rect(x, 234, fl - 113, 13, 1, '#efdcc2'); G.px(x, 240, fl - 114, '#efdcc2');
    // castiçais dourados com velas
    for (const cx of [204, 214, 224, 256, 266, 276]) {
      const by = cx < 240 ? (cx === 204 ? fl - 60 : fl - 66) : (cx === 276 ? fl - 60 : fl - 66);
      G.rect(x, cx - 2, by - 2, 4, 2, P.g3); G.hline(x, cx - 2, by - 2, 4, P.g5);
      G.vline(x, cx - 1, by - 7, 5, P.g4); G.vline(x, cx, by - 7, 5, P.g2);
      G.rect(x, cx - 2, by - 8, 4, 1, P.g5);
      G.rect(x, cx - 1, by - 21, 2, 13, '#fbf8f0'); G.vline(x, cx, by - 21, 13, '#e4ddcc');
    }
    // arranjos de flores brancas e amarelas
    for (const [fx, fy, r] of [[207, fl - 78, 7], [273, fl - 78, 7], [190, fl - 92, 9], [290, fl - 92, 9], [222, fl - 84, 5], [258, fl - 84, 5]]) {
      G.rect(x, fx - 2, fy + r - 2, 5, 8, '#d0c8b4');
      for (let k = 0; k < r * 14; k++) {
        const a = U.hash2(fx + k, fy) * Math.PI * 2, d = Math.sqrt(U.hash2(k, fx)) * r;
        const c = ['#ffffff', '#f4e27a', '#f0a830', '#fbf3d0', '#4a7a3a'][Math.floor(U.hash2(k * 3, fy) * 5)];
        G.px(x, Math.round(fx + Math.cos(a) * d), Math.round(fy + Math.sin(a) * d * 0.9), c);
      }
    }
    // mesa lateral com toalha roxa e branca (diante da porta da direita)
    G.rect(x, BW.x1 - 40, fl - 20, 30, 18, '#f4f0e6');
    for (let i = 0; i < 30; i += 4) { G.shape(x, BW.x1 - 40 + i, fl - 16, 4, 8, (a, b) => b >= Math.abs(a - 1.5) * 2, '#7a4a9a'); }
    G.rect(x, BW.x1 - 40, fl - 21, 30, 2, '#ffffff');
    // mesa de comunhão de madeira entalhada, com arcos
    const sR = 0.6, railTop = Math.round(sy(40, sR)), railBot = Math.round(sy(0, sR));
    for (const [X0, X1] of [[-240, -14], [14, 240]]) {
      const xa = Math.round(sx(X0, sR)), xb = Math.round(sx(X1, sR));
      G.rect(x, xa, railTop, xb - xa, 4, C.rail2); G.hline(x, xa, railTop, xb - xa, '#9a5a34');
      G.rect(x, xa, railTop + 4, xb - xa, railBot - railTop - 4, '#00000000');
      for (let i = xa; i < xb; i += 9) {
        G.rect(x, i, railTop + 4, 2, railBot - railTop - 4, C.rail);
        G.shape(x, i + 2, railTop + 4, 7, 7, (a, b) => Math.hypot(a - 3, b - 6.5) >= 3.2 && b < 6.5, C.rail);
      }
      G.rect(x, xa, railBot - 3, xb - xa, 3, C.rail);
    }
    G.rect(x, Math.round(sx(-14, sR)), railTop + 1, Math.round(28 * sR), 3, C.rail2); // portinhola
    // lâmpada do Santíssimo (vermelha), pendente do teto
    G.vline(x, 196, 0, 92, '#6a5a4a');
    G.rect(x, 193, 92, 7, 2, P.g4); G.rect(x, 194, 94, 5, 6, '#a8141c'); G.rect(x, 195, 100, 3, 2, P.g3);

    // ---------- nave: vitrais, arandelas, via-sacra ----------
    const wins = [[0.53, 0.58], [0.63, 0.7], [0.76, 0.87], [0.97, 1.18]];
    wins.forEach(([a, b], k) => { sideWindow(x, -1, a, b, k); sideWindow(x, 1, a, b, k + 1); });
    for (const s of [0.605, 0.73, 0.92]) { sconce(x, -1, s); sconce(x, 1, s); station(x, -1, s + 0.015); station(x, 1, s + 0.015); }

    // ---------- bancos e fiéis ----------
    const rows = [];
    for (let z = 1.56; z > 1.02; z -= 0.09) rows.push(1 / z);
    const folk = { 0: [[-150, 'veilW'], [170, 'veilB']], 1: [[-185, 'm'], [140, 'veilW']], 2: [[-125, 'veilB'], [190, 'm']], 3: [[-170, 'veilW'], [120, 'm']], 4: [[-140, 'm'], [165, 'veilW']], 5: [[-190, 'veilW']] };
    rows.forEach((s, r) => {
      pew(x, s, -218, -34); pew(x, s, 34, 218);
      (folk[r] || []).forEach(([X, kind], k) => person(x, s, X, kind, r * 3 + k));
    });
    staticLayer = cv.c;
    return staticLayer;
  }

  const motes = [];
  DG.exterior = {
    t: 0,
    render(x, t, dt) {
      if (!staticLayer) buildStatic();
      x.drawImage(staticLayer, 0, 0);
      const fl = BW.y1;
      // chamas das velas do altar e da lâmpada do Santíssimo
      for (const cx of [204, 214, 224, 256, 266, 276]) {
        const by = (cx === 204 || cx === 276) ? fl - 60 : fl - 66;
        const f = Math.sin(t * 11 + cx) + Math.sin(t * 6.3 + cx * 2);
        G.px(x, cx - 1 + (f > 1.2 ? 1 : 0), by - 23, P.flame2 || '#ffe7a0'); G.px(x, cx - 1, by - 22, P.flame0 || '#fff6d0');
        if (f > -0.6) G.px(x, cx - 1, by - 24, P.flame1 || '#ffb040');
      }
      const lf = 0.75 + Math.sin(t * 5) * 0.08 + Math.sin(t * 13) * 0.05;
      x.save(); x.globalCompositeOperation = 'lighter';
      const lg = x.createRadialGradient(196, 97, 0, 196, 97, 10); lg.addColorStop(0, 'rgba(255,60,40,' + (0.45 * lf) + ')'); lg.addColorStop(1, 'rgba(255,60,40,0)');
      x.fillStyle = lg; x.fillRect(184, 85, 24, 24);
      const ag = x.createRadialGradient(240, fl - 82, 0, 240, fl - 82, 60); ag.addColorStop(0, 'rgba(255,200,120,0.16)'); ag.addColorStop(1, 'rgba(255,200,120,0)');
      x.fillStyle = ag; x.fillRect(180, fl - 142, 120, 120);
      // luz do dia entrando pelos vitrais da esquerda
      x.globalAlpha = 0.07;
      x.fillStyle = '#fff2d0';
      x.beginPath(); x.moveTo(30, 60); x.lineTo(60, 52); x.lineTo(250, 260); x.lineTo(170, 270); x.closePath(); x.fill();
      x.beginPath(); x.moveTo(98, 92); x.lineTo(112, 88); x.lineTo(300, 230); x.lineTo(250, 236); x.closePath(); x.fill();
      x.restore();
      // poeira na luz
      if (motes.length < 40 && Math.random() < dt * 12) motes.push({ x: 60 + Math.random() * 200, y: 60 + Math.random() * 180, v: 2 + Math.random() * 3, a: 0, life: 6 + Math.random() * 6 });
      for (let i = motes.length - 1; i >= 0; i--) {
        const m = motes[i]; m.a += dt; m.y += m.v * dt * 0.4; m.x += Math.sin(m.a + i) * dt * 2;
        const al = Math.min(1, m.a, m.life - m.a);
        if (al <= 0) { motes.splice(i, 1); continue; }
        x.globalAlpha = al * 0.5; G.px(x, m.x, m.y, '#fff6dc'); x.globalAlpha = 1;
      }
      // vinheta suave
      x.drawImage(DG.fx.getVignette(), 0, 0);
    },
    update(dt) { this.t += dt; },
  };
})(window.DG = window.DG || {});
