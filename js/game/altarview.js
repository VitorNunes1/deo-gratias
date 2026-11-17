/* DEO GRATIAS — vista aproximada da mesa do altar (do Ofertório às abluções) */
(function (DG) {
  'use strict';
  const G = DG.gfx, P = DG.pal;
  const GOLD = [P.g1, P.g2, P.g4, P.g6, P.g5, P.g4, P.g3, P.g2, P.g1];
  const W = 116, H = 66, X0 = DG.W - W - 6, Y0 = 34;
  const SHOW = ['offertorium', 'lavabo', 'secreta', 'canon', 'consecratio', 'postcons', 'pater', 'agnus', 'communio', 'ablutio'];

  const AV = DG.altarView = {
    st: null, cel: null, alpha: 0, act: null, actT: 0,
    reset(cel) {
      AV.cel = cel;
      AV.st = { corporal: true, chalice: 'veiled', host: 'onChalice', wine: false, water: false, particle: true, broken: false, paten: 'onChalice' };
      AV.alpha = 0; AV.act = null;
    },
    visible() {
      const e = DG.game.engine;
      return e && e.step && SHOW.includes(e.step.sec) && DG.game.state === 'rite' && DG.game.scene && DG.game.scene.id === 'church' && DG.game.engine.camMode !== 'communion';
    },
    onAct(a) {
      const s = AV.st; if (!s) return;
      AV.act = a; AV.actT = 0;
      switch (a) {
        case 'discooperireCalicem': s.chalice = 'bare'; s.host = 'onChalice'; break;
        case 'offerreHostiam': s.host = 'offered'; break;
        case 'crucemPatena': s.host = 'corporal'; s.paten = 'under'; break;
        case 'infundereVinum': s.wine = true; break;
        case 'infundereAquam': s.water = true; break;
        case 'offerreCalicem': s.chalice = 'raised'; setTimeout(() => { if (AV.st === s) s.chalice = 'bare'; }, 1600); break;
        case 'cooperirePalla': s.chalice = 'pall'; break;
        case 'discooperirePalla': s.chalice = 'bare'; break;
        case 'accipereHostiam': if (s.host !== 'none') s.host = 'hands'; break;
        case 'elevareHostiam': s.host = 'up'; setTimeout(() => { if (AV.st === s && s.host === 'up') s.host = 'hands'; }, 3600); break;
        case 'deponereHostiam': s.host = 'corporal'; break;
        case 'accipereCalicem': s.chalice = 'hands'; break;
        case 'elevareCalicem': s.chalice = 'up'; setTimeout(() => { if (AV.st === s && s.chalice === 'up') s.chalice = 'hands'; }, 3600); break;
        case 'deponereCalicem': s.chalice = 'pall'; break;
        case 'elevatioMinor': s.host = 'overChalice'; s.chalice = 'raisedLow'; setTimeout(() => { if (AV.st === s) { s.host = 'corporal'; s.chalice = 'bare'; } }, 1500); break;
        case 'signareCumHostia': s.host = 'overChalice'; break;
        case 'tollerePatenam': s.paten = 'hand'; break;
        case 'osculariPatenam': s.paten = 'hand'; break;
        case 'frangere': s.broken = true; s.host = 'broken'; s.paten = 'under'; break;
        case 'signareParticula': break;
        case 'commiscere': s.particle = false; break;
        case 'sumereHostiam': s.host = 'none'; break;
        case 'sumereSanguinem': s.wine = false; s.chalice = 'tilt'; setTimeout(() => { if (AV.st === s) s.chalice = 'bare'; }, 1800); break;
        case 'porrigereCalicem': s.chalice = 'tilt'; break;
        case 'ablutio': s.chalice = 'bare'; break;
        case 'componereCalicem': s.chalice = 'veiled'; s.corporal = false; s.host = 'none'; break;
        default: break;
      }
    },
    render(x) {
      const vis = AV.visible();
      AV.alpha += ((vis ? 1 : 0) - AV.alpha) * 0.08;
      if (AV.alpha < 0.03 || !AV.st) return;
      const s = AV.st, cel = AV.cel || {};
      const t = DG.game.t;
      AV.actT += 0.016;
      x.save(); x.globalAlpha = AV.alpha;
      // moldura
      G.rect(x, X0 - 3, Y0 - 3, W + 6, H + 6, P.g1); G.frame(x, X0 - 2, Y0 - 2, W + 4, H + 4, P.g4); G.frame(x, X0 - 1, Y0 - 1, W + 2, H + 2, P.g2);
      // fundo: painel de mármore escuro e banqueta
      G.vgrad(x, X0, Y0, W, 40, [P.md3, P.md2, P.md1]);
      G.rect(x, X0, Y0 + 30, W, 4, P.mb2); G.hline(x, X0, Y0 + 30, W, P.mb0);
      // mesa (toalha)
      G.rect(x, X0, Y0 + 40, W, H - 40, P.l4); G.hline(x, X0, Y0 + 40, W, P.l5); G.dither(x, X0, Y0 + 52, W, 14, P.l3, 0.3);
      // sacra central
      G.bevel(x, X0 + 20, Y0 + 16, 22, 16, P.g3, P.g5, P.g1); G.rect(x, X0 + 22, Y0 + 18, 18, 12, P.l4); for (let k = 0; k < 4; k++) G.hline(x, X0 + 24, Y0 + 20 + k * 2, 14, '#8a7a68');
      // crucifixo ao fundo
      G.rect(x, X0 + 92, Y0 + 2, 3, 28, '#1f130c'); G.rect(x, X0 + 86, Y0 + 8, 15, 3, '#1f130c'); G.vline(x, X0 + 92, Y0 + 2, 28, P.g4); G.hline(x, X0 + 86, Y0 + 8, 15, P.g4);
      G.rect(x, X0 + 93, Y0 + 10, 1, 9, '#efdcc2'); G.hline(x, X0 + 88, Y0 + 9, 11, '#efdcc2'); G.px(x, X0 + 93, Y0 + 8, '#efdcc2');
      // corporal
      const cx = X0 + 58, ty = Y0 + 52;
      if (s.corporal) { G.rect(x, X0 + 28, Y0 + 42, 60, 16, P.l5); G.frame(x, X0 + 28, Y0 + 42, 60, 16, P.l2); G.vline(x, X0 + 48, Y0 + 42, 16, P.l3); G.vline(x, X0 + 68, Y0 + 42, 16, P.l3); }
      // cálice
      const chY = s.chalice === 'up' ? ty - 26 : s.chalice === 'raised' || s.chalice === 'hands' ? ty - 10 : s.chalice === 'raisedLow' ? ty - 5 : ty;
      const chX = s.chalice === 'tilt' ? cx + 8 : cx + 4;
      if (s.chalice === 'veiled') {
        const c = (DG.LIT[cel.color] || DG.LIT.albus).main, tr = DG.TRIM[(DG.LIT[cel.color] || DG.LIT.albus).trim];
        G.shape(x, chX - 9, chY - 22, 19, 22, (i, j) => j >= Math.abs(i - 9) * 0.6 - 2, c[0]); G.vline(x, chX, chY - 20, 18, tr[1]); G.hline(x, chX - 6, chY - 14, 13, tr[1]);
        G.rect(x, chX - 8, chY - 25, 17, 4, c[1]); G.hline(x, chX - 8, chY - 25, 17, tr[1]);
      } else {
        DG.spr.lathe(x, chX, chY - 22, 22, j => (j < 8 ? 6 - j * 0.15 : j < 10 ? 2 : j < 13 ? 2.8 - Math.abs(j - 11) * 0.5 : j < 17 ? 1.5 : 2 + (j - 17) * 1.6), GOLD);
        if (s.wine && s.chalice !== 'pall') { G.rect(x, chX - 5, chY - 21, 11, 2, '#6a0f1e'); G.hline(x, chX - 5, chY - 21, 11, '#9a2234'); }
        if (s.chalice === 'pall') { G.rect(x, chX - 7, chY - 24, 15, 3, P.l5); G.frame(x, chX - 7, chY - 24, 15, 3, P.l2); G.px(x, chX, chY - 23, P.g4); }
        if (s.chalice === 'up') { // brilho
          x.save(); x.globalCompositeOperation = 'lighter'; const gr = x.createRadialGradient(chX, chY - 16, 0, chX, chY - 16, 18); gr.addColorStop(0, 'rgba(255,230,170,.6)'); gr.addColorStop(1, 'rgba(255,230,170,0)'); x.fillStyle = gr; x.fillRect(chX - 20, chY - 36, 40, 40); x.restore();
        }
      }
      // patena e hóstia
      const hx = cx - 18;
      if (s.host === 'onChalice' && s.chalice !== 'veiled') { G.ellipse(x, chX, chY - 23, 7, 1.5, P.g4); G.ellipse(x, chX, chY - 24, 5, 1.2, '#fbf6e6'); }
      if (s.host === 'offered') { G.ellipse(x, cx, ty - 20, 8, 2, P.g4); G.ellipse(x, cx, ty - 21, 5.5, 1.5, '#fbf6e6'); }
      if (s.host === 'corporal' || s.host === 'hands' || s.host === 'up' || s.host === 'broken' || s.host === 'overChalice') {
        if (s.host === 'corporal') { G.ellipse(x, hx, ty - 1, 6, 1.6, '#e9e1cc'); G.ellipse(x, hx, ty - 1.5, 5, 1.2, '#fbf6e6'); }
        else if (s.host === 'broken') { G.ellipse(x, hx - 3, ty - 1, 3, 1.4, '#fbf6e6'); G.ellipse(x, hx + 4, ty - 1, 3, 1.4, '#fbf6e6'); }
        else {
          const y = s.host === 'up' ? ty - 40 : s.host === 'overChalice' ? chY - 30 : ty - 12;
          const X = s.host === 'overChalice' ? chX : hx;
          G.ellipse(x, X, y, 5, 5, '#fbf6e6'); G.rect(x, X - 1, y - 3, 2, 6, '#e8dfc8'); G.rect(x, X - 3, y - 1, 6, 2, '#e8dfc8');
          // mãos do sacerdote
          const sk = DG.pal.skins[(DG.profile.character.sacerdos.skin) | 0];
          G.rect(x, X - 9, y + 2, 5, 3, sk[0]); G.rect(x, X + 5, y + 2, 5, 3, sk[1]);
          G.rect(x, X - 12, y + 4, 4, 6, P.l4); G.rect(x, X + 9, y + 4, 4, 6, P.l4);
          if (s.host === 'up') { x.save(); x.globalCompositeOperation = 'lighter'; const gr = x.createRadialGradient(X, y, 0, X, y, 20); gr.addColorStop(0, 'rgba(255,240,190,.75)'); gr.addColorStop(1, 'rgba(255,240,190,0)'); x.fillStyle = gr; x.fillRect(X - 22, y - 22, 44, 44); x.restore(); }
        }
      }
      if (s.paten === 'hand') { G.ellipse(x, cx - 30, ty - 14, 7, 2, P.g4); G.ellipse(x, cx - 31, ty - 15, 3, 1, P.g6); }
      else if (s.paten === 'under' && s.host !== 'onChalice') { G.ellipse(x, cx - 28, ty + 4, 7, 1.4, P.g3); }
      // gotas (água) e respingos
      if ((AV.act === 'infundereAquam' || AV.act === 'lavare' || AV.act === 'ablutio' || AV.act === 'infundereVinum') && AV.actT < 1.4) {
        for (let k = 0; k < 4; k++) { const yy = chY - 34 + ((t * 40 + k * 6) % 14); G.px(x, chX + 6 + (k % 2), yy, AV.act === 'infundereVinum' ? '#8a1426' : '#bfe3f2'); }
      }
      // título
      G.rect(x, X0, Y0 - 2 + H - 7, 0, 0, P.g4);
      x.restore();
      void G; void t;
    },
  };
  DG.on('rite:act', (d) => AV.onAct(d.a));
})(window.DG = window.DG || {});
