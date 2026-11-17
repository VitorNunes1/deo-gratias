/* DEO GRATIAS — HUD da celebração e da exploração */
(function (DG) {
  'use strict';
  const { h } = DG.ui;
  const U = DG.util;

  const WHO = { P: 'Sacerdos', M: 'Minister', PM: 'Sacerdos et minister', O: 'Populus', C: 'Schola (coro)' };
  const VOICE = { clara: 'em voz alta', media: 'em voz média', secreta: 'em silêncio', submissa: 'em voz baixa', consecr: 'em silêncio — palavras da Consagração', cantus: 'cantado', cantusChorus: 'cantado pelo coro' };

  const HUD = DG.hud = {
    el: null, engine: null, offs: [],
    build(mode) {
      HUD.destroy();
      HUD.mode = mode; // 'rite' | 'explore' | 'prep'
      const el = HUD.el = h('div', { class: 'hud' });
      HUD.banner = h('div', { class: 'hud-banner' }, h('span', { class: 'b1' }), h('span', { class: 'sub' }));
      HUD.progress = h('div', { class: 'hud-progress' }, h('i'));
      HUD.rubric = h('div', { class: 'hud-rubric panel' },
        h('div', { class: 'rhead' }, h('span', { class: 'rt' }, 'Rubrica'), h('span', { class: 'kbd', title: 'Mostrar/ocultar (R)' }, 'R')),
        h('div', { class: 'rtext' }), h('div', { class: 'rhint' }), h('div', { class: 'rref' }));
      HUD.rubric.querySelector('.rhead').addEventListener('click', () => HUD.toggleRubric());
      HUD.dialog = h('div', { class: 'hud-dialog panel dark hidden' }, h('div', { class: 'who' }), h('div', { class: 'latin' }), h('div', { class: 'trad' }), h('div', { class: 'skip' }, 'F — pular'));
      HUD.choices = h('div', { class: 'hud-choices', style: { display: 'none' } });
      HUD.actions = h('div', { class: 'hud-actions' });
      HUD.promptEl = h('div', { class: 'hud-prompt', style: { display: 'none' } });
      HUD.tasks = h('div', { class: 'hud-tasks panel', style: { display: 'none' } });
      HUD.hands = h('div', { class: 'hud-hand' });
      HUD.score = h('div', { class: 'hud-score' });
      HUD.corner = h('div', { class: 'hud-corner' },
        h('button', { class: 'ibtn', title: 'Missal e livro de orações (M)', onclick: () => DG.book.open('missal') }, '✠'),
        h('button', { class: 'ibtn', title: 'Manual litúrgico (L)', onclick: () => DG.book.open('manual') }, 'L'),
        h('button', { class: 'ibtn', title: 'Objetos litúrgicos (O)', onclick: () => DG.book.open('objects') }, 'O'),
        h('button', { class: 'ibtn', title: 'Pausa (Esc)', onclick: () => DG.screens.pause() }, 'II'));
      el.append(HUD.banner, HUD.progress, HUD.rubric, HUD.tasks, HUD.dialog, HUD.choices, HUD.actions, HUD.promptEl, HUD.hands, HUD.score, HUD.corner);
      DG.ui.root.insertBefore(el, DG.ui.root.firstChild);
      if (mode !== 'rite') { HUD.rubric.style.display = 'none'; HUD.progress.style.display = 'none'; }
      if (DG.profile && DG.profile.rubricCollapsed) HUD.rubric.classList.add('collapsed');
      HUD.buildActions();
      HUD.listen();
    },
    destroy() {
      HUD.offs.forEach(f => f()); HUD.offs = [];
      if (HUD.el && HUD.el.parentNode) HUD.el.parentNode.removeChild(HUD.el);
      HUD.el = null;
    },
    on(ev, fn) { HUD.offs.push(DG.on(ev, fn)); },
    toggleRubric() { HUD.rubric.classList.toggle('collapsed'); if (DG.profile) { DG.profile.rubricCollapsed = HUD.rubric.classList.contains('collapsed'); DG.store.save(); } },
    setBanner(t, sub) {
      if (!HUD.el) return;
      HUD.banner.querySelector('.b1').textContent = t || ''; HUD.banner.querySelector('.sub').textContent = sub || ''; HUD.banner.style.display = t ? '' : 'none';
      // fora da Missa, o nome do lugar aparece ao entrar e depois se recolhe (não cobre o cenário)
      clearTimeout(HUD._bannerT); HUD.banner.classList.remove('faded');
      if (t && DG.game.state !== 'rite') HUD._bannerT = setTimeout(() => { if (DG.game.state !== 'rite') HUD.banner.classList.add('faded'); }, 5000);
    },
    setTasks(title, list) {
      if (!HUD.el) return;
      if (!list) { HUD.tasks.style.display = 'none'; return; }
      HUD.tasks.style.display = '';
      HUD.tasks.innerHTML = '';
      HUD.tasks.append(h('h4', null, title));
      let curSet = false;
      list.forEach(t => {
        const cur = !t.done && !curSet; if (cur) curSet = true;
        HUD.tasks.append(h('div', { class: 'task' + (t.done ? ' done' : '') + (cur ? ' cur' : '') }, h('span', { class: 'box' }, t.done ? '✓' : ''), h('span', null, t.label)));
      });
    },
    // ---------- barra de gestos ----------
    buildActions() {
      HUD.actions.innerHTML = '';
      const role = DG.game && DG.game.role;
      if (!role) return;
      const list = DG.GEST.forRole(role);
      const grp = h('div', { class: 'grp' });
      list.forEach(gd => {
        const keyLbl = DG.input.keyLabel(gd.key);
        const ic = document.createElement('canvas'); ic.width = 12; ic.height = 12; ic.getContext('2d').drawImage(DG.GEST.icon(gd.id), 0, 0);
        const b = h('button', { class: 'act', 'data-g': gd.id, onclick: () => DG.game.gesture(gd.id) }, ic, h('span', { class: 'key' }, keyLbl));
        b.addEventListener('mouseenter', (e) => DG.ui.tip('<b>' + gd.name + '</b> <span class="small muted">[' + keyLbl + ']</span><br><i>' + gd.la + '</i><br>' + gd.desc, e.clientX, e.clientY));
        b.addEventListener('mouseleave', () => DG.ui.tip(null));
        grp.append(b);
      });
      HUD.actions.append(grp);
      HUD.altarGrp = h('div', { class: 'grp', style: { display: 'none' } });
      HUD.actions.append(HUD.altarGrp);
    },
    showAltarActs(options) {
      if (!HUD.altarGrp) return;
      if (!options) { HUD.altarGrp.style.display = 'none'; HUD.altarGrp.innerHTML = ''; return; }
      HUD.altarGrp.style.display = 'flex'; HUD.altarGrp.innerHTML = '';
      const keys = ['Z', 'X', 'C', 'V'];
      options.forEach((o, i) => {
        const b = h('button', { class: 'act', 'data-a': o.id, style: { width: 'calc(var(--u)*40)', fontSize: '.62em', color: '#f3e3bd', padding: '0 calc(var(--u)*1)', lineHeight: '1.1' }, onclick: () => DG.game.altarAct(o.id) }, h('span', { class: 'key' }, keys[i]), o.label);
        HUD.altarGrp.append(b);
      });
      HUD.altarKeys = options.map(o => o.id);
    },
    highlight(gid, actId) {
      if (!HUD.el) return;
      HUD.actions.querySelectorAll('.act').forEach(b => b.classList.toggle('hint', !!((gid && b.dataset.g === gid) || (actId && b.dataset.a === actId))));
    },
    flashWrong(gid) { const b = HUD.actions.querySelector('[data-g="' + gid + '"]'); if (b) { b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong'); } },
    // ---------- diálogo ----------
    showSay(d) {
      if (!HUD.el) return;
      const tm = DG.settings.textMode;
      const who = HUD.dialog.querySelector('.who'), la = HUD.dialog.querySelector('.latin'), tr = HUD.dialog.querySelector('.trad');
      who.innerHTML = '';
      who.append(h('span', null, WHO[d.who] || ''), h('span', { class: 'voice' }, VOICE[d.voice] || ''));
      HUD.chantScore = null;
      if (d.score) {
        // partitura gregoriana com a nota atual acesa
        la.className = 'latin';
        la.innerHTML = '';
        const strip = h('div', { class: 'chant-strip' });
        const cv = h('canvas', { style: { width: '100%' } });
        strip.append(cv); la.append(strip);
        HUD.chantScore = d.score; HUD.chantCanvas = cv; HUD.chantStrip = strip; HUD.lastNote = -2;
        requestAnimationFrame(() => { if (HUD.chantCanvas === cv) DG.notation.draw(cv, d.score, { S: 8 }); });
        if (!HUD.chantRaf) HUD.chantTick();
      } else if (d.voice === 'consecr') {
        la.className = 'latin'; la.innerHTML = '<div class="consecr">' + DG.ui.esc(d.la) + '</div>';
      } else {
        la.className = 'latin' + (d.voice === 'secreta' ? ' secreta' : '');
        const words = d.la.split(/(\s+)/);
        let idx = 0;
        HUD.wordStarts = [];
        la.innerHTML = words.map(w => { const s = idx; idx += w.length; if (/^\s+$/.test(w)) return w; HUD.wordStarts.push(s); return '<span class="w" data-i="' + s + '">' + DG.ui.fmtLatin(w) + '</span>'; }).join('');
      }
      la.style.display = tm === 'pt' ? 'none' : '';
      tr.textContent = d.pt || '';
      tr.style.display = tm === 'latin' || !d.pt ? 'none' : '';
      HUD.dialog.classList.remove('hidden');
    },
    boundary(i) {
      if (!HUD.el) return;
      const spans = HUD.dialog.querySelectorAll('.latin .w');
      let best = null;
      spans.forEach(s => { if (+s.dataset.i <= i + 1) best = s; });
      spans.forEach(s => s.classList.toggle('cur', s === best));
    },
    hideSay() { if (HUD.el) HUD.dialog.classList.add('hidden'); HUD.chantScore = null; },
    chantTick() {
      HUD.chantRaf = requestAnimationFrame(() => {
        HUD.chantRaf = null;
        const e = DG.game.engine;
        if (!HUD.chantScore || !HUD.el) return;
        const cc = e && e.curChant && e.curChant.h;
        if (cc && cc.score === HUD.chantScore || (cc && cc.score && HUD.chantScore && cc.score.notes === HUD.chantScore.notes)) {
          const i = cc.noteAt(cc.position);
          if (i !== HUD.lastNote) {
            HUD.lastNote = i;
            const L = DG.notation.draw(HUD.chantCanvas, HUD.chantScore, { current: i, S: 8 });
            const p = L && L.notes[Math.max(0, i)];
            if (p) HUD.chantStrip.scrollTop = Math.max(0, p.line * L.lineH - 4);
          }
        }
        HUD.chantTick();
      });
    },
    // ---------- escolhas (respostas do acólito) ----------
    showChoices(need) {
      if (!HUD.el) return;
      if (!need) { HUD.choices.style.display = 'none'; HUD.choices.innerHTML = ''; if (HUD.choicePop) { HUD.choicePop(); HUD.choicePop = null; } return; }
      HUD.hideSay();
      HUD.choices.innerHTML = '';
      HUD.choices.append(h('div', { class: 'qhead' }, 'Responda (1, 2, 3)'));
      const showPt = DG.settings.textMode !== 'latin' && (DG.game.engine.hintsOn);
      need.options.forEach((o, i) => {
        const la = o.la.length > 120 ? o.la.slice(0, 110) + '…' : o.la;
        const b = h('button', { class: 'choice', onclick: () => DG.game.engine.onChoice(i) }, h('span', { class: 'k' }, String(i + 1)), h('span', { html: DG.ui.fmtLatin(la) }), showPt ? h('span', { class: 'tr' }, o.pt.length > 110 ? o.pt.slice(0, 100) + '…' : o.pt) : null);
        if (DG.game.engine.hintsOn && o.ok && DG.game.engine.mode === 'tutorial') b.classList.add('hint');
        HUD.choices.append(b);
      });
      HUD.choices.style.display = 'flex';
      if (HUD.choicePop) HUD.choicePop();
      const handler = (ev) => {
        if (ev.type !== 'key') return false;
        const n = { Digit1: 0, Digit2: 1, Digit3: 2, Numpad1: 0, Numpad2: 1, Numpad3: 2 }[ev.code];
        if (n != null) { DG.game.engine.onChoice(n); return true; }
        return false;
      };
      HUD.choicePop = DG.input.pushHandler(handler);
    },
    choiceResult(r) {
      const btn = HUD.choices.querySelectorAll('.choice')[r.i];
      if (!btn) return;
      if (r.ok) btn.classList.add('right'); else { btn.classList.remove('wrong'); void btn.offsetWidth; btn.classList.add('wrong'); if (DG.game.engine.hintsOn) HUD.choices.querySelectorAll('.choice').forEach((b, i) => { if (DG.game.engine.need && DG.game.engine.need.options && DG.game.engine.need.options[i] && DG.game.engine.need.options[i].ok) b.classList.add('hint'); }); }
    },
    // ---------- rubrica ----------
    setStep(s, idx, total, engine) {
      if (!HUD.el) return;
      const sec = DG.rite.SECTIONS.find(x => x.id === s.sec) || {};
      HUD.setBanner(sec.name || '', sec.la || '');
      HUD.progress.firstChild.style.width = Math.round(100 * idx / Math.max(1, total - 1)) + '%';
      HUD.rubric.querySelector('.rt').textContent = s.title;
      HUD.rubric.querySelector('.rtext').textContent = s.rub ? (s.rub[engine.me] || '') : '';
      HUD.rubric.querySelector('.rref').textContent = s.ref ? 'Fonte: ' + s.ref : '';
      HUD.rubric.querySelector('.rhint').textContent = '';
      if (engine.mode !== 'celebracao') { HUD.rubric.classList.remove('flash'); void HUD.rubric.offsetWidth; HUD.rubric.classList.add('flash'); }
    },
    setNeed(need, engine) {
      if (!HUD.el) return;
      const hint = HUD.rubric.querySelector('.rhint');
      HUD.showAltarActs(null); HUD.highlight(null);
      HUD.showChoices(null);
      if (!need) { hint.textContent = ''; return; }
      if (need.type === 'choice') { HUD.showChoices(need); hint.textContent = ''; return; }
      if (need.type === 'act') HUD.showAltarActs(need.options);
      const show = engine.hintsOn || need.lateMarked || HUD.forceHint;
      if (show) {
        hint.innerHTML = '➤ ' + DG.ui.esc(engine.needText(need)) + (need.type === 'g' ? ' <span class="kbd">' + DG.input.keyLabel((DG.GEST.BY[need.g] || {}).key || '') + '</span>' : need.type === 'actM' || need.type === 'recite' ? ' <span class="kbd">E</span>' : '');
        if (need.type === 'g') HUD.highlight(need.g); else if (need.type === 'act') HUD.highlight(null, need.a);
      } else hint.textContent = '';
    },
    setWindows(ws, engine) {
      if (!HUD.el) return;
      if (!engine.hintsOn) return;
      ws.forEach(w => HUD.highlight(w.g));
      if (!ws.length && !engine.need) HUD.highlight(null);
    },
    // ---------- mãos ----------
    setHands(item) {
      if (!HUD.el) return;
      HUD.hands.innerHTML = '';
      if (!item) return;
      const map = { cruets: 'urceoli', lavabo: 'lavabo', bell: 'campanula', paten: 'patenaCommunionis', missal: 'missale', missalStand: 'missale', biretta: 'birretum', chalice: 'calix', card: 'sacrae', pole: 'extinctorium', ciborium: 'pyxis', cross: 'crux', thurible: 'thuribulum', towel: 'manutergium' };
      const id = map[item] || item;
      const c = DG.ui.iconCanvas(id, DG.game.cel && DG.game.cel.color, 1);
      c.style.width = ''; c.style.height = '';
      HUD.hands.append(h('div', { class: 'hand-slot', title: 'Nas mãos' }, c, h('span', { class: 'lbl' }, 'mãos')));
    },
    prompt(text, sx, sy) {
      if (!HUD.el) return;
      if (!text) { HUD.promptEl.style.display = 'none'; return; }
      HUD.promptEl.innerHTML = '<span class="k">E</span>' + DG.ui.esc(text);
      HUD.promptEl.style.display = '';
      HUD.promptEl.style.left = (sx / DG.W * 100) + '%';
      HUD.promptEl.style.top = (sy / DG.H * 100) + '%';
    },
    setScore(text) { if (HUD.el) HUD.score.textContent = text || ''; },
    listen() {
      HUD.on('rite:step', (d) => HUD.setStep(d.step, d.idx, d.total, d.engine));
      HUD.on('rite:need', (n) => HUD.setNeed(n, DG.game.engine));
      HUD.on('rite:windows', (ws) => HUD.setWindows(ws, DG.game.engine));
      HUD.on('rite:say', (d) => HUD.showSay(d));
      HUD.on('rite:boundary', (i) => HUD.boundary(i));
      HUD.on('rite:choiceResult', (r) => HUD.choiceResult(r));
      HUD.on('rite:hint', () => { HUD.forceHint = true; if (DG.game.engine) HUD.setNeed(DG.game.engine.need, DG.game.engine); });
      HUD.on('rite:edu', (key) => {
        const ch = DG.data.manual && DG.data.manual.byKey(key);
        if (ch && DG.settings.hints !== 'nunca') DG.ui.toast('Manual: “' + ch.title + '” — tecla L', 'info');
      });
    },
  };
})(window.DG = window.DG || {});
