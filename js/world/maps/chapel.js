/* DEO GRATIAS — Capela lateral de Nossa Senhora: altar, imagem, velário, Pietà */
(function (DG) {
  'use strict';
  const G = DG.gfx, P = DG.pal, A = DG.art;
  const W = 336, H = 240;

  DG.maps.chapel = function (cel, opts) {
    opts = opts || {};
    const sc = new DG.Scene({ id: 'chapel', name: 'Capela de Nossa Senhora', w: W, h: H, ambient: '#4a3f48' });
    sc.state = Object.assign({ votives: [true, false, true, false, false, true, false, false, true, false, false, false] }, opts.state || {});
    const bgc = G.canvas(W, H), x = bgc.x;
    A.marbleChecker(x, 0, 80, W, H - 80, 12, [P.mb0, P.mb1, P.mb3], [P.b2, P.b1, P.b0], 13);
    A.ashlarWall(x, 0, 0, W, 80, 51, [P.st6, P.st5, P.st7, P.st4]);
    A.wallTop(x, 0, 80, 12, H - 80); A.wallTop(x, W - 12, 80, 12, H - 80); A.wallTop(x, 0, H - 10, W, 10);
    // rosácea mariana
    A.rose(x, 168, 18, 14);
    G.rect(x, 163, 14, 2, 8, P.gl_w); G.rect(x, 167, 14, 2, 8, P.gl_w); G.rect(x, 171, 14, 2, 8, P.gl_w); G.hline(x, 163, 14, 10, P.gl_w); // monograma M (estilizado)
    // retábulo de Nossa Senhora (azul e ouro)
    G.rect(x, 120, 30, 96, 52, P.g2); G.dither(x, 120, 30, 96, 52, P.g1, 0.25);
    G.shape(x, 146, 32, 44, 48, G.roundArchMask(44, 48), P.b1);
    for (let k = 0; k < 40; k++) { const a = -Math.PI + k / 39 * Math.PI; G.line(x, 168, 56, 168 + Math.cos(a) * 20, 56 + Math.sin(a) * 20, k % 2 ? P.b3 : P.b2); }
    A.statue(x, 168, 80, 'maria', 1.2);
    for (const cx of [128, 208]) { G.rect(x, cx - 3, 32, 7, 48, P.g4); G.vline(x, cx - 2, 32, 48, P.g6); }
    G.rect(x, 118, 28, 100, 4, P.g5);
    // altar
    G.rect(x, 126, 80, 84, 8, P.l4); G.rect(x, 126, 88, 84, 12, '#2e4d9c'); G.frame(x, 128, 89, 80, 10, P.g4); G.rect(x, 166, 91, 4, 6, P.g5); G.rect(x, 164, 93, 8, 2, P.g5);
    G.rect(x, 118, 100, 100, 6, P.mb2); G.hline(x, 118, 100, 100, P.mb0);
    // Pietà na parede esquerda
    G.rect(x, 20, 30, 40, 50, P.st3); G.shape(x, 22, 32, 36, 46, G.roundArchMask(36, 46), '#1c1418');
    G.ellipse(x, 40, 62, 10, 8, '#e9e2d4'); G.ellipse(x, 40, 52, 3, 3, '#e9e2d4'); G.rect(x, 30, 64, 20, 4, '#d9d0bf'); G.ellipse(x, 40, 48, 3.5, 3.5, P.g5); G.ellipse(x, 40, 48, 2.5, 2.5, '#e9e2d4');
    G.rect(x, 24, 76, 32, 4, P.st6);
    // placas votivas (ex-votos)
    for (let k = 0; k < 6; k++) { G.rect(x, 250 + (k % 3) * 22, 24 + Math.floor(k / 3) * 18, 16, 10, P.mb1); G.frame(x, 250 + (k % 3) * 22, 24 + Math.floor(k / 3) * 18, 16, 10, P.g3); G.hline(x, 253 + (k % 3) * 22, 28 + Math.floor(k / 3) * 18, 10, P.st5); }
    sc.bg = bgc.c;

    // bancos (genuflexórios)
    for (let r = 0; r < 3; r++) {
      const ry = 150 + r * 26;
      for (const bx of [88, 196]) {
        sc.addProp({ x: bx + 26, y: ry + 6, draw(x, sx, sy) { A.pewBack(x, Math.round(sx) - 26, Math.round(sy), 52); } });
        sc.block(bx, ry - 4, 52, 6);
      }
    }
    const bgx = G.canvas(1, 1); void bgx;
    // velário (castiçal de velas votivas)
    sc.addProp({ id: 'votive', x: 270, y: 132, examine: 'velarium', interact: { label: 'Acender uma vela votiva' }, ix: 270, iy: 144, hit: { x: 246, y: 104, w: 48, h: 30 },
      draw(x, sx, sy, t) {
        const X = Math.round(sx), Y = Math.round(sy);
        G.rect(x, X - 24, Y - 8, 48, 8, P.w2); G.rect(x, X - 24, Y - 18, 48, 10, '#2a1a12'); G.hline(x, X - 24, Y - 18, 48, P.g3);
        sc.state.votives.forEach((lit, i) => {
          const vx = X - 21 + (i % 6) * 8, vy = Y - 12 + Math.floor(i / 6) * -4;
          G.rect(x, vx, vy - 3, 4, 3, '#a3161c'); G.px(x, vx + 1, vy - 4, P.l4);
          if (lit) A.flame(x, vx + 1, vy - 5, t, i);
        });
        G.rect(x, X + 18, Y - 26, 6, 8, P.st6); G.rect(x, X + 19, Y - 27, 4, 2, P.g3); // caixa de esmolas
      } });
    sc.block(246, 118, 48, 16);
    sc.prop('votive').onUse = () => {
      const i = sc.state.votives.indexOf(false);
      if (i < 0) { DG.ui.toast('Todas as velas já ardem diante de Nossa Senhora.', 'info'); return; }
      sc.state.votives[i] = true; DG.sfx.whoosh(); DG.fx.sparkle(sc.particles, 270 - 21 + (i % 6) * 8, 118, '#ffd27a');
      DG.ui.toast('Uma vela acesa: a oração continua diante de Deus.', 'ok');
      DG.profile.votives = (DG.profile.votives || 0) + 1; DG.store.save();
    };
    sc.addProp({ id: 'statueM', x: 168, y: 82, examine: 'imagoMariae', hit: { x: 150, y: 36, w: 36, h: 46 }, interact: { label: 'Rezar diante de Nossa Senhora' }, ix: 168, iy: 120,
      onUse: async () => {
        const p = DG.game.player; if (!p || sc.praying) return;
        sc.praying = true;
        await p.walkTo(168, 122, { facing: 'up' });
        await p.play('ajoelhar');
        const O = DG.data.ordo;
        for (const k of ['aveMaria1', 'aveMaria2']) {
          DG.emit('rite:say', { who: DG.game.role === 'sacerdos' ? 'P' : 'M', la: O[k].la, pt: O[k].pt, voice: 'submissa' });
          await DG.voice.speak(O[k].la, { role: DG.game.role === 'sacerdos' ? 'priest' : 'server', volume: 0.6 }).promise;
        }
        DG.hud.hideSay();
        sc.praying = false;
      } });
    sc.addProp({ id: 'pieta', x: 40, y: 80, examine: 'pieta', hit: { x: 20, y: 30, w: 40, h: 50 } });
    sc.addProp({ id: 'rose', x: 168, y: 18, examine: 'vitrum', hit: { x: 152, y: 2, w: 32, h: 32 } });
    sc.block(0, 0, W, 108); sc.block(0, 0, 12, H); sc.block(W - 12, 0, 12, H); sc.block(0, H - 10, W, 10);
    sc.free(W - 12, 120, 12, 52);
    sc.doors.push({ x: W - 14, y: 120, w: 14, h: 52, to: 'church', spawn: 'chapelDoor', label: 'Voltar à nave' });
    sc.addProp({ id: 'doorN', x: W - 8, y: 172, draw(x, sx, sy) { A.door(x, Math.round(sx) - 6, Math.round(sy) - 52, 12, 50, true); } });
    sc.points = { naveDoor: { x: W - 28, y: 150, facing: 'left' }, start: { x: 168, y: 200, facing: 'up' }, altar: { x: 168, y: 120, facing: 'up' } };
    sc.lighting.lights = [{ x: 168, y: 70, r: 110, color: '#b8c8ff', intensity: 0.3 }, { x: 270, y: 120, r: 70, color: '#ffbe6a', intensity: 0.5, flicker: true, halo: 14 }, { x: 168, y: 150, r: 180, color: '#9a8a90', intensity: 0.28 }];
    sc.lighting.shafts = [{ x0: 156, x1: 180, y0: 20, fx0: 140, fx1: 196, fy: 140, color: '#c8b8ff', color2: '#ffd8e0', alpha: 0.45 }];
    sc.dustAreas = [{ x: 140, y: 30, w: 56, h: 110, rate: 1.5 }];
    sc.camBounds = { x0: 0, y0: 0, x1: Math.max(0, W - DG.W), y1: Math.max(0, H - DG.H) };
    return sc;
  };
})(window.DG = window.DG || {});
