/* DEO GRATIAS — Livro: Missal, orações, cantos, Manual, objetos */
(function (DG) {
  'use strict';
  const { h } = DG.ui;
  const U = DG.util;

  const TABS = [
    { id: 'missal', name: 'Missal' },
    { id: 'oracoes', name: 'Orações' },
    { id: 'respostas', name: 'Respostas' },
    { id: 'cantos', name: 'Cantos' },
    { id: 'manual', name: 'Manual' },
    { id: 'objects', name: 'Objetos' },
  ];
  const WHO = { P: 'S.', M: 'M.', PM: 'S. e M.' };

  const B = DG.book = {
    open(tab, item) {
      if (B.cur) { B.show(tab, item); return; }
      const sc = { modal: true };
      B.cur = sc;
      B.wasPaused = DG.game.paused;
      DG.game.paused = true; DG.voice.pause();
      sc.el = h('div', { class: 'screen dim' });
      B.panel = h('div', { class: 'panel book' });
      sc.el.append(B.panel);
      sc.onBack = () => B.close();
      sc.onKey = (ev) => {
        if (ev.action === 'cancel' || ev.code === 'KeyM' || ev.code === 'KeyL' || ev.code === 'KeyO') { B.close(); return true; }
        return false;
      };
      sc.onClose = () => { DG.chant.stop(); cancelAnimationFrame(B.raf); B.cur = null; DG.game.paused = B.wasPaused; DG.voice.resume(); };
      DG.ui.push(sc);
      B.show(tab || 'missal', item);
    },
    close() { if (B.cur) DG.ui.pop(B.cur); },
    show(tab, item) {
      B.tab = tab;
      const p = B.panel; p.innerHTML = '';
      const tabs = h('div', { class: 'book-tabs' }, TABS.map(t => h('button', { class: t.id === tab ? 'on' : '', onclick: () => B.show(t.id) }, t.name)),
        h('span', { class: 'grow' }), h('button', { class: 'btn small ghost', onclick: () => B.close() }, 'Fechar ✕'));
      tabs.style.alignItems = 'center';
      const body = h('div', { class: 'book-body' });
      const toc = h('div', { class: 'book-toc scroll' });
      const page = h('div', { class: 'book-page scroll' });
      body.append(toc, page);
      p.append(tabs, body);
      B.toc = toc; B.page = page;
      DG.chant.stop();
      ({ missal: B.missal, oracoes: B.prayers, respostas: B.responses, cantos: B.chants, manual: B.manual, objects: B.objects })[tab](item);
    },
    tocItem(label, on, fn, cls) { const e = h('div', { class: 'ti' + (on ? ' on' : '') + (cls ? ' ' + cls : ''), onclick: () => { B.toc.querySelectorAll('.ti').forEach(x => x.classList.remove('on')); e.classList.add('on'); fn(); } }, label); return e; },
    bil(la, pt, who) {
      const tm = DG.settings.textMode;
      const pre = who ? '<span class="vr">' + who + '</span> ' : '';
      const row = h('div', { class: 'bil' + (tm !== 'both' ? ' single' : '') });
      if (tm !== 'pt') row.append(h('div', { class: 'la', html: pre + DG.ui.fmtLatin(la) }));
      if (tm !== 'latin' && pt) row.append(h('div', { class: 'pt', html: (tm === 'pt' ? pre : '') + U.escape(pt) }));
      return row;
    },
    langToggle() {
      return h('div', { class: 'seg toggle-lang' }, [['both', 'Latim + português'], ['latin', 'Latim'], ['pt', 'Português']].map(([k, n]) => h('button', { class: DG.settings.textMode === k ? 'on' : '', onclick: () => { DG.settings.textMode = k; DG.store.save(); B.show(B.tab, B.lastItem); } }, n)));
    },
    // ------------------------------------------------------------
    missal(celId) {
      const cel = DG.cel.get(celId) || DG.game.cel || DG.calendar.suggested() || DG.cel.list[0];
      B.lastItem = cel.id;
      const toc = B.toc;
      toc.append(h('div', { class: 'th' }, 'Celebração'));
      const sel = h('select', { style: { width: '100%' }, onchange: (e) => B.show('missal', e.target.value) }, DG.cel.list.map(c => h('option', { value: c.id, selected: c.id === cel.id ? true : null }, c.pt)));
      toc.append(sel);
      toc.append(h('div', { class: 'th' }, 'Partes'));
      const role = DG.game.role || 'sacerdos';
      const rite = DG.rite.build(cel, role, DG.game.form || 'lecta');
      const page = B.page;
      page.append(h('h2', null, cel.la), h('p', { class: 'rubric' }, cel.pt + ' — ' + cel.className + ' — ' + cel.colorName + ' — ' + cel.seasonName));
      page.append(B.langToggle());
      const rs = DG.cel.rubricSummary(cel, DG.game.form);
      page.append(h('div', { class: 'note' }, rs.map(([k, v]) => h('span', { style: { marginRight: '1.2em', display: 'inline-block' } }, h('b', null, k + ': '), v))));
      cel.notes.forEach(n => page.append(h('p', { class: 'rubric small' }, '✠ ' + n)));
      let lastSec = null;
      const anchors = [];
      const walk = (els, out) => { for (const el of els) { if (!el) continue; if (Array.isArray(el)) walk(el, out); else if (el.t === 'par') walk(el.els, out); else if (el.t === 'say') out.push(el); } };
      rite.steps.forEach(st => {
        if (st.sec !== lastSec) {
          lastSec = st.sec;
          const sec = DG.rite.SECTIONS.find(s => s.id === st.sec);
          const hd = h('h3', null, sec.name + ' ', h('span', { class: 'small muted' }, '· ' + sec.la));
          page.append(hd); anchors.push([sec.name, hd]);
        }
        page.append(h('h4', { style: { marginTop: '.7em' } }, st.title));
        if (st.rub) page.append(h('p', { class: 'rubric small' }, st.rub.P));
        const says = []; walk(st.els, says);
        says.forEach(el => {
          const t = el.key ? DG.data.ordo[el.key] : { la: el.la, pt: el.pt };
          if (!t) return;
          const r = B.bil(t.la, t.pt, WHO[el.who]);
          if (el.voice === 'secreta') r.style.opacity = '.85';
          if (el.voice === 'consecr') r.querySelectorAll('.la,.pt').forEach(e => { e.style.fontFamily = 'var(--f-title)'; e.style.fontWeight = '600'; });
          page.append(r);
        });
        if (st.ref) page.append(h('div', { class: 'ref' }, st.ref));
      });
      anchors.forEach(([name, el], i) => toc.append(B.tocItem(name, i === 0, () => el.scrollIntoView({ behavior: 'smooth' }))));
    },
    // ------------------------------------------------------------
    prayers() {
      const O = DG.data.ordo;
      const sets = [
        ['Orações ao paramentar-se', [['Ao lavar as mãos', 'vestLavat'], ['Ao amito', 'vestAmictus'], ['À alva', 'vestAlba'], ['Ao cíngulo', 'vestCingulum'], ['Ao manípulo', 'vestManipulus'], ['À estola', 'vestStola'], ['À casula', 'vestCasula']]],
        ['Orações comuns', [['Pater noster', 'paterNoster'], ['Ave Maria', 'aveMaria1', 'aveMaria2'], ['Glória ao Pai', 'gloriaPatri', 'sicutErat'], ['Confíteor', 'confiteorM', 'meaCulpa', 'confiteorM2'], ['Salve Regina', 'salveRegina'], ['Sancte Míchaël', 'sancteMichael']]],
        ['Depois da Missa rezada', [['Orações leoninas', 'aveMaria1', 'aveMaria2', 'salveRegina', 'oraProNobis', 'utDigni', 'deusRefugium', 'sancteMichael', 'corJesu', 'miserereNobis']]],
        ['Ordinário', [['Glória in excélsis', '@gloria'], ['Credo', '@credo'], ['Sanctus', 'sanctus1', 'benedictus'], ['Agnus Dei', 'agnus1', 'agnus3'], ['Último Evangelho', 'initiumJoannem', 'inPrincipio1', 'inPrincipio2', 'inPrincipio3']]],
      ];
      const show = (title, keys) => {
        const page = B.page; page.innerHTML = '';
        page.append(h('h2', null, title), B.langToggle());
        keys.forEach(k => {
          if (k[0] === '@') { const arr = O[k.slice(1)]; page.append(B.bil(arr.map(s => s.la).join(' '), arr.map(s => s.pt).join(' '))); return; }
          const t = O[k]; if (t) page.append(B.bil(t.la, t.pt));
        });
        page.append(h('div', { class: 'row', style: { marginTop: '1em' } }, h('button', { class: 'btn small', onclick: () => { const txt = keys.map(k => k[0] === '@' ? O[k.slice(1)].map(s => s.la).join(' ') : (O[k] || {}).la).join(' '); DG.audio.unlock(); DG.voice.speak(txt, { role: 'priest' }); } }, '▶ Ouvir em latim'), h('button', { class: 'btn small ghost', onclick: () => DG.voice.cancel() }, '■ Parar')));
      };
      let first = true;
      sets.forEach(([g, items]) => {
        B.toc.append(h('div', { class: 'th' }, g));
        items.forEach(([name, ...keys]) => { B.toc.append(B.tocItem(name, first, () => show(name, keys))); if (first) { show(name, keys); first = false; } });
      });
    },
    responses() {
      const O = DG.data.ordo;
      const page = B.page;
      B.toc.append(h('div', { class: 'th' }, 'Estudo'));
      B.toc.append(B.tocItem('Todas as respostas do acólito', true, () => {}));
      page.append(h('h2', null, 'Respostas do acólito na Missa rezada'), h('p', { class: 'rubric' }, 'Em vermelho, a fala do sacerdote (S.); em negro, a resposta do ministro (M.). Estude-as antes de servir.'), B.langToggle());
      const pairs = [
        ['introibo', 'adDeum'], ['ps42_1', 'ps42_2'], ['ps42_3', 'ps42_4'], ['ps42_5', 'ps42_6'], ['gloriaPatri', 'sicutErat'], ['adjutorium', 'quiFecit'],
        ['confiteorP', 'misereaturTui'], [null, 'confiteorM'], [null, 'meaCulpa'], [null, 'confiteorM2'], ['misereaturVestri', 'amen'], ['indulgentiam', 'amen'],
        ['deusTuConversus', 'etPlebsTua'], ['ostendeNobis', 'etSalutare'], ['domineExaudi', 'etClamor'], ['dominusVobiscum', 'etCumSpiritu'],
        ['kyrie', 'kyrie'], ['kyrie', 'christe'], ['christe', 'christe'], ['kyrie', 'kyrie'],
        [null, 'deoGratias'], [null, 'gloriaTibi'], [null, 'lausTibi'], ['orateFratres', 'suscipiat'],
        ['perOmnia', 'amen'], ['sursumCorda', 'habemus'], ['gratiasAgamus', 'dignum'], ['paterNoster', 'sedLibera'], ['paxDomini', 'etCumSpiritu'],
        ['iteMissaEst', 'deoGratias'], ['requiescant', 'amen'], ['benedicat2', 'amen'], ['initiumJoannem', 'gloriaTibi'], ['inPrincipio3', 'deoGratias'],
      ];
      pairs.forEach(([p, m]) => {
        if (p) { const t = O[p]; page.append(h('div', { class: 'bil' + (DG.settings.textMode !== 'both' ? ' single' : '') }, h('div', { class: 'la rubric', html: '<span class="vr">S.</span> ' + DG.ui.fmtLatin(t.la.length > 140 ? t.la.slice(0, 130) + '…' : t.la) }), DG.settings.textMode === 'both' ? h('div', { class: 'pt rubric' }, t.pt.length > 140 ? t.pt.slice(0, 130) + '…' : t.pt) : null)); }
        const t = O[m]; page.append(B.bil(t.la, t.pt, 'M.'));
      });
    },
    // ------------------------------------------------------------
    chants(item) {
      const D = DG.data.chants;
      if (!D) { B.page.append(h('p', null, 'Partituras indisponíveis.')); return; }
      const toc = B.toc;
      const cel = DG.game.cel || DG.calendar.suggested() || DG.cel.list[0];
      const pr = D.propria[cel.id] || {};
      const groups = [];
      const ky = D.kyriale[pr.kyriale || 'XI'];
      groups.push(['Próprio — ' + cel.pt, [['Intróito', pr.in], ['Gradual', pr.gr], ['Aleluia', pr.al], ['Aleluia (2.º)', pr.al2], ['Trato', pr.tr], ['Sequência', pr.seq], ['Ofertório', pr.of], ['Comunhão', pr.co]].filter(x => x[1])]);
      for (const k of ['XI', 'I', 'II', 'IV', 'VIII', 'IX', 'XVII', 'DEF']) {
        const m = D.kyriale[k];
        groups.push([m.name, [['Kyrie', m.kyrie], ['Glória', m.gloria], ['Sanctus', m.sanctus], ['Agnus Dei', m.agnus], ['Ite / Despedida', m.ite]].filter(x => x[1])]);
      }
      groups.push(['Credo e tons', [['Credo I', D.credo.I], ['Credo III', D.credo.III], ['Prefácio — tom solene', D.tones.praefSollemnis], ['Prefácio — tom ferial', D.tones.praefFerialis]]]);
      groups.push(['Antífonas e hinos', [['Asperges me', D.misc.asperges], ['Vidi aquam', D.misc.vidiaquam], ['Salve Regina (solene)', D.misc.salve], ['Salve Regina (simples)', D.misc.salveSimplex], ['Regina cæli', D.misc.reginaCaeli], ['Alma Redemptoris Mater', D.misc.almaRedemptoris], ['Ave Regina cælorum', D.misc.aveRegina], ['Ave verum Corpus', D.misc.aveVerum], ['Adoro te devote', D.misc.adoroTe], ['Tantum ergo', D.misc.tantumErgo], ['Rorate cæli', D.misc.rorate]]]);
      void ky;
      let first = item || null;
      groups.forEach(([g, items]) => {
        toc.append(h('div', { class: 'th' }, g));
        items.forEach(([name, id]) => { const sc = D.scores[id]; if (!sc) return; if (!first) first = id; toc.append(B.tocItem(name, id === first, () => B.chantPage(id, name))); });
      });
      if (first) B.chantPage(first);
    },
    chantPage(id, title) {
      const D = DG.data.chants, sc = D.scores[id];
      const page = B.page; page.innerHTML = '';
      DG.chant.stop(); cancelAnimationFrame(B.raf);
      const score = DG.chant.get(id);
      page.append(h('h2', null, title || sc.name), h('p', { class: 'rubric small' }, (sc.part || '') + (sc.mode ? ' · modo ' + sc.mode : '') + (sc.book ? ' · ' + sc.book : '')));
      const cv = h('canvas', { style: { width: '100%' } });
      const box = h('div', { class: 'chant-box' }, cv);
      const status = h('span', { class: 'small muted' }, '');
      const play = h('button', { class: 'btn small', onclick: () => {
        DG.audio.unlock();
        if (DG.chant.current) { DG.chant.stop(); play.textContent = '▶ Cantar'; cancelAnimationFrame(B.raf); DG.notation.draw(cv, score, {}); return; }
        const hnd = DG.chant.play(id);
        if (!hnd) { status.textContent = 'Áudio indisponível (clique na página para ativar o som).'; return; }
        play.textContent = '■ Parar';
        const tick = () => {
          if (!DG.chant.current || DG.chant.current !== hnd) { play.textContent = '▶ Cantar'; DG.notation.draw(cv, score, {}); return; }
          const i = hnd.noteAt(hnd.position);
          DG.notation.draw(cv, score, { current: i });
          status.textContent = U.fmtTime(Math.max(0, hnd.position)) + ' / ' + U.fmtTime(hnd.duration);
          B.raf = requestAnimationFrame(tick);
        };
        tick();
      } }, '▶ Cantar');
      page.append(h('div', { class: 'chant-ctrl' }, play, status));
      page.append(box);
      page.append(h('p', { class: 'small muted' }, 'Schola sintetizada a partir da partitura (vozes masculinas, vogais latinas por sílaba). O ritmo segue uma leitura simples do método de Solesmes.'));
      requestAnimationFrame(() => DG.notation.draw(cv, score, {}));
    },
    // ------------------------------------------------------------
    manual(key) {
      const M = DG.data.manual;
      let first = key && M.byKey(key) ? key : null;
      M.groups().forEach(g => {
        B.toc.append(h('div', { class: 'th' }, g));
        M.chapters.filter(c => c.group === g).forEach(c => {
          if (!first) first = c.key;
          B.toc.append(B.tocItem((DG.profile.manualRead[c.key] ? '' : '• ') + c.title, c.key === first, () => B.chapter(c.key)));
        });
      });
      B.chapter(first);
    },
    chapter(key) {
      const c = DG.data.manual.byKey(key); if (!c) return;
      B.page.innerHTML = '';
      B.page.append(h('h2', null, c.title), h('div', { html: c.html }));
      B.page.scrollTop = 0;
      if (!DG.profile.manualRead[key]) { DG.profile.manualRead[key] = Date.now(); DG.store.save(); DG.achievements.checkPassive(); }
    },
    objects(id) {
      const D = DG.data.objects;
      const by = D.byCat();
      let first = id || null;
      Object.keys(D.CATS).forEach(cat => {
        if (!by[cat]) return;
        B.toc.append(h('div', { class: 'th' }, D.CATS[cat]));
        by[cat].forEach(o => { if (!first) first = o.id; B.toc.append(B.tocItem((DG.profile.examined[o.id] ? '✓ ' : '') + o.name, o.id === first, () => B.objectPage(o.id))); });
      });
      B.toc.append(h('div', { class: 'small muted', style: { marginTop: '1em' } }, Object.keys(DG.profile.examined).length + ' / ' + D.list.length + ' examinados'));
      B.objectPage(first);
    },
    objectPage(id) {
      const o = DG.data.objects.get(id); if (!o) return;
      const color = (DG.game.cel && DG.game.cel.color) || 'albus';
      B.page.innerHTML = '';
      const fig = h('div', { class: 'obj-fig' }, DG.ui.iconCanvas(o.icon, color, 128));
      B.page.append(...[fig, h('h2', null, o.name), h('p', { class: 'rubric' }, o.la + ' · ' + DG.data.objects.CATS[o.cat]),
        h('h4', null, 'O que é'), h('p', null, o.desc),
        h('h4', null, 'Uso no rito'), h('p', null, o.use),
        h('h4', null, 'Simbolismo e importância'), h('p', null, o.symb),
        o.rule && o.rule !== '—' ? h('div', { class: 'note' }, h('b', null, 'Norma: '), o.rule) : null].filter(Boolean));
      if (!DG.profile.examined[id]) { DG.profile.examined[id] = Date.now(); DG.store.save(); DG.achievements.checkPassive(); }
    },
    examine(id) { DG.book.open('objects', id); },
  };
})(window.DG = window.DG || {});
