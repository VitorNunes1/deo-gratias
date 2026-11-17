/* DEO GRATIAS — objetos litúrgicos em pixel art
   icon(id, color) -> canvas 32x32 (enciclopédia, mãos, inventário)
   Funções "mini" desenham versões pequenas no cenário. */
(function (DG) {
  'use strict';
  const G = DG.gfx, P = DG.pal;
  const GOLD_RAMP = [P.g1, P.g2, P.g4, P.g6, P.g5, P.g4, P.g3, P.g2, P.g1];
  const SILVER_RAMP = ['#4a4c52', '#6f727c', '#9a9ea8', '#e9ebf0', '#c9ccd4', '#a4a8b2', '#80838c', '#5b5e66', '#3d3f44'];
  const GLASS_RAMP = ['#7f8c94', '#b7c4cc', '#e8f1f5', '#ffffff', '#d5e2e8', '#aebcc4', '#8b989f'];

  // "torno": preenche um sólido de revolução linha a linha com rampa de brilho
  function lathe(x, cx, y0, h, rfn, ramp) {
    for (let j = 0; j < h; j++) {
      const r = rfn(j);
      if (r <= 0) continue;
      const w = Math.max(1, Math.round(r * 2));
      const left = Math.round(cx - w / 2);
      for (let i = 0; i < w; i++) {
        const t = w === 1 ? 0.5 : i / (w - 1);
        const k = Math.min(ramp.length - 1, Math.round(t * (ramp.length - 1)));
        x.fillStyle = ramp[k];
        x.fillRect(left + i, y0 + j, 1, 1);
      }
    }
  }
  G.lathe = lathe;

  function litCols(color) { return (DG.LIT[color] || DG.LIT.albus).main; }
  function trimCols(color) { return DG.TRIM[(DG.LIT[color] || DG.LIT.albus).trim]; }

  // ---------- desenhos 32x32 ----------
  const ICONS = {
    insigne(x) { if (DG.emblem) DG.emblem.icon(x); }, // emblema da Fraternidade
    calix(x) { // cálice
      lathe(x, 16, 4, 26, j => {
        if (j < 10) return 7 - j * 0.25 - (j > 7 ? (j - 7) * 1.4 : 0);   // copa
        if (j < 12) return 2.2;                                         // haste
        if (j < 15) return 3.4 - Math.abs(j - 13) * 0.6;                // nó
        if (j < 20) return 1.8 + (j - 15) * 0.15;                        // haste
        return 3 + (j - 20) * 1.15;                                      // pé
      }, GOLD_RAMP);
      G.rect(x, 9, 4, 14, 1, P.g6); G.rect(x, 10, 5, 12, 1, P.g1); // borda e interior
      G.px(x, 14, 13, P.v4); G.px(x, 18, 13, P.b4); // pedras no nó
      G.rect(x, 15, 25, 2, 2, P.g6); G.px(x, 16, 24, P.g6); G.px(x, 16, 27, P.g6); // cruz no pé
    },
    patena(x) {
      G.ellipse(x, 16, 17, 12, 5, P.g2); G.ellipse(x, 16, 16, 12, 5, P.g4); G.ellipse(x, 16, 16, 9, 3.5, P.g3);
      G.ellipse(x, 14, 15, 4, 1.5, P.g6);
    },
    hostia(x) {
      G.ellipse(x, 16, 16, 11, 11, '#d8cfb6'); G.ellipse(x, 16, 15, 10, 10, '#f3ecd8');
      G.rect(x, 15, 8, 2, 15, '#cfc3a3'); G.rect(x, 10, 13, 12, 2, '#cfc3a3'); // cruz gravada
      G.px(x, 11, 9, '#fffaf0'); G.px(x, 12, 8, '#fffaf0');
    },
    hostiae(x) { // hóstias pequenas
      for (const [a, b] of [[10, 12], [20, 11], [14, 20], [22, 20], [8, 21]]) { G.ellipse(x, a, b, 4, 4, '#d8cfb6'); G.ellipse(x, a, b - 0.5, 3.5, 3.5, '#f5efdd'); G.px(x, a, b - 1, '#cfc3a3'); }
    },
    corporale(x) {
      G.rect(x, 3, 8, 26, 18, P.l3); G.frame(x, 3, 8, 26, 18, P.l1);
      G.hline(x, 3, 14, 26, P.l2); G.hline(x, 3, 20, 26, P.l2); G.vline(x, 11, 8, 18, P.l2); G.vline(x, 20, 8, 18, P.l2);
      G.rect(x, 14, 22, 3, 1, P.v3); G.rect(x, 15, 21, 1, 3, P.v3);
    },
    purificatorium(x) { // sanguinho
      G.rect(x, 6, 6, 8, 22, P.l3); G.rect(x, 14, 6, 6, 22, P.l2); G.rect(x, 20, 6, 6, 22, P.l3);
      G.frame(x, 6, 6, 20, 22, P.l1); G.rect(x, 15, 15, 3, 1, P.v3); G.rect(x, 16, 14, 1, 3, P.v3);
    },
    palla(x) {
      G.rect(x, 6, 6, 20, 20, P.l4); G.frame(x, 6, 6, 20, 20, P.l1); G.frame(x, 8, 8, 16, 16, P.l2);
      G.rect(x, 14, 10, 4, 12, P.g4); G.rect(x, 10, 14, 12, 4, P.g4); G.rect(x, 15, 11, 2, 10, P.g6); G.rect(x, 11, 15, 10, 2, P.g6);
    },
    velum(x, col) { // véu do cálice
      const c = litCols(col), t = trimCols(col);
      G.shape(x, 5, 6, 22, 22, (i, j) => j > 2 + Math.abs(i - 11) * 0.25 ? (i < 3 || i > 18 ? c[1] : c[0]) : false);
      G.rect(x, 5, 26, 22, 2, t[1]); G.rect(x, 14, 10, 4, 14, t[1]); G.rect(x, 10, 14, 12, 4, t[1]); G.rect(x, 15, 11, 2, 12, t[0]);
    },
    bursa(x, col) {
      const c = litCols(col), t = trimCols(col);
      G.bevel(x, 5, 5, 22, 22, c[1], c[0], c[2]); G.frame(x, 6, 6, 20, 20, t[1]);
      G.rect(x, 14, 9, 4, 14, t[1]); G.rect(x, 10, 13, 12, 4, t[1]); G.px(x, 15, 14, t[0]); G.px(x, 16, 15, t[0]);
    },
    missale(x) {
      G.rect(x, 3, 20, 26, 6, P.w3); G.rect(x, 4, 24, 24, 2, P.w2); // estante
      G.rect(x, 5, 8, 22, 14, P.v2); G.rect(x, 6, 9, 9, 11, P.l4); G.rect(x, 17, 9, 9, 11, P.l3);
      for (let k = 0; k < 4; k++) { G.hline(x, 7, 11 + k * 2, 7, k === 0 ? P.v4 : '#5a4a3a'); G.hline(x, 18, 11 + k * 2, 7, '#5a4a3a'); }
      G.rect(x, 7, 10, 2, 2, P.v4); G.rect(x, 15, 8, 2, 13, P.g3);
      G.rect(x, 10, 20, 1, 6, P.v4); G.rect(x, 12, 20, 1, 5, P.g4); G.rect(x, 20, 20, 1, 7, P.b4); // fitas
    },
    manutergium(x) { // manustérgio
      G.rect(x, 6, 8, 20, 17, P.l3); G.rect(x, 6, 8, 20, 3, P.l4); G.frame(x, 6, 8, 20, 17, P.l1);
      for (let i = 0; i < 20; i += 2) G.px(x, 6 + i, 24, P.l1);
      G.rect(x, 15, 14, 3, 1, P.v3); G.rect(x, 16, 13, 1, 3, P.v3);
    },
    urceoli(x) { // galhetas
      for (const [cx, liq] of [[10, '#7a1426'], [22, '#d4e7ef']]) {
        lathe(x, cx, 7, 20, j => (j < 2 ? 1.6 : j < 5 ? 1.3 : j < 8 ? 1.3 + (j - 5) * 0.9 : j < 17 ? 4 : 4 - (j - 17) * 0.4), GLASS_RAMP);
        G.rect(x, cx - 3, 15, 7, 9, liq); G.px(x, cx - 2, 16, '#ffffff');
        G.rect(x, cx - 1, 5, 3, 2, P.g4); // tampa
        G.rect(x, cx + 4, 13, 1, 6, '#9fb0b8'); G.px(x, cx + 3, 12, '#9fb0b8'); // asa
      }
      G.rect(x, 4, 27, 24, 2, P.g3); G.hline(x, 4, 27, 24, P.g5); // bandeja
    },
    lavabo(x) { // bacia do lavabo
      G.ellipse(x, 16, 20, 13, 5, P.g2); G.ellipse(x, 16, 19, 13, 5, P.g4); G.ellipse(x, 16, 19, 10, 3.5, P.g2); G.ellipse(x, 16, 19.5, 8, 2.5, '#9fc4d4');
      G.hline(x, 10, 15, 6, P.g6);
    },
    campanula(x) { // campainhas (sinetas de altar, quatro sinos)
      G.rect(x, 15, 3, 2, 12, P.w4); G.rect(x, 14, 3, 4, 2, P.w5);
      for (const [cx, cy] of [[10, 20], [22, 20], [16, 24], [16, 16]]) {
        lathe(x, cx, cy - 4, 8, j => (j < 2 ? 1.5 + j : j < 6 ? 2.8 + (j - 2) * 0.3 : 4.2), GOLD_RAMP);
        G.px(x, cx, cy + 4, P.g1);
      }
      G.line(x, 16, 14, 10, 16, P.g2); G.line(x, 16, 14, 22, 16, P.g2);
    },
    thuribulum(x) { // turíbulo
      G.line(x, 16, 1, 9, 12, P.g2); G.line(x, 16, 1, 23, 12, P.g2); G.line(x, 16, 1, 16, 10, P.g2);
      G.ellipse(x, 16, 2, 2, 1.2, P.g4);
      lathe(x, 16, 10, 8, j => 3 + j * 0.7, GOLD_RAMP); // tampa perfurada
      for (let k = 0; k < 3; k++) G.px(x, 13 + k * 3, 14, P.g0);
      lathe(x, 16, 18, 8, j => 8 - j * 0.5, GOLD_RAMP); // bojo
      G.rect(x, 10, 18, 12, 1, P.g6);
      lathe(x, 16, 26, 4, j => 2 + j * 0.8, GOLD_RAMP); // pé
      G.px(x, 20, 8, '#cfcfcf'); G.px(x, 21, 6, '#e0e0e0'); G.px(x, 19, 4, '#d0d0d0'); // fumaça
    },
    navicula(x) { // naveta
      G.shape(x, 4, 12, 24, 8, (i, j) => { const t = Math.abs(i - 11.5) / 12; return j >= t * t * 6; }, P.g3);
      G.hline(x, 5, 12, 22, P.g6); G.ellipse(x, 12, 12, 5, 1.5, P.g5);
      lathe(x, 16, 20, 7, j => (j < 3 ? 1.5 : 1.5 + (j - 3) * 1.2), GOLD_RAMP);
      G.rect(x, 25, 9, 4, 1, P.g4); G.rect(x, 27, 8, 2, 3, P.g3); // colherinha
    },
    crux(x) { // cruz processional
      G.rect(x, 15, 9, 2, 23, P.w5); G.vline(x, 15, 9, 23, P.w6);
      G.rect(x, 13, 1, 6, 12, P.g3); G.rect(x, 9, 4, 14, 4, P.g3); G.rect(x, 14, 2, 4, 10, P.g5); G.rect(x, 10, 5, 12, 2, P.g5);
      G.rect(x, 15, 4, 2, 5, P.l2); G.px(x, 15, 3, P.l2); // corpus
      lathe(x, 16, 12, 4, j => 2.5 - Math.abs(j - 1.5) * 0.4, GOLD_RAMP);
    },
    candelabrum(x) { // castiçal com vela
      G.rect(x, 14, 3, 4, 12, P.l4); G.vline(x, 14, 3, 12, P.l2); G.rect(x, 15, 1, 1, 2, P.w1);
      G.px(x, 15, 0, P.flame1);
      lathe(x, 16, 15, 16, j => (j < 2 ? 3 : j < 4 ? 1.4 : j < 7 ? 2.5 - Math.abs(j - 5) * 0.5 : j < 11 ? 1.3 : 2 + (j - 11) * 1.1), GOLD_RAMP);
    },
    pyxis(x) { // âmbula / cibório
      lathe(x, 16, 3, 27, j => {
        if (j < 2) return 1.2; if (j < 4) return 0.8;      // cruz/botão
        if (j < 9) return 3 + (j - 4) * 1.1;              // tampa
        if (j < 15) return 8 - (j - 9) * 0.3;             // copa
        if (j < 17) return 2;
        if (j < 19) return 3;
        if (j < 22) return 1.8;
        return 3 + (j - 22) * 1.2;
      }, GOLD_RAMP);
      G.rect(x, 15, 0, 2, 4, P.g5); G.rect(x, 14, 1, 4, 1, P.g5);
      G.hline(x, 8, 12, 16, P.g6);
    },
    pyxisVelata(x) { // âmbula com o véu branco (conopeu da âmbula)
      ICONS.pyxis(x);
      G.shape(x, 6, 8, 20, 10, (i, j) => j >= Math.abs(i - 9.5) * 0.25, '#f3eddc');
      G.hline(x, 6, 17, 20, '#cdbf9c');
    },
    ostensorium(x) { // custódia
      for (let a = 0; a < 16; a++) { const ang = a / 16 * Math.PI * 2; G.line(x, 16, 11, 16 + Math.cos(ang) * 11, 11 + Math.sin(ang) * 11, a % 2 ? P.g4 : P.g3); }
      G.ellipse(x, 16, 11, 6, 6, P.g2); G.ellipse(x, 16, 11, 4.5, 4.5, '#f7f0dc'); G.ellipse(x, 16, 11, 3.5, 3.5, '#fffaf0');
      G.rect(x, 15, 0, 2, 2, P.g6);
      lathe(x, 16, 22, 10, j => (j < 4 ? 1.2 : j < 6 ? 2.4 : j < 7 ? 1.2 : 2 + (j - 7) * 2), GOLD_RAMP);
    },
    alba(x) {
      G.shape(x, 6, 3, 20, 27, (i, j) => { const half = 4 + j * 0.24; return Math.abs(i - 9.5) <= half; }, P.l4);
      G.rect(x, 1, 7, 6, 3, P.l3); G.rect(x, 25, 7, 6, 3, P.l3); G.rect(x, 3, 7, 4, 12, P.l3); G.rect(x, 25, 7, 4, 12, P.l3);
      for (let i = 0; i < 26; i++) if ((i & 1) === 0) { G.px(x, 3 + i, 27, P.l1); G.px(x, 3 + i, 25, P.l2); }
      G.rect(x, 3, 26, 26, 1, P.l1);
      G.ellipse(x, 16, 4, 3, 1.5, P.l1);
    },
    amictus(x) {
      G.rect(x, 5, 9, 22, 14, P.l4); G.frame(x, 5, 9, 22, 14, P.l1);
      G.rect(x, 15, 11, 3, 1, P.v3); G.rect(x, 16, 10, 1, 3, P.v3);
      G.line(x, 5, 9, 1, 4, P.l2); G.line(x, 26, 9, 31, 4, P.l2); // fitas
    },
    cingulum(x) {
      for (let k = 0; k < 3; k++) G.ellipse(x, 16, 14, 10 - k, 6 - k, null);
      G.shape(x, 5, 7, 22, 14, (i, j) => { const dx = (i - 11) / 11, dy = (j - 7) / 7; const d = dx * dx + dy * dy; return d <= 1 && d >= 0.7; }, P.l3);
      G.rect(x, 14, 18, 2, 10, P.l3); G.rect(x, 17, 18, 2, 8, P.l2);
      G.rect(x, 13, 27, 4, 4, P.l4); G.rect(x, 16, 25, 4, 4, P.l4);
      for (let i = 0; i < 4; i++) { G.px(x, 13 + i, 30, P.l1); G.px(x, 16 + i, 28, P.l1); }
    },
    stola(x, col) {
      const c = litCols(col), t = trimCols(col);
      G.shape(x, 4, 2, 24, 29, (i, j) => {
        const l = 6 + j * 0.05, r = 17 - j * 0.05;
        if (j < 6) return (i >= 5 && i <= 18 && j >= Math.abs(i - 11.5) - 4) ? c[1] : false;
        return (i >= l - 3 && i <= l + 1) || (i >= r - 1 && i <= r + 3) ? c[0] : false;
      });
      G.rect(x, 4, 26, 6, 4, c[0]); G.rect(x, 22, 26, 6, 4, c[0]);
      G.rect(x, 5, 27, 4, 2, t[1]); G.rect(x, 23, 27, 4, 2, t[1]);
      for (let i = 0; i < 6; i++) { G.px(x, 4 + i, 30, t[2]); G.px(x, 22 + i, 30, t[2]); }
      G.rect(x, 15, 3, 2, 4, t[1]); G.rect(x, 14, 4, 4, 1, t[1]);
    },
    manipulus(x, col) {
      const c = litCols(col), t = trimCols(col);
      G.rect(x, 8, 6, 6, 22, c[0]); G.rect(x, 18, 6, 6, 22, c[1]); G.rect(x, 8, 4, 16, 4, c[0]);
      G.rect(x, 8, 26, 6, 3, t[1]); G.rect(x, 18, 26, 6, 3, t[1]);
      for (let i = 0; i < 6; i++) { G.px(x, 8 + i, 29, t[2]); G.px(x, 18 + i, 29, t[2]); }
      G.rect(x, 15, 4, 2, 4, t[1]); G.rect(x, 14, 5, 4, 1, t[0]);
    },
    casula(x, col) { // casula romana (“de guitarra”), vista de costas
      const c = litCols(col), t = trimCols(col);
      G.shape(x, 4, 2, 24, 29, (i, j) => {
        let half;
        if (j < 4) half = 6 + j * 1.2; else if (j < 12) half = 10.5 - (j - 4) * 0.25; else half = 8.5 + (j - 12) * 0.18;
        if (j > 25) half -= (j - 25) * 1.3;
        return Math.abs(i - 11.5) <= half ? (Math.abs(i - 11.5) > half - 1 ? t[1] : c[0]) : false;
      });
      G.ellipse(x, 16, 3, 3, 1.6, P.l3);
      G.rect(x, 14, 5, 4, 23, t[1]); G.rect(x, 15, 5, 2, 23, t[0]);
      G.rect(x, 8, 10, 16, 4, t[1]); G.rect(x, 8, 11, 16, 2, t[0]);
      G.dither(x, 5, 18, 22, 10, c[1], (i, j) => j / 14);
    },
    dalmatica(x, col) {
      const c = litCols(col), t = trimCols(col);
      G.rect(x, 7, 4, 18, 26, c[0]); G.rect(x, 2, 5, 6, 10, c[0]); G.rect(x, 24, 5, 6, 10, c[0]);
      G.ellipse(x, 16, 4, 3, 1.5, P.l3);
      G.rect(x, 10, 4, 2, 26, t[1]); G.rect(x, 20, 4, 2, 26, t[1]); // clavi
      G.rect(x, 10, 20, 12, 2, t[1]); G.rect(x, 10, 25, 12, 2, t[1]);
      G.rect(x, 2, 13, 6, 2, t[1]); G.rect(x, 24, 13, 6, 2, t[1]);
      for (let i = 7; i < 25; i += 2) G.px(x, i, 30, t[2]);
    },
    pluviale(x, col) { // pluvial (capa de asperges)
      const c = litCols(col), t = trimCols(col);
      G.shape(x, 2, 3, 28, 28, (i, j) => { const half = 3 + j * 0.5; return Math.abs(i - 13.5) <= half; }, c[0]);
      G.shape(x, 9, 3, 14, 10, (i, j) => { const half = 6.5 - j * 0.3; return Math.abs(i - 6.5) <= half && j < 9; }, t[1]); // capuz/escudo
      G.rect(x, 12, 5, 8, 4, c[1]);
      G.line(x, 13, 3, 6, 30, t[1]); G.line(x, 19, 3, 26, 30, t[1]); G.line(x, 14, 3, 7, 30, t[0]); G.line(x, 18, 3, 25, 30, t[0]);
      G.rect(x, 13, 3, 6, 2, P.g5); // fecho (morse)
    },
    birretum(x) {
      G.rect(x, 7, 14, 18, 11, '#1a1a1e'); G.rect(x, 7, 14, 18, 2, '#2e2e34');
      G.rect(x, 9, 9, 3, 6, '#25252a'); G.rect(x, 15, 8, 3, 7, '#25252a'); G.rect(x, 21, 9, 3, 6, '#25252a');
      G.ellipse(x, 16, 7, 2.5, 2, '#1a1a1e'); G.px(x, 15, 6, '#3a3a42');
    },
    superpelliceum(x) { // sobrepeliz
      G.shape(x, 4, 4, 24, 22, (i, j) => Math.abs(i - 11.5) <= 4 + j * 0.45, P.l4);
      for (let i = 0; i < 24; i++) { if ((i + 1) % 3) G.px(x, 4 + i, 25, P.l1); G.px(x, 4 + i, 23, (i & 1) ? P.l2 : P.l4); }
      G.ellipse(x, 16, 5, 3, 1.5, '#1a1a1e');
    },
    vestisTalaris(x) { // batina
      G.shape(x, 6, 3, 20, 27, (i, j) => Math.abs(i - 9.5) <= 4 + j * 0.2, '#1b1a1e');
      G.rect(x, 3, 6, 4, 14, '#1b1a1e'); G.rect(x, 25, 6, 4, 14, '#1b1a1e');
      for (let j = 5; j < 29; j += 2) G.px(x, 16, j, '#4a1a22');
      G.rect(x, 13, 3, 6, 2, '#f0f0f0');
    },
    sacrae(x) { // sacras (cartas do altar)
      G.bevel(x, 2, 6, 28, 20, P.g3, P.g5, P.g1); G.rect(x, 4, 8, 24, 16, P.l4);
      G.rect(x, 4, 8, 24, 2, P.v3);
      for (let k = 0; k < 5; k++) { G.hline(x, 6, 12 + k * 2, 9, '#5a4a3a'); G.hline(x, 17, 12 + k * 2, 9, '#5a4a3a'); }
      G.rect(x, 15, 11, 2, 10, P.rubric || '#a3161c');
    },
    tabernaculum(x, col) {
      const c = litCols(col || 'albus');
      G.rect(x, 7, 6, 18, 22, P.g3); G.rect(x, 8, 7, 16, 20, P.g4);
      G.shape(x, 6, 1, 20, 8, (i, j) => j >= Math.abs(i - 9.5) * 0.6, P.g5);
      G.rect(x, 11, 10, 10, 14, P.g2); G.rect(x, 12, 11, 8, 12, P.g5); G.rect(x, 15, 13, 2, 7, P.v3); G.rect(x, 13, 15, 6, 2, P.v3);
      // conopeu (véu)
      G.shape(x, 5, 4, 22, 25, (i, j) => (i < 4 || i > 17) && j > 2, c[0]);
      G.rect(x, 6, 28, 20, 2, P.g2);
    },
    lampas(x) { // lâmpada do Santíssimo
      G.line(x, 16, 0, 16, 10, P.g2); G.line(x, 10, 0, 12, 10, P.g2); G.line(x, 22, 0, 20, 10, P.g2);
      lathe(x, 16, 10, 12, j => (j < 2 ? 6 : 6 - (j - 2) * 0.45), GOLD_RAMP);
      G.rect(x, 13, 7, 6, 5, '#b3122a'); G.rect(x, 14, 8, 4, 3, '#ff4a35'); G.px(x, 15, 6, P.flame1);
    },
    aspersorium(x) { // caldeirinha e aspersório
      lathe(x, 13, 12, 16, j => (j < 2 ? 6 : 6 - j * 0.15), SILVER_RAMP);
      G.ellipse(x, 13, 12, 6, 1.5, '#7f9aa6'); G.line(x, 7, 12, 13, 4, '#9a9ea8'); G.line(x, 19, 12, 13, 4, '#9a9ea8');
      G.line(x, 20, 26, 29, 6, SILVER_RAMP[2]); G.ellipse(x, 29, 5, 2.5, 2.5, SILVER_RAMP[3]);
    },
    extinctorium(x) { // acendedor / apagador de velas
      G.line(x, 4, 31, 24, 6, P.w5); G.line(x, 5, 31, 25, 6, P.w4);
      lathe(x, 26, 2, 7, j => 1 + j * 0.45, GOLD_RAMP);
      G.line(x, 23, 7, 22, 3, P.l3); G.px(x, 22, 2, P.flame1);
    },
    ara(x) { // pedra d'ara
      G.bevel(x, 4, 10, 24, 14, '#a39784', '#c9bda8', '#6f6555');
      for (const [a, b] of [[8, 13], [24, 13], [16, 17], [8, 21], [24, 21]]) { G.rect(x, a - 1, b, 3, 1, '#5a5045'); G.rect(x, a, b - 1, 1, 3, '#5a5045'); }
      G.rect(x, 14, 15, 5, 5, '#8a7e6a'); G.frame(x, 14, 15, 5, 5, '#5a5045');
    },
    mappae(x) { // toalhas do altar
      G.rect(x, 2, 10, 28, 6, P.l4); G.rect(x, 2, 16, 28, 10, P.l3);
      for (let i = 2; i < 30; i += 2) { G.px(x, i, 25, P.l1); G.px(x, i + 1, 23, P.l2); }
      G.hline(x, 2, 10, 28, P.l5);
    },
    antependium(x, col) {
      const c = litCols(col), t = trimCols(col);
      G.rect(x, 2, 6, 28, 22, c[0]); G.frame(x, 2, 6, 28, 22, t[1]); G.frame(x, 4, 8, 24, 18, t[2]);
      G.rect(x, 14, 10, 4, 14, t[1]); G.rect(x, 10, 15, 12, 4, t[1]); G.rect(x, 15, 11, 2, 12, t[0]);
    },
    cereus(x) { // círio pascal
      G.rect(x, 12, 4, 8, 24, P.l4); G.vline(x, 12, 4, 24, P.l2);
      G.rect(x, 15, 9, 2, 10, P.v4); G.rect(x, 13, 12, 6, 2, P.v4);
      for (const [a, b] of [[16, 10], [14, 13], [18, 13], [16, 16], [16, 13]]) G.px(x, a, b, P.g5);
      G.rect(x, 15, 2, 1, 2, P.w1); G.px(x, 15, 1, P.flame1); G.px(x, 15, 0, P.flame0);
      G.rect(x, 9, 28, 14, 3, P.g3);
    },
    crucifixus(x) {
      G.rect(x, 14, 2, 4, 28, P.w3); G.rect(x, 5, 8, 22, 4, P.w3); G.vline(x, 14, 2, 28, P.w5); G.hline(x, 5, 8, 22, P.w5);
      G.rect(x, 15, 9, 2, 11, '#e9d8c0'); G.rect(x, 9, 9, 14, 2, '#e9d8c0'); G.ellipse(x, 16, 8, 1.5, 1.5, '#e9d8c0');
      G.rect(x, 15, 17, 2, 6, '#d9c4a8'); G.rect(x, 14, 4, 4, 2, P.l4);
      G.rect(x, 12, 28, 8, 3, P.g3);
    },
    vinumAqua(x) { // vinho e água (âmbula de vinho para a sacristia)
      ICONS.urceoli(x);
    },
    patenaCommunionis(x) { // patena de comunhão (com cabo)
      G.ellipse(x, 14, 18, 11, 6, P.g2); G.ellipse(x, 14, 17, 11, 6, P.g4); G.ellipse(x, 14, 17, 8, 4, P.g3); G.ellipse(x, 11, 15, 3, 1.5, P.g6);
      G.rect(x, 24, 16, 7, 2, P.g3); G.hline(x, 24, 16, 7, P.g5);
    },
    clavis(x) { // chave do sacrário
      G.ellipse(x, 10, 10, 5, 5, P.g4); G.ellipse(x, 10, 10, 2.5, 2.5, null);
      G.shape(x, 5, 5, 11, 11, (i, j) => { const d = Math.hypot(i - 5, j - 5); return d <= 5.5 && d >= 2.6; }, P.g4);
      G.rect(x, 14, 9, 14, 2, P.g3); G.rect(x, 24, 11, 2, 4, P.g3); G.rect(x, 27, 11, 2, 3, P.g3);
    },
    thus(x) { // incenso (grãos)
      G.ellipse(x, 16, 22, 12, 5, P.w3);
      for (let k = 0; k < 18; k++) { const a = DG.util.hash2(k, 3), b = DG.util.hash2(k, 9); G.rect(x, 7 + a * 17, 16 + b * 8, 2, 2, k % 3 ? '#d9b46a' : '#b98d42'); }
    },
  };

  const cache = {};
  DG.spr = {
    ICONS,
    lathe,
    has: id => !!ICONS[id],
    icon(id, color, size) {
      const key = 'icon:' + id + ':' + (color || '') + ':' + (size || 32);
      return G.cached(key, size || 32, size || 32, (x) => {
        if (size && size !== 32) { const tmp = DG.spr.icon(id, color, 32); x.imageSmoothingEnabled = false; x.drawImage(tmp, 0, 0, size, size); return; }
        const f = ICONS[id]; if (f) f(x, color || 'albus');
      });
    },
    // ---------- versões pequenas no cenário ----------
    miniCandle(x, X, Y, h, lit, t) { // X,Y = base do castiçal
      lathe(x, X, Y - 6, 6, j => (j < 2 ? 1.5 : j < 4 ? 0.8 : 1.2 + (j - 4) * 1.1), GOLD_RAMP);
      G.rect(x, X - 1, Y - 6 - h, 2, h, P.l4); G.px(x, X - 1, Y - 6 - h, P.l2);
      if (lit) {
        const fl = (Math.sin((t || 0) * 13 + X) + Math.sin((t || 0) * 7.3 + X * 3)) * 0.5;
        G.px(x, X - 1 + (fl > 0.6 ? 1 : 0), Y - 8 - h, P.flame1);
        G.px(x, X - 1, Y - 7 - h, P.flame0);
        if (fl > -0.3) G.px(x, X - 1, Y - 9 - h, P.flame2);
      } else G.px(x, X - 1, Y - 7 - h, P.w1);
    },
    miniChalice(x, X, Y, col, veiled) { // X centro, Y base
      if (veiled) {
        const c = litCols(col), t = trimCols(col);
        G.shape(x, X - 4, Y - 8, 9, 8, (i, j) => j >= Math.abs(i - 4) - 2 + 1 ? c[0] : false);
        G.rect(x, X - 4, Y - 1, 9, 1, c[2]); G.vline(x, X, Y - 7, 6, t[1]); G.hline(x, X - 2, Y - 5, 5, t[1]);
        G.rect(x, X - 3, Y - 10, 7, 2, c[1]); // bolsa por cima
        G.hline(x, X - 3, Y - 10, 7, t[1]);
      } else {
        lathe(x, X, Y - 8, 8, j => (j < 3 ? 2.2 - j * 0.2 : j < 5 ? 0.8 : j < 6 ? 1.3 : 0.6 + (j - 6) * 1.2), GOLD_RAMP);
      }
    },
    miniBook(x, X, Y, open) { // estante com missal (vista de cima e de frente)
      G.rect(x, X - 5, Y - 2, 10, 2, P.w3);
      if (open) { G.rect(x, X - 6, Y - 7, 12, 5, P.v2); G.rect(x, X - 5, Y - 7, 5, 4, P.l4); G.rect(x, X + 1, Y - 7, 4, 4, P.l3); G.vline(x, X, Y - 7, 5, P.g3); }
      else { G.rect(x, X - 4, Y - 7, 8, 5, P.v2); G.rect(x, X - 4, Y - 7, 8, 1, P.v4); G.rect(x, X - 1, Y - 6, 2, 3, P.g4); }
    },
    miniCruets(x, X, Y) {
      G.rect(x, X - 4, Y - 1, 9, 1, P.g3);
      G.rect(x, X - 3, Y - 5, 2, 4, '#7a1426'); G.px(x, X - 3, Y - 6, '#b7c4cc'); G.px(x, X - 3, Y - 5, '#c33');
      G.rect(x, X + 1, Y - 5, 2, 4, '#c9dde6'); G.px(x, X + 1, Y - 6, '#b7c4cc');
    },
    miniBell(x, X, Y) { G.rect(x, X - 2, Y - 3, 4, 3, P.g4); G.px(x, X - 1, Y - 3, P.g6); G.px(x, X, Y - 4, P.w4); },
    miniCard(x, X, Y, w, h) { G.bevel(x, X, Y, w, h, P.g3, P.g5, P.g1); G.rect(x, X + 1, Y + 1, w - 2, h - 2, P.l4); for (let k = 2; k < h - 1; k += 2) G.hline(x, X + 2, Y + k, w - 4, '#8a7a68'); },
  };
})(window.DG = window.DG || {});
