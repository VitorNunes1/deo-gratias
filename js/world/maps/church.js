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

  function drawReredos(x, cel) {
    const R = K.reredos;
    const tab = (DG.LIT[cel.tabernacleColor] || DG.LIT.albus).main;
    // fundo do nicho central em azul profundo com raios dourados (glória)
    G.rect(x, R.x + 8, R.y + 8, R.w - 16, R.h - 8, P.b1);
    // corpo do retábulo: talha dourada
    G.rect(x, R.x, R.y + 14, R.w, R.h - 14, P.g2);
    G.dither(x, R.x, R.y + 14, R.w, R.h - 14, P.g1, 0.25);
    // nichos laterais (arcos redondos) com imagens
    const niches = [[R.x + 30, 'petrus'], [R.x + R.w - 30, 'paulus']];
    for (const [nx, kind] of niches) {
      G.shape(x, nx - 12, R.y + 30, 25, 60, G.roundArchMask(25, 60), P.v1);
      G.shape(x, nx - 11, R.y + 31, 23, 58, G.roundArchMask(23, 58), P.v2);
      G.dither(x, nx - 11, R.y + 31, 23, 58, P.v1, (i, j) => j / 80);
      A.statue(x, nx, R.y + 92, kind, 0.95);
      G.shape(x, nx - 13, R.y + 29, 27, 6, (i, j) => { const d = Math.hypot(i - 13, j - 13); return d <= 13.5 && d >= 12; }, P.g5);
    }
    // nicho central com glória de raios
    const gx = CX, gy = R.y + 52;
    G.shape(x, CX - 34, R.y + 10, 69, 106, G.roundArchMask(69, 106), P.b1);
    for (let a = 0; a < 28; a++) {
      const ang = -Math.PI + a / 27 * Math.PI;
      G.line(x, gx, gy, gx + Math.cos(ang) * 40, gy + Math.sin(ang) * 40, a % 2 ? P.g3 : P.g2);
    }
    G.ellipse(x, gx, gy, 14, 14, P.g4); G.ellipse(x, gx, gy, 11, 11, P.g5); G.ellipse(x, gx, gy, 8, 8, P.g6);
    // pomba do Espírito Santo no topo da glória
    G.ellipse(x, gx, R.y + 22, 3, 2, P.l5); G.line(x, gx - 6, R.y + 21, gx + 6, R.y + 21, P.l4); G.px(x, gx + 3, R.y + 21, P.l2);
    // colunas salomônicas (torsas) — 2 pares
    const colX = [R.x + 10, R.x + 50, R.x + R.w - 51, R.x + R.w - 11];
    for (const c of colX) {
      for (let j = 0; j < 80; j++) {
        const yy = R.y + 26 + j;
        const tw = Math.sin(j * 0.45) * 1.5;
        const left = c - 3;
        for (let i = 0; i < 7; i++) {
          const ph = (i - 3 - tw) / 3.5;
          const k = U.clamp(Math.floor((ph + 1) / 2 * GOLD.length), 0, GOLD.length - 1);
          G.px(x, left + i, yy, GOLD[k]);
        }
        if (j % 6 === 0) G.px(x, c + Math.round(tw), yy, P.g7);
        if (j % 9 === 3) { G.px(x, c - 2, yy, '#3d7a3a'); G.px(x, c + 2, yy + 1, P.v4); } // folhas de videira e uvas
      }
      G.rect(x, c - 5, R.y + 20, 11, 6, P.g4); G.hline(x, c - 5, R.y + 20, 11, P.g6); // capitel
      G.rect(x, c - 5, R.y + 106, 11, 6, P.g3); G.hline(x, c - 5, R.y + 106, 11, P.g5); // base
    }
    // entablamento e frontão curvo
    G.rect(x, R.x - 2, R.y + 12, R.w + 4, 8, P.g4); G.hline(x, R.x - 2, R.y + 12, R.w + 4, P.g6); G.hline(x, R.x - 2, R.y + 19, R.w + 4, P.g1);
    for (let i = R.x; i < R.x + R.w; i += 4) G.px(x, i, R.y + 16, P.g2);
    G.shape(x, CX - 40, R.y - 6, 81, 18, (i, j) => { const d = Math.hypot(i - 40, (j - 18) * 2.2); return d <= 40 && d >= 35; }, P.g4);
    // emblema da Fraternidade Sacerdotal São Pio X no coroamento do retábulo
    G.ellipse(x, CX, R.y + 3, 9, 8, P.b1);
    DG.emblem.draw(x, CX, R.y - 5, 16, 'gold');
    // volutas e anjinhos sobre as colunas externas
    for (const c of [colX[0], colX[3]]) { G.ellipse(x, c, R.y + 8, 3, 3, P.g4); G.ellipse(x, c, R.y + 8, 1.5, 1.5, P.g2); G.ellipse(x, c, R.y + 3, 2, 2, '#f0d4b8'); G.px(x, c - 3, R.y + 3, P.l4); G.px(x, c + 3, R.y + 3, P.l4); }
    // anjos adoradores ajoelhados ao lado do trono
    for (const [ax, dir] of [[CX - 26, 1], [CX + 26, -1]]) {
      G.shape(x, ax - 5, R.y + 74, 11, 14, (i, j) => Math.abs(i - 5) <= 2 + j * 0.25, '#efe9dc');
      G.ellipse(x, ax, R.y + 72, 2.5, 2.5, '#f2d6bb'); G.rect(x, ax - 2, R.y + 69, 5, 2, '#c79a4a');
      G.shape(x, ax - 8 * dir - (dir < 0 ? 5 : 0), R.y + 66, 6, 12, (i, j) => j > (dir > 0 ? (5 - i) : i) * 1.4, '#f7f2e6');
      G.rect(x, ax + dir * 2, R.y + 76, 2, 2, '#f2d6bb');
    }
    // painel de mármore escuro atrás dos castiçais (faz sobressair o metal dourado)
    G.rect(x, R.x + 14, R.y + 96, R.w - 28, 26, P.md2); G.dither(x, R.x + 14, R.y + 96, R.w - 28, 26, P.md3, 0.35);
    G.hline(x, R.x + 14, R.y + 96, R.w - 28, P.g4);
    // trono e crucifixo do altar (cruz de ébano com bordas de ouro)
    const crX = CX, cTop = R.y + 26, cBar = R.y + 40, cBot = R.y + 80;
    G.rect(x, crX - 2, cTop, 5, cBot - cTop, '#1f130c'); G.rect(x, crX - 13, cBar, 27, 5, '#1f130c');
    G.vline(x, crX - 2, cTop, cBot - cTop, P.g4); G.vline(x, crX + 2, cTop, cBot - cTop, P.g2);
    G.hline(x, crX - 13, cBar, 27, P.g4); G.hline(x, crX - 13, cBar + 4, 27, P.g2);
    for (const [ex, ey] of [[crX, cTop - 1], [crX - 14, cBar + 2], [crX + 14, cBar + 2]]) { G.rect(x, ex - 1, ey - 1, 3, 3, P.g5); G.px(x, ex, ey, P.g7); }
    G.rect(x, crX - 2, cTop + 2, 5, 3, P.l4); G.px(x, crX, cTop + 3, P.v3); // INRI
    // corpo de Cristo (marfim)
    G.ellipse(x, crX, cBar - 3, 1.6, 1.8, '#efdcc2'); G.px(x, crX - 1, cBar - 5, '#3a2416'); G.px(x, crX + 1, cBar - 5, '#3a2416');
    G.shape(x, crX - 2, cBar - 1, 5, 18, (i, j) => j < 12 ? Math.abs(i - 2) <= 1.5 - j * 0.04 + 0.5 : Math.abs(i - 2) <= 1, '#efdcc2');
    G.line(x, crX - 2, cBar + 1, crX - 12, cBar + 1, '#efdcc2'); G.line(x, crX + 2, cBar + 1, crX + 12, cBar + 1, '#efdcc2');
    G.line(x, crX - 2, cBar + 2, crX - 10, cBar + 3, '#d9c3a6'); G.line(x, crX + 2, cBar + 2, crX + 10, cBar + 3, '#d9c3a6');
    G.rect(x, crX - 2, cBar + 9, 5, 3, '#fbf6ea'); // perizônio
    G.px(x, crX - 12, cBar + 1, '#a3161c'); G.px(x, crX + 12, cBar + 1, '#a3161c'); G.px(x, crX + 1, cBar + 5, '#a3161c');
    G.rect(x, crX - 5, cBot, 11, 3, P.g4); G.hline(x, crX - 5, cBot, 11, P.g6); // pé da cruz
    if (cel.tempus === 'passionis') { // cruz velada de roxo
      G.shape(x, crX - 12, R.y + 32, 25, 50, (i, j) => j >= Math.abs(i - 12) * 0.5, (DG.LIT.violaceus).main[1]);
      G.dither(x, crX - 12, R.y + 32, 25, 50, (DG.LIT.violaceus).main[2], 0.25);
      for (const [nx] of niches) G.rect(x, nx - 9, R.y + 40, 19, 48, (DG.LIT.violaceus).main[1]);
    }
    // sacrário (tabernáculo) dourado com conopeu
    const tX = CX - 14, tY = K.wallBottom - 44;
    G.rect(x, tX - 2, tY - 6, 32, 6, P.g4); G.shape(x, tX - 2, tY - 14, 32, 9, (i, j) => j >= Math.abs(i - 15.5) * 0.55, P.g5);
    G.rect(x, CX - 1, tY - 18, 3, 5, P.g6); G.rect(x, CX - 3, tY - 16, 7, 1, P.g6);
    G.rect(x, tX, tY, 28, 44, P.g3); G.rect(x, tX + 1, tY + 1, 26, 42, P.g4);
    G.rect(x, tX + 6, tY + 6, 16, 26, P.g2); G.rect(x, tX + 7, tY + 7, 14, 24, P.g5);
    G.rect(x, CX - 1, tY + 10, 3, 14, P.v3); G.rect(x, CX - 5, tY + 14, 11, 3, P.v3); // cruz na porta
    G.ellipse(x, CX, tY + 33, 1, 1, P.g6);
    // conopeu: cortinas laterais na cor do dia
    G.shape(x, tX - 3, tY - 4, 9, 48, (i, j) => i <= 6 - j * 0.04, tab[0]);
    G.shape(x, tX + 22, tY - 4, 9, 48, (i, j) => i >= 2 + j * 0.04, tab[0]);
    G.vline(x, tX + 2, tY, 44, tab[2]); G.vline(x, tX + 25, tY, 44, tab[2]);
    G.rect(x, tX - 3, tY - 5, 34, 3, tab[1]); G.hline(x, tX - 3, tY - 5, 34, (DG.TRIM.gold)[0]);
  }

  function drawAltar(x, cel) {
    const M = K.mensa;
    const fr = (DG.LIT[cel.frontalColor] || DG.LIT.albus).main;
    const tr = DG.TRIM[(DG.LIT[cel.frontalColor] || DG.LIT.albus).trim];
    // gradis (degraus dos castiçais) em mármore com filete dourado
    G.bevel(x, M.x + 2, K.wallBottom - 16, M.w - 4, 8, P.mb2, P.mb0, P.mb4);
    G.bevel(x, M.x - 2, K.wallBottom - 8, M.w + 4, 8, P.mb1, P.mb0, P.mb4);
    G.hline(x, M.x + 2, K.wallBottom - 10, M.w - 4, P.g4); G.hline(x, M.x - 2, K.wallBottom - 2, M.w + 4, P.g4);
    // flores (entre os castiçais)
    for (const fx of [254, 322]) {
      G.rect(x, fx - 2, K.wallBottom - 20, 5, 5, P.g4);
      const cols = cel.requiem || cel.tempus === 'quadragesimae' || cel.tempus === 'passionis' ? [] : ['#f3eee2', '#e8303a', '#f3eee2', '#f0c040', '#e8a0b0'];
      for (let k = 0; k < cols.length; k++) G.px(x, fx - 2 + k, K.wallBottom - 23 - (k % 2), cols[k]);
      if (cols.length) { G.px(x, fx, K.wallBottom - 25, '#f3eee2'); G.hline(x, fx - 1, K.wallBottom - 21, 3, '#3d7a3a'); }
    }
    // mesa do altar: tampo com as toalhas (vista superior)
    G.rect(x, M.x, M.y, M.w, M.top, P.l4);
    G.hline(x, M.x, M.y, M.w, P.l5); G.dither(x, M.x, M.y + 6, M.w, 4, P.l3, 0.3);
    // sacras (cartas do altar)
    DG.spr.miniCard(x, CX - 9, M.y - 9, 18, 12);
    DG.spr.miniCard(x, M.x + 14, M.y - 6, 10, 8);
    DG.spr.miniCard(x, M.x + M.w - 24, M.y - 6, 10, 8);
    // frontal (antependium)
    G.rect(x, M.x, M.y + M.top, M.w, M.front, fr[0]);
    G.dither(x, M.x, M.y + M.top, M.w, M.front, fr[1], (i, j) => 0.2 + j / M.front * 0.5);
    G.frame(x, M.x + 2, M.y + M.top + 2, M.w - 4, M.front - 3, tr[1]);
    G.rect(x, CX - 1, M.y + M.top + 4, 3, 9, tr[0]); G.rect(x, CX - 4, M.y + M.top + 7, 9, 3, tr[0]);
    for (let i = M.x + 10; i < M.x + M.w - 10; i += 20) { G.px(x, i, M.y + M.top + 8, tr[1]); G.px(x, i + 1, M.y + M.top + 7, tr[1]); G.px(x, i - 1, M.y + M.top + 9, tr[1]); }
    // toalha caindo pelas laterais
    G.rect(x, M.x - 3, M.y, 3, M.top + M.front - 2, P.l3); G.rect(x, M.x + M.w, M.y, 3, M.top + M.front - 2, P.l3);
    for (let j = M.y; j < M.y + M.top + M.front - 2; j += 3) { G.px(x, M.x - 3, j, P.l1); G.px(x, M.x + M.w + 2, j, P.l1); }
    G.hline(x, M.x, M.y + M.top, M.w, P.l2); // franja da toalha sobre o frontal
    for (let i = M.x; i < M.x + M.w; i += 2) G.px(x, i, M.y + M.top + 1, P.l3);
  }

  function drawSteps(x) {
    const Pd = K.predella;
    // supedâneo (estrado) em madeira com tapete
    A.woodFloor(x, Pd.x, Pd.y, Pd.w, Pd.h, 41, true);
    A.carpet(x, Pd.x + 8, Pd.y + 1, Pd.w - 16, Pd.h - 1, ['#8a1d27', '#6e1620', '#4f0f17'], [P.g4, P.g2], false);
    G.hline(x, Pd.x, Pd.y + Pd.h - 1, Pd.w, P.w1);
    // degraus de mármore
    K.steps.forEach((s, i) => {
      const y = s.y;
      G.rect(x, s.x, y, s.w, K.stepH, P.mb1);
      G.hline(x, s.x, y, s.w, P.mb0); G.hline(x, s.x, y + 1, s.w, P.mb0);
      G.rect(x, s.x, y + 5, s.w, 3, P.mb3); G.hline(x, s.x, y + K.stepH - 1, s.w, P.mb4);
      G.noise(x, s.x, y + 2, s.w, 3, [P.mb2, P.mb3], 300 + i, 0.08);
      // passadeira vermelha central
      G.rect(x, CX - 22, y, 44, K.stepH - 1, '#7a1a22'); G.hline(x, CX - 22, y, 44, '#9a2a32'); G.rect(x, CX - 22, y + 5, 44, 2, '#5a1018');
      G.vline(x, CX - 22, y, K.stepH - 1, P.g3); G.vline(x, CX + 21, y, K.stepH - 1, P.g3);
    });
  }

  function drawSanctuaryFloor(x) {
    const ap = K.apse;
    A.marbleChecker(x, ap.x, 190, ap.w, K.railY - 190, 16, [P.mb0, P.mb1, P.mb3], [P.md0, P.md1, P.md2], 7);
    // faixa embutida e rosácea de mármore diante do altar
    G.frame(x, ap.x + 8, 194, ap.w - 16, K.railY - 200, P.g3);
    G.ellipse(x, CX, 250, 22, 14, P.mb3); G.ellipse(x, CX, 250, 20, 12.5, P.b2); G.ellipse(x, CX, 250, 14, 8.5, P.mb1); G.ellipse(x, CX, 250, 8, 5, P.md1);
    for (let a = 0; a < 8; a++) { const an = a / 8 * Math.PI * 2; G.px(x, CX + Math.cos(an) * 17, 250 + Math.sin(an) * 10.5, P.g5); }
    // tapete central até a balaustrada
    A.carpet(x, CX - 20, 190, 40, K.railY - 190, ['#7a1a22', '#62131b', '#4a0e14'], [P.g4, P.g2]);
    // piso do presbitério sob o supedâneo e degraus (laterais)
    A.marbleChecker(x, ap.x, 128, 76, 62, 16, [P.mb0, P.mb1, P.mb3], [P.md0, P.md1, P.md2], 9);
    A.marbleChecker(x, ap.x + ap.w - 76, 128, 76, 62, 16, [P.mb0, P.mb1, P.mb3], [P.md0, P.md1, P.md2], 11);
    G.rect(x, ap.x + 76, 128, 24, 62, P.mb1);
    G.rect(x, ap.x + ap.w - 100, 128, 24, 62, P.mb1);
    G.dither(x, ap.x, 128, ap.w, 14, P.st2, (i, j) => (1 - j / 14) * 0.5);
  }

  function drawApseWall(x, cel) {
    const ap = K.apse;
    A.ashlarWall(x, ap.x, 0, ap.w, K.wallBottom, 21);
    // pilastras e arcadas cegas
    for (const px of [ap.x + 12, ap.x + 84, ap.x + ap.w - 96, ap.x + ap.w - 24]) {
      G.rect(x, px, 0, 12, K.wallBottom, P.st6); G.vline(x, px, 0, K.wallBottom, P.st8); G.vline(x, px + 11, 0, K.wallBottom, P.st3);
      G.rect(x, px - 2, 34, 16, 4, P.st7); G.rect(x, px - 2, K.wallBottom - 6, 16, 6, P.st7);
    }
    // vitrais altos do presbitério
    A.lancet(x, ap.x + 36, 10, 30, 96, 'maria', 3);
    A.lancet(x, ap.x + ap.w - 66, 10, 30, 96, 'cor', 5);
    // lambri baixo
    G.rect(x, ap.x, K.wallBottom - 14, ap.w, 14, P.w2);
    G.hline(x, ap.x, K.wallBottom - 14, ap.w, P.w5);
    for (let i = ap.x + 4; i < ap.x + ap.w; i += 16) G.frame(x, i, K.wallBottom - 11, 12, 8, P.w1);
    drawReredos(x, cel);
  }

  function drawNave(x, cel) {
    // piso da nave: lajes de pedra clara
    A.squareTiles(x, 16, K.naveTop, W - 32, H - K.naveTop - 24, 20, ['#b9a98d', '#ae9e82', '#c3b498', '#94836a', '#5a2a24'], 101);
    // corredor central com tapete
    A.carpet(x, CX - 20, K.naveTop, 40, 660, ['#7a1a22', '#62131b', '#4a0e14'], [P.g4, P.g2]);
    // paredes laterais (topo espesso)
    A.wallTop(x, 0, 0, 16, H);
    A.wallTop(x, W - 16, 0, 16, H);
    G.rect(x, 16, 0, 80, K.naveTop, P.st1); G.rect(x, 480, 0, 80, K.naveTop, P.st1); // laterais do presbitério (sem acesso)
    A.wallTop(x, 80, 0, 16, K.naveTop - 14); A.wallTop(x, 480, 0, 16, 196); A.wallTop(x, 480, 238, 16, K.naveTop - 238 - 14);
    // arco triunfal / degrau do presbitério
    G.rect(x, 16, K.naveTop - 14, 80, 14, P.st3); G.rect(x, 480, K.naveTop - 14, 80, 14, P.st3);
    // estandartes da Fraternidade nas paredes laterais do presbitério
    A.banner(x, 64, 34, 30, 78); A.banner(x, 512, 34, 30, 78);
    // altares laterais
    drawSideAltar(x, 24, K.naveTop - 14, 'maria', cel);
    drawSideAltar(x, 488, K.naveTop - 14, 'joseph', cel);
    // vitrais nas paredes laterais (vistos de viés)
    for (let k = 0; k < 6; k++) {
      const wy = 380 + k * 100;
      drawSideWindow(x, 2, wy, ['agnus', 'spiritus', 'geo', 'petrus', 'geo', 'agnus'][k]);
      drawSideWindow(x, W - 14, wy, ['geo', 'joseph', 'agnus', 'geo', 'spiritus', 'geo'][k]);
    }
    // via-sacra
    for (let k = 0; k < 7; k++) { A.station(x, 18, 360 + k * 90, k); A.station(x, W - 28, 360 + k * 90, 7 + k); }
    // capela lateral (arco na parede esquerda)
    G.rect(x, 0, 560, 16, 44, '#120c09'); G.rect(x, 12, 560, 4, 44, P.st5);
    G.shape(x, 0, 554, 16, 10, G.roundArchMask(16, 10), P.st6);
    // batistério (fundo à esquerda)
    G.rect(x, 20, 900, 84, 80, P.st4); A.marbleChecker(x, 22, 902, 80, 76, 8, [P.mb0, P.mb1, P.mb3], [P.b2, P.b1, P.b0], 31);
    // parede do fundo e portas principais
    A.wallTop(x, 0, H - 24, W, 24);
    G.rect(x, CX - 28, H - 24, 56, 24, P.w2); G.rect(x, CX - 26, H - 22, 25, 20, P.w3); G.rect(x, CX + 1, H - 22, 25, 20, P.w3);
    G.vline(x, CX, H - 22, 20, P.w1); G.rect(x, CX - 4, H - 13, 2, 2, P.g4); G.rect(x, CX + 2, H - 13, 2, 2, P.g4);
    // pias de água benta
    for (const hx of [CX - 44, CX + 44]) { G.ellipse(x, hx, H - 32, 6, 4, P.st7); G.ellipse(x, hx, H - 33, 5, 3, P.mb1); G.ellipse(x, hx, H - 33, 3.5, 2, '#9fc4d4'); }
    // confessionário (direita)
    G.rect(x, 470, 690, 76, 40, P.w2); G.rect(x, 472, 692, 72, 6, P.w4); G.rect(x, 474, 700, 20, 28, P.w1); G.rect(x, 498, 700, 20, 28, '#3a0f15'); G.rect(x, 522, 700, 20, 28, P.w1);
    G.rect(x, 504, 684, 8, 8, P.g4); G.rect(x, 507, 680, 2, 6, P.g5);
  }

  function drawSideWindow(x, X, Y, design) {
    G.rect(x, X, Y, 12, 52, P.st6); G.rect(x, X + 2, Y + 4, 8, 46, P.st1);
    G.shape(x, X + 2, Y + 4, 8, 46, G.gothicMask(8, 46, 7), (i, j) => null);
    G.shape(x, X + 3, Y + 5, 6, 44, G.gothicMask(6, 44, 6), true);
    const cols = { agnus: [P.gl_b, P.gl_w, P.gl_y], spiritus: [P.gl_r, P.gl_y, P.gl_w], geo: [P.gl_g, P.gl_b, P.gl_y], petrus: [P.gl_y, P.gl_b, P.gl_r], joseph: [P.gl_b, '#8a5a22', P.gl_y] }[design] || [P.gl_b, P.gl_r, P.gl_y];
    const mask = G.gothicMask(6, 44, 6);
    G.shape(x, X + 3, Y + 5, 6, 44, (i, j) => mask(i, j) ? (j % 7 === 0 ? P.gl_lead : cols[(Math.floor(j / 7) + i) % cols.length]) : false);
  }

  function drawSideAltar(x, X, Y, kind, cel) {
    // pequeno altar lateral com imagem, toalha e castiçais
    G.rect(x, X, Y - 70, 64, 56, P.g2); G.dither(x, X, Y - 70, 64, 56, P.g1, 0.3);
    G.shape(x, X + 18, Y - 66, 28, 46, G.roundArchMask(28, 46), kind === 'maria' ? P.b1 : P.v1);
    A.statue(x, X + 32, Y - 22, kind, 0.9);
    G.rect(x, X - 2, Y - 74, 68, 5, P.g4); G.hline(x, X - 2, Y - 74, 68, P.g6);
    G.rect(x, X + 4, Y - 14, 56, 6, P.l4); G.rect(x, X + 4, Y - 8, 56, 8, kind === 'maria' ? '#3a5aa8' : P.w3); G.frame(x, X + 6, Y - 7, 52, 6, P.g4);
    void cel;
  }

  // ------------------------------------------------------------------
  DG.maps.church = function (cel, opts) {
    opts = opts || {};
    const sc = new DG.Scene({ id: 'church', name: 'Capela São Pio X', w: W, h: H, ambient: '#706055' });
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
    // imagem de São Pio X, padroeiro da capela e da Fraternidade (fundo da nave, à direita)
    G.rect(x, 500, 934, 40, 4, P.st4); G.hline(x, 500, 934, 40, P.st6);
    A.statue(x, 520, 934, 'pius', 1.15);
    A.floorCandle(x, 504, 936, false); A.floorCandle(x, 536, 936, false);
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
    sc.block(0, 0, W, 16); sc.block(0, 0, 16, H); sc.block(W - 16, 0, 16, H); sc.block(0, H - 24, W, 24);
    sc.block(0, 0, 96, K.naveTop - 14); sc.block(480, 0, 96, K.naveTop - 14);
    sc.free(480, 196, 16, 42); // porta da sacristia
    sc.block(96, 0, 384, K.wallBottom + 2);
    sc.block(K.mensa.x - 3, K.wallBottom, K.mensa.w + 6, K.mensa.top + K.mensa.front);
    sc.block(410, 174, 36, 30);      // credência
    sc.block(424, 222, 46, 26);      // sedília
    sc.block(112, 210, 24, 14);      // imagem
    sc.block(498, 920, 44, 18);      // imagem de São Pio X
    sc.block(346, 988, 28, 10);      // quadro de avisos
    sc.block(K.apse.x, K.railY - 2, CX - 16 - K.apse.x, 12); sc.block(CX + 16, K.railY - 2, K.apse.x + K.apse.w - CX - 16, 12);
    sc.block(16, K.naveTop - 30, 80, 20); sc.block(480, K.naveTop - 30, 80, 20); // altares laterais
    sc.block(470, 684, 76, 46); // confessionário
    sc.block(20, 900, 84, 10); // batistério (pia)
    for (const ry of rows) { sc.block(144, ry - 4, 120, 6); sc.block(312, ry - 4, 120, 6); }
    sc.gateBlock = () => { if (sc.state.gateOpen) sc.free(CX - 16, K.railY - 2, 32, 12); else sc.block(CX - 16, K.railY - 2, 32, 12); };
    sc.gateBlock();
    // superfícies (som dos passos)
    sc.surfaces.push({ x: K.predella.x, y: K.predella.y, w: K.predella.w, h: K.predella.h, kind: 'wood' });
    sc.surfaces.push({ x: CX - 22, y: 166, w: 44, h: H, kind: 'carpet' });
    for (const ry of rows) { sc.surfaces.push({ x: 144, y: ry - 16, w: 120, h: 24, kind: 'wood' }); sc.surfaces.push({ x: 312, y: ry - 16, w: 120, h: 24, kind: 'wood' }); }

    // ---------- colunas ----------
    for (let k = 0; k < 7; k++) {
      A.columnProp(sc, 128, 344 + k * 96, 92, { marble: k % 2 === 0 });
      A.columnProp(sc, 448, 344 + k * 96, 92, { marble: k % 2 === 0 });
    }
    // encostos dos bancos
    for (const ry of rows) {
      sc.addProp({ x: 204, y: ry + 8, sortY: ry + 8, draw(x, sx, sy) { A.pewBack(x, sx - 60, sy, 120); } });
      sc.addProp({ x: 372, y: ry + 8, sortY: ry + 8, draw(x, sx, sy) { A.pewBack(x, sx - 60, sy, 120); } });
    }
    // púlpito (lado do Evangelho, na coluna)
    sc.addProp({ id: 'pulpit', x: 142, y: 452, sortY: 452, examine: 'pulpitum', interact: { label: 'Examinar o púlpito' }, hit: { x: 128, y: 400, w: 30, h: 56 },
      draw(x, sx, sy) {
        sx = Math.round(sx); sy = Math.round(sy);
        G.rect(x, sx - 3, sy - 24, 6, 24, P.w3); G.vline(x, sx - 3, sy - 24, 24, P.w5);
        DG.spr.lathe(x, sx, sy - 44, 20, j => 10 - j * 0.35, [P.w2, P.w4, P.w6, P.w5, P.w3, P.w2]);
        G.rect(x, sx - 10, sy - 46, 20, 3, P.g4); G.hline(x, sx - 10, sy - 46, 20, P.g6);
        for (let i = -8; i <= 6; i += 5) G.frame(x, sx + i, sy - 41, 4, 8, P.g3);
        G.rect(x, sx - 12, sy - 74, 24, 4, P.w3); G.hline(x, sx - 12, sy - 74, 24, P.g4); // abat-voix
        G.shape(x, sx - 9, sy - 82, 19, 9, (i, j) => j >= Math.abs(i - 9) * 0.9, P.w4); G.px(x, sx, sy - 84, P.g5);
        G.rect(x, sx - 1, sy - 70, 2, 24, P.w2);
      } });
    sc.block(132, 446, 22, 8);

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
        if (sc.state.gateOpen) { G.rect(x, X - 16, Y - 14, 3, 12, P.mb1); G.rect(x, X + 13, Y - 14, 3, 12, P.mb1); return; }
        G.rect(x, X - 16, Y - 8, 32, 3, P.mb0); for (let i = -15; i < 15; i += 4) G.vline(x, X + i, Y - 5, 6, P.mb2);
        G.rect(x, X - 1, Y - 9, 2, 10, P.g4);
      } });
    // balaustrada de mármore (objeto com altura, ordenado com os personagens)
    const railImg = G.cached('rail', K.apse.w, 16, (rx) => {
      for (let i = 0; i < K.apse.w; i++) {
        const gx = K.apse.x + i;
        if (gx >= CX - 16 && gx < CX + 16) continue;
        const k = i % 7;
        if (k < 5) { const col = k === 0 ? P.mb3 : k === 1 ? P.mb0 : k < 4 ? P.mb1 : P.mb2; G.vline(rx, i, 5, 9, col); if (k > 0 && k < 4) { G.px(rx, i, 8, P.mb0); G.px(rx, i, 11, P.mb3); } }
      }
      const seg = (a, b) => { G.rect(rx, a, 0, b - a, 5, P.mb0); G.hline(rx, a, 0, b - a, '#ffffff'); G.hline(rx, a, 4, b - a, P.mb3); G.rect(rx, a, 14, b - a, 2, P.mb3); };
      seg(0, CX - 16 - K.apse.x); seg(CX + 16 - K.apse.x, K.apse.w);
      // pilaretes junto ao portão
      for (const px of [CX - 20 - K.apse.x, CX + 16 - K.apse.x]) { G.rect(rx, px, 0, 4, 16, P.mb1); G.vline(rx, px, 0, 16, P.mb0); G.vline(rx, px + 3, 0, 16, P.mb3); }
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
    // velas dos altares laterais (decorativas, acesas)
    for (const [ax, id] of [[56, 'sideL'], [520, 'sideR']]) {
      for (const dx of [-18, 18]) sc.addProp({ x: ax + dx, y: K.naveTop - 26, sortY: K.naveTop - 26, draw(x, sx, sy, t) { DG.spr.miniCandle(x, Math.round(sx), Math.round(sy), 5, sc.state.sideCandles, t); } });
      sc.addProp({ id, x: ax, y: K.naveTop - 18, examine: id === 'sideL' ? 'altareMariae' : 'altareJoseph', hit: { x: ax - 32, y: K.naveTop - 90, w: 64, h: 76 } });
    }
    // capela lateral, batistério, confessionário (exame)
    sc.addProp({ id: 'font', x: 60, y: 940, examine: 'fons', hit: { x: 20, y: 900, w: 84, h: 80 }, interact: { label: 'Examinar a pia batismal' } });
    sc.addProp({ id: 'confess', x: 508, y: 732, examine: 'confessionale', hit: { x: 470, y: 680, w: 76, h: 50 }, interact: { label: 'Examinar o confessionário' } });
    sc.addProp({ id: 'tabernacle', x: CX, y: 124, examine: 'tabernaculum', hit: { x: CX - 16, y: 70, w: 32, h: 50 } });
    sc.addProp({ id: 'crucifix', x: CX, y: 80, examine: 'crucifixus', hit: { x: CX - 12, y: 36, w: 24, h: 34 } });
    sc.addProp({ id: 'cards', x: CX, y: 124, examine: 'sacrae', hit: { x: CX - 9, y: 116, w: 18, h: 12 } });
    sc.addProp({ id: 'frontal', x: CX, y: 150, examine: 'antependium', hit: { x: K.mensa.x, y: 138, w: K.mensa.w, h: 16 } });
    sc.addProp({ id: 'rail', x: 160, y: 312, examine: 'cancelli', hit: { x: 100, y: 304, w: 150, h: 16 } });
    sc.addProp({ id: 'statueMaria', x: 124, y: 222, examine: 'imagoMariae', hit: { x: 112, y: 182, w: 24, h: 42 } });
    sc.addProp({ id: 'window1', x: 150, y: 60, examine: 'vitrum', hit: { x: 130, y: 10, w: 34, h: 96 } });
    sc.addProp({ id: 'window2', x: 430, y: 60, examine: 'vitrum', hit: { x: 412, y: 10, w: 34, h: 96 } });
    sc.addProp({ id: 'crest', x: CX, y: 14, examine: 'insigneFSSPX', hit: { x: CX - 8, y: 0, w: 16, h: 14 } });
    sc.addProp({ id: 'bannerL', x: 64, y: 112, examine: 'insigneFSSPX', hit: { x: 49, y: 28, w: 30, h: 82 } });
    sc.addProp({ id: 'bannerR', x: 512, y: 112, examine: 'insigneFSSPX', hit: { x: 497, y: 28, w: 30, h: 82 } });
    sc.addProp({ id: 'notices', x: 360, y: 998, examine: 'tabulaNotitiarum', hit: { x: 346, y: 962, w: 28, h: 36 } });
    sc.addProp({ id: 'statuePius', x: 520, y: 934, examine: 'imagoPii', hit: { x: 506, y: 886, w: 28, h: 50 }, interact: { label: 'Rezar diante de São Pio X' }, ix: 520, iy: 950,
      onUse: async () => {
        const p = DG.game.player; if (!p || sc.praying || DG.game.state === 'rite') return;
        sc.praying = true;
        await p.walkTo(520, 950, { facing: 'up' });
        await p.play('ajoelhar');
        const role = DG.game.role === 'sacerdos' ? 'P' : 'M';
        const la = 'Sancte Pie Décime, ora pro nobis.';
        DG.emit('rite:say', { who: role, la, pt: 'São Pio X, rogai por nós.', voice: 'submissa' });
        await DG.voice.speak(la, { role: role === 'P' ? 'priest' : 'server', volume: 0.6 }).promise;
        await DG.wait(1.2);
        DG.hud.hideSay();
        sc.praying = false;
      } });
    sc.addProp({ id: 'reredos', x: CX, y: 20, examine: 'retabulum', hit: { x: K.reredos.x, y: 0, w: K.reredos.w, h: 36 } });

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
    pts.chapelDoor = { x: 26, y: 584, facing: 'right' };
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
    zones.nave = { x: 16, y: K.naveTop, w: W - 32, h: H - K.naveTop - 24 };

    // ---------- portas ----------
    sc.doors.push({ x: 480, y: 196, w: 16, h: 42, to: 'sacristy', spawn: 'churchDoor', label: 'Ir à sacristia' });
    sc.doors.push({ x: 0, y: 558, w: 16, h: 48, to: 'chapel', spawn: 'naveDoor', label: 'Capela de Nossa Senhora' });
    sc.doors.push({ x: CX - 28, y: H - 26, w: 56, h: 4, to: null, exit: true, label: 'Portas principais (fechadas durante a celebração)', labelExplore: 'Sair da igreja' });

    // ---------- luz ----------
    sc.lighting.lights = [];
    K.candlesX.forEach((cx, i) => sc.lighting.lights.push({ id: 'c' + i, x: cx, y: 93, r: 46, color: '#ffc36a', intensity: 0.42, flicker: true, halo: 5, off: true }));
    sc.lighting.lights.push({ x: 156, y: 140, r: 44, color: '#ff4030', intensity: 0.38, flicker: true, halo: 9 });
    sc.lighting.lights.push({ x: CX, y: 60, r: 120, color: '#e8c890', intensity: 0.28 }); // retábulo dourado
    sc.lighting.lights.push({ x: CX, y: 230, r: 170, color: '#b0987c', intensity: 0.35 });
    for (const ax of [56, 520]) sc.lighting.lights.push({ x: ax, y: K.naveTop - 50, r: 50, color: '#ffc36a', intensity: 0.35, flicker: true, halo: 8 });
    for (let k = 0; k < 6; k++) sc.lighting.lights.push({ x: CX, y: 420 + k * 100, r: 230, color: '#9a8a78', intensity: 0.3 });
    if (sc.state.pascalCandle) sc.lighting.lights.push({ id: 'pascal', x: 212, y: 170, r: 40, color: '#ffc36a', intensity: 0.4, flicker: true, halo: 8 });
    // feixes de luz pelos vitrais (manhã)
    sc.lighting.shafts = [
      { x0: 134, x1: 160, y0: 30, fx0: 120, fx1: 176, fy: 300, color: '#9fb6ff', color2: '#ffd9a0', alpha: 0.5 },
      { x0: 416, x1: 444, y0: 30, fx0: 392, fx1: 452, fy: 300, color: '#ffb0a0', color2: '#ffe2b0', alpha: 0.45 },
    ];
    for (let k = 0; k < 6; k++) sc.lighting.shafts.push({ x0: W - 14, x1: W - 6, y0: 386 + k * 100, fx0: 300, fx1: 380, fy: 440 + k * 100, color: ['#ffe2a8', '#c8d4ff', '#ffd0b8'][k % 3], alpha: 0.32 });
    sc.dustAreas = [{ x: 120, y: 60, w: 60, h: 220, rate: 2 }, { x: 392, y: 60, w: 60, h: 220, rate: 2 }, { x: 300, y: 420, w: 220, h: 500, rate: 3 }];

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
