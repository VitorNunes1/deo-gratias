/* DEO GRATIAS — guia passo a passo (tutorial e dicas)
   Diz, em linguagem simples, O QUE fazer agora e COMO (tecla, botão, lugar),
   e mostra ONDE: seta dourada sobre o objeto ou o lugar, anel no chão e,
   se o alvo estiver fora da tela ou noutra sala, seta na borda apontando o caminho. */
(function (DG) {
  'use strict';
  const G = DG.gfx;
  const k = (key) => '<span class="kbd">' + key + '</span>';
  const keyOf = (g) => DG.input.keyLabel((DG.GEST.BY[g] || {}).key || '');
  const SCENE_NAME = { vestry: 'sala dos paramentos', sacristy: 'sacristia', church: 'capela', chapel: 'capela de Nossa Senhora' };
  // salas ligadas por portas
  const LINKS = { vestry: ['sacristy'], sacristy: ['vestry', 'church'], church: ['sacristy', 'chapel'], chapel: ['church'] };
  function nextHop(from, to) {
    if (from === to) return null;
    const prev = { [from]: null }, q = [from];
    while (q.length) { const s = q.shift(); for (const n of LINKS[s] || []) if (!(n in prev)) { prev[n] = s; q.push(n); } }
    if (!(to in prev)) return null;
    let cur = to; while (prev[cur] !== from) cur = prev[cur];
    return cur;
  }

  // ---------- tarefas da preparação ----------
  function prepStep(prep) {
    const GM = DG.game, me = GM.player, t = prep.current();
    if (!t) return null;
    const color = DG.LIT[prep.cel.color].name.toLowerCase();
    const P = (scene, prop, what, how) => ({ scene, prop, what, how });
    if (prep.role === 'sacerdos') {
      switch (t.id) {
        case 'missal': return P('sacristy', 'missalStand', 'Marque o Missal: a Missa de hoje e o Prefácio.', 'Vá até a estante do Missal (seta) e aperte ' + k('E') + '. Depois escolha a opção destacada.');
        case 'hands': return P('sacristy', 'lavaboSac', 'Lave as mãos, rezando “Da, Dómine, virtútem”.', 'Vá até o lavabo (seta) e aperte ' + k('E') + '.');
        case 'chalice': return P('sacristy', 'chaliceTable', 'Prepare o cálice.', 'Vá até a mesa do cálice (seta), aperte ' + k('E') + ' e escolha as peças na ordem destacada.');
        case 'vest': return P('vestry', 'drawer_' + prep.cel.color, 'Revista-se com os paramentos de cor ' + color + '.', 'Na sala dos paramentos, aperte ' + k('E') + ' na gaveta ' + color + ' do arcaz (seta). Depois escolha cada peça na ordem.');
        case 'take': return P('sacristy', 'chaliceTable', 'Tome o cálice e o barrete.', 'Volte à mesa do cálice, na sacristia (seta), e aperte ' + k('E') + '.');
      }
      return null;
    }
    switch (t.id) {
      case 'surplice': return P('vestry', 'serverHooks', 'Vista a batina e a sobrepeliz.', 'Vá até os cabides das vestes do acólito (seta) e aperte ' + k('E') + '.');
      case 'cruets': return P('sacristy', 'cruetTable', 'Encha as galhetas de vinho e de água.', 'Vá até a mesa das galhetas, na sacristia (seta), e aperte ' + k('E') + '.');
      case 'credence':
        if (me && me.base.carry === 'cruets') return P('church', 'credence', 'Leve as galhetas, a bacia e o manustérgio à credência.', 'Na capela, vá até a credência, a mesinha à direita do altar (seta), e aperte ' + k('E') + '. Ao passar diante do meio do altar, faça genuflexão: ' + k('5') + '.');
        return P('sacristy', 'cruetTable', 'Pegue as galhetas, a bacia e o manustérgio.', 'Aperte ' + k('E') + ' de novo na mesa das galhetas (seta) para pegá-los.');
      case 'cover': return { scene: 'church', point: { x: 340, y: 166 }, what: 'Retire a cobertura do altar.', how: 'Pare junto do altar, do lado direito (seta), e aperte ' + k('E') + '. Ao passar diante do meio do altar, faça genuflexão: ' + k('5') + '.' };
      case 'lighter': return P('sacristy', 'lighter', 'Pegue o acendedor das velas.', 'Na sacristia, vá até o acendedor (seta) e aperte ' + k('E') + '.');
      case 'candles': {
        const sc = GM.scene, st = sc && sc.id === 'church' ? sc.state : (GM.sceneStates.church || {});
        const order = GM.form === 'cantata' ? [3, 4, 5, 2, 1, 0] : [3, 2];
        const next = order.find(i => !(st.candles || [])[i]);
        const ep = next == null || next >= 3;
        return { scene: 'church', point: { x: ep ? 340 : 236, y: 166 }, what: ep ? 'Acenda a vela do lado da Epístola (à direita do altar).' : 'Agora acenda a vela do lado do Evangelho (à esquerda).', how: 'Pare junto do altar, onde está a seta, e aperte ' + k('E') + '. Ao passar diante do meio do altar, faça genuflexão: ' + k('5') + '.' };
      }
      case 'returnLighter': return P('sacristy', 'lighter', 'Devolva o acendedor ao seu lugar.', 'Volte à sacristia e aperte ' + k('E') + ' no lugar do acendedor (seta).');
      case 'assist':
        if (prep.priestWaiting) return { scene: 'vestry', actor: 'priest', what: 'Ajude o sacerdote a revestir-se.', how: 'Na sala dos paramentos, aproxime-se do sacerdote (seta). Depois escolha cada paramento na ordem destacada.' };
        return { scene: 'vestry', point: { x: 176, y: 140 }, what: 'Espere o sacerdote para ajudá-lo a revestir-se.', how: 'Ele ainda se prepara na sacristia. Aguarde na sala dos paramentos (seta); ele virá.' };
      case 'missal': return P('sacristy', 'missalStand', 'Tome o Missal para a procissão.', 'Na sacristia, vá até a estante do Missal (seta) e aperte ' + k('E') + '.');
    }
    return null;
  }

  // resolve o alvo (posição) dentro da sala atual, ou a porta que leva até lá
  function locate(step) {
    const GM = DG.game, sc = GM.scene;
    if (!step || !sc) return null;
    if (step.scene && step.scene !== sc.id) {
      const hop = nextHop(sc.id, step.scene);
      const d = hop && sc.doors.find(dd => dd.to === hop);
      if (!d) return null;
      return { x: d.x + d.w / 2, y: d.y + d.h / 2, door: true, via: SCENE_NAME[hop] || hop };
    }
    if (step.prop) { const p = sc.prop(step.prop); if (p) return { x: p.ix != null ? p.ix : p.x, y: p.iy != null ? p.iy : p.y, top: p.hit ? p.hit.y : p.y - 30 }; }
    if (step.actor === 'priest' && GM.priest && GM.priest.scene === sc.id) return { x: GM.priest.x, y: GM.priest.y, top: GM.priest.y - 34 };
    if (step.point) return { x: step.point.x, y: step.point.y };
    return null;
  }

  // ---------- rito ----------
  function riteStep(e) {
    const need = e.need, ws = e.windows || [];
    const priest = e.me === 'P';
    if (ws.length) {
      const w = ws[0];
      return { what: (w.g === 'tocar' ? 'Toque a campainha' : DG.GEST.name(w.g)) + (w.el && w.el.why ? ' (' + w.el.why + ')' : '') + ' — agora!', how: 'Aperte ' + k(keyOf(w.g)) + ' ou clique no botão que pisca na barra de baixo.', gesture: w.g };
    }
    if (!need) {
      return priest
        ? { what: 'Acompanhe a oração.', how: 'Os textos avançam sozinhos; leia na caixa de baixo. ' + k('F') + ' pula a leitura.', idle: true }
        : { what: 'Acompanhe o sacerdote.', how: 'Nada a fazer agora: leia o texto na caixa de baixo. Quando for sua vez, este quadro avisa.', idle: true };
    }
    switch (need.type) {
      case 'go': return { what: 'Vá a: ' + need.label + '.', how: 'Ande até o anel dourado indicado pela seta (setas ou WASD, ou clique no chão).', point: need.to };
      case 'kneel': return { what: need.label + '.', how: (need.at ? 'Vá até o anel dourado (seta) e aperte ' : 'Aperte ') + k('K') + ' para ajoelhar-se.', point: need.at, gesture: 'ajoelhar' };
      case 'g': return { what: DG.GEST.name(need.g) + (need.n > 1 ? ' (' + (need.n - need.count) + ' vezes)' : '') + '.', how: 'Aperte ' + k(keyOf(need.g)) + ' ou clique no botão que pisca na barra de baixo.', gesture: need.g };
      case 'act': return { what: need.label + '.', how: 'Aperte a tecla do botão que pisca, à direita da barra (' + k('Z') + ' ' + k('X') + ' ' + k('C') + ' ' + k('V') + '), ou clique nele.' };
      case 'actM': return { what: need.label + '.', how: 'Aperte ' + k('E') + ' para fazê-lo.' };
      case 'recite': return { what: 'Recite a oração.', how: 'Aperte ' + k('E') + ' para dizer o texto.' };
      case 'choice': return { what: 'Responda ao sacerdote em latim.', how: 'Escolha a frase certa, que está destacada: tecla ' + k('1') + ' ' + k('2') + ' ' + k('3') + ' ou clique nela.' };
    }
    return { what: e.needText(need), how: '' };
  }

  const Guide = DG.guide = {
    // o guia aparece no tutorial; nos outros modos, quando as dicas estão ligadas para o passo atual
    shown() {
      const GM = DG.game;
      if (GM.mode === 'tutorial') return true;
      if (GM.state === 'prep' && GM.prep) return !!GM.prep.hints && GM.mode !== 'celebracao';
      const e = GM.engine;
      if (GM.state === 'rite' && e) return !!(e.hintsOn || (e.need && e.need.lateMarked) || DG.hud.forceHint);
      return false;
    },
    current() {
      const GM = DG.game;
      if (!GM.scene || !Guide.shown()) return null;
      if (GM.state === 'prep' && GM.prep) {
        const pr = GM.prep;
        if (pr.waitGesture) { const g = pr.waitGesture.id; return { what: 'Faça o gesto: ' + DG.GEST.name(g) + '.', how: 'Aperte ' + k(keyOf(g)) + ' ou clique no botão que pisca.', gesture: g }; }
        if (pr.busy) return null;
        const st = prepStep(pr); if (!st) return null;
        const loc = locate(st);
        const how = loc && loc.door ? 'Primeiro vá à ' + loc.via + ' pela porta indicada (seta). ' + st.how : st.how;
        return { what: st.what, how, loc, gesture: st.gesture };
      }
      if (GM.state === 'rite' && GM.engine) {
        const st = riteStep(GM.engine);
        if (st.point) { const p = GM.scene.points[st.point]; st.loc = p ? { x: p.x, y: p.y } : null; }
        return st;
      }
      return null;
    },
    // marcador no mundo: anel no chão, seta saltitante e seta na borda quando fora da tela
    draw(x, cam, t) {
      const c = Guide.cur; if (!c || !c.loc) return;
      const sx = c.loc.x - cam.x, sy = c.loc.y - cam.y;
      const M = 12;
      if (sx < M || sx > DG.W - M || sy < M + 10 || sy > DG.H - M - 30) { Guide.edgeArrow(x, sx, sy, t); return; }
      const r = 11 + Math.sin(t * 5) * 2;
      G.shape(x, sx - r, sy - r / 2, r * 2 + 1, r + 1, (i, j) => { const dx = (i - r) / r, dy = (j - r / 2) / (r / 2); const d = dx * dx + dy * dy; return d <= 1 && d >= 0.5 ? (d > 0.8 ? '#7a5a1c' : '#f1d887') : false; });
      if (c.loc.door && (sx < 60 || sx > DG.W - 60)) { const dir = sx > DG.W / 2 ? 1 : -1; Guide.tri(x, sx - dir * (24 + Math.abs(Math.sin(t * 4)) * 4), sy, dir > 0 ? 0 : Math.PI); return; }
      const top = c.loc.door ? sy - 14 : (c.loc.top != null ? c.loc.top - cam.y : sy - 30);
      const ay = Math.round(Math.min(top, sy - 22) - 10 + Math.abs(Math.sin(t * 4)) * -5);
      Guide.arrowDown(x, Math.round(sx), ay);
    },
    arrowDown(x, cx, y) {
      const rows = ['.ooooooo.', '.ohhhhho.', '.ohgggho.', 'oohgggoo', 'ohgggggho', '.ohgggho.', '..ohgho..', '...ogo...', '....o....'];
      const pal = { o: '#2a1708', h: '#fff0b0', g: '#e2b850' };
      // seta em escala 2× para ser vista de longe
      rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const col = pal[r[i]]; if (col) G.rect(x, cx - 9 + i * 2, y - 8 + j * 2, 2, 2, col); } });
    },
    tri(x, px, py, a) {
      const ca = Math.cos(a), sa = Math.sin(a);
      G.shape(x, px - 9, py - 9, 19, 19, (i, j) => {
        const u = (i - 9) * ca + (j - 9) * sa, v = -(i - 9) * sa + (j - 9) * ca;
        if (!(u >= -7 && u <= 8 && Math.abs(v) <= (8 - u) * 0.55)) return false;
        const edge = u < -5.5 || Math.abs(v) > (8 - u) * 0.55 - 1.3;
        return edge ? '#2a1708' : (v < 0 ? '#fff0b0' : '#e2b850');
      });
    },
    edgeArrow(x, sx, sy, t) {
      const cx = DG.W / 2, cy = DG.H / 2;
      const a = Math.atan2(sy - cy, sx - cx);
      const M = 18 + Math.abs(Math.sin(t * 4)) * 3;
      // ponto na borda (evita a barra de gestos embaixo)
      const hw = DG.W / 2 - M, hh = DG.H / 2 - M - 14;
      const s = Math.min(hw / Math.abs(Math.cos(a) || 1e-6), hh / Math.abs(Math.sin(a) || 1e-6));
      const px = cx + Math.cos(a) * s, py = cy + Math.sin(a) * s - 8;
      const ca = Math.cos(a), sa = Math.sin(a);
      G.shape(x, px - 9, py - 9, 19, 19, (i, j) => {
        const u = (i - 9) * ca + (j - 9) * sa, v = -(i - 9) * sa + (j - 9) * ca; // u: ao longo da direção
        const inTri = u >= -7 && u <= 8 && Math.abs(v) <= (8 - u) * 0.55;
        if (!inTri) return false;
        const edge = u < -5.5 || Math.abs(v) > (8 - u) * 0.55 - 1.3;
        return edge ? '#2a1708' : (v < 0 ? '#fff0b0' : '#e2b850');
      });
    },
    seeThrough(c) {
      const H = DG.hud; if (!H.el) return;
      const panels = [H.tasks, H.rubric].filter(Boolean);
      let pt = null;
      if (c && c.loc && DG.game.camera) {
        const st = document.getElementById('stage').getBoundingClientRect(), k = st.width / DG.W;
        const sx = c.loc.x - DG.game.camera.x, sy = c.loc.y - DG.game.camera.y;
        pt = { x: st.left + sx * k, y0: st.top + (sy - 50) * k, y1: st.top + (sy + 6) * k };
      }
      for (const p of panels) {
        let hide = false;
        if (pt && p.style.display !== 'none') { const r = p.getBoundingClientRect(); hide = pt.x > r.left - 20 && pt.x < r.right + 20 && pt.y1 > r.top && pt.y0 < r.bottom; }
        p.classList.toggle('see-through', hide);
      }
    },
    // atualiza o quadro "Agora / Como" no HUD e o destaque de botões
    update() {
      const c = Guide.current();
      Guide.cur = c;
      DG.hud.setCoach(c && !(DG.ui.stack.length) ? c : null);
      Guide.seeThrough(c);
      // botão do gesto esperado pisca na barra (só quando muda, para não refazer a cada quadro)
      const g = (c && c.gesture) || null;
      if (g !== Guide.lastG) { if (g) DG.hud.highlight(g); else if (Guide.lastG && DG.game.state === 'prep') DG.hud.highlight(null); Guide.lastG = g; }
    },
  };
})(window.DG = window.DG || {});
