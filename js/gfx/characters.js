/* DEO GRATIAS — personagens procedurais (sacerdote, acólito, fiéis)
   draw(ctx, X, Y, spec, st, t): X,Y = ponto entre os pés (base).
   st: { facing, pose:'stand'|'kneel'|'sit', walk(0..1|-1), bow(0..3), genu(0..1), arms, sign(0..1), hold, kiss(0..1) } */
(function (DG) {
  'use strict';
  const G = DG.gfx, P = DG.pal;

  const SHOE = '#151110', SHOE_HI = '#3a2f2a';
  const ALB = ['#ffffff', '#efebe2', '#d6d0c2', '#b2ab9b'];

  function palFor(spec) {
    const lit = DG.LIT[spec.color] || DG.LIT.albus;
    return {
      skin: P.skins[DG.util.clamp(spec.skin | 0, 0, P.skins.length - 1)],
      hair: P.hairs[DG.util.clamp(spec.hairColor == null ? 1 : spec.hairColor, 0, P.hairs.length - 1)],
      v: lit.main, t: DG.TRIM[lit.trim],
      cassock: spec.cassock === 'ruber' ? ['#a3242b', '#7d1720', '#550e14'] : ['#2b2a30', '#1b1a1e', '#0f0e11'],
    };
  }

  // desenha itens nas mãos (coordenadas absolutas)
  function drawHeld(x, item, hx, hy, spec, t, facing) {
    const c = palFor(spec);
    switch (item) {
      case 'chalice': // cálice velado (levado à altura do peito)
        DG.spr.miniChalice(x, hx, hy + 2, spec.color, true); break;
      case 'chaliceBare': DG.spr.miniChalice(x, hx, hy + 2, spec.color, false); break;
      case 'host':
        G.ellipse(x, hx, hy, 2, 2, '#fffbea'); G.px(x, hx, hy - 1, '#e8dfc8'); break;
      case 'missal':
        G.rect(x, hx - 4, hy - 4, 8, 6, P.v2); G.rect(x, hx - 4, hy - 4, 8, 1, P.v4); G.rect(x, hx - 1, hy - 3, 2, 3, P.g4); G.rect(x, hx - 4, hy + 1, 8, 1, P.g3); break;
      case 'missalStand':
        G.rect(x, hx - 5, hy - 3, 10, 5, P.v2); G.rect(x, hx - 4, hy - 3, 4, 3, P.l4); G.rect(x, hx + 1, hy - 3, 3, 3, P.l3); G.rect(x, hx - 5, hy + 2, 10, 2, P.w3); break;
      case 'cruets':
        G.rect(x, hx - 4, hy - 3, 2, 4, '#7a1426'); G.px(x, hx - 4, hy - 4, '#b7c4cc');
        G.rect(x, hx + 2, hy - 3, 2, 4, '#c9dde6'); G.px(x, hx + 2, hy - 4, '#b7c4cc'); break;
      case 'cruetWine': G.rect(x, hx - 1, hy - 3, 2, 4, '#7a1426'); G.px(x, hx - 1, hy - 4, '#b7c4cc'); break;
      case 'cruetWater': G.rect(x, hx - 1, hy - 3, 2, 4, '#c9dde6'); G.px(x, hx - 1, hy - 4, '#b7c4cc'); break;
      case 'lavabo':
        G.ellipse(x, hx - 1, hy + 1, 3, 1, P.g4); G.rect(x, hx + 2, hy - 3, 2, 4, '#c9dde6');
        G.rect(x, hx - 5, hy - 2, 2, 5, P.l3); break;
      case 'bell': DG.spr.miniBell(x, hx, hy + 1); break;
      case 'paten': G.ellipse(x, hx, hy, 3, 1, P.g4); G.hline(x, hx - 2, hy - 1, 3, P.g6); break;
      case 'biretta': G.rect(x, hx - 2, hy - 2, 5, 3, '#151417'); G.px(x, hx, hy - 3, '#2a2a30'); break;
      case 'card': G.rect(x, hx - 3, hy - 4, 6, 5, P.l4); G.frame(x, hx - 3, hy - 4, 6, 5, P.g3); break;
      case 'pole': // acendedor/apagador
        G.line(x, hx, hy, hx + (facing === 'left' ? -3 : 3), hy - 14, P.w5);
        G.px(x, hx + (facing === 'left' ? -3 : 3), hy - 15, P.g4);
        if (spec.poleLit) G.px(x, hx + (facing === 'left' ? -3 : 3), hy - 16, P.flame1);
        break;
      case 'vestment':
        G.rect(x, hx - 4, hy - 2, 8, 4, spec.heldColor ? (DG.LIT[spec.heldColor] || DG.LIT.albus).main[1] : ALB[1]); G.hline(x, hx - 4, hy - 2, 8, '#fff'); break;
      case 'thurible':
        G.vline(x, hx, hy - 1, 7, P.g2); DG.spr.lathe(x, hx, hy + 6, 4, j => 1.5 + j * 0.4, [P.g2, P.g4, P.g6, P.g3, P.g1]); break;
      case 'cross': G.vline(x, hx, hy - 20, 26, P.w5); G.rect(x, hx - 3, hy - 22, 7, 2, P.g4); G.rect(x, hx - 1, hy - 25, 3, 8, P.g4); break;
      case 'ciborium': DG.spr.lathe(x, hx, hy - 4, 6, j => (j < 2 ? 1 + j : j < 4 ? 2.5 : 1), [P.g2, P.g4, P.g6, P.g3, P.g1]); G.rect(x, hx - 3, hy - 3, 7, 2, '#f3eddc'); break;
      case 'candle': G.rect(x, hx - 1, hy - 6, 2, 6, P.l4); G.px(x, hx - 1, hy - 7, P.flame1); break;
      case 'towel': G.rect(x, hx - 2, hy - 1, 4, 5, P.l3); break;
      default: break;
    }
  }

  // ------------------------------------------------------------------
  function drawPriestLike(x, X, Y, spec, st, t) {
    const c = palFor(spec);
    const f = st.facing || 'up';
    const vest = spec.vest || {};
    const hasCas = !!vest.casula, hasAlb = !!vest.alba, hasStole = !!vest.stola, hasMan = !!vest.manipulus;
    const cope = !!vest.pluviale;
    const kneel = st.pose === 'kneel';
    const genu = st.genu || 0;
    const bow = Math.max(st.bow || 0, st.kiss ? 3 : 0);
    const walk = st.walk == null ? -1 : st.walk;
    const step = walk >= 0 ? (walk < 0.5 ? 0 : 1) : -1;
    const bob = walk >= 0 && (walk % 0.5) > 0.25 ? 1 : 0;
    // deslocamento vertical do tronco (ajoelhar / genuflectir)
    const drop = kneel ? 8 : Math.round(genu * 6);
    const bodyY = Y + drop + bob;              // referência do tronco
    const R = (dx, dy, w, h, col) => G.rect(x, X + dx, bodyY + dy, w, h, col);
    const RA = (dx, dy, w, h, col) => G.rect(x, X + dx, Y + dy, w, h, col); // absoluto (pés)
    const side = f === 'left' || f === 'right';
    const m = f === 'left' ? -1 : 1;
    const S = (dx, dy, w, h, col) => { const xx = m > 0 ? X + dx : X - dx - w + 1; G.rect(x, xx, bodyY + dy, w, h, col); };

    // sombra
    G.shadow(x, X, Y, side ? 5 : 7, 2, 0.32);

    // ---- pés e parte inferior ----
    if (!kneel) {
      const lowerTop = -9 + Math.round(genu * 3);
      // pés
      if (side) {
        const fwd = step === 0 ? 2 : step === 1 ? -1 : 1;
        G.rect(x, X + (m > 0 ? fwd : -fwd - 2), Y - 1, 3, 1, SHOE);
        G.rect(x, X + (m > 0 ? -fwd - 1 : fwd - 1), Y - 1, 2, 1, SHOE_HI);
      } else {
        RA(-3, step === 0 ? -2 : -1, 2, 1, SHOE); RA(1, step === 1 ? -2 : -1, 2, 1, SHOE);
      }
      // alva ou batina até os pés
      const robe = hasAlb ? ALB : [c.cassock[0], c.cassock[1], c.cassock[2], c.cassock[2]];
      const hgt = -lowerTop - 1 - (drop > 0 ? 0 : 0);
      const top = bodyY + lowerTop;
      const h = Y - 1 - top;
      if (h > 0) {
        if (side) {
          const xx = m > 0 ? X - 3 : X - 3;
          G.rect(x, xx, top, 7, h, robe[1]); G.vline(x, m > 0 ? X + 3 : X - 3, top, h, robe[2]);
        } else {
          G.rect(x, X - 5, top, 11, h, robe[1]); G.vline(x, X - 5, top, h, robe[0]); G.vline(x, X + 5, top, h, robe[2]);
          if (hasAlb && h > 2) { for (let i = -5; i <= 5; i++) G.px(x, X + i, Y - 2, (i & 1) ? ALB[3] : ALB[0]); G.hline(x, X - 5, Y - 3, 11, ALB[2]); }
        }
      }
      void hgt;
    } else {
      // de joelhos: solas dos sapatos atrás (vista de costas) ou joelhos (frente)
      if (f === 'up') { RA(-3, -1, 2, 1, SHOE); RA(1, -1, 2, 1, SHOE); }
      else if (side) { S(-4, -1, 3, 1, SHOE); }
    }

    // ---- tronco ----
    const torsoTop = -23 + (bow >= 3 ? 3 : bow >= 2 ? 1 : 0);
    const torsoBot = -9;
    const halfW = (j) => { // j: linha a partir do topo do tronco
      if (j === 0) return 4; if (j === 1) return 5;
      if (cope) return 6 + Math.min(2, j * 0.15);
      if (!hasCas) return j < 6 ? 5 : 5;
      if (f === 'down' && j >= 5 && j <= 9) return 5; // cintura do "violino" na frente
      if (j >= (torsoBot - torsoTop) - 1) return 5;
      return 6;
    };
    const rows = torsoBot - torsoTop + (kneel ? 0 : 0);
    const garment = cope ? c.v : hasCas ? c.v : hasAlb ? ALB : c.cassock.concat([c.cassock[2]]);
    if (!side) {
      for (let j = 0; j <= rows; j++) {
        const hw = halfW(j);
        const yy = torsoTop + j;
        R(-hw, yy, hw * 2 + 1, 1, garment[1]);
        G.px(x, X - hw, bodyY + yy, garment[0]); G.px(x, X + hw, bodyY + yy, garment[2]);
        if ((hasCas || cope) && j > 1) { G.px(x, X - hw, bodyY + yy, c.t[1]); G.px(x, X + hw, bodyY + yy, c.t[2]); }
      }
      // sombreamento inferior
      if (hasCas || cope) G.dither(x, X - 5, bodyY + torsoBot - 4, 11, 4, garment[2], (i, j) => j / 6);
      if (hasCas && !cope) {
        // orfrei: cruz nas costas, coluna na frente
        R(-1, torsoTop + 1, 3, rows - 1, c.t[1]); R(0, torsoTop + 1, 1, rows - 1, c.t[0]);
        if (f === 'up') { R(-4, torsoTop + 4, 9, 2, c.t[1]); R(-4, torsoTop + 4, 9, 1, c.t[0]); }
        G.hline(x, X - 4, bodyY + torsoBot, 9, c.t[1]);
      }
      if (cope) { // pluvial: escudo e fecho
        if (f === 'up') { R(-4, torsoTop + 1, 9, 6, c.t[1]); R(-3, torsoTop + 2, 7, 4, c.v[2]); }
        else { R(-3, torsoTop, 2, rows, c.t[1]); R(2, torsoTop, 2, rows, c.t[1]); R(-2, torsoTop, 5, 2, P.g5); }
      }
      if (!hasCas && !cope && hasAlb) {
        // alva com cíngulo e estola cruzada (fase da paramentação)
        if (vest.cingulum) { R(-5, -14, 11, 1, ALB[3]); R(1, -14, 1, 6, ALB[3]); }
        if (hasStole) {
          if (f === 'down') { for (let k = 0; k < 7; k++) { G.px(x, X - 3 + k, bodyY - 21 + k, c.v[1]); G.px(x, X + 3 - k, bodyY - 21 + k, c.v[0]); } R(-4, -13, 2, 6, c.v[1]); R(3, -13, 2, 6, c.v[1]); R(-4, -8, 2, 1, c.t[1]); R(3, -8, 2, 1, c.t[1]); }
          else if (f === 'up') { R(-3, -23, 7, 2, c.v[1]); }
        }
      }
      // estola sob a casula (pontas visíveis na frente)
      if (hasCas && hasStole && f === 'down' && !kneel) { R(-4, torsoBot + 1, 2, 3, c.v[1]); R(3, torsoBot + 1, 2, 3, c.v[1]); R(-4, torsoBot + 4, 2, 1, c.t[1]); R(3, torsoBot + 4, 2, 1, c.t[1]); }
    } else {
      // vista lateral
      for (let j = 0; j <= rows; j++) {
        const yy = torsoTop + j;
        const back = j < 2 ? 2 : 3, fr = j < 2 ? 2 : (hasCas ? 3 : 3);
        S(-back, yy, back + fr + 1, 1, garment[1]);
        S(fr, yy, 1, 1, garment[2]);
        if (hasCas && j > 1) { S(-back, yy, 1, 1, c.t[1]); S(fr, yy, 1, 1, c.t[1]); }
      }
      if (hasCas) G.dither(x, X - 3, bodyY + torsoBot - 3, 7, 3, garment[2], (i, j) => j / 5);
    }

    // ---- braços / mãos ----
    const arms = st.arms || 'joined';
    const sk = c.skin;
    const sleeve = hasAlb ? ALB[1] : c.cassock[1];
    const manCol = c.v[0];
    const drawManiple = (mx, my) => { if (!hasMan) return; G.rect(x, mx, my, 2, 6, manCol); G.rect(x, mx, my + 6, 2, 1, c.t[1]); G.px(x, mx, my + 7, c.t[2]); };
    const ay = bodyY + torsoTop; // topo dos ombros
    if (f === 'up') {
      if (arms === 'extended' || arms === 'blessOpen') {
        G.rect(x, X - 9, ay + 4, 3, 3, sleeve); G.rect(x, X + 7, ay + 4, 3, 3, sleeve);
        G.rect(x, X - 10, ay + 2, 2, 3, sk[0]); G.rect(x, X + 9, ay + 2, 2, 3, sk[1]);
        drawManiple(X - 10, ay + 6);
      } else if (arms === 'raised') {
        G.rect(x, X - 5, ay - 6, 2, 7, sleeve); G.rect(x, X + 4, ay - 6, 2, 7, sleeve);
        G.rect(x, X - 3, ay - 10, 7, 3, sk[0]);
        drawManiple(X - 6, ay - 4);
        if (st.hold) drawHeld(x, st.hold === 'host' ? 'host' : st.hold, X + 0, ay - 13, spec, t, f);
      } else if (arms === 'raisedLow') { // pequena elevação / mostrar ao povo
        G.rect(x, X - 7, ay + 1, 2, 4, sleeve); G.rect(x, X + 6, ay + 1, 2, 4, sleeve);
        G.rect(x, X - 3, ay - 3, 7, 2, sk[0]);
        if (st.hold) drawHeld(x, st.hold, X, ay - 5, spec, t, f);
      } else if (arms === 'signum' || arms === 'breast' || arms === 'bless') {
        // vê-se o cotovelo direito movendo-se
        const ph = st.sign || 0;
        const ey = arms === 'breast' ? ay + 6 : ay + 2 + Math.round(Math.sin(ph * Math.PI) * 3);
        G.rect(x, X + 6, ey, 2, 3, sleeve);
        if (arms === 'bless') G.rect(x, X + 7, ey - 2, 2, 2, sk[1]);
      } else if (arms === 'forward' || arms === 'onAltar' || arms === 'overOblata') {
        G.rect(x, X - 8, ay + 5, 2, 3, sleeve); G.rect(x, X + 7, ay + 5, 2, 3, sleeve);
      } else {
        G.rect(x, X - 7, ay + 6, 1, 4, sleeve); G.rect(x, X + 7, ay + 6, 1, 4, ALB[2]);
      }
    } else if (f === 'down') {
      if (arms === 'extended' || arms === 'blessOpen') {
        G.rect(x, X - 9, ay + 4, 4, 2, sleeve); G.rect(x, X + 6, ay + 4, 4, 2, sleeve);
        G.rect(x, X - 10, ay + 2, 2, 3, sk[0]); G.rect(x, X + 9, ay + 2, 2, 3, sk[1]);
        drawManiple(X + 8, ay + 6);
      } else if (arms === 'signum') {
        const ph = st.sign || 0; // 0..1: fronte, peito, ombro esq., ombro dir.
        const pts = [[-1, -6], [-1, 6], [3, 2], [-3, 2]];
        const k = Math.min(3, Math.floor(ph * 4));
        const [hx, hy] = pts[k];
        G.rect(x, X - 2, ay + 7, 3, 2, sleeve);
        G.rect(x, X + hx - 1, ay + hy, 2, 2, sk[0]);
        G.rect(x, X + 2, ay + 7, 2, 2, sk[1]); drawManiple(X + 3, ay + 8);
      } else if (arms === 'bless') {
        const ph = st.sign || 0;
        const k = Math.min(3, Math.floor(ph * 4));
        const pts = [[0, -6], [0, 2], [-3, -2], [3, -2]];
        G.rect(x, X - 4, ay + 3, 3, 3, sleeve);
        G.rect(x, X + pts[k][0] - 4, ay + pts[k][1] + 1, 2, 3, sk[0]);
        G.rect(x, X + 2, ay + 7, 2, 2, sk[1]); drawManiple(X + 3, ay + 8);
      } else if (arms === 'breast') {
        G.rect(x, X - 3, ay + 6, 3, 2, sk[0]); G.rect(x, X + 2, ay + 8, 2, 2, sk[1]); drawManiple(X + 3, ay + 9);
      } else if (arms === 'raised') {
        G.rect(x, X - 5, ay - 6, 2, 7, sleeve); G.rect(x, X + 4, ay - 6, 2, 7, sleeve); G.rect(x, X - 3, ay - 9, 7, 3, sk[0]);
        if (st.hold) drawHeld(x, st.hold, X, ay - 12, spec, t, f);
      } else if (arms === 'raisedLow') {
        G.rect(x, X - 4, ay + 4, 9, 2, sleeve);
        if (st.hold) drawHeld(x, st.hold, X, ay + 2, spec, t, f);
        drawManiple(X + 4, ay + 6);
      } else if (arms === 'hold' && st.hold) {
        G.rect(x, X - 3, ay + 7, 7, 2, sleeve);
        drawHeld(x, st.hold, X, ay + 6, spec, t, f);
        drawManiple(X + 4, ay + 9);
      } else {
        // mãos juntas diante do peito (polegar direito sobre o esquerdo)
        G.rect(x, X - 2, ay + 7, 5, 2, sleeve);
        G.rect(x, X - 1, ay + 5, 3, 3, sk[0]); G.px(x, X + 1, ay + 5, sk[1]);
        drawManiple(X + 2, ay + 9);
      }
    } else {
      // lateral: mãos à frente
      if (arms === 'extended' || arms === 'blessOpen') { S(3, torsoTop + 3, 4, 2, sleeve); S(6, torsoTop + 1, 2, 3, sk[0]); }
      else if (arms === 'raised') { S(1, torsoTop - 7, 2, 8, sleeve); S(1, torsoTop - 10, 3, 3, sk[0]); if (st.hold) drawHeld(x, st.hold, X + m * 2, bodyY + torsoTop - 13, spec, t, f); }
      else if (arms === 'hold' && st.hold) { S(2, torsoTop + 6, 4, 2, sleeve); drawHeld(x, st.hold, X + m * 6, bodyY + torsoTop + 6, spec, t, f); }
      else { S(2, torsoTop + 6, 3, 2, sleeve); S(4, torsoTop + 5, 2, 2, sk[0]); if (hasMan) S(3, torsoTop + 7, 2, 5, manCol); }
    }

    // ---- cabeça ----
    const headDrop = bow === 1 ? 1 : bow === 2 ? 3 : bow >= 3 ? 6 : 0;
    const hy = bodyY - 30 + headDrop + (st.kiss ? -1 : 0);
    const hx = X;
    const skin = c.skin, hair = c.hair;
    if (f === 'up') {
      if (bow >= 3) {
        // inclinação profunda: só o alto da cabeça aparece acima dos ombros
        G.rect(x, hx - 3, bodyY + torsoTop - 2, 6, 3, hair);
        if (spec.tonsure) G.rect(x, hx - 1, bodyY + torsoTop - 2, 2, 1, skin[0]);
      } else {
        G.rect(x, hx - 3, hy + 1, 6, 6, hair); G.rect(x, hx - 2, hy, 4, 1, hair);
        G.px(x, hx - 3, hy + 4, skin[1]); G.px(x, hx + 2, hy + 4, skin[2]); // orelhas
        if (spec.tonsure) G.rect(x, hx - 1, hy + 1, 2, 1, skin[0]);
        G.rect(x, hx - 1, hy + 7, 2, 1, skin[2]); // nuca
      }
      if (vest.amictus || hasAlb) G.rect(x, hx - 2, bodyY + torsoTop - (bow >= 3 ? 0 : 1), 5, 1, ALB[1]);
    } else if (f === 'down') {
      if (bow >= 3) {
        G.rect(x, hx - 3, bodyY + torsoTop - 2, 6, 3, hair); G.rect(x, hx - 2, bodyY + torsoTop + 1, 4, 1, skin[1]);
      } else {
        G.rect(x, hx - 3, hy + 1, 6, 6, skin[0]); G.rect(x, hx - 2, hy, 4, 1, hair);
        G.rect(x, hx - 3, hy + 1, 6, 2, hair); G.px(x, hx - 3, hy + 3, hair); G.px(x, hx + 2, hy + 3, hair);
        G.vline(x, hx + 2, hy + 3, 4, skin[1]);
        if (spec.age === 'idoso') { G.rect(x, hx - 3, hy + 1, 6, 1, P.hairs[4]); }
        // olhos (mais fechados quando inclinado)
        const ec = bow ? skin[2] : '#1d130e';
        G.px(x, hx - 2, hy + 4, ec); G.px(x, hx + 1, hy + 4, ec);
        G.px(x, hx, hy + 5, skin[1]); G.hline(x, hx - 1, hy + 6, 2, skin[2]);
        if (spec.beard) { G.rect(x, hx - 2, hy + 6, 4, 1, hair); }
      }
      if (vest.amictus || hasAlb) G.rect(x, hx - 2, bodyY + torsoTop - 1, 5, 1, ALB[0]);
      else if (spec.collar) G.rect(x, hx - 1, bodyY + torsoTop - 1, 3, 1, '#f4f4f4');
    } else {
      const bx = m > 0 ? hx - 3 : hx - 2;
      G.rect(x, bx, hy + 1, 5, 6, skin[0]); G.rect(x, bx, hy, 5, 3, hair);
      G.rect(x, m > 0 ? bx : bx + 3, hy + 1, 2, 5, hair);
      G.px(x, m > 0 ? bx + 5 : bx - 1, hy + 4, skin[0]); // nariz
      G.px(x, m > 0 ? bx + 3 : bx + 1, hy + 3, bow ? skin[2] : '#1d130e'); // olho
      G.px(x, m > 0 ? bx + 1 : bx + 3, hy + 3, skin[1]); // orelha
      if (vest.amictus || hasAlb) G.rect(x, hx - 2, bodyY + torsoTop - 1, 4, 1, ALB[1]);
    }
    // barrete
    if (spec.biretta && bow < 3) {
      const by = hy - 2;
      G.rect(x, hx - 3, by + 1, 6, 2, '#151417'); G.rect(x, hx - 3, by + 1, 6, 1, '#2a2a30');
      G.px(x, hx - 2, by, '#1e1d22'); G.px(x, hx, by, '#1e1d22'); G.px(x, hx + 1, by, '#1e1d22');
      G.px(x, hx, by - 1, '#2a2a30');
    }
  }

  // ------------------------------------------------------------------
  function drawServer(x, X, Y, spec, st, t) {
    const c = palFor(spec);
    const f = st.facing || 'up';
    const kneel = st.pose === 'kneel';
    const genu = st.genu || 0;
    const bow = st.bow || 0;
    const walk = st.walk == null ? -1 : st.walk;
    const step = walk >= 0 ? (walk < 0.5 ? 0 : 1) : -1;
    const bob = walk >= 0 && (walk % 0.5) > 0.25 ? 1 : 0;
    const drop = kneel ? 7 : Math.round(genu * 5);
    const bodyY = Y + drop + bob;
    const side = f === 'left' || f === 'right';
    const m = f === 'left' ? -1 : 1;
    const S = (dx, dy, w, h, col) => { const xx = m > 0 ? X + dx : X - dx - w + 1; G.rect(x, xx, bodyY + dy, w, h, col); };
    const surplice = spec.surplice !== false;
    const cas = c.cassock;
    G.shadow(x, X, Y, side ? 4 : 6, 2, 0.3);

    // pés + batina
    if (!kneel) {
      if (side) { const fwd = step === 0 ? 2 : step === 1 ? -1 : 1; G.rect(x, X + (m > 0 ? fwd - 1 : -fwd - 1), Y - 1, 3, 1, SHOE); }
      else { G.rect(x, X - 3, Y - (step === 0 ? 2 : 1), 2, 1, SHOE); G.rect(x, X + 1, Y - (step === 1 ? 2 : 1), 2, 1, SHOE); }
      const top = bodyY - 9, h = Y - 1 - top;
      if (h > 0) {
        if (side) { G.rect(x, X - 3, top, 6, h, cas[1]); G.vline(x, m > 0 ? X + 2 : X - 3, top, h, cas[2]); }
        else { G.rect(x, X - 4, top, 9, h, cas[1]); G.vline(x, X - 4, top, h, cas[0]); G.vline(x, X + 4, top, h, cas[2]); }
      }
    } else if (f === 'up') { G.rect(x, X - 3, Y - 1, 2, 1, SHOE); G.rect(x, X + 1, Y - 1, 2, 1, SHOE); }

    // tronco
    const torsoTop = -19 + (bow >= 3 ? 3 : bow >= 2 ? 1 : 0);
    const torsoBot = kneel ? -2 : -7;
    const rows = torsoBot - torsoTop;
    if (!side) {
      for (let j = 0; j <= rows; j++) {
        const hw = j === 0 ? 3 : j === 1 ? 4 : Math.min(6, 4 + Math.floor(j / 4));
        const col = surplice ? (j === rows ? ALB[2] : ALB[1]) : cas[1];
        G.rect(x, X - hw, bodyY + torsoTop + j, hw * 2 + 1, 1, col);
        G.px(x, X - hw, bodyY + torsoTop + j, surplice ? ALB[0] : cas[0]); G.px(x, X + hw, bodyY + torsoTop + j, surplice ? ALB[3] : cas[2]);
      }
      if (surplice) { for (let i = -6; i <= 6; i += 2) G.px(x, X + i, bodyY + torsoBot, ALB[3]); G.hline(x, X - 5, bodyY + torsoBot - 1, 11, ALB[2]); }
      // gola da batina
      G.rect(x, X - 2, bodyY + torsoTop - 1, 5, 1, cas[1]);
    } else {
      for (let j = 0; j <= rows; j++) { const b = j < 2 ? 2 : 3, fr = j < 2 ? 2 : 3 + (j > 6 ? 1 : 0); S(-b, torsoTop + j, b + fr + 1, 1, surplice ? ALB[1] : cas[1]); S(fr, torsoTop + j, 1, 1, ALB[2]); }
    }

    // braços
    const arms = st.arms || 'joined';
    const sk = c.skin;
    const sl = surplice ? ALB[0] : cas[1];
    const ay = bodyY + torsoTop;
    if (f === 'up') {
      if (arms === 'raised' || arms === 'chasuble') { G.rect(x, X - 6, ay + 3, 2, 3, sl); G.rect(x, X + 5, ay + 1, 2, 4, sl); G.rect(x, X + 5, ay - 1, 2, 2, sk[1]); }
      else if (arms === 'hold' || arms === 'ring') { G.rect(x, X - 6, ay + 5, 2, 3, sl); G.rect(x, X + 5, ay + 5, 2, 3, sl); if (st.hold && (st.hold === 'pole' || st.hold === 'cross' || arms === 'ring')) drawHeld(x, st.hold, X + 6, ay + 5 - (arms === 'ring' && st.ringing ? 2 : 0), spec, t, f); }
      else if (arms === 'signum' || arms === 'breast') { const ph = st.sign || 0; G.rect(x, X + 5, ay + 2 + Math.round(Math.sin(ph * Math.PI) * 3), 2, 3, sl); }
      else { G.rect(x, X - 6, ay + 5, 1, 4, sl); G.rect(x, X + 6, ay + 5, 1, 4, ALB[2]); }
    } else if (f === 'down') {
      if (arms === 'hold' && st.hold) { G.rect(x, X - 5, ay + 6, 11, 2, sl); drawHeld(x, st.hold, X, ay + 6, spec, t, f); }
      else if (arms === 'ring') { G.rect(x, X + 3, ay + 4, 3, 3, sl); drawHeld(x, 'bell', X + 5, ay + 4 - (st.ringing ? 1 : 0), spec, t, f); G.rect(x, X - 2, ay + 6, 3, 2, sk[0]); }
      else if (arms === 'signum') { const k = Math.min(3, Math.floor((st.sign || 0) * 4)); const pts = [[-1, -5], [-1, 5], [2, 1], [-3, 1]]; G.rect(x, X - 2, ay + 6, 3, 2, sl); G.rect(x, X + pts[k][0], ay + pts[k][1], 2, 2, sk[0]); }
      else if (arms === 'breast') { G.rect(x, X - 2, ay + 4, 3, 2, sk[0]); G.rect(x, X + 1, ay + 7, 2, 2, sk[1]); }
      else { G.rect(x, X - 2, ay + 6, 5, 2, sl); G.rect(x, X - 1, ay + 4, 3, 3, sk[0]); }
    } else {
      if (arms === 'hold' && st.hold) { S(1, torsoTop + 5, 4, 2, sl); drawHeld(x, st.hold, X + m * 5, ay + 5, spec, t, f); }
      else if (arms === 'ring') { S(1, torsoTop + 4, 4, 2, sl); drawHeld(x, 'bell', X + m * 5, ay + 4 - (st.ringing ? 1 : 0), spec, t, f); }
      else { S(2, torsoTop + 5, 3, 2, sl); S(4, torsoTop + 4, 2, 2, sk[0]); }
    }

    // cabeça
    const headDrop = bow === 1 ? 1 : bow === 2 ? 2 : bow >= 3 ? 5 : 0;
    const hy = bodyY - 25 + headDrop;
    const hair = c.hair, skin = c.skin;
    if (f === 'up') {
      G.rect(x, X - 3, hy + 1, 6, 5, hair); G.rect(x, X - 2, hy, 4, 1, hair);
      G.px(x, X - 3, hy + 3, skin[1]); G.px(x, X + 2, hy + 3, skin[2]);
    } else if (f === 'down') {
      G.rect(x, X - 3, hy + 1, 6, 5, skin[0]); G.rect(x, X - 3, hy, 6, 2, hair); G.rect(x, X - 2, hy - 1, 4, 1, hair);
      if (spec.hair === 1) { G.px(x, X - 3, hy + 2, hair); G.px(x, X + 2, hy + 2, hair); }
      G.vline(x, X + 2, hy + 2, 3, skin[1]);
      const ec = bow ? skin[2] : '#1d130e';
      G.px(x, X - 2, hy + 3, ec); G.px(x, X + 1, hy + 3, ec); G.hline(x, X - 1, hy + 5, 2, skin[2]);
    } else {
      const bx = m > 0 ? X - 3 : X - 2;
      G.rect(x, bx, hy + 1, 5, 5, skin[0]); G.rect(x, bx, hy, 5, 2, hair); G.rect(x, m > 0 ? bx : bx + 3, hy + 1, 2, 3, hair);
      G.px(x, m > 0 ? bx + 5 : bx - 1, hy + 3, skin[0]); G.px(x, m > 0 ? bx + 3 : bx + 1, hy + 2, '#1d130e');
    }
    // itens sustentados na frente quando de costas (ex.: missal) — aparecem acima dos ombros
    if (f === 'up' && arms === 'hold' && st.hold && st.hold !== 'pole' && st.hold !== 'cross') {
      if (st.hold === 'missal' || st.hold === 'missalStand') G.rect(x, X - 3, ay + 1, 7, 2, P.v2);
    }
  }

  // ------------------------------------------------------------------
  function drawFaithful(x, X, Y, spec, st, t) {
    const c = palFor(spec);
    const f = st.facing || 'up';
    const pose = st.pose || 'stand';
    const walk = st.walk == null ? -1 : st.walk;
    const step = walk >= 0 ? (walk < 0.5 ? 0 : 1) : -1;
    const H = spec.child ? 18 : spec.female ? 25 : 27;
    const drop = pose === 'kneel' ? 7 : pose === 'sit' ? 5 : 0;
    const bodyY = Y + drop;
    const side = f === 'left' || f === 'right';
    const m = f === 'left' ? -1 : 1;
    const cloth = spec.cloth || ['#3b3f4a', '#2a2d36', '#1c1e25'];
    const skin = c.skin, hair = c.hair;
    const bow = st.bow || 0;
    G.shadow(x, X, Y, 5, 2, 0.28);
    const headH = spec.child ? 5 : 6;
    const top = bodyY - H;
    // corpo
    const bodyTop = top + headH + 1;
    const bodyBot = Y - 1;
    if (pose === 'stand' || walk >= 0) {
      if (!spec.female) {
        G.rect(x, X - 3, bodyBot - 1, 2, 1, SHOE); G.rect(x, X + 1, bodyBot - (step === 1 ? 2 : 1), 2, 1, SHOE);
        G.rect(x, X - 3, bodyTop + 9, 6, bodyBot - bodyTop - 9, spec.trousers || '#24252b');
      } else {
        G.rect(x, X - 2, bodyBot, 2, 1, SHOE); G.rect(x, X + 1, bodyBot - (step === 1 ? 1 : 0), 2, 1, SHOE);
      }
    }
    const torsoH = spec.female ? (bodyBot - bodyTop - (pose === 'stand' ? 1 : 0)) : 10;
    for (let j = 0; j < torsoH; j++) {
      const hw = spec.child ? 3 : (spec.female ? Math.min(5, 3 + Math.floor(j / 4)) : (j < 1 ? 3 : 4));
      if (bodyTop + j > Y - 1) break;
      G.rect(x, X - hw, bodyTop + j, hw * 2 + 1, 1, cloth[1]);
      G.px(x, X - hw, bodyTop + j, cloth[0]); G.px(x, X + hw, bodyTop + j, cloth[2]);
    }
    if (f === 'down' && !spec.female) { G.rect(x, X - 1, bodyTop, 2, 3, '#e9e6de'); G.px(x, X, bodyTop + 1, spec.tie || '#5a1320'); }
    // mãos
    if (f === 'down' || f === 'up') {
      if (st.arms === 'joined' || pose === 'kneel') { if (f === 'down') G.rect(x, X - 1, bodyTop + 4, 3, 2, skin[0]); else { G.px(x, X - 4, bodyTop + 5, cloth[0]); G.px(x, X + 4, bodyTop + 5, cloth[2]); } }
      if (st.arms === 'signum' && f === 'down') { const k = Math.min(3, Math.floor((st.sign || 0) * 4)); const pts = [[-1, -4], [-1, 4], [2, 1], [-3, 1]]; G.rect(x, X + pts[k][0], bodyTop + 2 + pts[k][1], 2, 2, skin[0]); }
    }
    // cabeça
    const hy = top + (bow ? 2 : 0);
    if (f === 'up') {
      G.rect(x, X - 3, hy, 6, headH, hair);
      if (spec.veil) {
        const dark = spec.veil === '#1c1c1c';
        G.rect(x, X - 3, hy - 1, 6, headH + 3, spec.veil); G.rect(x, X - 4, hy + 2, 1, 5, spec.veil); G.rect(x, X + 3, hy + 2, 1, 5, spec.veil);
        G.hline(x, X - 2, hy - 1, 4, dark ? '#3a3a3a' : '#ffffff'); // brilho da renda
        G.px(x, X - 2, hy + 2, dark ? '#2e2e2e' : G.mix(spec.veil, '#a89f8c', 0.35)); G.px(x, X + 1, hy + 4, dark ? '#2e2e2e' : G.mix(spec.veil, '#a89f8c', 0.35));
      }
      else if (spec.female && spec.longHair) G.rect(x, X - 3, hy + headH, 6, 3, hair);
    } else if (f === 'down') {
      G.rect(x, X - 3, hy, 6, headH, skin[0]); G.rect(x, X - 3, hy, 6, 2, hair);
      G.px(x, X - 2, hy + 3, '#1d130e'); G.px(x, X + 1, hy + 3, '#1d130e'); G.vline(x, X + 2, hy + 2, headH - 2, skin[1]);
      if (spec.veil) { G.rect(x, X - 4, hy - 1, 8, 2, spec.veil); G.rect(x, X - 4, hy, 1, headH + 2, spec.veil); G.rect(x, X + 3, hy, 1, headH + 2, spec.veil); }
    } else {
      const bx = m > 0 ? X - 3 : X - 2;
      G.rect(x, bx, hy, 5, headH, skin[0]); G.rect(x, bx, hy, 5, 2, hair); G.rect(x, m > 0 ? bx : bx + 3, hy, 2, 4, hair);
      G.px(x, m > 0 ? bx + 3 : bx + 1, hy + 3, '#1d130e');
      if (spec.veil) G.rect(x, bx - 1, hy - 1, 7, 3, spec.veil);
    }
  }

  DG.chars = {
    draw(x, X, Y, spec, st, t) {
      X = Math.round(X); Y = Math.round(Y);
      if (spec.kind === 'priest') drawPriestLike(x, X, Y, spec, st, t);
      else if (spec.kind === 'server') drawServer(x, X, Y, spec, st, t);
      else drawFaithful(x, X, Y, spec, st, t);
    },
    drawHeld,
    // miniatura para cartões de seleção (escala inteira)
    portrait(spec, st, scale) {
      const cv = G.canvas(40 * scale, 40 * scale);
      const tmp = G.canvas(40, 40);
      DG.chars.draw(tmp.x, 20, 36, spec, Object.assign({ facing: 'down', arms: 'joined' }, st || {}), 0);
      cv.x.imageSmoothingEnabled = false;
      cv.x.drawImage(tmp.c, 0, 0, 40 * scale, 40 * scale);
      cv.c.style.imageRendering = 'pixelated';
      return cv.c;
    },
  };
})(window.DG = window.DG || {});
