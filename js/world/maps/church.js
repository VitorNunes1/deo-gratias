/* DEO GRATIAS — Igreja (presbitério, altar-mor, nave, altares laterais) */
(function (DG) {
  'use strict';
  const G = DG.gfx, P = DG.pal, U = DG.util, A = DG.art;
  DG.maps = DG.maps || {};
  const GOLD = [P.g1, P.g2, P.g4, P.g6, P.g5, P.g4, P.g3, P.g2, P.g1];

  // ---- geometria (px) ----
  const W = 576, H = 1024;
  const CX = 288;                  // eixo do altar
  const K = {
    wallBottom: 128,               // base da parede do fundo (abside)
    reredos: { x: 196, y: 6, w: 184, h: 122 },
    mensa: { x: 220, y: 128, w: 136, top: 10, front: 16 },
    predella: { x: 196, y: 154, w: 184, h: 12 },
    steps: [{ x: 188, y: 166, w: 200 }, { x: 180, y: 174, w: 216 }, { x: 172, y: 182, w: 232 }],
    stepH: 8,
    apse: { x: 96, w: 384 },
    railY: 310,
    naveTop: 324,
    candlesX: [228, 245, 262, 314, 331, 348],
    candleBaseY: 120,
  };

  // ==================================================================
  // Capela São Pio X (Priorado Padre Anchieta, São Paulo), a partir de fotografias:
  // nave única de paredes brancas e abóbada ogival com nervuras cinzentas; arco do
  // presbitério sobre colunas de mármore cinza com capitéis e bases verdes; grande
  // crucifixo de madeira na parede do fundo; portas vermelhas em ogiva com sol dourado;
  // altar de mármore branco com arcaria gótica e renda; mesa de comunhão de madeira
  // entalhada; piso de granito claro com losangos pretos no corredor central.
  // ==================================================================
  const CH = {
    wall: '#f2eee4', wall2: '#e6e0d2', wall3: '#d6cfbf', base: '#b8b4ac',
    grayM: '#b9b7b1', grayM2: '#8f8d87', grayM3: '#d8d6d0', green: '#2f6a5a', green2: '#1e4a3e', green3: '#4a8a76',
    red: '#8a1a1a', red2: '#6a1010', red3: '#a82a28', sun: '#d6a63a',
    marble: '#f3f0e8', marble2: '#dcd7cb', marble3: '#c6c0b2', dark: '#2a2a2c',
    gran: '#d3d0c9', gran2: '#c4c1ba', gran3: '#e2dfd8', joint: '#b7b3ab',
    wood: '#5a2a1a', wood2: '#7a3e26', wood3: '#3a1a10',
  };

  // porta vermelha em ogiva com o sol dourado no tímpano
  function redDoor(x, X, Y, w, h, ornament) {
    G.shape(x, X - 2, Y - 2, w + 4, h + 2, G.gothicMask(w + 4, h + 2, Math.ceil((w + 4) / 2)), CH.grayM2);
    const m = G.gothicMask(w, h, Math.ceil(w / 2));
    const ty = Math.floor(h * 0.34);
    G.shape(x, X, Y, w, h, (i, j) => m(i, j) ? (j < ty ? CH.wall2 : (i === Math.floor(w / 2) ? CH.red2 : (j - ty) % 14 === 0 ? CH.red2 : (i % 7 === 1 ? CH.red3 : CH.red))) : false);
    G.hline(x, X, Y + ty, w, CH.red2);
    const sx = X + Math.floor(w / 2), sy = Y + Math.floor(ty * 0.62);
    if (ornament === 'sun') { for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; G.line(x, sx, sy, sx + Math.cos(a) * 5, sy + Math.sin(a) * 4, CH.sun); } G.ellipse(x, sx, sy, 1.6, 1.6, '#f0c860'); }
    else { G.hline(x, sx - 5, sy, 11, CH.sun); G.vline(x, sx, sy - 3, 7, CH.sun); G.px(x, sx - 3, sy - 2, CH.sun); G.px(x, sx + 3, sy - 2, CH.sun); G.px(x, sx - 3, sy + 2, CH.sun); G.px(x, sx + 3, sy + 2, CH.sun); }
    G.px(x, sx + 3, Y + Math.floor(h * 0.7), '#d8b060');
  }

  // fuste de mármore cinza com veios, capitel e base verdes
  function column(x, cx, top, bot) {
    G.rect(x, cx - 5, top, 11, 5, CH.green); G.hline(x, cx - 5, top, 11, CH.green3); G.hline(x, cx - 5, top + 4, 11, CH.green2);
    G.rect(x, cx - 4, top + 5, 9, bot - top - 13, CH.grayM);
    for (let j = top + 5; j < bot - 8; j++) { const v = Math.sin(j * 0.27 + cx) * 2.5; G.px(x, Math.round(cx + v), j, CH.grayM2); if (j % 4 === 0) G.px(x, Math.round(cx - v * 0.7 - 1), j, CH.grayM3); }
    G.vline(x, cx - 4, top + 5, bot - top - 13, CH.grayM3); G.vline(x, cx + 4, top + 5, bot - top - 13, CH.grayM2);
    G.rect(x, cx - 5, bot - 8, 11, 8, CH.green); G.hline(x, cx - 5, bot - 8, 11, CH.green3); G.rect(x, cx - 6, bot - 3, 13, 3, CH.green2);
  }

  // parede do fundo do presbitério
  function drawBackWall(x, cel) {
    const ap = K.apse;
    G.vgrad(x, ap.x, 0, ap.w, K.wallBottom, [CH.wall2, CH.wall, CH.wall]);
    G.dither(x, ap.x, 0, ap.w, K.wallBottom, CH.wall2, 0.05);
    G.rect(x, ap.x, 0, 8, K.wallBottom, CH.wall3); G.rect(x, ap.x + ap.w - 8, 0, 8, K.wallBottom, CH.wall3); // cantos em sombra
    G.rect(x, ap.x, K.wallBottom - 5, ap.w, 5, CH.base); G.hline(x, ap.x, K.wallBottom - 5, ap.w, CH.grayM3);
    // arco ogival do presbitério: nervura de mármore cinza que nasce dos capitéis
    const cl = CX - 92, cr = CX + 92, spring = 46;
    for (const [c, s] of [[cl, 1], [cr, -1]]) {
      const R = 120, ccx = c + s * R;
      for (let i = 0; i <= 60; i++) {
        const px0 = c + s * i; const dy = Math.sqrt(Math.max(0, R * R - (px0 - ccx) ** 2));
        const y = Math.round(spring - dy); if (y < -4) break;
        G.rect(x, px0 - 3, Math.max(0, y), 7, 1, i % 6 === 0 ? CH.grayM2 : CH.grayM);
        G.px(x, px0 - 3, Math.max(0, y + 1), CH.grayM3); G.px(x, px0 + 3, Math.max(0, y + 1), CH.grayM2);
      }
    }
    column(x, cl, spring, K.wallBottom); column(x, cr, spring, K.wallBottom);
    // grande crucifixo de madeira
    const crX = CX, cTop = 2, cBar = 18, cBot = 78;
    G.rect(x, crX - 2, cTop, 5, cBot - cTop, '#6a4022'); G.vline(x, crX - 2, cTop, cBot - cTop, '#8a5a32'); G.vline(x, crX + 2, cTop, cBot - cTop, '#4a2a14');
    G.rect(x, crX - 18, cBar, 37, 5, '#6a4022'); G.hline(x, crX - 18, cBar, 37, '#8a5a32'); G.hline(x, crX - 18, cBar + 4, 37, '#4a2a14');
    G.rect(x, crX - 3, cTop + 3, 7, 4, '#efe6d0'); // INRI
    G.ellipse(x, crX, cBar - 2, 2, 2.2, '#c89a6a'); G.px(x, crX - 1, cBar - 4, '#5a3a20');
    G.shape(x, crX - 3, cBar + 1, 7, 24, (i, j) => j < 16 ? Math.abs(i - 3) <= 2 - j * 0.04 : Math.abs(i - 3) <= 1.2, '#c89a6a');
    G.line(x, crX - 3, cBar + 2, crX - 15, cBar + 1, '#c89a6a'); G.line(x, crX + 3, cBar + 2, crX + 15, cBar + 1, '#c89a6a');
    G.rect(x, crX - 3, cBar + 12, 7, 4, '#efe6d0'); // perizônio
    G.rect(x, crX - 6, cBot, 13, 3, '#4a2a14');
    if (cel.tempus === 'passionis') { // cruz velada de roxo no Tempo da Paixão
      G.shape(x, crX - 16, cTop + 2, 33, cBot - cTop, (i, j) => j >= Math.abs(i - 16) * 0.35, (DG.LIT.violaceus).main[1]);
      G.dither(x, crX - 16, cTop + 2, 33, cBot - cTop, (DG.LIT.violaceus).main[2], 0.25);
    }
    // portas vermelhas em ogiva, fora do arco
    redDoor(x, ap.x + 22, 52, 30, K.wallBottom - 57, 'sun');
    redDoor(x, ap.x + ap.w - 52, 52, 30, K.wallBottom - 57, 'star');
    // imagens sobre pedestais ao lado do altar (Sagrado Coração e São José)
    for (const [px0, kind] of [[CX - 76, 'cor'], [CX + 76, 'joseph']]) {
      G.rect(x, px0 - 5, 84, 11, K.wallBottom - 84, CH.marble); G.vline(x, px0 - 5, 84, K.wallBottom - 84, '#ffffff'); G.vline(x, px0 + 5, 84, K.wallBottom - 84, CH.marble3);
      G.rect(x, px0 - 6, 82, 13, 3, CH.marble2);
      A.statue(x, px0, 84, kind, 0.75);
      if (cel.tempus === 'passionis') G.rect(x, px0 - 6, 52, 13, 30, (DG.LIT.violaceus).main[1]);
    }
    // sacrário de mármore branco com porta dourada e conopeu da cor do dia
    const tab = (DG.LIT[cel.tabernacleColor] || DG.LIT.albus).main;
    const tX = CX - 14, tY = K.wallBottom - 44;
    G.rect(x, tX - 2, tY - 6, 32, 6, CH.marble2); G.shape(x, tX - 2, tY - 14, 32, 9, (i, j) => j >= Math.abs(i - 15.5) * 0.55, CH.marble);
    G.rect(x, CX - 1, tY - 18, 3, 5, P.g5); G.rect(x, CX - 3, tY - 16, 7, 1, P.g5);
    G.rect(x, tX, tY, 28, 44, CH.marble3); G.rect(x, tX + 1, tY + 1, 26, 42, CH.marble);
    G.rect(x, tX + 6, tY + 6, 16, 26, P.g3); G.rect(x, tX + 7, tY + 7, 14, 24, P.g5);
    G.rect(x, CX - 1, tY + 10, 3, 14, P.g2); G.rect(x, CX - 5, tY + 14, 11, 3, P.g2);
    G.ellipse(x, CX, tY + 33, 1, 1, P.g6);
    G.shape(x, tX - 3, tY - 4, 9, 48, (i, j) => i <= 6 - j * 0.04, tab[0]);
    G.shape(x, tX + 22, tY - 4, 9, 48, (i, j) => i >= 2 + j * 0.04, tab[0]);
    G.vline(x, tX + 2, tY, 44, tab[2]); G.vline(x, tX + 25, tY, 44, tab[2]);
    G.rect(x, tX - 3, tY - 5, 34, 3, tab[1]); G.hline(x, tX - 3, tY - 5, 34, (DG.TRIM.gold)[0]);
  }

  // altar de mármore branco: banquetas com arcaria, flores, toalhas e frontal gótico com renda
  function drawAltar(x, cel) {
    const M = K.mensa;
    // banquetas (degraus dos castiçais) com pequenos arcos góticos
    G.rect(x, M.x + 2, K.wallBottom - 16, M.w - 4, 8, CH.marble); G.hline(x, M.x + 2, K.wallBottom - 16, M.w - 4, '#ffffff');
    G.rect(x, M.x - 2, K.wallBottom - 8, M.w + 4, 8, CH.marble); G.hline(x, M.x - 2, K.wallBottom - 8, M.w + 4, '#ffffff');
    for (let i = M.x + 4; i < M.x + M.w - 4; i += 6) { G.vline(x, i, K.wallBottom - 13, 5, CH.dark); G.px(x, i + 2, K.wallBottom - 14, CH.marble3); G.px(x, i + 3, K.wallBottom - 15, CH.marble3); }
    for (let i = M.x; i < M.x + M.w; i += 7) { G.vline(x, i, K.wallBottom - 5, 5, CH.dark); G.px(x, i + 3, K.wallBottom - 7, CH.marble3); }
    G.hline(x, M.x + 2, K.wallBottom - 9, M.w - 4, CH.marble3); G.hline(x, M.x - 2, K.wallBottom - 1, M.w + 4, CH.marble3);
    // flores brancas e amarelas entre os castiçais (nunca nos dias penitenciais e de Réquiem)
    const flowers = !(cel.requiem || cel.tempus === 'quadragesimae' || cel.tempus === 'passionis');
    if (flowers) for (const fx of [236, 254, 322, 340]) {
      G.rect(x, fx - 2, K.wallBottom - 21, 5, 5, P.g4);
      for (let k = 0; k < 26; k++) {
        const a = U.hash2(fx + k, 9) * Math.PI * 2, d = Math.sqrt(U.hash2(k, fx)) * 5;
        G.px(x, Math.round(fx + Math.cos(a) * d), Math.round(K.wallBottom - 26 + Math.sin(a) * d * 0.9), ['#ffffff', '#f4e27a', '#f0c030', '#fbf3d0', '#4a7a3a'][Math.floor(U.hash2(k * 3, fx) * 5)]);
      }
    }
    // mesa do altar: tampo com as toalhas (vista superior)
    G.rect(x, M.x, M.y, M.w, M.top, P.l4);
    G.hline(x, M.x, M.y, M.w, P.l5); G.dither(x, M.x, M.y + 6, M.w, 4, P.l3, 0.3);
    DG.spr.miniCard(x, CX - 9, M.y - 9, 18, 12);
    DG.spr.miniCard(x, M.x + 14, M.y - 6, 10, 8);
    DG.spr.miniCard(x, M.x + M.w - 24, M.y - 6, 10, 8);
    // frontal de mármore branco com arcaria gótica de colunelos escuros
    const fy = M.y + M.top, fh = M.front;
    G.rect(x, M.x, fy, M.w, fh, CH.marble);
    const bays = 5, bw = M.w / bays;
    for (let b = 0; b <= bays; b++) { const cx = Math.round(M.x + b * bw); G.rect(x, cx - 1, fy + 4, 2, fh - 5, CH.dark); G.px(x, cx - 1, fy + 4, P.g4); G.px(x, cx, fy + 4, P.g4); }
    for (let b = 0; b < bays; b++) {
      const x0 = Math.round(M.x + b * bw) + 1, w = Math.round(bw) - 2;
      const m = G.gothicMask(w, fh - 5, Math.ceil(w / 2));
      G.shape(x, x0, fy + 4, w, fh - 5, (i, j) => m(i, j) ? (j < 3 && (i === 0 || i === w - 1 || !m(i - 1, j - 1) || !m(i + 1, j - 1)) ? CH.marble3 : (j > 2 ? '#e8e4da' : false)) : false);
    }
    // renda pendente sobre o frontal
    G.rect(x, M.x, fy, M.w, 4, '#fbf8f0');
    for (let i = M.x; i < M.x + M.w; i++) { if (i % 4 === 0) G.px(x, i, fy + 4, '#fbf8f0'); if (i % 4 === 2) G.px(x, i, fy + 2, CH.marble2); }
    // toalha caindo pelas laterais
    G.rect(x, M.x - 3, M.y, 3, M.top + M.front - 2, P.l3); G.rect(x, M.x + M.w, M.y, 3, M.top + M.front - 2, P.l3);
    for (let j = M.y; j < M.y + M.top + M.front - 2; j += 3) { G.px(x, M.x - 3, j, P.l1); G.px(x, M.x + M.w + 2, j, P.l1); }
    G.hline(x, M.x, M.y + M.top, M.w, P.l2);
  }

  // supedâneo de mármore claro e degraus de granito
  function drawSteps(x) {
    const Pd = K.predella;
    G.rect(x, Pd.x, Pd.y, Pd.w, Pd.h, CH.marble); G.hline(x, Pd.x, Pd.y, Pd.w, '#ffffff');
    for (let i = Pd.x; i < Pd.x + Pd.w; i += 24) G.vline(x, i, Pd.y, Pd.h, CH.marble2);
    G.frame(x, Pd.x, Pd.y, Pd.w, Pd.h, CH.grayM2);
    G.hline(x, Pd.x, Pd.y + Pd.h - 1, Pd.w, CH.grayM2);
    K.steps.forEach((s, i) => {
      const y = s.y;
      G.rect(x, s.x, y, s.w, K.stepH, CH.gran);
      G.hline(x, s.x, y, s.w, CH.gran3); G.hline(x, s.x, y + 1, s.w, CH.gran3);
      G.rect(x, s.x, y + 5, s.w, 3, CH.gran2); G.hline(x, s.x, y + K.stepH - 1, s.w, CH.grayM2);
      G.noise(x, s.x, y + 2, s.w, 3, [CH.gran2, CH.gran3], 300 + i, 0.12);
    });
  }

  // piso de granito claro com juntas e pontinhos
  function granite(x, X, Y, w, h, tile, seed, cols) {
    const c = cols || [CH.gran, CH.gran2, CH.gran3];
    G.rect(x, X, Y, w, h, c[0]);
    G.noise(x, X, Y, w, h, [c[1], c[2]], seed, 0.16);
    for (let j = Y; j < Y + h; j += tile) G.hline(x, X, j, w, CH.joint);
    for (let i = X; i < X + w; i += tile) G.vline(x, i, Y, h, CH.joint);
  }

  function drawSanctuaryFloor(x) {
    const ap = K.apse;
    granite(x, ap.x, 128, ap.w, K.naveTop - 128, 24, 7);
    // faixa de granito escuro contornando o presbitério
    G.frame(x, ap.x + 6, 192, ap.w - 12, K.railY - 198, '#8a8780');
    G.dither(x, ap.x, 128, ap.w, 10, CH.wall3, (i, j) => (1 - j / 10) * 0.5);
  }

  function drawApseWall(x, cel) { drawBackWall(x, cel); }

  // vitral ogival numa parede lateral, com moldura de pedra cinza
  function drawSideWindow(x, X, Y, design) {
    G.rect(x, X, Y, 12, 52, CH.grayM); G.vline(x, X, Y, 52, CH.grayM3); G.vline(x, X + 11, Y, 52, CH.grayM2);
    const cols = { agnus: [P.gl_b, P.gl_w, P.gl_y], spiritus: [P.gl_r, P.gl_y, P.gl_w], geo: [P.gl_g, P.gl_b, P.gl_y], petrus: [P.gl_y, P.gl_b, P.gl_r], joseph: [P.gl_b, '#8a5a22', P.gl_y] }[design] || [P.gl_b, P.gl_r, P.gl_y];
    const mask = G.gothicMask(8, 46, 7);
    G.shape(x, X + 2, Y + 3, 8, 46, (i, j) => mask(i, j) ? (j % 7 === 0 || (i === 4 && j > 10) ? P.gl_lead : cols[(Math.floor(j / 7) + i) % cols.length]) : false);
  }

  // ventilador de parede (preto), como os da capela
  function wallFan(x, X, Y, side) {
    G.rect(x, X - side * 1, Y - 1, 3, 4, '#1a1a1a');
    const cx = X + side * 5, cy = Y + 1;
    G.ellipse(x, cx, cy, 4, 4, '#26262a'); G.ellipse(x, cx, cy, 3, 3, '#1a1a1e');
    for (const a of [0.3, 2.4, 4.5]) G.line(x, cx, cy, cx + Math.cos(a) * 3, cy + Math.sin(a) * 3, '#3a3a40');
    G.ellipse(x, cx, cy, 1, 1, '#5a5a60');
  }

  function drawNave(x, cel) {
    const nx0 = 96, nx1 = 480; // paredes internas da nave única
    // piso de granito claro
    granite(x, nx0, K.naveTop, nx1 - nx0, H - K.naveTop - 24, 24, 101);
    // corredor central: granito mais claro com losangos pretos embutidos
    G.rect(x, CX - 20, K.naveTop, 40, H - K.naveTop - 24, '#e4e1da');
    G.noise(x, CX - 20, K.naveTop, 40, H - K.naveTop - 24, ['#d6d3cc', '#eceae4'], 55, 0.14);
    G.vline(x, CX - 20, K.naveTop, H - K.naveTop - 24, CH.joint); G.vline(x, CX + 19, K.naveTop, H - K.naveTop - 24, CH.joint);
    for (let y = K.naveTop + 30; y < H - 40; y += 52) {
      G.shape(x, CX - 10, y - 10, 21, 21, (i, j) => Math.abs(i - 10) + Math.abs(j - 10) <= 10 ? (Math.abs(i - 10) + Math.abs(j - 10) >= 9 ? '#4a4a4c' : '#1e1e20') : false);
    }
    // paredes laterais (topo espesso), espaço externo escuro
    G.rect(x, 0, 0, nx0 - 16, H, '#0c0908'); G.rect(x, nx1 + 16, 0, W - nx1 - 16, H, '#0c0908');
    A.wallTop(x, nx0 - 16, 0, 16, H); A.wallTop(x, nx1, 0, 16, H);
    // face interna das paredes: reboco branco
    G.rect(x, nx0, K.naveTop, 3, H - K.naveTop - 24, CH.wall3); G.rect(x, nx1 - 3, K.naveTop, 3, H - K.naveTop - 24, CH.wall3);
    // vitrais, mísulas das nervuras, via-sacra e ventiladores
    const designs = ['agnus', 'spiritus', 'geo', 'petrus', 'joseph', 'agnus'];
    for (let k = 0; k < 6; k++) {
      const wy = 352 + k * 96;
      drawSideWindow(x, nx0 - 14, wy, designs[k]); drawSideWindow(x, nx1 + 2, wy, designs[(k + 2) % 6]);
    }
    for (let k = 0; k < 7; k++) { const cy = 336 + k * 96; G.rect(x, nx0 - 4, cy, 6, 6, CH.grayM); G.hline(x, nx0 - 4, cy, 6, CH.grayM3); G.rect(x, nx1 - 2, cy, 6, 6, CH.grayM); G.hline(x, nx1 - 2, cy, 6, CH.grayM3); }
    for (let k = 0; k < 7; k++) { A.station(x, nx0 + 3, 372 + k * 80, k); A.station(x, nx1 - 13, 372 + k * 80, 7 + k); }
    for (const fy of [420, 612, 804]) { wallFan(x, nx0 + 2, fy, 1); wallFan(x, nx1 - 3, fy, -1); }
    // porta da capela de Nossa Senhora (parede esquerda)
    G.rect(x, nx0 - 16, 556, 16, 52, '#0e0a08'); G.rect(x, nx0 - 3, 556, 3, 52, CH.grayM2);
    G.shape(x, nx0 - 16, 550, 16, 10, G.roundArchMask(16, 10), CH.grayM);
    // porta da sacristia (parede direita do presbitério): vermelha
    G.rect(x, nx1, 194, 16, 46, CH.red2); G.rect(x, nx1 + 2, 196, 12, 42, CH.red); G.vline(x, nx1 + 8, 196, 42, CH.red2); G.px(x, nx1 + 3, 218, '#d8b060');
    // degrau do arco do presbitério
    G.rect(x, nx0, K.naveTop - 14, nx1 - nx0, 2, CH.grayM2);
    // parede do fundo e portas principais de madeira
    A.wallTop(x, nx0 - 16, H - 24, nx1 - nx0 + 32, 24);
    G.rect(x, CX - 28, H - 24, 56, 24, CH.wood3); G.rect(x, CX - 26, H - 22, 25, 20, CH.wood); G.rect(x, CX + 1, H - 22, 25, 20, CH.wood);
    G.vline(x, CX, H - 22, 20, CH.wood3); G.rect(x, CX - 4, H - 13, 2, 2, P.g4); G.rect(x, CX + 2, H - 13, 2, 2, P.g4);
    for (let i = CX - 24; i < CX + 24; i += 6) G.vline(x, i, H - 20, 16, CH.wood2);
    // pias de água benta junto às portas
    for (const hx of [CX - 44, CX + 44]) { G.ellipse(x, hx, H - 32, 6, 4, CH.grayM2); G.ellipse(x, hx, H - 33, 5, 3, CH.marble); G.ellipse(x, hx, H - 33, 3.5, 2, '#9fc4d4'); }
    // pia batismal pequena (fundo à esquerda da porta)
    G.ellipse(x, 196, 966, 9, 6, CH.grayM2); G.ellipse(x, 196, 965, 8, 5, CH.marble); G.ellipse(x, 196, 965, 5.5, 3, '#9fc4d4');
    // confessionário de madeira (fundo, à direita)
    G.rect(x, 430, 892, 46, 46, CH.wood); G.rect(x, 432, 894, 42, 6, CH.wood2); G.rect(x, 434, 902, 12, 34, CH.wood3); G.rect(x, 448, 902, 12, 34, '#5a1018'); G.rect(x, 462, 902, 12, 34, CH.wood3);
    G.rect(x, 450, 886, 8, 8, P.g4); G.rect(x, 453, 882, 2, 6, P.g5);
    void cel;
  }

  // ------------------------------------------------------------------
  DG.maps.church = function (cel, opts) {
    opts = opts || {};
    const sc = new DG.Scene({ id: 'church', name: 'Capela São Pio X', w: W, h: H, ambient: '#958f84' });
    sc.K = K; sc.CX = CX;
    // estado dinâmico (alterado pelo rito)
    sc.state = Object.assign({
      candles: [false, false, false, false, false, false],
      missal: { at: 'epistle', open: false }, // epistle | gospel | credence | carried | none
      chalice: 'none',                          // none | veiled | corporal | open
      credence: { cruets: true, lavabo: true, towel: true, bell: true, paten: true, card: true },
      biretta: false, gateOpen: false, tabernacleOpen: false, altarCover: false, sideCandles: true,
      pascalCandle: (cel.id === 'pascha' || cel.id === 'asc') ? 'lit' : null, // apagado depois do Evangelho da Ascensão
    }, opts.state || {});

    // ---------- fundo pré-renderizado ----------
    const bgc = G.canvas(W, H); const x = bgc.x;
    G.rect(x, 0, 0, W, H, P.st0);
    drawNave(x, cel);
    drawSanctuaryFloor(x);
    drawApseWall(x, cel);
    drawAltar(x, cel);
    drawSteps(x);
    // credência (topo) e sedília (bancos) — mobiliário fixo
    G.rect(x, 410, 176, 36, 20, P.l4); G.hline(x, 410, 176, 36, P.l5); G.rect(x, 410, 196, 36, 6, P.w3); G.rect(x, 412, 202, 3, 6, P.w2); G.rect(x, 441, 202, 3, 6, P.w2);
    for (let i = 410; i < 446; i += 2) G.px(x, i, 196, P.l2);
    G.rect(x, 424, 236, 46, 8, P.w4); G.hline(x, 424, 236, 46, P.w6); G.rect(x, 424, 228, 46, 8, '#7a1a22'); G.rect(x, 424, 244, 46, 4, P.w2);
    G.rect(x, 424, 222, 46, 6, P.w3); G.hline(x, 424, 222, 46, P.w5);
    // imagem de Nossa Senhora (lado do Evangelho)
    A.statue(x, 124, 222, 'maria', 1.05);
    // imagem de São Pio X, padroeiro da capela (fundo da nave, à esquerda)
    G.rect(x, 104, 934, 40, 4, P.st4); G.hline(x, 104, 934, 40, P.st6);
    A.statue(x, 124, 934, 'pius', 1.15);
    A.floorCandle(x, 108, 936, false); A.floorCandle(x, 140, 936, false);
    // quadro de avisos junto às portas
    A.noticeBoard(x, 360, 998);
    // genuflexório da comunhão (do lado da nave)
    G.rect(x, K.apse.x, K.railY + 10, K.apse.w, 6, P.w3); G.hline(x, K.apse.x, K.railY + 10, K.apse.w, P.w5); G.hline(x, K.apse.x, K.railY + 15, K.apse.w, P.w1);
    // degrau do arco
    G.hline(x, K.apse.x, K.naveTop - 1, K.apse.w, P.st3);
    // bancos: assentos (no fundo); encostos são objetos
    const rows = [];
    for (let k = 0; k < 20; k++) rows.push(356 + k * 26);
    for (const ry of rows) { A.pewSeat(x, 144, ry + 6, 120); A.pewSeat(x, 312, ry + 6, 120); }
    // sombra suave sob o altar
    G.dither(x, K.predella.x, K.predella.y - 2, K.predella.w, 3, '#000000', 0.25);
    sc.bg = bgc.c;

    // ---------- colisão ----------
    sc.block(0, 0, W, 16); sc.block(0, H - 24, W, 24);
    sc.block(0, 0, 96, H); sc.block(480, 0, 96, H);           // paredes da nave única
    sc.free(480, 196, 16, 42);                                   // porta da sacristia
    sc.free(80, 558, 16, 48);                                    // porta da capela de Nossa Senhora
    sc.block(96, 0, 384, K.wallBottom + 2);
    sc.block(K.mensa.x - 3, K.wallBottom, K.mensa.w + 6, K.mensa.top + K.mensa.front);
    sc.block(410, 174, 36, 30);      // credência
    sc.block(424, 222, 46, 26);      // sedília
    sc.block(112, 210, 24, 14);      // imagem de Nossa Senhora
    sc.block(102, 920, 44, 18);      // imagem de São Pio X
    sc.block(346, 988, 28, 10);      // quadro de avisos
    sc.block(K.apse.x, K.railY - 2, CX - 16 - K.apse.x, 12); sc.block(CX + 16, K.railY - 2, K.apse.x + K.apse.w - CX - 16, 12);
    sc.block(430, 890, 46, 48);      // confessionário
    sc.block(186, 960, 20, 10);      // pia batismal
    for (const ry of rows) { sc.block(144, ry - 4, 120, 6); sc.block(312, ry - 4, 120, 6); }
    sc.gateBlock = () => { if (sc.state.gateOpen) sc.free(CX - 16, K.railY - 2, 32, 12); else sc.block(CX - 16, K.railY - 2, 32, 12); };
    sc.gateBlock();
    // superfícies (som dos passos)
    sc.surfaces.push({ x: K.predella.x, y: K.predella.y, w: K.predella.w, h: K.predella.h, kind: 'wood' });
    for (const ry of rows) { sc.surfaces.push({ x: 144, y: ry - 16, w: 120, h: 24, kind: 'wood' }); sc.surfaces.push({ x: 312, y: ry - 16, w: 120, h: 24, kind: 'wood' }); }

    // encostos dos bancos
    for (const ry of rows) {
      sc.addProp({ x: 204, y: ry + 8, sortY: ry + 8, draw(x, sx, sy) { A.pewBack(x, sx - 60, sy, 120); } });
      sc.addProp({ x: 372, y: ry + 8, sortY: ry + 8, draw(x, sx, sy) { A.pewBack(x, sx - 60, sy, 120); } });
    }

    // ---------- objetos dinâmicos do altar ----------
    // castiçais do altar (6), acesos conforme o estado
    K.candlesX.forEach((cx, i) => {
      sc.addProp({ id: 'candle' + i, x: cx, y: K.candleBaseY, sortY: 110, examine: 'candelabrum',
        hit: { x: cx - 4, y: K.candleBaseY - 34, w: 8, h: 36 },
        draw(x, sx, sy, t) {
          sx = Math.round(sx); sy = Math.round(sy);
          DG.spr.lathe(x, sx, sy - 14, 14, j => (j < 2 ? 2 : j < 9 ? 0.8 + (j % 4 === 0 ? 0.8 : 0) : 1 + (j - 9) * 0.9), GOLD);
          const ch = 12;
          G.rect(x, sx - 1, sy - 14 - ch, 2, ch, P.l4); G.vline(x, sx, sy - 14 - ch, ch, P.l2);
          if (sc.state.candles[i]) A.flame(x, sx - 1 + 1, sy - 15 - ch, t, i);
          else G.px(x, sx, sy - 15 - ch, P.w1);
        } });
    });
    // estante e Missal
    sc.addProp({ id: 'missal', x: CX, y: 126, sortY: 126, examine: 'missale', hit: { x: 0, y: 0, w: 0, h: 0 },
      draw(x, sx, sy, t, scene, cam) {
        const m = sc.state.missal; if (m.at !== 'epistle' && m.at !== 'gospel') return;
        const px = m.at === 'epistle' ? 340 : 236;
        const X = Math.round(px - cam.x), Y = Math.round(sy);
        DG.spr.miniBook(x, X, Y + 6, m.open);
        if (m.at === 'gospel') G.px(x, X + 5, Y + 1, P.w2);
      } });
    // cálice sobre o altar
    sc.addProp({ id: 'chaliceAltar', x: CX, y: 132, sortY: 132, examine: 'calix',
      draw(x, sx, sy) {
        const s = sc.state.chalice; if (s === 'none') return;
        const X = Math.round(sx), Y = Math.round(sy);
        if (s === 'corporal' || s === 'open' || s === 'veiled') { G.rect(x, X - 9, Y - 4, 18, 5, P.l5); G.frame(x, X - 9, Y - 4, 18, 5, P.l3); }
        if (s === 'veiled' || s === 'corporal') DG.spr.miniChalice(x, X, Y, cel.color, true);
        if (s === 'open') { DG.spr.miniChalice(x, X, Y, cel.color, false); G.rect(x, X - 2, Y - 10, 5, 1, P.l4); }
        if (s === 'open' || s === 'corporal') { G.rect(x, X - 34 - 4, Y - 6, 7, 6, (DG.LIT[cel.color] || DG.LIT.albus).main[1]); } // bolsa no lado do Evangelho
      } });
    // credência: galhetas, bacia, toalha, campainha, patena, cartão
    sc.addProp({ id: 'credence', x: 428, y: 196, sortY: 196, examine: 'credentia', interact: { label: 'Credência' }, hit: { x: 408, y: 168, w: 40, h: 34 }, ix: 428, iy: 206,
      draw(x, sx, sy) {
        const c = sc.state.credence; const X = Math.round(sx), Y = Math.round(sy);
        if (c.cruets) DG.spr.miniCruets(x, X - 9, Y - 10);
        if (c.lavabo) { G.ellipse(x, X + 4, Y - 11, 4, 1.5, P.g4); G.ellipse(x, X + 4, Y - 11.5, 2.5, 0.8, '#9fc4d4'); }
        if (c.towel) G.rect(x, X + 9, Y - 15, 5, 4, P.l3);
        if (c.bell) DG.spr.miniBell(x, X + 12, Y - 4);
        if (c.paten) { G.ellipse(x, X - 1, Y - 5, 3, 1, P.g4); }
        if (c.card) G.rect(x, X - 14, Y - 7, 4, 4, P.l4);
      } });
    // barrete sobre a sedília
    sc.addProp({ id: 'birettaSeat', x: 446, y: 232, sortY: 232, draw(x, sx, sy) { if (!sc.state.biretta) return; G.rect(x, Math.round(sx) - 3, Math.round(sy) - 4, 6, 3, '#151417'); G.px(x, Math.round(sx), Math.round(sy) - 5, '#2a2a30'); } });
    sc.addProp({ id: 'sedilia', x: 446, y: 244, sortY: 236, examine: 'sedilia', hit: { x: 424, y: 220, w: 46, h: 28 } });
    // portão da balaustrada
    sc.addProp({ id: 'gate', x: CX, y: K.railY + 6, sortY: K.railY + 6, examine: 'cancelli', hit: { x: CX - 16, y: K.railY - 6, w: 32, h: 16 },
      draw(x, sx, sy) {
        const X = Math.round(sx), Y = Math.round(sy);
        if (sc.state.gateOpen) { G.rect(x, X - 16, Y - 14, 3, 12, CH.wood2); G.rect(x, X + 13, Y - 14, 3, 12, CH.wood2); return; }
        G.rect(x, X - 16, Y - 9, 32, 3, CH.wood2); G.hline(x, X - 16, Y - 9, 32, '#9a5a34');
        for (let i = -15; i < 15; i += 5) { G.vline(x, X + i, Y - 6, 7, CH.wood); G.px(x, X + i + 2, Y - 5, CH.wood); }
        G.rect(x, X - 1, Y - 10, 2, 11, CH.wood3);
      } });
    // balaustrada de mármore (objeto com altura, ordenado com os personagens)
    const railImg = G.cached('railWood', K.apse.w, 16, (rx) => {
      for (let i = 0; i < K.apse.w; i++) {
        const gx = K.apse.x + i;
        if (gx >= CX - 16 && gx < CX + 16) continue;
        const k = i % 8;
        if (k === 0 || k === 1) G.vline(rx, i, 4, 10, k === 0 ? CH.wood3 : CH.wood);
        else { const arch = Math.abs(k - 4.5) <= 1.5 ? 7 : 6; G.px(rx, i, arch, CH.wood); G.px(rx, i, 5, CH.wood2); }
      }
      const seg = (a, b) => { G.rect(rx, a, 0, b - a, 4, CH.wood2); G.hline(rx, a, 0, b - a, '#9a5a34'); G.hline(rx, a, 3, b - a, CH.wood3); G.rect(rx, a, 13, b - a, 3, CH.wood3); };
      seg(0, CX - 16 - K.apse.x); seg(CX + 16 - K.apse.x, K.apse.w);
      for (const px of [CX - 20 - K.apse.x, CX + 16 - K.apse.x]) { G.rect(rx, px, 0, 4, 16, CH.wood); G.vline(rx, px, 0, 16, CH.wood2); G.vline(rx, px + 3, 0, 16, CH.wood3); }
    });
    sc.addProp({ id: 'railProp', x: K.apse.x, y: K.railY + 8, sortY: K.railY + 8, draw(x, sx, sy) {
      x.drawImage(railImg, Math.round(sx), Math.round(sy) - 16);
      if (sc.state.communionCloth) { G.rect(x, Math.round(sx), Math.round(sy) - 16, K.apse.w, 3, P.l4); }
    } });
    // lâmpada do Santíssimo (pendente)
    sc.addProp({ id: 'lamp', x: 156, y: 200, sortY: 400, examine: 'lampas', hit: { x: 148, y: 132, w: 16, h: 22 },
      draw(x, sx, sy, t) {
        const X = Math.round(sx), Y = Math.round(sy) - 58;
        G.vline(x, X, Y - 150, 140, '#2a1e12');
        DG.spr.lathe(x, X, Y - 10, 10, j => (j < 2 ? 5 : 5 - (j - 2) * 0.5), GOLD);
        G.rect(x, X - 2, Y - 13, 5, 4, '#b3122a'); G.px(x, X, Y - 14 - (Math.sin(t * 9) > 0.6 ? 1 : 0), '#ff7a50');
      } });
    // círio pascal (Tempo Pascal)
    if (sc.state.pascalCandle) sc.addProp({ id: 'pascal', x: 212, y: 206, sortY: 206, examine: 'cereus',
      draw(x, sx, sy, t) { const X = Math.round(sx), Y = Math.round(sy); DG.spr.lathe(x, X, Y - 16, 16, j => (j < 3 ? 3 : 1.4 + (j > 12 ? (j - 12) : 0)), GOLD); G.rect(x, X - 2, Y - 34, 4, 18, P.l4); G.rect(x, X - 1, Y - 28, 2, 6, P.v4); if (sc.state.pascalCandle === 'lit') A.flame(x, X, Y - 35, t, 3); } });
    if (sc.state.pascalCandle) sc.block(206, 202, 12, 6);
    // capela lateral, batistério, confessionário (exame)
    sc.addProp({ id: 'font', x: 196, y: 972, examine: 'fons', hit: { x: 184, y: 956, w: 24, h: 18 }, interact: { label: 'Examinar a pia batismal' } });
    sc.addProp({ id: 'confess', x: 453, y: 940, examine: 'confessionale', hit: { x: 430, y: 880, w: 46, h: 58 }, interact: { label: 'Examinar o confessionário' } });
    sc.addProp({ id: 'tabernacle', x: CX, y: 124, examine: 'tabernaculum', hit: { x: CX - 16, y: 70, w: 32, h: 50 } });
    sc.addProp({ id: 'crucifix', x: CX, y: 80, examine: 'crucifixus', hit: { x: CX - 18, y: 0, w: 36, h: 70 } });
    sc.addProp({ id: 'cards', x: CX, y: 124, examine: 'sacrae', hit: { x: CX - 9, y: 116, w: 18, h: 12 } });
    sc.addProp({ id: 'frontal', x: CX, y: 150, examine: 'antependium', hit: { x: K.mensa.x, y: 138, w: K.mensa.w, h: 16 } });
    sc.addProp({ id: 'rail', x: 160, y: 312, examine: 'cancelli', hit: { x: 100, y: 304, w: 150, h: 16 } });
    sc.addProp({ id: 'statueMaria', x: 124, y: 222, examine: 'imagoMariae', hit: { x: 112, y: 182, w: 24, h: 42 } });
    sc.addProp({ id: 'window1', x: 88, y: 420, examine: 'vitrum', hit: { x: 82, y: 352, w: 14, h: 52 } });
    sc.addProp({ id: 'window2', x: 488, y: 420, examine: 'vitrum', hit: { x: 480, y: 352, w: 14, h: 52 } });
    sc.addProp({ id: 'notices', x: 360, y: 998, examine: 'tabulaNotitiarum', hit: { x: 346, y: 962, w: 28, h: 36 } });
    sc.addProp({ id: 'statuePius', x: 124, y: 934, examine: 'imagoPii', hit: { x: 110, y: 886, w: 28, h: 50 }, interact: { label: 'Rezar diante de São Pio X' }, ix: 124, iy: 950,
      onUse: async () => {
        const p = DG.game.player; if (!p || sc.praying || DG.game.state === 'rite') return;
        sc.praying = true;
        await p.walkTo(124, 950, { facing: 'up' });
        await p.play('ajoelhar');
        const role = DG.game.role === 'sacerdos' ? 'P' : 'M';
        const la = 'Sancte Pie Décime, ora pro nobis.';
        DG.emit('rite:say', { who: role, la, pt: 'São Pio X, rogai por nós.', voice: 'submissa' });
        await DG.voice.speak(la, { role: role === 'P' ? 'priest' : 'server', volume: 0.6 }).promise;
        await DG.wait(1.2);
        DG.hud.hideSay();
        sc.praying = false;
      } });

    // ---------- pontos e zonas ----------
    const pts = sc.points;
    pts.P_mid = { x: CX, y: 162, facing: 'up' };
    pts.P_ep = { x: 338, y: 162, facing: 'up' };
    pts.P_ev = { x: 238, y: 162, facing: 'up' };
    pts.P_foot = { x: CX, y: 196, facing: 'up' };
    pts.P_epCorner = { x: 354, y: 164, facing: 'right' }; // canto da Epístola (lavabo e galhetas)
    pts.M_foot = { x: 270, y: 202, facing: 'up' };
    pts.M_stepEv = { x: 206, y: 189, facing: 'up' };
    pts.M_stepEp = { x: 370, y: 189, facing: 'up' };
    pts.M_floorEp = { x: 372, y: 200, facing: 'up' };
    pts.M_floorEv = { x: 204, y: 200, facing: 'up' };
    pts.M_midFloor = { x: CX, y: 198, facing: 'up' };
    pts.M_cruets = { x: 370, y: 170, facing: 'left' };  // degrau superior, canto da Epístola
    pts.M_consecr = { x: 304, y: 166, facing: 'up' };    // de joelhos no supedâneo, à direita do sacerdote
    pts.M_credence = { x: 428, y: 208, facing: 'up' };
    pts.M_sedilia = { x: 446, y: 252, facing: 'up' };
    pts.M_missalEp = { x: 344, y: 166, facing: 'up' };
    pts.M_missalEv = { x: 232, y: 166, facing: 'up' };
    pts.M_evStand = { x: 214, y: 196, facing: 'right' };
    pts.M_epStand = { x: 362, y: 196, facing: 'left' };
    pts.M_communion = { x: 300, y: 166, facing: 'up' };
    pts.M_railServer = { x: CX + 10, y: 302, facing: 'down' };
    pts.P_rail = { x: CX - 6, y: 302, facing: 'down' };
    pts.sacristyDoor = { x: 470, y: 216, facing: 'left' };
    pts.entry = { x: CX, y: 990, facing: 'up' };
    pts.chapelDoor = { x: 108, y: 584, facing: 'right' };
    const zones = sc.zones;
    zones.predella = { x: K.predella.x, y: K.predella.y, w: K.predella.w, h: K.predella.h };
    zones.steps = { x: 172, y: 166, w: 232, h: 24 };
    zones.sanctuary = { x: 96, y: 128, w: 384, h: K.railY - 128 };
    zones.middle = { x: CX - 8, y: 150, w: 16, h: 60 };       // faixa do meio diante do altar
    zones.epSide = { x: CX + 8, y: 150, w: 120, h: 64 };
    zones.evSide = { x: 160, y: 150, w: CX - 8 - 160, h: 64 };
    zones.credence = { x: 404, y: 196, w: 48, h: 22 };
    zones.P_ep = { x: 326, y: 154, w: 30, h: 14 };
    zones.P_ev = { x: 222, y: 154, w: 30, h: 14 };
    zones.P_mid = { x: CX - 10, y: 154, w: 20, h: 14 };
    zones.P_foot = { x: CX - 12, y: 190, w: 24, h: 14 };
    zones.M_stepEp = { x: 352, y: 180, w: 40, h: 16 };
    zones.M_stepEv = { x: 184, y: 180, w: 40, h: 16 };
    zones.M_foot = { x: 254, y: 192, w: 26, h: 16 };
    zones.M_cruets = { x: 358, y: 160, w: 28, h: 18 };
    zones.M_consecr = { x: 294, y: 154, w: 22, h: 16 };
    zones.nave = { x: 96, y: K.naveTop, w: 384, h: H - K.naveTop - 24 };

    // ---------- portas ----------
    sc.doors.push({ x: 480, y: 196, w: 16, h: 42, to: 'sacristy', spawn: 'churchDoor', label: 'Ir à sacristia' });
    sc.doors.push({ x: 80, y: 558, w: 16, h: 48, to: 'chapel', spawn: 'naveDoor', label: 'Capela de Nossa Senhora' });
    sc.doors.push({ x: CX - 28, y: H - 26, w: 56, h: 4, to: null, exit: true, label: 'Portas principais (fechadas durante a celebração)', labelExplore: 'Sair da igreja' });

    // ---------- luz ----------
    sc.lighting.lights = [];
    K.candlesX.forEach((cx, i) => sc.lighting.lights.push({ id: 'c' + i, x: cx, y: 93, r: 46, color: '#ffc36a', intensity: 0.42, flicker: true, halo: 5, off: true }));
    sc.lighting.lights.push({ x: 156, y: 140, r: 44, color: '#ff4030', intensity: 0.38, flicker: true, halo: 9 });
    sc.lighting.lights.push({ x: CX, y: 60, r: 160, color: '#fff6e6', intensity: 0.32 }); // parede branca do fundo
    sc.lighting.lights.push({ x: CX, y: 230, r: 190, color: '#ece6da', intensity: 0.42 });
    for (let k = 0; k < 7; k++) sc.lighting.lights.push({ x: CX, y: 400 + k * 90, r: 240, color: '#e2ddd2', intensity: 0.38 }); // lâmpadas do teto
    if (sc.state.pascalCandle) sc.lighting.lights.push({ id: 'pascal', x: 212, y: 170, r: 40, color: '#ffc36a', intensity: 0.4, flicker: true, halo: 8 });
    // sol pelos vitrais das paredes laterais
    sc.lighting.shafts = [];
    for (let k = 0; k < 6; k++) {
      sc.lighting.shafts.push({ x0: 84, x1: 94, y0: 356 + k * 96, fx0: 150, fx1: 230, fy: 420 + k * 96, color: ['#c8d4ff', '#ffe2a8', '#ffd0b8'][k % 3], alpha: 0.26 });
      sc.lighting.shafts.push({ x0: 482, x1: 492, y0: 356 + k * 96, fx0: 346, fx1: 426, fy: 420 + k * 96, color: ['#ffe2a8', '#c8d4ff', '#ffd0b8'][k % 3], alpha: 0.22 });
    }
    sc.dustAreas = [{ x: 120, y: 360, w: 120, h: 520, rate: 2 }, { x: 340, y: 360, w: 120, h: 520, rate: 2 }];

    sc.camBounds = { x0: 0, y0: 0, x1: W - DG.W, y1: H - DG.H };
    sc.syncLights = () => {
      sc.lighting.lights.forEach(l => { if (l.id && l.id[0] === 'c' && l.id.length === 2) l.off = !sc.state.candles[+l.id[1]]; if (l.id === 'pascal') l.off = sc.state.pascalCandle !== 'lit'; });
    };
    sc.syncLights();
    sc.onUpdate = () => { sc.syncLights(); };
    return sc;
  };
  DG.maps.churchK = K;
})(window.DG = window.DG || {});
