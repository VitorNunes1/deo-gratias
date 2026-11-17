/* DEO GRATIAS — Sacristia: lavabo, mesa do cálice, estante do Missal, galhetas, crucifixo */
(function (DG) {
  'use strict';
  const G = DG.gfx, P = DG.pal, A = DG.art;
  const W = 480, H = 272;

  DG.maps.sacristy = function (cel, opts) {
    opts = opts || {};
    const sc = new DG.Scene({ id: 'sacristy', name: 'Sacristia', w: W, h: H, ambient: '#7a6a5c' });
    sc.state = Object.assign({
      chalice: 'parts',          // parts -> prepared -> taken
      missalMarked: false, handsWashed: false,
      cruets: 'empty',           // empty -> filled -> taken
      missal: 'shelf',           // shelf -> taken
      lighter: true, bellRung: false, holyWater: true,
    }, opts.state || {});
    const bgc = G.canvas(W, H), x = bgc.x;
    // piso de madeira e paredes
    A.woodFloor(x, 0, 64, W, H - 64, 77, true);
    A.ashlarWall(x, 0, 0, W, 64, 31, [P.st6, P.st5, P.st7, P.st4]);
    A.wainscot(x, 0, 38, W, 26);
    A.wallTop(x, 0, 64, 12, H - 64); A.wallTop(x, W - 12, 64, 12, H - 64); A.wallTop(x, 0, H - 10, W, 10);
    // janela com luz
    A.lancet(x, 404, 4, 18, 34, 'geo', 9);
    // crucifixo principal da sacristia (a ele se faz a inclinação antes de sair)
    G.rect(x, 238, 4, 4, 30, P.w2); G.rect(x, 230, 10, 20, 3, P.w2); G.vline(x, 239, 4, 30, P.w5); G.hline(x, 230, 10, 20, P.w5);
    G.rect(x, 239, 12, 2, 10, '#ead6bc'); G.rect(x, 232, 11, 16, 2, '#ead6bc'); G.px(x, 239, 10, '#ead6bc');
    G.rect(x, 226, 34, 28, 3, P.w4); G.hline(x, 226, 34, 28, P.w6); // peanha
    // quadro da Última Ceia e relógio
    A.painting(x, 110, 8, 44, 24, 'ceia');
    G.ellipse(x, 340, 18, 7, 7, P.w3); G.ellipse(x, 340, 18, 5.5, 5.5, P.l3); G.line(x, 340, 18, 340, 14, P.ink); G.line(x, 340, 18, 343, 19, P.ink);
    // cartão com a oração “Da, Domine” sobre o lavabo
    G.bevel(x, 26, 14, 22, 16, P.g3, P.g5, P.g1); G.rect(x, 28, 16, 18, 12, P.l4); for (let k = 0; k < 4; k++) G.hline(x, 30, 18 + k * 2, 14, '#7a6a58'); G.rect(x, 30, 17, 2, 2, P.v3);
    // armário dos vasos sagrados (cofre)
    G.rect(x, 60, 18, 40, 52, P.w2); G.rect(x, 62, 20, 36, 48, P.w3); G.frame(x, 64, 22, 15, 44, P.w1); G.frame(x, 81, 22, 15, 44, P.w1);
    G.rect(x, 78, 42, 1, 4, P.g4); G.rect(x, 81, 42, 1, 4, P.g4); G.rect(x, 58, 16, 44, 3, P.w5);
    // retratos de São Pio X e de Dom Lefebvre, e o emblema da Fraternidade
    A.portrait(x, 172, 9, 'pius');
    G.bevel(x, 280, 6, 24, 28, P.g3, P.g5, P.g1); G.rect(x, 282, 8, 20, 24, '#efe3c8'); G.frame(x, 283, 9, 18, 22, '#a3161c');
    DG.emblem.draw(x, 292, 11, 18, 'red');
    A.portrait(x, 364, 9, 'lefebvre');
    sc.bg = bgc.c;

    // ---------- objetos ----------
    sc.addProp({ id: 'portraitPius', x: 180, y: 40, examine: 'imagoPii', hit: { x: 170, y: 7, w: 20, h: 24 } });
    sc.addProp({ id: 'insigne', x: 292, y: 40, examine: 'insigneFSSPX', hit: { x: 280, y: 6, w: 24, h: 28 } });
    sc.addProp({ id: 'portraitLefebvre', x: 372, y: 40, examine: 'imagoLefebvre', hit: { x: 362, y: 7, w: 20, h: 24 } });
    // lavabo da sacristia
    sc.addProp({ id: 'lavaboSac', x: 37, y: 84, examine: 'lavaboSacristiae', interact: { label: 'Lavar as mãos' }, ix: 37, iy: 96, hit: { x: 18, y: 34, w: 40, h: 54 },
      draw(x, sx, sy) {
        sx = Math.round(sx); sy = Math.round(sy);
        G.rect(x, sx - 14, sy - 30, 28, 4, P.st7); G.hline(x, sx - 14, sy - 30, 28, P.st8);
        G.ellipse(x, sx, sy - 22, 12, 5, P.mb2); G.ellipse(x, sx, sy - 23, 10, 3.5, P.mb0); G.ellipse(x, sx, sy - 22.5, 7, 2, '#a9cad8');
        G.rect(x, sx - 2, sy - 40, 4, 8, P.g3); G.rect(x, sx - 1, sy - 34, 2, 4, P.g5); // torneira
        G.rect(x, sx - 3, sy - 18, 6, 18, P.mb1); G.vline(x, sx - 3, sy - 18, 18, P.mb0);
        G.rect(x, sx + 15, sy - 40, 6, 22, P.l3); G.hline(x, sx + 14, sy - 41, 8, P.w4); // toalha no rolo
      } });
    sc.block(20, 60, 40, 28);
    // mesa de preparação do cálice
    sc.addProp({ id: 'chaliceTable', x: 236, y: 132, examine: 'calix', interact: { label: 'Preparar o cálice' }, ix: 236, iy: 146, hit: { x: 196, y: 104, w: 80, h: 34 },
      draw(x, sx, sy) {
        sx = Math.round(sx); sy = Math.round(sy);
        G.rect(x, sx - 38, sy - 20, 76, 14, P.l4); G.hline(x, sx - 38, sy - 20, 76, P.l5); G.rect(x, sx - 38, sy - 6, 76, 6, P.w3); G.hline(x, sx - 38, sy - 6, 76, P.w5);
        G.rect(x, sx - 36, sy, 3, 8, P.w2); G.rect(x, sx + 33, sy, 3, 8, P.w2);
        const s = sc.state.chalice;
        if (s === 'parts') {
          DG.spr.miniChalice(x, sx - 16, sy - 9, cel.color, false);
          G.rect(x, sx - 6, sy - 15, 7, 5, P.l3); G.ellipse(x, sx + 8, sy - 12, 3, 1, P.g4); G.rect(x, sx + 14, sy - 16, 5, 4, P.l5);
          G.rect(x, sx + 22, sy - 16, 8, 6, (DG.LIT[cel.color] || DG.LIT.albus).main[1]); G.rect(x, sx - 30, sy - 17, 8, 5, P.w4); G.px(x, sx - 27, sy - 16, P.l5); // caixa de hóstias
        } else if (s === 'prepared') {
          DG.spr.miniChalice(x, sx, sy - 8, cel.color, true);
        }
      } });
    sc.block(196, 112, 80, 24);
    // estante com o Missal
    sc.addProp({ id: 'missalStand', x: 336, y: 118, examine: 'missale', interact: { label: 'Marcar o Missal' }, ix: 336, iy: 130, hit: { x: 320, y: 90, w: 32, h: 30 },
      draw(x, sx, sy) {
        sx = Math.round(sx); sy = Math.round(sy);
        G.rect(x, sx - 2, sy - 14, 4, 14, P.w3); G.rect(x, sx - 8, sy - 2, 16, 3, P.w2);
        if (sc.state.missal === 'shelf') { G.rect(x, sx - 10, sy - 24, 20, 10, P.v2); G.rect(x, sx - 9, sy - 23, 8, 7, P.l4); G.rect(x, sx + 1, sy - 23, 8, 7, P.l3); G.vline(x, sx, sy - 24, 10, P.g3); if (sc.state.missalMarked) { G.vline(x, sx - 4, sy - 14, 5, P.v4); G.vline(x, sx - 2, sy - 14, 4, P.g4); G.vline(x, sx + 3, sy - 14, 6, '#2e4d9c'); G.vline(x, sx + 6, sy - 14, 3, '#2b6f40'); } }
        else G.rect(x, sx - 9, sy - 18, 18, 3, P.w4);
      } });
    sc.block(326, 110, 20, 10);
    // galhetas, vinho e água
    sc.addProp({ id: 'cruetTable', x: 72, y: 196, examine: 'urceoli', interact: { label: 'Preparar as galhetas' }, ix: 72, iy: 210, hit: { x: 44, y: 170, w: 56, h: 30 },
      draw(x, sx, sy) {
        sx = Math.round(sx); sy = Math.round(sy);
        G.rect(x, sx - 26, sy - 14, 52, 10, P.w4); G.hline(x, sx - 26, sy - 14, 52, P.w6); G.rect(x, sx - 26, sy - 4, 52, 4, P.w2);
        G.rect(x, sx - 22, sy - 26, 5, 12, '#3a0c14'); G.rect(x, sx - 21, sy - 30, 3, 4, '#2a1a10'); G.px(x, sx - 21, sy - 24, '#a33'); // garrafa de vinho de missa
        G.rect(x, sx - 12, sy - 24, 6, 10, '#9fc4d4'); G.rect(x, sx - 11, sy - 26, 4, 2, '#cfe2ea'); // jarra de água
        if (sc.state.cruets !== 'taken') { const f = sc.state.cruets === 'filled'; G.rect(x, sx + 4, sy - 20, 3, 6, f ? '#7a1426' : '#d5e2e8'); G.rect(x, sx + 10, sy - 20, 3, 6, f ? '#c9dde6' : '#e8f1f5'); G.rect(x, sx + 2, sy - 15, 14, 1, P.g3); }
        if (sc.state.cruets !== 'taken') { G.ellipse(x, sx + 20, sy - 16, 4, 1.4, P.g4); G.rect(x, sx + 18, sy - 22, 6, 4, P.l3); }
      } });
    sc.block(44, 182, 56, 14);
    // genuflexório de preparação
    sc.addProp({ id: 'priedieu', x: 160, y: 214, examine: 'genuflexorium', interact: { label: 'Rezar (preparação para a Missa)' }, ix: 160, iy: 222, hit: { x: 148, y: 194, w: 24, h: 22 },
      draw(x, sx, sy) { sx = Math.round(sx); sy = Math.round(sy); G.rect(x, sx - 9, sy - 18, 18, 8, P.w3); G.hline(x, sx - 9, sy - 18, 18, P.w6); G.rect(x, sx - 9, sy - 10, 18, 3, P.w2); G.rect(x, sx - 9, sy - 2, 18, 3, '#7a1a22'); G.hline(x, sx - 9, sy - 2, 18, '#9a2a32'); } });
    sc.block(150, 196, 20, 10);
    // acendedor/apagador de velas, turíbulo, cruz processional
    sc.addProp({ id: 'lighter', x: 420, y: 96, examine: 'extinctorium', interact: { label: 'Pegar o acendedor' }, hit: { x: 412, y: 56, w: 18, h: 42 },
      draw(x, sx, sy) { sx = Math.round(sx); sy = Math.round(sy); G.rect(x, sx - 6, sy - 4, 12, 4, P.w2); if (sc.state.lighter) { G.line(x, sx - 2, sy - 4, sx - 2, sy - 36, P.w5); DG.spr.lathe(x, sx - 2, sy - 40, 4, j => 1 + j * 0.4, [P.g2, P.g4, P.g6, P.g3]); } } });
    sc.addProp({ id: 'thurible', x: 380, y: 92, examine: 'thuribulum', hit: { x: 368, y: 56, w: 24, h: 38 },
      draw(x, sx, sy) { sx = Math.round(sx); sy = Math.round(sy); G.rect(x, sx - 1, sy - 34, 2, 34, P.w2); G.rect(x, sx - 8, sy - 34, 16, 2, P.w2); G.vline(x, sx - 6, sy - 32, 10, P.g2); DG.spr.lathe(x, sx - 6, sy - 22, 6, j => (j < 3 ? 1.5 + j * 0.6 : 3 - (j - 3) * 0.4), [P.g2, P.g4, P.g6, P.g3, P.g1]); G.ellipse(x, sx + 5, sy - 22, 3, 1.2, P.g4); G.rect(x, sx - 6, sy - 2, 12, 2, P.w3); } });
    sc.addProp({ id: 'crossStand', x: 440, y: 236, examine: 'crux', hit: { x: 430, y: 186, w: 20, h: 52 },
      draw(x, sx, sy) { sx = Math.round(sx); sy = Math.round(sy); G.rect(x, sx - 5, sy - 3, 10, 3, P.w2); G.vline(x, sx, sy - 44, 42, P.w5); G.rect(x, sx - 1, sy - 54, 3, 12, P.g4); G.rect(x, sx - 5, sy - 50, 11, 3, P.g4); G.px(x, sx, sy - 48, P.l3); } });
    sc.block(432, 230, 16, 6);
    sc.addProp({ id: 'cabinet', x: 80, y: 70, examine: 'ostensorium', hit: { x: 58, y: 16, w: 44, h: 54 }, interact: { label: 'Examinar o armário dos vasos sagrados' } });
    sc.block(58, 56, 44, 16);
    sc.addProp({ id: 'crucifixSac', x: 240, y: 40, examine: 'crucifixus', hit: { x: 226, y: 2, w: 28, h: 36 } });
    sc.addProp({ id: 'lastSupper', x: 132, y: 30, examine: 'ultimaCena', hit: { x: 108, y: 6, w: 48, h: 28 } });
    // campainha da sacristia junto à porta da igreja
    sc.addProp({ id: 'sacBell', x: 452, y: 112, examine: 'tintinnabulum', interact: { label: 'Tocar a campainha da sacristia' }, hit: { x: 444, y: 92, w: 18, h: 22 },
      draw(x, sx, sy, t) { sx = Math.round(sx); sy = Math.round(sy); G.rect(x, sx - 1, sy - 22, 2, 6, P.w2); const sw = sc.state.bellSwing ? Math.round(Math.sin(t * 20) * 1.5) : 0; DG.spr.lathe(x, sx + sw, sy - 17, 6, j => 1 + j * 0.5, [P.g2, P.g4, P.g6, P.g3, P.g1]); G.vline(x, sx + 4, sy - 16, 12, '#c9a043'); } });
    // água benta junto à porta
    sc.addProp({ id: 'holyWater', x: 456, y: 186, examine: 'aquaBenedicta', interact: { label: 'Água benta' }, hit: { x: 448, y: 172, w: 16, h: 16 },
      draw(x, sx, sy) { sx = Math.round(sx); sy = Math.round(sy); G.rect(x, sx - 4, sy - 12, 8, 2, P.mb1); G.ellipse(x, sx, sy - 9, 4, 2.5, P.mb2); G.ellipse(x, sx, sy - 10, 3, 1.4, '#a9cad8'); } });
    // portas
    sc.doors.push({ x: W - 14, y: 120, w: 14, h: 52, to: 'church', spawn: 'sacristyDoor', label: 'Ir à igreja' });
    sc.doors.push({ x: 0, y: 150, w: 14, h: 52, to: 'vestry', spawn: 'sacDoor', label: 'Sala dos paramentos' });
    sc.addProp({ id: 'doorChurch', x: W - 8, y: 172, draw(x, sx, sy) { A.door(x, Math.round(sx) - 6, Math.round(sy) - 52, 12, 50, false); } });
    sc.addProp({ id: 'doorVestry', x: 8, y: 202, draw(x, sx, sy) { A.door(x, Math.round(sx) - 6, Math.round(sy) - 52, 12, 50, false); } });
    // colisão das paredes
    sc.block(0, 0, W, 66); sc.block(0, 0, 12, H); sc.block(W - 12, 0, 12, H); sc.block(0, H - 10, W, 10);
    sc.free(0, 150, 12, 52); sc.free(W - 12, 120, 12, 52);
    // pontos
    sc.points = {
      churchDoor: { x: W - 26, y: 150, facing: 'left' }, vestDoor: { x: 26, y: 180, facing: 'right' }, sacDoor: { x: 26, y: 180, facing: 'right' },
      start: { x: 300, y: 200, facing: 'up' }, crucifix: { x: 240, y: 92, facing: 'up' }, crucifixM: { x: 222, y: 98, facing: 'up' },
      lavabo: { x: 37, y: 98, facing: 'up' }, table: { x: 236, y: 148, facing: 'up' }, missal: { x: 336, y: 132, facing: 'up' },
      cruets: { x: 72, y: 212, facing: 'up' }, priedieu: { x: 160, y: 222, facing: 'up' }, exit: { x: W - 30, y: 146, facing: 'right' },
      priestWait: { x: 280, y: 100, facing: 'up' }, serverWait: { x: 262, y: 104, facing: 'up' },
    };
    sc.zones = { door: { x: W - 40, y: 120, w: 28, h: 52 } };
    // luz
    sc.lighting.lights = [{ x: 240, y: 120, r: 220, color: '#c2aa8a', intensity: 0.42 }, { x: 37, y: 60, r: 70, color: '#ffe2b0', intensity: 0.2 }];
    sc.lighting.shafts = [{ x0: 404, x1: 422, y0: 10, fx0: 330, fx1: 380, fy: 230, color: '#fff0c8', alpha: 0.45 }];
    sc.dustAreas = [{ x: 330, y: 60, w: 60, h: 160, rate: 2 }];
    sc.camBounds = { x0: 0, y0: 0, x1: 0, y1: H - DG.H };
    return sc;
  };
})(window.DG = window.DG || {});
