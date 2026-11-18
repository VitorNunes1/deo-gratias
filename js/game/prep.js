/* DEO GRATIAS — preparação na sacristia (sacerdote e acólito) */
(function (DG) {
  'use strict';
  const U = DG.util;
  const O = () => DG.data.ordo;

  const VEST_ORDER = [
    { id: 'amictus', name: 'Amito', art: 'do', prayer: 'vestAmictus', kiss: true, icon: 'amictus' },
    { id: 'alba', name: 'Alva', prayer: 'vestAlba', icon: 'alba' },
    { id: 'cingulum', name: 'Cíngulo', prayer: 'vestCingulum', icon: 'cingulum' },
    { id: 'manipulus', name: 'Manípulo', art: 'do', prayer: 'vestManipulus', kiss: true, icon: 'manipulus' },
    { id: 'stola', name: 'Estola', art: 'da', prayer: 'vestStola', kiss: true, icon: 'stola' },
    { id: 'casula', name: 'Casula', prayer: 'vestCasula', icon: 'casula' },
  ];
  const CHALICE_ORDER = [
    { id: 'purif', name: 'Sanguinho (purificatório) sobre a boca do cálice', icon: 'purificatorium' },
    { id: 'patena', name: 'Patena com a hóstia grande', icon: 'patena' },
    { id: 'palla', name: 'Pala', icon: 'palla' },
    { id: 'velum', name: 'Véu do cálice', icon: 'velum' },
    { id: 'bursa', name: 'Bolsa com o corporal dobrado', icon: 'bursa' },
  ];

  // painel de escolha genérico (retorna índice)
  function choose(title, subtitle, options, opts) {
    opts = opts || {};
    return new Promise(res => {
      const { h } = DG.ui;
      const sc = { modal: true };
      const done = (i) => { DG.ui.pop(sc); res(i); };
      const grid = h('div', { class: 'cards', style: { gridTemplateColumns: 'repeat(' + Math.min(options.length, opts.cols || 3) + ', 1fr)' } });
      options.forEach((o, i) => {
        const card = h('div', { class: 'card' + (opts.hint && o.ok ? ' sel' : ''), 'data-nav': 1, 'data-ok': o.ok ? '1' : null, tabindex: 0, onclick: () => done(i) },
          o.icon ? DG.ui.iconCanvas(o.icon, o.color, 56) : null, h('h4', { class: 'center' }, (i + 1) + '. ' + o.label), o.sub ? h('div', { class: 'small center muted' }, o.sub) : null);
        grid.append(card);
      });
      sc.el = h('div', { class: 'screen dim' }, h('div', { class: 'panel', style: { width: 'calc(var(--u)*' + (opts.width || 300) + ')' } },
        h('h3', null, title), subtitle ? h('p', { class: 'rubric' }, subtitle) : null, grid,
        opts.cancel ? h('div', { class: 'row', style: { justifyContent: 'flex-end', marginTop: '1em' } }, h('button', { class: 'btn ghost', 'data-nav': 1, onclick: () => done(-1) }, 'Voltar')) : null));
      sc.onKey = (ev) => { const n = parseInt((ev.code || '').replace(/\D/g, ''), 10); if (ev.type === 'key' && n >= 1 && n <= options.length && /^(Digit|Numpad)/.test(ev.code)) { done(n - 1); return true; } return false; };
      sc.onBack = () => { if (opts.cancel) done(-1); };
      sc.navH = true;
      DG.ui.push(sc);
    });
  }
  DG.choose = choose;

  class Prep {
    constructor(role, cel, mode) {
      this.role = role; this.cel = cel; this.mode = mode;
      this.score = new DG.Score();
      this.busy = false;
      this.hints = DG.settings.hints === 'sempre' || (DG.settings.hints === 'auto' && mode !== 'celebracao');
      this.flags = {};
      this.vestIdx = 0;
      this.candles = [];
      this.cross = { inMid: false, genu: false };
    }
    get G() { return DG.game; }
    // ------------------------------------------------------------
    start() {
      const GM = this.G, P = GM.priest, M = GM.server;
      if (this.role === 'sacerdos') {
        this.tasks = [
          { id: 'missal', label: 'Marcar o Missal (Missa do dia e Prefácio)' },
          { id: 'hands', label: 'Lavar as mãos (Da, Dómine, virtútem)' },
          { id: 'chalice', label: 'Preparar o cálice' },
          { id: 'vest', label: 'Revestir-se dos paramentos na sala ao lado' },
          { id: 'take', label: 'Tomar o cálice e o barrete' },
        ];
        // igreja já preparada pelo acólito
        GM.sceneStates.church = { candles: GM.form === 'cantata' ? [true, true, true, true, true, true] : [false, false, true, true, false, false], missal: { at: 'none', open: false } };
        P.scene = 'sacristy'; M.scene = 'vestry';
        GM.loadScene('sacristy', 'start');
        M.x = 152; M.y = 118; M.facing = 'up';
        DG.hud.setBanner('Sacristia', 'Preparação para a Missa — ' + this.cel.title);
      } else {
        this.tasks = [
          { id: 'surplice', label: 'Vestir a sobrepeliz (sala dos paramentos)' },
          { id: 'cruets', label: 'Encher as galhetas de vinho e de água' },
          { id: 'credence', label: 'Levar galhetas, bacia e manustérgio à credência' },
          { id: 'cover', label: 'Retirar a cobertura do altar' },
          { id: 'lighter', label: 'Pegar o acendedor (sacristia)' },
          { id: 'candles', label: DG.game.form === 'cantata' ? 'Acender as seis velas: Epístola primeiro (da cruz para fora), depois Evangelho' : 'Acender as velas: Epístola primeiro, depois Evangelho' },
          { id: 'returnLighter', label: 'Devolver o acendedor' },
          { id: 'assist', label: 'Auxiliar o sacerdote a revestir-se' },
          { id: 'missal', label: 'Tomar o Missal para a procissão' },
        ];
        GM.server.spec.surplice = false;
        GM.sceneStates.church = { candles: [false, false, false, false, false, false], missal: { at: 'none', open: false }, altarCover: true, credence: { cruets: false, lavabo: false, towel: false, bell: true, paten: true, card: true } };
        GM.sceneStates.sacristy = { cruets: 'empty' };
        M.scene = 'vestry'; P.scene = 'sacristy';
        GM.loadScene('vestry', 'start');
        P.x = 480; P.y = 150; P.scene = 'sacristy';
        DG.hud.setBanner('Sala dos paramentos', 'Preparação — ' + this.cel.title);
        this.npcPriestPrep();
      }
      this.refresh();
      this.intro();
    }
    intro() {
      const t = this.role === 'sacerdos'
        ? 'Prepare-se para celebrar: as tarefas estão à direita. Ande com WASD/setas ou clique; use E para interagir. A cor do dia é: ' + DG.LIT[this.cel.color].name.toLowerCase() + '.'
        : 'Prepare a Missa: as tarefas estão à direita. Ande com WASD/setas ou clique; E para interagir; K ajoelha; 5 genuflecte.';
      if (this.mode !== 'tutorial') DG.ui.toast(t, 'info');
    }
    refresh() { DG.hud.setTasks(this.role === 'sacerdos' ? 'Preparação do celebrante' : 'Preparação do acólito', this.tasks); }
    done(id) { const t = this.tasks.find(t => t.id === id); if (t && !t.done) { t.done = true; this.score.good('rubrica'); DG.sfx.ok2(); this.refresh(); this.checkAll(); } }
    isDone(id) { const t = this.tasks.find(t => t.id === id); return !!(t && t.done); }
    current() { return this.tasks.find(t => !t.done); }
    mistake(what, how) { this.lastWrong = true; this.score.mistake('rubrica', what, how, {}); DG.sfx.error(); DG.ui.toast(what + (this.hints ? ' ' + how : ''), 'err'); }
    hintNow() { const r = this.mode === 'tutorial' || (this.hints && this.lastWrong); this.lastWrong = false; return r; }
    checkAll() {
      if (this.tasks.every(t => t.done) && !this.finishing) { this.finishing = true; this.finish(); }
    }
    async finish() {
      const GM = this.G;
      DG.ui.toast('Tudo pronto. Começa a procissão para o altar.', 'ok');
      await DG.wait(1.2);
      // ambos na sacristia
      if (GM.scene.id !== 'sacristy') { GM.priest.scene = GM.server.scene = 'sacristy'; await GM.goScene('sacristy', 'vestDoor', { withBoth: true }); }
      GM.priest.scene = GM.server.scene = 'sacristy';
      GM.scene.actors = [GM.priest, GM.server];
      const prepScore = this.score;
      GM.beginRite({});
      const e = GM.engine;
      for (const k in prepScore.ok) e.score.ok[k] += prepScore.ok[k];
      for (const k in prepScore.bad) e.score.bad[k] += prepScore.bad[k];
      e.score.mistakes.push(...prepScore.mistakes.map(m => Object.assign(m, { step: 'Preparação na sacristia' })));
    }
    // ------------------------------------------------------------
    update(dt) {
      // genuflexão ao passar diante do altar do Santíssimo (acólito, na igreja)
      const GM = this.G, sc = GM.scene, me = GM.player;
      if (!sc || sc.id !== 'church' || !me) return;
      const inSanct = me.y > 140 && me.y < 215;
      const mid = Math.abs(me.x - sc.CX) < 9 && inSanct;
      if (mid && !this.cross.inMid) { this.cross.inMid = true; this.cross.genu = false; this.cross.from = me.x < sc.CX ? -1 : 1; }
      if (!mid && this.cross.inMid) {
        this.cross.inMid = false;
        const side = me.x < sc.CX ? -1 : 1;
        if (side !== this.cross.from && !this.cross.genu) { this.score.mistake('reverencia', 'Passou diante do Santíssimo sem genuflectir.', 'Ao passar pelo meio do altar onde está o sacrário, genuflecte-se.', {}); DG.ui.toast('Passou diante do Santíssimo sem genuflectir.' + (this.hints ? ' Genuflecte-se (5) ao passar pelo meio.' : ''), 'err'); }
      }
    }
    onGesture(id) {
      const GM = this.G;
      if (id === 'genuflectere' && this.cross.inMid) this.cross.genu = true;
      if (this.waitGesture && this.waitGesture.id === id) { const w = this.waitGesture; this.waitGesture = null; GM.player.play(DG.GEST.BY[id].anim); w.res(true); return true; }
      return false;
    }
    gesture(id, label, timeout) {
      DG.ui.toast((this.hints ? label + ' — tecla ' + DG.input.keyLabel(DG.GEST.BY[id].key) : label), 'info');
      return new Promise(res => { this.waitGesture = { id, res }; DG.wait(timeout || 12).then(() => { if (this.waitGesture && this.waitGesture.res === res) { this.waitGesture = null; this.mistake('Gesto omitido: ' + DG.GEST.name(id) + '.', label); res(false); } }); });
    }
    canLeave() { return !this.busy; }
    promptText() {
      const GM = this.G, sc = GM.scene, p = GM.player;
      if (this.busy) return null;
      if (this.role === 'minister' && sc.id === 'church') {
        if (p.base.carry === 'pole' && this.nearAltar()) return 'Acender a vela (' + (p.x > sc.CX ? 'lado da Epístola' : 'lado do Evangelho') + ')';
        if (sc.state.altarCover && this.nearAltar()) return 'Retirar a cobertura do altar';
        if (p.base.carry === 'cruets' && sc.inZone('credence', p.x, p.y)) return 'Pôr na credência';
      }
      return null;
    }
    nearAltar() { const sc = this.G.scene, p = this.G.player; return sc.id === 'church' && p.y >= 150 && p.y <= 172 && p.x > 196 && p.x < 380; }
    // tecla E
    interact() {
      if (this.busy) return true;
      const GM = this.G, sc = GM.scene, p = GM.player;
      if (this.role === 'minister' && sc.id === 'church') {
        if (p.base.carry === 'pole' && this.nearAltar()) { this.lightCandle(); return true; }
        if (sc.state.altarCover && this.nearAltar()) { sc.state.altarCover = false; DG.sfx.cloth(0.7); this.done('cover'); return true; }
      }
      return false;
    }
    onProp(prop) {
      if (this.busy) return true;
      const id = prop.id;
      const fn = (this.role === 'sacerdos' ? this.priestProps : this.serverProps)[id];
      if (fn) { fn.call(this, prop); return true; }
      if (/^drawer_/.test(id)) { (this.role === 'sacerdos' ? this.priestProps.drawer : this.serverProps.drawer).call(this, prop); return true; }
      return false;
    }
    async showPrayer(key, who) {
      const t = O()[key];
      DG.emit('rite:say', { who: who || 'P', la: t.la, pt: t.pt, voice: 'submissa' });
      const h = DG.voice.speak(t.la, { role: who === 'M' ? 'server' : 'priest', volume: 0.55 });
      await h.promise; await DG.wait(0.4);
      DG.hud.hideSay();
    }
    // ------------------------------------------------------------
    // SACERDOTE
    get priestProps() {
      return {
        priedieu: async function () {
          this.busy = true; const P = this.G.priest;
          await P.play('ajoelhar'); DG.ui.toast('Preparação: Antífona “Ne reminiscáris”, Salmos 83, 84, 85, 115 e 129 (Missal, “Præparatio ad Missam”).', 'info');
          await DG.wait(3); await P.play('levantar'); this.busy = false;
        },
        missalStand: async function (prop) {
          if (this.isDone('missal')) { DG.book.open('missal'); return; }
          this.busy = true;
          const others = U.shuffle(DG.cel.list.filter(c => c.id !== this.cel.id)).slice(0, 2);
          const opts = U.shuffle([this.cel, ...others]);
          const i = await choose('Marcar o Missal', 'Qual é a Missa de hoje? (' + this.cel.seasonName + ')', opts.map(c => ({ label: c.pt, sub: c.la, icon: 'missale', ok: c === this.cel })), { cols: 3, hint: this.hintNow() });
          if (opts[i] !== this.cel) this.mistake('Missa errada no Missal.', 'Hoje: ' + this.cel.title + '.');
          const pref = DG.cel.preface(this.cel);
          const prefs = U.shuffle(['Communis', 'Trinitate', 'Nat', 'Quad', 'Pasch', 'Maria', 'Apostolis', 'Defunctorum', 'Quad5', 'Spiritu'].filter(k => k !== pref.key)).slice(0, 2).concat([pref.key]);
          const sh = U.shuffle(prefs);
          const j = await choose('Marcar o Prefácio', 'Que Prefácio se diz nesta Missa?', sh.map(k => ({ label: DG.data.ordo.prefaceNames[k], icon: 'missale', ok: k === pref.key })), { cols: 3, hint: this.hintNow() });
          if (sh[j] !== pref.key) this.mistake('Prefácio errado.', 'Nesta Missa: ' + pref.name + '.');
          this.G.scene.state.missalMarked = true; DG.sfx.page();
          this.done('missal'); this.busy = false;
        },
        lavaboSac: async function () {
          if (this.isDone('hands')) return;
          if (!this.isDone('missal')) this.mistake('Ordem: primeiro se marca o Missal, depois se lavam as mãos.', 'Ritus servandus I, 1.');
          this.busy = true; const P = this.G.priest;
          P.face('up'); DG.sfx.pour(1.6); P.play('tractare', { dur: 1.6 });
          await this.showPrayer('vestLavat');
          this.done('hands'); this.busy = false;
        },
        chaliceTable: async function () {
          const sc = this.G.scene;
          if (this.isDone('chalice')) {
            if (this.isDone('vest') && !this.isDone('take')) { sc.state.chalice = 'taken'; this.G.priest.spec.biretta = true; this.G.priest.setBase({ carry: 'chalice', carryArms: 'hold' }); DG.sfx.clink(); this.done('take'); }
            else if (!this.isDone('vest')) DG.ui.toast('Primeiro reveste-se; depois toma o cálice.', 'info');
            return;
          }
          if (!this.isDone('hands')) this.mistake('Ordem: lavam-se as mãos antes de preparar o cálice.', 'Ritus servandus I, 1.');
          this.busy = true;
          let k = 0;
          while (k < CHALICE_ORDER.length) {
            const remaining = CHALICE_ORDER.slice(k);
            const opts = U.shuffle(remaining);
            const i = await choose('Preparar o cálice', 'Sobre o cálice, coloque em ordem (' + (k + 1) + '/5):', opts.map(o => ({ label: o.name, icon: o.icon, color: this.cel.color, ok: o.id === CHALICE_ORDER[k].id })), { cols: Math.min(3, opts.length), width: 320, hint: this.hintNow() });
            if (opts[i].id === CHALICE_ORDER[k].id) { k++; DG.sfx.clink(); }
            else this.mistake('Fora de ordem: ' + opts[i].name + '.', 'A ordem é: sanguinho, patena com a hóstia, pala, véu e bolsa com o corporal.');
          }
          sc.state.chalice = 'prepared';
          this.done('chalice'); this.busy = false;
        },
        arcaz: async function () { DG.ui.toast('Abra a gaveta com os paramentos da cor do dia (' + (this.hints ? DG.LIT[this.cel.color].name.toLowerCase() : '?') + ').', 'info'); },
        drawer: async function (prop) {
          if (this.isDone('vest')) return;
          const sc = this.G.scene;
          if (!this.isDone('chalice')) { this.mistake('Ordem: o cálice prepara-se antes de se revestir.', 'Ritus servandus I, 1–2.'); }
          if (prop.color !== this.cel.color) {
            if (!(this.cel.color === 'rosaceus' && prop.color === 'violaceus')) { sc.state.openDrawer = prop.color; this.mistake('Cor litúrgica errada: ' + DG.LIT[prop.color].name + '.', 'Hoje: ' + DG.LIT[this.cel.color].name + ' — ' + DG.LIT[this.cel.color].meaning); await DG.wait(0.6); sc.state.openDrawer = null; return; }
          }
          sc.state.openDrawer = prop.color; DG.sfx.cloth(0.6);
          sc.state.laid = { color: prop.color, items: { amictus: 1, alba: 1, cingulum: 1, manipulus: 1, stola: 1, casula: 1 } };
          this.G.priest.spec.color = prop.color;
          this.vesting();
        },
      };
    }
    async vesting() {
      this.busy = true;
      const GM = this.G, P = GM.priest, M = GM.server, sc = GM.scene;
      await P.walkTo(sc.points.arcaz.x, sc.points.arcaz.y, { facing: 'up' });
      if (M.scene === sc.id) { M.walkTo(sc.points.arcazServer.x, sc.points.arcazServer.y, { facing: 'up' }); }
      let k = 0;
      while (k < VEST_ORDER.length) {
        const rem = VEST_ORDER.slice(k);
        const opts = U.shuffle(rem);
        const i = await choose('Paramentação', 'Qual paramento se veste agora? (' + (k + 1) + '/6)', opts.map(v => ({ label: v.name, icon: v.icon, color: this.cel.color, ok: v.id === VEST_ORDER[k].id })), { cols: 3, hint: this.hintNow() });
        const v = opts[i];
        if (v.id !== VEST_ORDER[k].id) { this.mistake('Ordem errada: ' + v.name + '.', 'A ordem é: amito, alva, cíngulo, manípulo, estola e casula.'); continue; }
        if (v.kiss) await this.gesture('osculari', 'Beije a cruz ' + v.art + ' ' + v.name.toLowerCase(), 10);
        P.spec.vest = Object.assign({}, P.spec.vest, { [v.id]: 1 });
        delete sc.state.laid.items[v.id];
        DG.sfx.cloth(0.8);
        P.play('tractare', { dur: 1 });
        await this.showPrayer(v.prayer);
        k++;
      }
      sc.state.openDrawer = null; sc.state.laid = null;
      this.done('vest'); this.busy = false;
      DG.ui.toast('Agora, volte à sacristia e tome o cálice preparado.', 'info');
      // o acólito vai à sacristia buscar o Missal
      if (M.scene === sc.id) { M.walkTo(sc.points.sacDoor.x, sc.points.sacDoor.y).then(() => { M.scene = 'sacristy'; const ss = GM.scene; if (ss.id === 'vestry') ss.actors = ss.actors.filter(a => a !== M); M.x = 300; M.y = 104; M.setBase({ carry: 'missal', carryArms: 'hold' }); if (GM.scene.id === 'sacristy' && !GM.scene.actors.includes(M)) GM.scene.actors.push(M); }); }
    }
    // ------------------------------------------------------------
    // ACÓLITO
    get serverProps() {
      return {
        serverHooks: async function () {
          if (this.isDone('surplice')) return;
          this.busy = true;
          const i = await choose('Veste do acólito', 'Escolha a batina (o costume varia; a sobrepeliz é sempre branca):', [{ label: 'Batina preta', icon: 'vestisTalaris', ok: true }, { label: 'Batina vermelha', icon: 'vestisTalaris', ok: true }]);
          const G = this.G;
          G.server.spec.cassock = i === 1 ? 'ruber' : 'niger';
          DG.profile.character.minister.cassock = G.server.spec.cassock; DG.store.save();
          G.scene.state.serverVested = true; G.scene.state.serverCassock = G.server.spec.cassock;
          DG.sfx.cloth(1);
          await G.server.play('tractare', { dur: 1 });
          G.server.spec.surplice = true;
          this.done('surplice'); this.busy = false;
        },
        cruetTable: async function () {
          const sc = this.G.scene, M = this.G.server;
          if (!this.isDone('surplice')) { DG.ui.toast('Primeiro vista a sobrepeliz.', 'info'); }
          if (!this.isDone('cruets')) {
            this.busy = true;
            const i = await choose('Galhetas', 'Em qual galheta vai o vinho?', [{ label: 'Na galheta marcada “V” (vinho)', icon: 'urceoli', ok: true }, { label: 'Em qualquer uma', icon: 'urceoli' }], { cols: 2, hint: this.hintNow() });
            if (i !== 0) this.mistake('As galhetas devem ser distinguíveis.', 'O vinho de Missa (de uva, natural) vai na galheta própria; a água pura na outra.');
            DG.sfx.pour(1.2); await M.play('tractare', { dur: 1.2 });
            sc.state.cruets = 'filled';
            this.done('cruets'); this.busy = false; return;
          }
          if (!this.isDone('credence') && M.base.carry !== 'cruets') { sc.state.cruets = 'taken'; M.setBase({ carry: 'cruets', carryArms: 'hold' }); DG.sfx.clink(); DG.ui.toast('Leve as galhetas, a bacia e o manustérgio à credência, na igreja.', 'info'); }
        },
        credence: async function () {
          const sc = this.G.scene, M = this.G.server;
          if (M.base.carry === 'cruets') { sc.state.credence = Object.assign({}, sc.state.credence, { cruets: true, lavabo: true, towel: true }); M.setBase({ carry: null }); DG.sfx.clink(); this.done('credence'); return; }
          DG.book.examine('credentia');
        },
        lighter: async function () {
          const sc = this.G.scene, M = this.G.server;
          if (!this.isDone('candles') && M.base.carry !== 'pole') {
            if (M.base.carry) { DG.ui.toast('Suas mãos estão ocupadas.', 'err'); return; }
            sc.state.lighter = false; M.setBase({ carry: 'pole', carryArms: 'hold' }); M.spec.poleLit = true; DG.sfx.whoosh(); this.done('lighter'); return;
          }
          if (this.isDone('candles') && M.base.carry === 'pole') { sc.state.lighter = true; M.setBase({ carry: null }); M.spec.poleLit = false; this.done('returnLighter'); }
        },
        arcaz: async function () { DG.ui.toast('O sacerdote se reveste aqui; ajude-o quando ele chegar.', 'info'); },
        drawer: async function () { DG.ui.toast('Os paramentos já estão escolhidos pelo celebrante.', 'info'); },
        missalStand: async function () {
          const M = this.G.server;
          if (!this.isDone('assist')) { DG.ui.toast('Antes, auxilie o sacerdote a revestir-se.', 'info'); return; }
          if (M.base.carry) { DG.ui.toast('Suas mãos estão ocupadas.', 'err'); return; }
          this.G.scene.state.missal = 'taken'; M.setBase({ carry: 'missal', carryArms: 'hold' }); DG.sfx.page(); this.done('missal');
        },
      };
    }
    lightCandle() {
      const sc = this.G.scene, p = this.G.player;
      // ordem: lado da Epístola primeiro, da vela mais próxima da cruz para fora; depois o do Evangelho
      const order = this.G.form === 'cantata' ? [3, 4, 5, 2, 1, 0] : [3, 2];
      const ep = p.x > sc.CX;
      const next = order.find(i => !sc.state.candles[i]);
      const mine = order.find(i => !sc.state.candles[i] && (i >= 3) === ep);
      if (mine == null) { DG.ui.toast('As velas deste lado já estão acesas.', 'info'); return; }
      if (mine !== next) this.mistake('Ordem das velas: acende-se primeiro o lado da Epístola, começando pela vela mais próxima da cruz.', 'O’Connell, p. 355 (n. 12).');
      sc.state.candles[mine] = true; DG.sfx.whoosh(); DG.fx.sparkle(sc.particles, sc.K.candlesX[mine], 92, '#ffd27a');
      p.play('tractare', { dur: 0.8 });
      if (order.every(i => sc.state.candles[i])) this.done('candles');
    }
    // sacerdote (NPC) prepara-se enquanto o acólito trabalha
    async npcPriestPrep() {
      const GM = this.G, P = GM.priest;
      P.spec.vest = {}; P.spec.biretta = false;
      await DG.wait(2);
      // o sacerdote chega à sacristia vindo da igreja e faz suas preparações (invisível se o jogador estiver em outra sala)
      const steps = async () => {
        P.x = 440; P.y = 150; P.scene = 'sacristy';
        if (GM.scene.id === 'sacristy' && !GM.scene.actors.includes(P)) GM.scene.actors.push(P);
        const sc = () => GM.scene;
        const at = async (pt) => { const ss = DG.maps && GM.sceneStates; void ss; if (GM.scene.id === 'sacristy') await P.walkTo(GM.scene.points[pt].x, GM.scene.points[pt].y, { facing: GM.scene.points[pt].facing }); else { await DG.wait(2.5); } };
        await at('priedieu'); if (GM.scene.id === 'sacristy') await P.play('ajoelhar'); await DG.wait(6); if (GM.scene.id === 'sacristy') await P.play('levantar');
        await at('missal'); DG.sfx.page(); await DG.wait(2.5);
        await at('lavabo'); if (GM.scene.id === 'sacristy') { DG.sfx.pour(1.2); DG.emit('rite:say', { who: 'P', la: O().vestLavat.la, pt: O().vestLavat.pt, voice: 'submissa' }); } await DG.wait(4); DG.hud.hideSay();
        await at('table'); await DG.wait(3);
        if (GM.scene.id === 'sacristy') { GM.scene.state.chalice = 'prepared'; } else { GM.sceneStates.sacristy = Object.assign(GM.sceneStates.sacristy || {}, { chalice: 'prepared' }); }
        // vai à sala dos paramentos esperar o acólito
        if (GM.scene.id === 'sacristy') await P.walkTo(26, 180);
        P.scene = 'vestry';
        if (GM.scene.id === 'sacristy') GM.scene.actors = GM.scene.actors.filter(a => a !== P);
        P.x = 176; P.y = 112; P.facing = 'up';
        if (GM.scene.id === 'vestry' && !GM.scene.actors.includes(P)) GM.scene.actors.push(P);
        this.priestWaiting = true;
        DG.ui.toast('O sacerdote está à espera na sala dos paramentos.', 'info');
        this.watchAssist();
      };
      steps();
    }
    watchAssist() {
      const GM = this.G;
      const tick = async () => {
        if (this.isDone('assist') || this !== GM.prep) return;
        const P = GM.priest, M = GM.server;
        if (GM.scene.id === 'vestry' && this.isDone('surplice') && !this.assisting && U.dist(M.x, M.y, P.x, P.y) < 40) { this.assisting = true; await this.assistVesting(); return; }
        DG.wait(0.5).then(tick);
      };
      tick();
    }
    async assistVesting() {
      this.busy = true;
      const GM = this.G, P = GM.priest, M = GM.server, sc = GM.scene;
      sc.state.laid = { color: this.cel.color, items: { amictus: 1, alba: 1, cingulum: 1, manipulus: 1, stola: 1, casula: 1 } };
      P.spec.color = this.cel.color;
      await M.walkTo(sc.points.arcazServer.x, sc.points.arcazServer.y, { facing: 'up' });
      DG.ui.toast('De pé, à esquerda do sacerdote, entregue-lhe cada paramento na ordem.', 'info');
      let k = 0;
      while (k < VEST_ORDER.length - 1) { // a casula, o sacerdote a toma ele mesmo
        const opts = U.shuffle(VEST_ORDER.slice(k, VEST_ORDER.length - 1));
        const i = await choose('Auxiliar a paramentação', 'Que paramento entregar agora? (' + (k + 1) + '/5)', opts.map(v => ({ label: v.name, icon: v.icon, color: this.cel.color, ok: v.id === VEST_ORDER[k].id })), { cols: 3, hint: this.hintNow() });
        const v = opts[i];
        if (v.id !== VEST_ORDER[k].id) { this.mistake('Ordem errada: ' + v.name + '.', 'Amito, alva, cíngulo (segurado por trás do sacerdote), manípulo e estola; a casula, o sacerdote a toma.'); continue; }
        if (v.kiss) await this.gesture('beijar', 'Beije a cruz ' + v.art + ' ' + v.name.toLowerCase() + ' (ao lado, não no mesmo lugar do sacerdote)', 10);
        M.play('servir', { dur: 0.8 });
        P.spec.vest = Object.assign({}, P.spec.vest, { [v.id]: 1 }); delete sc.state.laid.items[v.id];
        DG.sfx.cloth(0.8);
        await this.showPrayer(v.prayer);
        k++;
      }
      P.spec.vest = Object.assign({}, P.spec.vest, { casula: 1 }); sc.state.laid = null;
      await this.showPrayer('vestCasula');
      this.done('assist'); this.busy = false;
      // o sacerdote toma o cálice na sacristia
      P.walkTo(sc.points.sacDoor.x, sc.points.sacDoor.y).then(() => {
        P.scene = 'sacristy'; P.x = 280; P.y = 100; P.facing = 'up'; P.spec.biretta = true; P.setBase({ carry: 'chalice', carryArms: 'hold' });
        if (GM.scene.id === 'vestry') GM.scene.actors = GM.scene.actors.filter(a => a !== P);
        GM.sceneStates.sacristy = Object.assign(GM.sceneStates.sacristy || {}, { chalice: 'taken' });
        if (GM.scene.id === 'sacristy') { GM.scene.state.chalice = 'taken'; if (!GM.scene.actors.includes(P)) GM.scene.actors.push(P); }
      });
      DG.ui.toast('Agora tome o Missal na sacristia.', 'info');
    }
  }

  DG.Prep = Prep;
})(window.DG = window.DG || {});
