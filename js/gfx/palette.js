/* DEO GRATIAS — paleta
   Tons: vinho, dourado, marfim, marrom-escuro, azul profundo, madeiras. */
(function (DG) {
  'use strict';
  const P = DG.pal = {
    black: '#0a0706', ink: '#140d0a',
    // pedra
    st0: '#17120f', st1: '#221b17', st2: '#2f2620', st3: '#3e332b', st4: '#544538', st5: '#6c5a49', st6: '#8a7560', st7: '#a8927a', st8: '#c7b49a', st9: '#e0d2bb',
    // mármore marfim e escuro
    mb0: '#fbf6ea', mb1: '#efe6d2', mb2: '#ded2b8', mb3: '#c8b998', mb4: '#a9987a',
    md0: '#6b3b33', md1: '#542a25', md2: '#3d1c19', md3: '#2a1210',
    mg0: '#5a6a62', mg1: '#43524b', mg2: '#2f3b35', // mármore verde (colunas)
    // madeira
    w0: '#1d1009', w1: '#2e1b0f', w2: '#432815', w3: '#5c381d', w4: '#774b27', w5: '#935f33', w6: '#b07a45', w7: '#c9965f',
    // ouro
    g0: '#3a2508', g1: '#5e3f10', g2: '#8a611b', g3: '#b48a2c', g4: '#d6ae4a', g5: '#ecd07a', g6: '#fbedb4', g7: '#fffbe6',
    // vinho
    v0: '#24070c', v1: '#3d0c15', v2: '#5a1320', v3: '#7a1c2b', v4: '#9b2a38', v5: '#bd4552',
    // azul profundo
    b0: '#080d1e', b1: '#101a38', b2: '#1a2a55', b3: '#283f78', b4: '#3c5a9c', b5: '#6283c4', b6: '#9db6e6',
    // linho / branco
    l0: '#8f877a', l1: '#b5ad9e', l2: '#d3ccbd', l3: '#e8e3d7', l4: '#f6f3ec', l5: '#ffffff',
    // vitral
    gl_r: '#c0182f', gl_r2: '#7e0c1d', gl_b: '#2246b8', gl_b2: '#132a73', gl_g: '#1d8a4c', gl_g2: '#0f5530', gl_y: '#e6a21f', gl_y2: '#a8680f', gl_p: '#7a2fa3', gl_w: '#f4ecc8', gl_lead: '#120c0a',
    // luz
    candle: '#ffd27a', flame0: '#fff6d0', flame1: '#ffd25a', flame2: '#ff9a2a', flame3: '#d0501a',
    lampRed: '#ff3b2a',
    // pele
    skins: [
      ['#f1c9a5', '#d9a77f', '#b9845e'],
      ['#e6b68d', '#c99168', '#a5704b'],
      ['#c68e63', '#a46f48', '#7f5233'],
      ['#946446', '#764c33', '#583623'],
      ['#6e4630', '#563523', '#3c2418'],
    ],
    hairs: ['#1b1410', '#3b2617', '#5e3b20', '#8a6a3c', '#b9b2a6', '#e0dcd2', '#7a3416'],
  };

  // Cores litúrgicas (Rubricae generales Missalis, n. 117 ss.)
  DG.LIT = {
    albus:     { name: 'Branco', la: 'albus', main: ['#fbf8ee', '#e7dfca', '#c9bea2', '#a49a80'], trim: 'gold', meaning: 'Pureza, glória e alegria: festas do Senhor (exceto as da Paixão), de Nossa Senhora, dos Anjos, dos Santos não mártires; Natal e Tempo Pascal.' },
    ruber:     { name: 'Vermelho', la: 'ruber', main: ['#c3343b', '#9c2129', '#73141b', '#4c0b10'], trim: 'gold', meaning: 'Fogo do Espírito Santo e sangue dos mártires: Pentecostes, festas da Paixão e da Cruz, Apóstolos e Mártires.' },
    viridis:   { name: 'Verde', la: 'viridis', main: ['#3f8f56', '#2b6f40', '#1b4f2c', '#10331c'], trim: 'gold', meaning: 'Esperança da vida eterna: domingos e férias depois da Epifania e depois de Pentecostes.' },
    violaceus: { name: 'Roxo', la: 'violaceus', main: ['#7b4694', '#5c2f74', '#401f53', '#281234'], trim: 'gold', meaning: 'Penitência e expectativa: Advento, Septuagésima, Quaresma, Têmporas e vigílias.' },
    rosaceus:  { name: 'Rosáceo', la: 'rosaceus', main: ['#e7a9b9', '#cc8499', '#a5607a', '#78405a'], trim: 'gold', meaning: 'Alegria contida no meio da penitência: domingos Gaudete (III do Advento) e Lætare (IV da Quaresma).' },
    niger:     { name: 'Preto', la: 'niger', main: ['#3a3a42', '#26262c', '#16161a', '#0a0a0c'], trim: 'silver', meaning: 'Luto e sufrágio: Missas de defuntos e a Sexta-feira Santa.' },
  };
  DG.TRIM = {
    gold: ['#fbedb4', '#d6ae4a', '#8a611b'],
    silver: ['#f2f2f4', '#b9bcc4', '#6f727c'],
  };
})(window.DG = window.DG || {});
