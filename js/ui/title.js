/* DEO GRATIAS — tela inicial */
(function (DG) {
  'use strict';
  const { h } = DG.ui;

  const T = DG.title = {
    sc: null, musicT: null,
    show() {
      DG.game.state = 'title';
      DG.game.scene = null;
      DG.hud.destroy();
      const last = DG.profile.history.find(r => r.completed);
      const items = [
        ['Nova celebração', () => DG.screens.newGame()],
        last ? ['Repetir: ' + last.celTitle.replace(/ — .*/, ''), () => DG.game.startCelebration({ role: last.role, celId: last.celebration, form: last.form, mode: last.mode === 'tutorial' ? 'treino' : last.mode, startSection: last.section })] : null,
        ['Explorar a igreja', async () => { const i = await DG.choose('Explorar a igreja', 'Percorra a nave, o presbitério, a sacristia, a sala dos paramentos e a capela; examine cada objeto.', [{ label: 'Como acólito', icon: 'superpelliceum' }, { label: 'Como sacerdote', icon: 'casula' }], { cols: 2, cancel: true }); if (i >= 0) DG.game.startExplore(i === 1 ? 'sacerdos' : 'minister'); }],
        ['Calendário litúrgico', () => DG.screens.calendarView(null)],
        ['Livro de orações e cantos', () => DG.book.open('cantos')],
        ['Manual litúrgico', () => DG.book.open('manual')],
        ['Objetos litúrgicos', () => DG.book.open('objects')],
        ['Histórico e progresso', () => DG.screens.history()],
        ['Configurações', () => DG.screens.settings()],
        ['Créditos e fontes', () => DG.screens.credits()],
      ].filter(Boolean);
      const today = DG.calendar.today();
      const crest = h('div', { class: 'crest' }, h('span', { class: 'crest-line' }), DG.skin.emblem(24, 'gold'), h('span', { class: 'crest-line' }));
      const menu = h('div', { class: 'title-menu panel dark' }, crest, items.map(([label, fn]) => h('button', { class: 'menu-item', 'data-nav': 1, onclick: () => { DG.audio.unlock(); DG.sfx.uiSelect(); fn(); } }, label)));
      const el = h('div', { class: 'title-screen' },
        h('div', { class: 'title-logo' }, h('div', { class: 't1' }, 'Deo Gratias'), h('div', { class: 't2' }, 'Simulador da Santa Missa Tridentina'), h('div', { class: 't3' }, 'Capela São Pio X · Missale Romanum MCMLXII')),
        menu,
        h('div', { class: 'title-foot' }, 'Hoje: ' + today.name + ' · ' + DG.LIT[today.color].name.toLowerCase() + ' · v' + DG.VERSION));
      const sc = T.sc = { el, modal: false };
      sc.onKey = () => false;
      DG.ui.push(sc);
      sc._pop && sc._pop();
      // navegação do menu inicial mesmo sem foco
      sc._pop = DG.input.pushHandler((ev) => { if (DG.ui.top() !== sc) return false; return DG.ui.navigate(sc, ev); });
      T.updateMusic();
    },
    updateMusic() {
      clearTimeout(T.musicT);
      if (DG.game.state !== 'title' || !DG.settings.ambientChant) { DG.chant.stop(); return; }
      if (!DG.audio.unlocked) { const off = DG.on('audio:unlocked', () => { off(); T.updateMusic(); }); return; }
      if (DG.chant.current) return;
      const D = DG.data.chants;
      const cel = DG.calendar.suggested() || DG.cel.list[0];
      const pr = D.propria[cel.id] || {};
      const pool = [pr.in, D.misc.salveSimplex, D.misc.adoroTe, D.misc.aveVerum, pr.co].filter(Boolean);
      const id = pool[Math.floor(Math.random() * pool.length)];
      const hnd = DG.chant.play(id, { volume: 0.55 });
      if (hnd) hnd.promise.then(() => { T.musicT = setTimeout(() => T.updateMusic(), 9000); });
    },
  };
})(window.DG = window.DG || {});
