/* DEO GRATIAS — Sala dos paramentos: arcaz (gavetas por cor), alvas, pluviais, dalmáticas, batinas e sobrepelizes */
(function (DG) {
  'use strict';
  const G = DG.gfx, P = DG.pal, A = DG.art;
  const W = 352, H = 224;
  const COLORS = ['albus', 'ruber', 'viridis', 'violaceus', 'rosaceus', 'niger'];

  DG.maps.vestry = function (cel, opts) {
    opts = opts || {};
    const sc = new DG.Scene({ id: 'vestry', name: 'Sala dos paramentos', w: W, h: H, ambient: '#7d6c5c' });
    sc.state = Object.assign({ openDrawer: null, laid: null, serverVested: false }, opts.state || {});
    const bgc = G.canvas(W, H), x = bgc.x;
    A.woodFloor(x, 0, 64, W, H - 64, 55, false);
    A.ashlarWall(x, 0, 0, W, 64, 41, [P.st6, P.st5, P.st7, P.st4]);
    A.wainscot(x, 0, 36, W, 28);
    A.wallTop(x, 0, 64, 12, H - 64); A.wallTop(x, W - 12, 64, 12, H - 64); A.wallTop(x, 0, H - 10, W, 10);
    // crucifixo sobre o arcaz
    G.rect(x, 174, 4, 4, 26, P.w2); G.rect(x, 167, 9, 18, 3, P.w2); G.vline(x, 175, 4, 26, P.w5);
    G.rect(x, 175, 11, 2, 9, '#ead6bc'); G.rect(x, 169, 10, 14, 2, '#ead6bc');
    // cartão das orações da paramentação
    G.bevel(x, 120, 10, 28, 20, P.g3, P.g5, P.g1); G.rect(x, 122, 12, 24, 16, P.l4); for (let k = 0; k < 6; k++) G.hline(x, 124, 14 + k * 2, 20, '#7a6a58');
    G.rect(x, 124, 13, 3, 2, P.v3);
    // espelho
    G.bevel(x, 286, 6, 24, 30, P.g3, P.g5, P.g1); G.vgrad(x, 288, 8, 20, 26, ['#9fb4c0', '#6f8794', '#c8d6de']); G.line(x, 292, 12, 300, 26, '#e6eef2');
    sc.bg = bgc.c;

    // arcaz: grande cômoda com gavetas para cada cor litúrgica
    const ARC = { x: 76, y: 96, w: 200 };
    sc.addProp({ id: 'arcaz', x: ARC.x + ARC.w / 2, y: ARC.y, sortY: ARC.y, examine: 'arcaz', hit: { x: ARC.x, y: 54, w: ARC.w, h: 44 },
      draw(x, sx, sy) {
        const X = Math.round(sx - ARC.w / 2), Y = Math.round(sy);
        G.rect(x, X - 2, Y - 42, ARC.w + 4, 6, P.w5); G.hline(x, X - 2, Y - 42, ARC.w + 4, P.w7); // tampo (vista superior)
        G.rect(x, X, Y - 36, ARC.w, 36, P.w3);
        for (let k = 0; k < 6; k++) {
          const dx = X + 4 + (k % 3) * 65, dy = Y - 34 + Math.floor(k / 3) * 17;
          const open = sc.state.openDrawer === COLORS[k];
          G.rect(x, dx, dy, 61, 15, open ? P.w1 : P.w4); G.frame(x, dx, dy, 61, 15, P.w2);
          G.hline(x, dx + 1, dy + 1, 59, open ? P.w2 : P.w6);
          // etiqueta colorida (cor das vestes guardadas)
          const c = (DG.LIT[COLORS[k]]).main;
          G.rect(x, dx + 24, dy + 4, 13, 4, c[1]); G.frame(x, dx + 24, dy + 4, 13, 4, P.g3);
          G.rect(x, dx + 8, dy + 6, 6, 2, P.g4); G.rect(x, dx + 47, dy + 6, 6, 2, P.g4);
          if (open) { G.rect(x, dx + 4, dy - 3, 53, 4, c[0]); G.hline(x, dx + 4, dy - 3, 53, DG.TRIM[(DG.LIT[COLORS[k]]).trim][1]); }
        }
        // paramentos dispostos sobre o arcaz (na ordem: casula, estola, manípulo, cíngulo, alva, amito)
        const laid = sc.state.laid;
        if (laid) {
          const c = DG.LIT[laid.color].main, t = DG.TRIM[DG.LIT[laid.color].trim];
          const L = laid.items;
          if (L.casula) { G.rect(x, X + 62, Y - 44, 40, 7, c[0]); G.rect(x, X + 80, Y - 44, 4, 7, t[1]); }
          if (L.stola) { G.rect(x, X + 106, Y - 43, 18, 2, c[1]); G.rect(x, X + 106, Y - 40, 18, 2, c[1]); }
          if (L.manipulus) G.rect(x, X + 128, Y - 43, 10, 4, c[1]);
          if (L.cingulum) { G.ellipse(x, X + 146, Y - 41, 5, 2, P.l3); }
          if (L.alba) G.rect(x, X + 30, Y - 44, 26, 7, P.l4);
          if (L.amictus) G.rect(x, X + 16, Y - 43, 10, 5, P.l5);
        }
      } });
    sc.block(ARC.x - 2, 56, ARC.w + 4, 42);
    // armário com pluviais e dalmáticas
    sc.addProp({ id: 'wardrobe', x: 36, y: 150, examine: 'pluviale', hit: { x: 14, y: 70, w: 44, h: 82 },
      draw(x, sx, sy) {
        const X = Math.round(sx) - 22, Y = Math.round(sy);
        G.rect(x, X, Y - 80, 44, 80, P.w2); G.rect(x, X + 2, Y - 78, 40, 76, '#1c120c');
        G.rect(x, X + 4, Y - 74, 36, 2, P.g3);
        // pluvial vermelho e dalmática dourada pendurados
        G.shape(x, X + 5, Y - 72, 16, 60, (i, j) => Math.abs(i - 8) <= 3 + j * 0.1, DG.LIT.ruber.main[1]); G.vline(x, X + 9, Y - 72, 60, P.g4); G.vline(x, X + 17, Y - 72, 60, P.g4);
        G.rect(x, X + 24, Y - 72, 14, 44, '#c9a043'); G.vline(x, X + 27, Y - 72, 44, P.v3); G.vline(x, X + 34, Y - 72, 44, P.v3); G.rect(x, X + 22, Y - 70, 3, 14, '#c9a043'); G.rect(x, X + 37, Y - 70, 3, 14, '#c9a043');
        G.rect(x, X - 2, Y - 2, 48, 2, P.w1);
      } });
    sc.block(14, 136, 44, 16);
    sc.addProp({ id: 'dalmatic', x: 46, y: 150, examine: 'dalmatica', hit: { x: 36, y: 74, w: 20, h: 50 } });
    // cabide de alvas e amitos
    sc.addProp({ id: 'albRack', x: 306, y: 150, examine: 'alba', hit: { x: 290, y: 100, w: 34, h: 52 },
      draw(x, sx, sy) { const X = Math.round(sx), Y = Math.round(sy); G.vline(x, X - 14, Y - 48, 48, P.w4); G.vline(x, X + 14, Y - 48, 48, P.w4); G.rect(x, X - 15, Y - 49, 31, 2, P.w5);
        for (let k = 0; k < 3; k++) { G.shape(x, X - 12 + k * 8, Y - 46, 9, 38, (i, j) => Math.abs(i - 4) <= 2 + j * 0.06, P.l4); G.vline(x, X - 8 + k * 8, Y - 46, 38, P.l2); } } });
    sc.block(290, 140, 34, 12);
    // cabides do acólito: batinas e sobrepelizes
    sc.addProp({ id: 'serverHooks', x: 52, y: 206, examine: 'superpelliceum', interact: { label: 'Vestir batina e sobrepeliz' }, ix: 52, iy: 196, hit: { x: 24, y: 160, w: 60, h: 48 },
      draw(x, sx, sy) { const X = Math.round(sx), Y = Math.round(sy); G.rect(x, X - 28, Y - 46, 56, 3, P.w5);
        const cas = ['#1b1a1e', '#7d1720', '#1b1a1e'];
        for (let k = 0; k < 3; k++) { if (k === 1 && sc.state.serverVested && sc.state.serverCassock === 'ruber') continue; if (k === 0 && sc.state.serverVested && sc.state.serverCassock !== 'ruber') continue;
          const cx = X - 18 + k * 18; G.shape(x, cx - 5, Y - 43, 11, 40, (i, j) => Math.abs(i - 5) <= 3 + j * 0.06, cas[k]); G.shape(x, cx - 6, Y - 43, 13, 18, (i, j) => Math.abs(i - 6) <= 3 + j * 0.22, P.l4); } } });
    sc.block(24, 200, 60, 8);
    // porta
    sc.doors.push({ x: W - 14, y: 120, w: 14, h: 52, to: 'sacristy', spawn: 'vestDoor', label: 'Voltar à sacristia' });
    sc.addProp({ id: 'doorS', x: W - 8, y: 172, draw(x, sx, sy) { A.door(x, Math.round(sx) - 6, Math.round(sy) - 52, 12, 50, false); } });
    sc.block(0, 0, W, 66); sc.block(0, 0, 12, H); sc.block(W - 12, 0, 12, H); sc.block(0, H - 10, W, 10); sc.free(W - 12, 120, 12, 52);
    sc.points = {
      sacDoor: { x: W - 28, y: 150, facing: 'left' }, arcaz: { x: 176, y: 112, facing: 'up' }, arcazServer: { x: 152, y: 118, facing: 'up' },
      hooks: { x: 52, y: 196, facing: 'down' }, start: { x: 200, y: 170, facing: 'up' },
    };
    // gavetas como alvos interativos separados
    COLORS.forEach((col, k) => {
      const dx = ARC.x + 4 + (k % 3) * 65 + 30, dy = ARC.y - 34 + Math.floor(k / 3) * 17 + 8;
      sc.addProp({ id: 'drawer_' + col, x: dx, y: dy, color: col, interact: { label: 'Abrir a gaveta: paramentos ' + DG.LIT[col].name.toLowerCase() + 's' }, ix: dx, iy: ARC.y + 14, range: 22, hit: { x: dx - 30, y: dy - 8, w: 61, h: 15 } });
    });
    sc.lighting.lights = [{ x: 176, y: 130, r: 200, color: '#c2aa8a', intensity: 0.45 }];
    sc.camBounds = { x0: 0, y0: 0, x1: Math.max(0, W - DG.W), y1: Math.max(0, H - DG.H) };
    sc.COLORS = COLORS;
    return sc;
  };
})(window.DG = window.DG || {});
