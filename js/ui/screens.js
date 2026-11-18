/* DEO GRATIAS — telas: nova celebração, celebrações, calendário, configurações, histórico, avaliação, pausa */
(function (DG) {
  'use strict';
  const { h } = DG.ui;
  const U = DG.util;

  function screen(panel, opts) {
    opts = opts || {};
    const sc = { modal: true, onBack: opts.onBack || (() => DG.ui.pop(sc)) };
    sc.el = h('div', { class: 'screen dim' }, panel);
    if (opts.onKey) sc.onKey = opts.onKey;
    DG.ui.push(sc);
    return sc;
  }
  const ROLE_NAMES = { sacerdos: 'Sacerdote celebrante', minister: 'Acólito (coroinha)' };
  const MODE_NAMES = { tutorial: 'Tutorial guiado', treino: 'Treino', celebracao: 'Celebração completa' };

  const S = DG.screens = {
    // ---------------- 1. papel ----------------
    newGame(preset) {
      preset = preset || {};
      const o = { role: preset.role || null, mode: preset.mode || null, form: 'lecta', celId: preset.celId || null, startSection: preset.startSection || null };
      const pr = DG.profile.character;
      const card = (role, title, desc) => {
        const spec = role === 'sacerdos'
          ? { kind: 'priest', skin: pr.sacerdos.skin, hairColor: pr.sacerdos.age === 'idoso' ? 4 : pr.sacerdos.hairColor, color: (DG.calendar.suggested() || {}).color || 'albus', tonsure: true, vest: { amictus: 1, alba: 1, cingulum: 1, manipulus: 1, stola: 1, casula: 1 } }
          : { kind: 'server', skin: pr.minister.skin, hairColor: pr.minister.hairColor, cassock: pr.minister.cassock, surplice: true };
        const rk = DG.ranks.of(role);
        return h('div', { class: 'card', 'data-nav': 1, tabindex: 0, onclick: () => { o.role = role; DG.ui.pop(sc); S.character(o); } },
          DG.chars.portrait(spec, { facing: 'down', arms: 'joined' }, 3), h('h3', null, title), h('p', { class: 'small center' }, desc),
          h('p', { class: 'center small' }, h('span', { class: 'badge' }, rk.title), ' ', h('span', { class: 'muted' }, rk.xp + ' XP')));
      };
      const panel = h('div', { class: 'panel', style: { width: 'calc(var(--u)*300)' } },
        h('h2', { class: 'center' }, 'Quem servirá ao altar?'), h('div', { class: 'sep' }),
        h('div', { class: 'cards' },
          card('sacerdos', 'Sacerdote', 'Celebre a Missa: paramente-se, suba ao altar, siga cada rubrica — gestos, posições, o Cânon, a Consagração.'),
          card('minister', 'Acólito', 'Sirva a Missa: prepare a sacristia e o altar, responda em latim, transporte o Missal, apresente as galhetas, toque a campainha.')),
        h('div', { class: 'row', style: { justifyContent: 'flex-end', marginTop: '1em' } }, h('button', { class: 'btn ghost', 'data-nav': 1, onclick: () => DG.ui.pop(sc) }, 'Voltar')));
      const sc = screen(panel); sc.navH = true;
    },
    // ---------------- 2. personagem ----------------
    character(o) {
      const role = o.role;
      const ch = DG.profile.character[role];
      const prevBox = h('div', { class: 'center' });
      const redraw = () => {
        prevBox.innerHTML = '';
        const spec = role === 'sacerdos'
          ? { kind: 'priest', skin: ch.skin, hairColor: ch.age === 'idoso' ? 4 : ch.hairColor, color: 'albus', tonsure: true, beard: ch.beard, vest: {}, collar: true }
          : { kind: 'server', skin: ch.skin, hairColor: ch.hairColor, cassock: ch.cassock, surplice: true };
        const c1 = DG.chars.portrait(spec, { facing: 'down' }, 4), c2 = DG.chars.portrait(spec, { facing: 'up' }, 4);
        prevBox.append(c1, c2);
        c1.style.display = c2.style.display = 'inline-block';
      };
      const sw = (label, n, key, colors) => h('div', { class: 'field' }, h('label', null, label), h('div', { class: 'swatches' }, Array.from({ length: n }, (_, i) => {
        const b = h('button', { class: ch[key] === i ? 'on' : '', style: { background: colors[i] }, onclick: () => { ch[key] = i; b.parentNode.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); redraw(); } });
        return b;
      })));
      const name = h('input', { type: 'text', value: ch.name, maxlength: 24, oninput: (e) => { ch.name = e.target.value; } });
      const fields = [h('div', { class: 'field' }, h('label', null, 'Nome'), name),
        sw('Tom de pele', DG.pal.skins.length, 'skin', DG.pal.skins.map(s => s[0])),
        sw('Cor do cabelo', 4, 'hairColor', DG.pal.hairs.slice(0, 4))];
      if (role === 'sacerdos') {
        fields.push(h('div', { class: 'field' }, h('label', null, 'Idade'), h('div', { class: 'seg' }, [['adulto', 'Adulto'], ['idoso', 'Idoso']].map(([k, n]) => { const b = h('button', { class: ch.age === k ? 'on' : '', onclick: () => { ch.age = k; b.parentNode.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); redraw(); } }, n); return b; }))));
      } else {
        fields.push(h('div', { class: 'field' }, h('label', null, 'Batina'), h('div', { class: 'seg' }, [['niger', 'Preta'], ['ruber', 'Vermelha']].map(([k, n]) => { const b = h('button', { class: ch.cassock === k ? 'on' : '', onclick: () => { ch.cassock = k; b.parentNode.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); redraw(); } }, n); return b; }))));
      }
      redraw();
      const panel = h('div', { class: 'panel', style: { width: 'calc(var(--u)*280)' } },
        h('h2', null, role === 'sacerdos' ? 'O celebrante' : 'O acólito'), h('div', { class: 'sep' }),
        h('div', { class: 'row', style: { alignItems: 'flex-start', gap: 'calc(var(--u)*8)' } }, h('div', { class: 'grow' }, fields), prevBox),
        h('div', { class: 'row', style: { justifyContent: 'space-between', marginTop: '1em' } },
          h('button', { class: 'btn ghost', 'data-nav': 1, onclick: () => { DG.ui.pop(sc); S.newGame(o); } }, 'Voltar'),
          h('button', { class: 'btn', 'data-nav': 1, onclick: () => { DG.store.save(); DG.ui.pop(sc); S.mode(o); } }, 'Continuar')));
      const sc = screen(panel);
    },
    // ---------------- 3. modo ----------------
    mode(o) {
      o.form = o.form || 'lecta';
      const lockedCantata = () => o.form === 'cantata' && !DG.profile.unlocked.cantata;
      const opt = (id, title, desc, extra) => h('div', { class: 'card' + (extra && extra.locked ? ' locked' : ''), 'data-nav': 1, tabindex: 0, onclick: () => {
        if (extra && extra.locked) { DG.ui.toast(extra.locked, 'err'); return; }
        if (id === 'celebracao' && lockedCantata()) { DG.ui.toast('A Missa cantada em “Celebração completa” desbloqueia-se ao concluir uma Missa rezada completa. Experimente-a no modo Treino.', 'err'); return; }
        o.mode = id; DG.ui.pop(sc);
        if (id === 'tutorial') { o.celId = 'pent4'; o.form = 'lecta'; DG.game.startCelebration(o); } else S.celebrations(o);
      } }, h('h3', null, title), h('p', { class: 'small' }, desc));
      const formBtn = (k, n) => { const b = h('button', { class: o.form === k ? 'on' : '', onclick: () => { o.form = k; b.parentNode.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); formInfo.textContent = FORM_INFO[k]; } }, n); return b; };
      const FORM_INFO = {
        lecta: 'Missa rezada: o sacerdote diz tudo, servido por um acólito; partes em voz alta, média e em silêncio; orações leoninas no fim.',
        cantata: 'Missa cantada: o coro canta o Intróito, o Kyriale do dia, o Gradual, o Ofertório e a Comunhão; o celebrante entoa o Glória e o Credo e canta as orações (tom ferial), o Prefácio e o Pater noster. Seis velas; sem orações leoninas.',
      };
      const formInfo = h('p', { class: 'small rubric' }, FORM_INFO[o.form]);
      const panel = h('div', { class: 'panel', style: { width: 'calc(var(--u)*330)' } },
        h('h2', null, 'Modo de jogo — ' + ROLE_NAMES[o.role]), h('div', { class: 'sep' }),
        h('div', { class: 'cards' },
          opt('tutorial', 'Tutorial guiado', 'Uma Missa dominical completa com todas as dicas visíveis, as respostas assinaladas e sem pressa: ideal para a primeira vez.'),
          opt('treino', 'Treino', 'Escolha a celebração e, se quiser, comece numa parte específica (Ofertório, Cânon, Comunhão…). Dicas visíveis; os erros são explicados.'),
          opt('celebracao', 'Celebração completa', 'Da sacristia à sacristia, sem dicas (salvo se o rito ficar parado). Avaliação rigorosa e registro no histórico.')),
        h('div', { class: 'field', style: { marginTop: '1em' } }, h('label', null, 'Forma da Missa'),
          h('div', { class: 'row' },
            h('div', { class: 'seg' }, formBtn('lecta', 'Missa rezada (lecta)'), formBtn('cantata', 'Missa cantada (cantata)')),
            h('button', { class: 'btn small ghost', onclick: () => DG.book.open('manual', 'formas') }, 'Sobre a Missa solene')),
          formInfo),
        h('div', { class: 'row', style: { justifyContent: 'flex-start', marginTop: '1em' } }, h('button', { class: 'btn ghost', 'data-nav': 1, onclick: () => { DG.ui.pop(sc); S.character(o); } }, 'Voltar')));
      const sc = screen(panel); sc.navH = true;
    },
    // ---------------- 4. celebração ----------------
    celebrations(o) {
      const list = h('div', { class: 'celeb-list scroll' });
      const detail = h('div', { class: 'detail-box' });
      const order = ['adventus', 'nativitatis', 'epiphaniae', 'septuagesimae', 'quadragesimae', 'passionis', 'paschale', 'postpent'];
      const today = DG.calendar.today();
      const sug = DG.calendar.suggested();
      let sel = DG.cel.get(o.celId) || sug || DG.cel.list[0];
      const items = [];
      order.forEach(t => {
        const cs = DG.cel.list.filter(c => c.tempus === t);
        if (!cs.length) return;
        list.append(h('div', { class: 'celeb-season' }, DG.cel.SEASONS[t].name));
        cs.forEach(c => {
          const best = DG.profile.best[c.id + '|' + o.role + '|' + (o.form || 'lecta')];
          const it = h('div', { class: 'celeb-item' + (c === sel ? ' sel' : ''), 'data-nav': 1, tabindex: 0, onclick: () => { sel = c; items.forEach(x => x.classList.remove('sel')); it.classList.add('sel'); showDetail(); } },
            h('span', { class: 'swatch cl-' + c.color }), h('span', { class: 'grow' }, c.pt, c === sug ? h('span', { class: 'badge red', style: { marginLeft: '.5em' } }, 'próxima') : null),
            best ? h('span', { class: 'badge' }, best + '%') : null);
          it.addEventListener('dblclick', () => go());
          items.push(it); list.append(it);
        });
      });
      const secSel = h('select', null, h('option', { value: '' }, 'Desde a sacristia (completa)'), DG.rite.SECTIONS.map(s => h('option', { value: s.id }, s.name)));
      if (o.mode === 'celebracao') secSel.disabled = true;
      const showDetail = () => {
        detail.innerHTML = '';
        const c = sel;
        const next = DG.calendar.nextDate(c);
        detail.append(h('h3', null, c.pt), h('p', { class: 'rubric' }, c.la),
          h('p', { class: 'small' }, h('span', { class: 'swatch cl-' + c.color, style: { display: 'inline-block', verticalAlign: 'middle', marginRight: '.4em' } }), c.colorName + ' · ' + c.className + ' · ' + c.seasonName + (next ? ' · próxima data: ' + U.fmtDate(next) : '')),
          h('ul', { class: 'rule-list small' }, DG.cel.rubricSummary(c, o.form || 'lecta').slice(2).map(([k, v]) => h('li', null, h('b', null, k + ': '), h('span', { class: /^(sim|próprio)/.test(v) ? 'yes' : /^não/.test(v) ? 'no' : '' }, v)))),
          c.notes.length ? h('div', { class: 'small' }, c.notes.map(n => h('p', { class: 'rubric', style: { margin: '.2em 0' } }, '✠ ' + n))) : null);
      };
      showDetail();
      const go = () => { o.celId = sel.id; o.startSection = secSel.value || null; DG.ui.pop(sc); DG.game.startCelebration(o); };
      const panel = h('div', { class: 'panel', style: { width: 'calc(var(--u)*420)' } },
        h('div', { class: 'row', style: { justifyContent: 'space-between' } }, h('h2', null, 'Escolha a celebração' + (o.form === 'cantata' ? ' — Missa cantada' : '')), h('span', { class: 'small' }, 'Hoje: ', h('b', null, today.name), ' (', DG.LIT[today.color].name.toLowerCase(), ')')),
        h('div', { class: 'celeb-layout' }, list, h('div', { class: 'col' }, detail,
          h('div', { class: 'field' }, h('label', null, 'Começar em (treino)'), secSel),
          h('div', { class: 'row', style: { justifyContent: 'space-between' } },
            h('button', { class: 'btn ghost', 'data-nav': 1, onclick: () => { DG.ui.pop(sc); S.calendarView(o); } }, 'Calendário'),
            h('button', { class: 'btn ghost', 'data-nav': 1, onclick: () => DG.book.open('missal', sel.id) }, 'Ler no Missal'),
            h('button', { class: 'btn gold', 'data-nav': 1, onclick: go }, o.role === 'sacerdos' ? 'Celebrar ✠' : 'Servir ✠')))),
        h('div', { class: 'row', style: { marginTop: '.6em' } }, h('button', { class: 'btn ghost small', 'data-nav': 1, onclick: () => { DG.ui.pop(sc); S.mode(o); } }, 'Voltar')));
      const sc = screen(panel);
    },
    // ---------------- calendário ----------------
    calendarView(o, ym) {
      const now = new Date();
      let y = ym ? ym[0] : now.getFullYear(), m = ym ? ym[1] : now.getMonth();
      const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      const grid = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 'calc(var(--u)*1)' } });
      ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].forEach(d => grid.append(h('div', { class: 'small center', style: { fontFamily: 'var(--f-title)', color: 'var(--wine)' } }, d)));
      const first = new Date(y, m, 1, 12);
      for (let i = 0; i < first.getDay(); i++) grid.append(h('div'));
      const days = new Date(y, m + 1, 0).getDate();
      const info = h('div', { class: 'detail-box small', style: { minHeight: 'calc(var(--u)*30)' } }, 'Clique num dia para ver a celebração.');
      for (let d = 1; d <= days; d++) {
        const date = new Date(y, m, d, 12);
        const di = DG.calendar.dayInfo(date);
        const isToday = DG.calendar.sameDay(date, now);
        const cell = h('div', { class: 'card', style: { padding: 'calc(var(--u)*1)', minHeight: 'calc(var(--u)*17)', fontSize: '.7em', lineHeight: '1.1', outline: isToday ? 'calc(var(--u)*.6) solid var(--rubric)' : '' }, 'data-nav': 1, tabindex: 0,
          onclick: () => {
            info.innerHTML = '';
            info.append(h('b', null, U.fmtDate(date) + ' — ' + di.name), h('div', null, di.seasonName + ' · ' + DG.LIT[di.color].name + (di.classis ? ' · ' + (DG.cel.CLASS_NAMES[di.classis] || '') : '')));
            if (di.playable.length && o) di.playable.forEach(c => info.append(h('button', { class: 'btn small', style: { marginTop: '.5em' }, onclick: () => { o.celId = c.id; DG.ui.pop(sc); S.celebrations(o); } }, (o.role === 'sacerdos' ? 'Celebrar: ' : 'Servir: ') + c.pt)));
            else if (!di.playable.length) info.append(h('div', { class: 'muted' }, 'Esta Missa ainda não está disponível para jogar; escolha uma das celebrações marcadas com ✠.'));
          } },
          h('div', { style: { display: 'flex', justifyContent: 'space-between' } }, h('b', null, String(d)), h('span', { class: 'swatch cl-' + di.color, style: { width: 'calc(var(--u)*3)', height: 'calc(var(--u)*3)' } })),
          h('div', { style: { color: di.playable.length ? 'var(--rubric)' : '' } }, (di.playable.length ? '✠ ' : '') + di.name.replace(/^Féria — .*/, 'féria')));
        grid.append(cell);
      }
      const nav = (dm) => { DG.ui.pop(sc); let nm = m + dm, ny = y; if (nm < 0) { nm = 11; ny--; } if (nm > 11) { nm = 0; ny++; } S.calendarView(o, [ny, nm]); };
      const panel = h('div', { class: 'panel', style: { width: 'calc(var(--u)*400)' } },
        h('div', { class: 'row', style: { justifyContent: 'space-between' } },
          h('button', { class: 'btn small ghost', 'data-nav': 1, onclick: () => nav(-1) }, '◀'),
          h('h2', { style: { margin: 0 } }, 'Calendário litúrgico — ' + months[m] + ' de ' + y),
          h('button', { class: 'btn small ghost', 'data-nav': 1, onclick: () => nav(1) }, '▶')),
        h('p', { class: 'small rubric' }, 'Calendário tradicional (rubricas de 1960): ciclo temporal calculado a partir da Páscoa (' + U.fmtDate(DG.calendar.easter(y)) + ') e festas principais. ✠ = Missa disponível no jogo.'),
        grid, info,
        h('div', { class: 'row', style: { justifyContent: 'flex-end', marginTop: '.8em' } }, h('button', { class: 'btn ghost', 'data-nav': 1, onclick: () => { DG.ui.pop(sc); if (o) S.celebrations(o); } }, 'Voltar')));
      const sc = screen(panel); sc.navH = true;
    },
    // ---------------- configurações ----------------
    settings() {
      const s = DG.settings;
      const save = () => { DG.store.save(); DG.audio.applySettings(); };
      const slider = (label, key) => h('div', { class: 'field' }, h('label', null, label + ' ', h('span', { class: 'muted' }, Math.round(s[key] * 100) + '%')), h('input', { type: 'range', min: 0, max: 1, step: 0.05, value: s[key], oninput: (e) => { s[key] = +e.target.value; e.target.previousSibling.lastChild.textContent = Math.round(s[key] * 100) + '%'; save(); } }));
      const toggle = (label, obj, key, help) => h('div', { class: 'toggle-row' }, h('span', null, label, help ? h('div', { class: 'small muted' }, help) : null), h('input', { type: 'checkbox', checked: obj[key] ? true : null, onchange: (e) => { obj[key] = e.target.checked; save(); } }));
      const seg = (label, key, opts) => h('div', { class: 'field' }, h('label', null, label), h('div', { class: 'seg' }, opts.map(([k, n]) => { const b = h('button', { class: s[key] === k ? 'on' : '', onclick: () => { s[key] = k; b.parentNode.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); save(); } }, n); return b; })));
      const voiceSel = (label, key, role) => {
        const sel = h('select', { onchange: (e) => { s[key] = e.target.value; save(); } }, h('option', { value: '' }, 'Automática (' + ((DG.voice.pick(role) || {}).name || 'nenhuma') + ')'), DG.voice.voices.map(v => h('option', { value: v.name, selected: s[key] === v.name ? true : null }, v.name + ' — ' + v.lang)));
        return h('div', { class: 'field' }, h('label', null, label), h('div', { class: 'row' }, sel, h('button', { class: 'btn small', onclick: () => { DG.audio.unlock(); DG.voice.speak(role === 'priest' ? 'Dóminus vobíscum. Introíbo ad altáre Dei.' : 'Et cum spíritu tuo. Ad Deum, qui lætíficat juventútem meam.', { role }); } }, '▶')));
      };
      const d = DG.voice.describe();
      const panel = h('div', { class: 'panel scroll', style: { width: 'calc(var(--u)*380)', maxHeight: '92%' } },
        h('h2', null, 'Configurações'), h('div', { class: 'sep' }),
        h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'calc(var(--u)*8)' } },
          h('div', null,
            h('h3', null, 'Áudio'),
            slider('Volume geral', 'volMaster'), slider('Canto gregoriano', 'volMusic'), slider('Efeitos (sinos, passos)', 'volSfx'), slider('Ambiência', 'volAmbient'), slider('Vozes', 'volVoice'), slider('Reverberação da igreja', 'reverb'),
            toggle('Ler as orações em voz alta (síntese de fala)', s, 'tts'),
            toggle('Ler também as orações secretas (em voz baixa)', s, 'ttsSecreta', 'Na Missa real elas são ditas em silêncio.'),
            toggle('Canto ambiente nos menus e na exploração', s, 'ambientChant'),
            voiceSel('Voz do sacerdote', 'voicePriest', 'priest'), voiceSel('Voz do acólito', 'voiceServer', 'server'),
            h('p', { class: 'small muted' }, d.italian ? 'Há voz italiana instalada: a pronúncia será a romana.' : 'Nenhuma voz italiana encontrada: a pronúncia do latim será aproximada. No Windows, instale o idioma Italiano (Configurações → Hora e idioma → Fala) ou use o navegador Edge.')),
          h('div', null,
            h('h3', null, 'Texto e jogo'),
            seg('Texto das orações', 'textMode', [['both', 'Latim + tradução'], ['latin', 'Latim'], ['pt', 'Tradução']]),
            seg('Ritmo', 'pace', [['contemplativo', 'Contemplativo'], ['normal', 'Normal'], ['rapido', 'Rápido']]),
            seg('Dicas', 'hints', [['auto', 'Conforme o modo'], ['sempre', 'Sempre'], ['nunca', 'Nunca']]),
            seg('Câmera na Missa', 'camera', [['auto', 'Enquadrar o altar'], ['seguir', 'Seguir o personagem']]),
            toggle('Orações do sacerdote avançam sozinhas', s, 'autoRecite', 'Desligado: tecle E para recitar cada trecho.'),
            h('h3', { style: { marginTop: '1em' } }, 'Costumes locais'),
            h('p', { class: 'small rubric' }, 'Usos legítimos não prescritos (ou suprimidos) pelo Missal de 1962. Ligados, o jogo os exige.'),
            toggle('Campainha no Hanc igitur', s.customs, 'bellHancIgitur', 'O’Connell: “se for costume”.'),
            toggle('Campainha ao “Domine, non sum dignus”', s.customs, 'bellDomineNonSum', 'O’Connell (1962): já não se toca.'),
            toggle('Confíteor antes da Comunhão dos fiéis', s.customs, 'confiteorCommunion', 'Suprimido em 1962; mantido em muitos lugares.'),
            toggle('Água benta à porta da sacristia', s.customs, 'holyWaterSacristy'),
            toggle('Sineta da sacristia ao sair', s.customs, 'sacristyBell'),
            toggle('“Prosit” na sacristia depois da Missa', s.customs, 'prosit'),
            h('h3', { style: { marginTop: '1em' } }, 'Progresso'),
            h('div', { class: 'row' },
              h('button', { class: 'btn small', onclick: () => { const blob = new Blob([DG.store.exportJSON()], { type: 'application/json' }); const a = h('a', { href: URL.createObjectURL(blob), download: 'deo-gratias-progresso.json' }); document.body.appendChild(a); a.click(); a.remove(); } }, 'Exportar'),
              h('button', { class: 'btn small ghost', onclick: async () => { if (await DG.ui.confirm('Apagar progresso', 'Apagar histórico, conquistas e experiência? Esta ação não pode ser desfeita.', 'Apagar', 'Cancelar')) { DG.store.reset(); DG.ui.toast('Progresso apagado.', 'info'); } } }, 'Apagar progresso')),
            h('div', { class: 'row', style: { marginTop: '.6em' } }, h('button', { class: 'btn small ghost', onclick: () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); } }, 'Tela cheia')))),
        h('div', { class: 'row', style: { justifyContent: 'flex-end', marginTop: '1em' } }, h('button', { class: 'btn', 'data-nav': 1, onclick: () => DG.ui.pop(sc) }, 'Fechar')));
      const sc = screen(panel);
      sc.onClose = () => { DG.store.save(); if (DG.game.state === 'title') DG.title.updateMusic(); };
    },
    // ---------------- histórico ----------------
    history() {
      const p = DG.profile;
      const rk = (role) => { const r = DG.ranks.of(role); const pct = r.next ? Math.round(100 * (r.xp - r.base) / (r.next - r.base)) : 100; return h('div', { class: 'detail-box' }, h('b', null, ROLE_NAMES[role]), h('div', null, h('span', { class: 'badge red' }, r.title), ' ', r.xp + ' XP'), h('div', { class: 'bar', style: { margin: '.4em 0' } }, h('i', { style: { width: pct + '%' } })), h('div', { class: 'small muted' }, r.next ? 'Próximo posto: ' + r.nextTitle + ' (' + r.next + ' XP)' : 'Posto máximo alcançado')); };
      const rows = p.history.slice(0, 60).map(r => h('tr', null, h('td', null, U.fmtDate(new Date(r.date))), h('td', null, h('span', { class: 'swatch cl-' + r.color, style: { display: 'inline-block', width: '10px', height: '12px', marginRight: '4px' } }), r.celTitle), h('td', null, r.role === 'sacerdos' ? 'Sacerdote' : 'Acólito'), h('td', null, MODE_NAMES[r.mode] || r.mode, r.section ? ' · parte' : ''), h('td', null, r.completed ? r.grade + ' (' + r.score + '%)' : 'interrompida'), h('td', null, U.fmtTime(r.duration))));
      const ach = DG.achievements.list.map(a => h('div', { class: 'task' + (p.achievements[a.id] ? '' : ' done'), style: { opacity: p.achievements[a.id] ? 1 : 0.5, textDecoration: 'none' } }, h('span', { class: 'box' }, p.achievements[a.id] ? '★' : ''), h('span', null, h('b', null, a.name), ' — ', h('span', { class: 'small' }, a.desc))));
      const panel = h('div', { class: 'panel scroll', style: { width: 'calc(var(--u)*400)', maxHeight: '92%' } },
        h('h2', null, 'Histórico e progresso'), h('div', { class: 'sep' }),
        h('div', { class: 'row', style: { alignItems: 'stretch' } }, h('div', { class: 'grow' }, rk('sacerdos')), h('div', { class: 'grow' }, rk('minister')),
          h('div', { class: 'detail-box grow' }, h('b', null, 'Estudo'), h('div', null, Object.keys(p.examined).length + ' objetos examinados'), h('div', null, Object.keys(p.manualRead).length + ' capítulos lidos'), h('div', null, p.masses + ' celebrações completas'))),
        h('h3', { style: { marginTop: '1em' } }, 'Conquistas'), h('div', null, ach),
        h('h3', { style: { marginTop: '1em' } }, 'Celebrações'),
        rows.length ? h('table', { class: 'hist' }, h('tr', null, ['Data', 'Celebração', 'Papel', 'Modo', 'Avaliação', 'Duração'].map(t => h('th', null, t))), rows) : h('p', { class: 'muted' }, 'Nenhuma celebração ainda.'),
        h('div', { class: 'row', style: { justifyContent: 'flex-end', marginTop: '1em' } }, h('button', { class: 'btn', 'data-nav': 1, onclick: () => DG.ui.pop(sc) }, 'Fechar')));
      const sc = screen(panel);
    },
    // ---------------- avaliação ----------------
    evaluation(rec, engine) {
      const sc0 = engine.score;
      DG.hud.hideSay(); DG.hud.showChoices(null); DG.hud.showAltarActs(null);
      const g = sc0.grade();
      const cats = Object.keys(DG.SCORE_CATS).map(k => h('div', { class: 'cat' }, h('b', null, sc0.catScore(k) + '%'), h('span', null, DG.SCORE_CATS[k].name)));
      const mist = sc0.mistakes.length ? sc0.mistakes.map(m => h('div', { class: 'mist' }, h('div', { class: 'm-what' }, '✗ ' + m.what), m.how ? h('div', { class: 'm-how' }, m.how) : null, h('div', { class: 'small muted' }, (m.step || '') + (m.ref ? ' — ' + m.ref : '')))) : [h('p', { class: 'center' }, 'Nenhum erro registrado. Deo grátias!')];
      const panel = h('div', { class: 'panel eval' },
        h('p', { class: 'center rubric', style: { margin: 0 } }, rec.completed ? (rec.role === 'sacerdos' ? 'Missa celebrada' : 'Missa servida') : 'Celebração interrompida'),
        h('h2', { class: 'center', style: { margin: '.2em 0' } }, rec.celTitle),
        h('div', { class: 'grade' }, rec.completed ? g[1] : '—'),
        h('div', { class: 'score' }, rec.completed ? sc0.total() + '% · ' + g[2] : ''),
        rec.xp ? h('p', { class: 'center small' }, '+' + rec.xp + ' XP · ' + DG.ranks.of(rec.role).title) : null,
        h('div', { class: 'cats' }, cats),
        h('h3', null, 'Rubricas a corrigir (' + sc0.mistakes.length + ')'),
        h('div', { class: 'mistakes scroll' }, mist),
        h('div', { class: 'row', style: { justifyContent: 'space-between', marginTop: '1em' } },
          h('button', { class: 'btn ghost', 'data-nav': 1, onclick: () => { DG.ui.pop(sc); DG.book.open('manual', 'acolito'); } }, 'Abrir o Manual'),
          h('button', { class: 'btn ghost', 'data-nav': 1, onclick: () => { DG.ui.pop(sc); DG.game.startCelebration({ role: rec.role, celId: rec.celebration, form: rec.form, mode: rec.mode === 'tutorial' ? 'treino' : rec.mode, startSection: rec.section }); } }, 'Repetir'),
          h('button', { class: 'btn gold', 'data-nav': 1, onclick: () => { DG.ui.pop(sc); DG.game.toTitle(); } }, 'Deo grátias — menu')));
      const sc = screen(panel, { onBack: () => {} });
      DG.sfx.chime();
    },
    // ---------------- pausa ----------------
    pause() {
      if (DG.ui.stack.length) return;
      DG.game.paused = true; DG.voice.pause();
      const resume = () => { DG.ui.pop(sc); };
      const panel = h('div', { class: 'panel pause-menu' },
        h('h2', null, 'Pausa'), h('p', { class: 'small rubric' }, DG.game.cel ? DG.game.cel.title : ''),
        h('button', { class: 'btn', 'data-nav': 1, onclick: resume }, 'Continuar'),
        h('button', { class: 'btn ghost', 'data-nav': 1, onclick: () => { DG.ui.pop(sc); DG.book.open('missal'); } }, 'Missal'),
        h('button', { class: 'btn ghost', 'data-nav': 1, onclick: () => { DG.ui.pop(sc); DG.book.open('manual'); } }, 'Manual litúrgico'),
        h('button', { class: 'btn ghost', 'data-nav': 1, onclick: () => S.settings() }, 'Configurações'),
        DG.game.engine && DG.game.engine.need ? h('button', { class: 'btn ghost', 'data-nav': 1, onclick: () => { DG.hud.forceHint = true; DG.emit('rite:hint', true); DG.ui.pop(sc); } }, 'Mostrar dica agora') : null,
        h('button', { class: 'btn ghost', 'data-nav': 1, onclick: async () => { if (await DG.ui.confirm('Sair', 'Sair desta celebração? O progresso desta Missa será registrado como interrompido.', 'Sair', 'Ficar')) { DG.ui.pop(sc); if (DG.game.engine) DG.game.engine.abort(); else DG.game.toTitle(); } } }, 'Sair para o menu'));
      const sc = screen(panel, { onBack: resume });
      sc.onClose = () => { DG.game.paused = false; DG.voice.resume(); };
    },
    // ---------------- inventário ----------------
    inventory() {
      if (DG.ui.stack.length) return;
      DG.game.paused = true;
      const p = DG.game.player;
      const carry = p && p.base.carry;
      const known = Object.keys(DG.profile.examined).map(id => DG.data.objects.get(id)).filter(Boolean);
      const panel = h('div', { class: 'panel', style: { width: 'calc(var(--u)*330)' } },
        h('h2', null, 'Inventário litúrgico'), h('div', { class: 'sep' }),
        h('h4', null, 'Nas mãos'), h('p', null, carry ? ({ cruets: 'Galhetas (vinho e água)', lavabo: 'Bacia, galheta da água e manustérgio', bell: 'Campainha', paten: 'Patena de comunhão', missal: 'Missal', missalStand: 'Missal com a estante', biretta: 'Barrete', chalice: 'Cálice velado', pole: 'Acendedor de velas', ciborium: 'Âmbula' }[carry] || carry) : 'Nada.'),
        h('h4', null, 'Coleção (' + known.length + '/' + DG.data.objects.list.length + ')'), h('p', { class: 'small muted' }, 'Examine os objetos no mundo (botão direito ou E) para colecioná-los.'),
        h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 'calc(var(--u)*2)', maxHeight: 'calc(var(--u)*90)', overflowY: 'auto' } }, known.map(o => h('div', { class: 'card', title: o.name, style: { padding: 'calc(var(--u)*1)' }, onclick: () => { DG.ui.pop(sc); DG.book.examine(o.id); } }, DG.ui.iconCanvas(o.icon, (DG.game.cel || {}).color, 40)))),
        h('div', { class: 'row', style: { justifyContent: 'flex-end', marginTop: '1em' } }, h('button', { class: 'btn', 'data-nav': 1, onclick: () => DG.ui.pop(sc) }, 'Fechar')));
      const sc = screen(panel);
      sc.onClose = () => { DG.game.paused = false; };
    },
    // ---------------- créditos ----------------
    credits() {
      const panel = h('div', { class: 'panel scroll', style: { width: 'calc(var(--u)*330)', maxHeight: '92%' } },
        h('h2', null, 'Créditos e fontes'), h('div', { class: 'sep' }),
        h('p', null, h('b', null, 'Deo Gratias'), ' — simulador da Santa Missa segundo o Missale Romanum de 1962. Arte, música e sons gerados por código; nenhuma imagem ou gravação externa.'),
        h('h4', null, 'Textos litúrgicos'), h('p', { class: 'small' }, 'Divinum Officium (divinumofficium.com; github.com/DivinumOfficium) — Ordinário, Próprios, Prefácios em latim; tradução portuguesa dos Próprios, adaptada à norma brasileira. Ordinário e Prefácios traduzidos para este jogo.'),
        h('h4', null, 'Rubricas'), h('p', { class: 'small' }, 'Ritus servandus in celebratione Missæ (Missal de 1962); Codex Rubricarum (1960); J. B. O’Connell, The Celebration of Mass, 4.ª ed., Bruce, 1964.'),
        h('h4', null, 'Canto gregoriano'), h('p', { class: 'small' }, 'GregoBase (gregobase.selapa.net) — partituras GABC da edição vaticana (Graduale Romanum e Liber Usualis, 1961); mapeamento das Missas segundo o projeto jgabc (B. Bloomfield).'),
        h('h4', null, 'A capela'), h('p', { class: 'small' }, 'O jogo se passa na Capela São Pio X, do Priorado Padre Anchieta (São Paulo), da Fraternidade Sacerdotal São Pio X. A fachada e o interior foram redesenhados em pixel art a partir de fotografias publicadas pela FSSPX Brasil e pela imprensa (Poder360, Portal Tela). O emblema da Fraternidade foi redesenhado para este jogo. Este é um projeto independente de fiéis, sem vínculo oficial com a FSSPX.'),
        h('h4', null, 'Tipografia'), h('p', { class: 'small' }, 'EB Garamond e UnifrakturMaguntia — SIL Open Font License (ver assets/fonts).'),
        h('div', { class: 'note small' }, 'Veja no Manual o capítulo “Pontos a revisar por um liturgista”.'),
        h('p', { class: 'center', style: { fontFamily: 'var(--f-black)', color: 'var(--wine)', fontSize: '1.5em' } }, 'Ad majorem Dei gloriam'),
        h('div', { class: 'row', style: { justifyContent: 'flex-end' } }, h('button', { class: 'btn', 'data-nav': 1, onclick: () => DG.ui.pop(sc) }, 'Fechar')));
      const sc = screen(panel);
    },
  };
})(window.DG = window.DG || {});
