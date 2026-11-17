/* DEO GRATIAS — motor do rito: executa o roteiro, conduz os personagens e valida o jogador */
(function (DG) {
  'use strict';
  const U = DG.util;

  // ações do acólito que exigem algo nas mãos / efeitos
  const ACT_FX = {
    infundereVinum: 'pour', infundereAquam: 'pour', infundereLavabo: 'pour', infundereAblutio: 'pour', infundereDigitis: 'pour',
    praebereVinum: 'clink', praebereAquam: 'clink', tollereUrceolos: 'clink', reddereUrceolos: 'clink', tollereLavabo: 'clink',
    aperireMissale: 'page', claudereMissale: 'page', transferreMissale: 'page', ponereMissaleEv: 'page', ponereMissaleEp: 'page', deponereMissale: 'page',
    discooperireCalicem: 'cloth', componereCalicem: 'cloth', ponereCalicem: 'cloth', cooperirePalla: 'cloth', discooperirePalla: 'cloth',
    frangere: 'break',
  };
  const ACT_ANIM = {
    offerreHostiam: 'offerre', offerreCalicem: 'offerre', elevareHostiam: 'elevareHostiam', elevareCalicem: 'elevareCalicem', elevatioMinor: 'elevatioMinor',
    sumereHostiam: 'sumere', sumereSanguinem: 'sumere', ostendere: 'ostendere', osculariLibrum: 'osculari', osculariPatenam: 'inclinCapitis',
    lavare: 'tractare', ablutio: 'tractare',
  };
  // grupos de ações do altar (para mostrar distratores plausíveis)
  const ACT_GROUPS = [
    ['ponereCalicem', 'aperireMissale', 'discooperireCalicem', 'claudereMissale', 'componereCalicem', 'tollereCalicem'],
    ['discooperireCalicem', 'offerreHostiam', 'crucemPatena', 'offerreCalicem', 'cooperirePalla', 'infundereVinum', 'infundereAquam', 'lavare'],
    ['accipereHostiam', 'elevareHostiam', 'deponereHostiam', 'discooperirePalla', 'accipereCalicem', 'elevareCalicem', 'deponereCalicem', 'cooperirePalla'],
    ['discooperirePalla', 'signareCumHostia', 'elevatioMinor', 'cooperirePalla', 'tollerePatenam', 'osculariPatenam', 'frangere', 'signareParticula', 'commiscere'],
    ['accipereHostiam', 'sumereHostiam', 'discooperirePalla', 'colligere', 'sumereSanguinem', 'aperireTabernaculum', 'distribuere', 'claudereTabernaculum'],
    ['porrigereCalicem', 'ablutio', 'componereCalicem', 'claudereMissale', 'osculariLibrum', 'tollereCalicem'],
  ];

  class Engine {
    constructor(opts) {
      this.opts = opts;               // { cel, role, form, mode: 'treino'|'celebracao'|'tutorial', startSection }
      this.cel = opts.cel;
      this.role = opts.role;          // 'sacerdos' | 'minister'
      this.me = opts.role === 'sacerdos' ? 'P' : 'M';
      this.form = opts.form || 'lecta';
      this.mode = opts.mode || 'celebracao';
      this.rite = DG.rite.build(this.cel, this.role, this.form);
      this.score = new DG.Score();
      this.stepIdx = 0; this.step = null;
      this.need = null;               // exigência bloqueante atual
      this.windows = [];              // exigências com janela de tempo
      this.aborted = false; this.done = false;
      this.instant = false;
      this.hintsOn = DG.settings.hints === 'sempre' || (DG.settings.hints === 'auto' && (this.mode !== 'celebracao'));
      this.pool = this.buildResponsePool();
      this.cross = { inMid: false, genu: false, from: 0 };
      this.seenEdu = {};
      this.speechHandle = null;
      this.camMode = 'normal';
    }
    get P() { return DG.game.priest; }
    get M() { return DG.game.server; }
    actorOf(who) { return who === 'P' ? this.P : who === 'M' ? this.M : null; }
    isMe(who) { return who === this.me || (who === 'PM' && false); }
    scene() { return DG.game.scene; }

    buildResponsePool() {
      const O = DG.data.ordo, keys = ['adDeum', 'ps42_2', 'ps42_4', 'ps42_6', 'sicutErat', 'quiFecit', 'misereaturTui', 'amen', 'etPlebsTua', 'etSalutare', 'etClamor', 'etCumSpiritu', 'kyrie', 'christe', 'deoGratias', 'gloriaTibi', 'lausTibi', 'suscipiat', 'habemus', 'dignum', 'sedLibera', 'aveMaria2', 'utDigni', 'miserereNobis', 'deoGratiasAll', 'confiteorM'];
      return keys.map(k => ({ key: k, la: O[k].la, pt: O[k].pt }));
    }
    resolveText(el) {
      if (el.key) { const t = DG.data.ordo[el.key]; return { la: t ? t.la : el.key, pt: t ? t.pt : '' }; }
      return { la: el.la || '', pt: el.pt || '' };
    }

    // ------------------------------------------------------------------
    async run() {
      const steps = this.rite.steps;
      let start = 0;
      if (this.opts.startSection) {
        const i = steps.findIndex(s => s.sec === this.opts.startSection);
        if (i > 0) {
          // avança instantaneamente até a seção escolhida (estado e posições)
          this.instant = true;
          for (let k = 0; k < i; k++) { this.step = steps[k]; for (const el of this.step.els) await this.exec(el, { instant: true }); }
          this.instant = false;
          start = i;
          DG.game.snapCamera && DG.game.snapCamera();
        }
      }
      try {
        for (this.stepIdx = start; this.stepIdx < steps.length; this.stepIdx++) {
          if (this.aborted) throw new DG.Abort();
          const s = this.step = steps[this.stepIdx];
          this.score.stepFlags = {};
          DG.emit('rite:step', { step: s, idx: this.stepIdx, total: steps.length, engine: this });
          if (s.edu && !this.seenEdu[s.edu]) { this.seenEdu[s.edu] = true; DG.emit('rite:edu', s.edu); }
          for (const el of s.els) { if (this.aborted) throw new DG.Abort(); await this.exec(el, {}); }
          await this.waitWindows();
          if (this.opts.endSection && s.sec === this.opts.endSection && (steps[this.stepIdx + 1] || {}).sec !== s.sec) break;
        }
        this.done = true;
        DG.emit('rite:end', { engine: this, completed: true });
      } catch (e) {
        if (e && e.abort) { DG.emit('rite:end', { engine: this, completed: false, aborted: true }); return; }
        console.error(e);
        DG.emit('rite:error', e);
      }
    }
    abort() { this.aborted = true; this.cancelSpeech(); if (this.need && this.need.reject) this.need.reject(new DG.Abort()); this.windows.forEach(w => w.resolve && w.resolve()); DG.clearTimers(); }

    // ------------------------------------------------------------------
    async exec(el, ctx) {
      if (!el) return;
      const inst = ctx.instant || this.instant;
      switch (el.t) {
        case 'par': {
          if (inst) { for (const e of el.els) { if (Array.isArray(e)) await this.seq(e, ctx); else await this.exec(e, ctx); } return; }
          await Promise.all(el.els.map(e => Array.isArray(e) ? this.seq(e, ctx) : this.exec(e, ctx)));
          return;
        }
        case 'state': { const sc = this.scene(); if (sc) el.fn(sc); return; }
        case 'base': { const a = this.actorOf(el.who); if (a) a.setBase(el.b); return; }
        case 'carry': { const a = this.actorOf(el.who); if (a) a.setBase({ carry: el.item }); return; }
        case 'wait': if (!inst) await DG.wait(el.s * this.paceK()); return;
        case 'cam': this.camMode = el.mode; DG.emit('rite:cam', el.mode); return;
        case 'event': return this.event(el, inst);
        case 'go': return this.doGo(el, inst);
        case 'g': return this.doGesture(el, inst);
        case 'say': return this.doSay(el, inst);
        case 'act': return this.doAct(el, inst);
        case 'kneel': return this.doKneel(el, inst);
        case 'stand': return this.doStand(el, inst);
        case 'bell': return this.doBell(el, inst);
        case 'chant': return this.doChant(el, inst);
        case 'chantWait': if (!inst) await this.waitChant(); return;
        default: return;
      }
    }
    async seq(arr, ctx) { for (const e of arr) await this.exec(e, ctx); }
    paceK() { return DG.settings.pace === 'rapido' ? 0.6 : DG.settings.pace === 'contemplativo' ? 1.3 : 1; }

    // ---------- deslocamento ----------
    pointFor(name) {
      const sc = this.scene();
      return (sc && sc.points[name]) || null;
    }
    zoneFor(name) {
      const sc = this.scene(); if (!sc) return null;
      if (sc.zones[name]) return sc.zones[name];
      const p = sc.points[name]; if (!p) return null;
      return { x: p.x - 10, y: p.y - 8, w: 20, h: 16 };
    }
    inZone(actor, name) { const z = this.zoneFor(name); return z && actor.x >= z.x && actor.y >= z.y && actor.x < z.x + z.w && actor.y < z.y + z.h; }
    async doGo(el, inst) {
      const a = this.actorOf(el.who); const p = this.pointFor(el.to);
      if (!a || !p) return;
      if (inst) { a.x = p.x; a.y = p.y; a.facing = p.facing || a.facing; a.setBase({ pose: 'stand' }); return; }
      if (this.isMe(el.who)) {
        if (this.inZone(a, el.to)) { if (p.facing) a.facing = p.facing; return; }
        await this.require({ type: 'go', to: el.to, el, label: this.placeName(el.to) }, () => this.inZone(a, el.to));
        if (p.facing && !a.moving) a.facing = p.facing;
        this.score.good('posicao');
        return;
      }
      if (U.dist(a.x, a.y, p.x, p.y) < 2) { if (p.facing) a.facing = p.facing; return; }
      await a.walkTo(p.x, p.y, { facing: p.facing });
    }
    placeName(to) {
      return ({ P_mid: 'meio do altar', P_ep: 'lado da Epístola (Missal)', P_ev: 'lado do Evangelho', P_foot: 'pé do altar', P_epCorner: 'canto da Epístola', M_foot: 'pé do altar, à esquerda do sacerdote', M_stepEv: 'degrau inferior, lado do Evangelho', M_stepEp: 'degrau inferior, lado da Epístola', M_floorEp: 'chão, lado da Epístola', M_floorEv: 'chão, lado do Evangelho', M_midFloor: 'meio, diante do altar (no chão)', M_cruets: 'degrau superior, canto da Epístola', M_consecr: 'supedâneo, à direita do sacerdote', M_credence: 'credência', M_sedilia: 'sedília', M_missalEp: 'canto da Epístola (Missal)', M_missalEv: 'canto do Evangelho', M_evStand: 'pé dos degraus, lado do Evangelho', M_epStand: 'pé dos degraus, lado da Epístola', M_communion: 'borda do supedâneo', crucifix: 'diante do crucifixo', crucifixM: 'atrás do sacerdote, à esquerda' }[to]) || to;
    }

    // ---------- gestos ----------
    animFor(el) {
      if (el.g === 'vertere') return el.back ? (el.circle ? 'revertereCirculo' : 'revertere') : 'vertere';
      if (el.g === 'ajoelhar') return 'ajoelhar';
      return el.g;
    }
    async doGesture(el, inst) {
      const a = this.actorOf(el.who);
      if (!a) return;
      const n = el.n || 1;
      const anim = this.animFor(el);
      if (inst) { if (el.hold) a.setBase({ bow: this.bowLevel(el.g) }); if (el.g === 'vertere') a.facing = el.back ? 'up' : 'down'; if (el.g === 'extendere') a.setBase({ arms: 'extended' }); if (el.g === 'jungere') a.setBase({ arms: 'joined' }); if (el.g === 'manusSuper') a.setBase({ arms: 'overOblata' }); return; }
      if (this.isMe(el.who) && !el.npcOnly) {
        const want = el.gesture || (el.g === 'extJung' || el.g === 'extJungBow' ? 'extendere' : el.g);
        if (el.mode === 'window') return this.window({ type: 'g', g: want, anim, n, el, win: el.win || 5 });
        await this.require({ type: 'g', g: want, anim, n, count: 0, el });
        if (el.hold) a.setBase({ bow: this.bowLevel(el.g) });
        return;
      }
      if (el.npcOnly && this.isMe(el.who)) { if (anim === 'jungere') a.setBase({ arms: 'joined' }); return; }
      for (let i = 0; i < n; i++) { await a.play(anim); if (n > 1) await DG.wait(0.15); }
      if (el.hold) a.setBase({ bow: this.bowLevel(el.g) });
    }
    bowLevel(g) { return g === 'inclinProfunda' ? 3 : g === 'inclinMedia' ? 2 : g === 'inclinCapitis' ? 1 : 0; }

    // ---------- fala ----------
    async doSay(el, inst) {
      if (inst) return;
      const txt = this.resolveText(el);
      const who = el.who;
      // resposta do acólito pelo jogador: escolha em latim
      if (this.me === 'M' && (who === 'M') && !el.npcOnly) {
        await this.requireChoice(el, txt);
        await this.speak(el, txt, 'M');
        this.score.good('resposta');
        return;
      }
      if (this.me === 'P' && who === 'P' && !DG.settings.autoRecite) {
        await this.require({ type: 'recite', el, label: 'Recitar' });
      }
      await this.speak(el, txt, who);
    }
    // ---------- canto (Missa cantada) ----------
    scoreFor(id, part, el) {
      let full = DG.chant.get(id);
      if (!full) return null;
      const paschal = this.cel.tempus === 'paschale';
      if (el && el.introit) return DG.chant.introit(full, { paschal, gloriaPatri: this.cel.gloriaPatri !== false });
      if (!paschal && el && el.proper) full = DG.chant.stripTP(full);
      if (part === 'intonation') return DG.chant.slice(full, 0, DG.chant.intonationEnd(full));
      if (part === 'rest') return DG.chant.slice(full, DG.chant.intonationEnd(full));
      return full;
    }
    scoreText(sc) { let s = ''; sc.syllables.forEach(y => { if (!y.text) return; s += (y.wordStart && s ? ' ' : '') + y.text; }); return s.replace(/\s+([,.;:])/g, '$1').trim(); }
    async playScore(score, opts) {
      // com áudio: a schola sintetizada; sem áudio: a duração estimada da partitura
      const h = DG.audio.unlocked ? DG.chant.play(score, opts) : null;
      const dur = h ? null : DG.chant.timeline(score, 1).total;
      const promise = h ? h.promise : DG.wait(Math.min(dur, 90) * (this.paceK() < 1 ? 0.4 : 1));
      return { h, promise, stop() { if (h) h.stop(); } };
    }
    async doChant(el, inst) {
      if (inst) return;
      const ids = el.ids || [el.id];
      const run = async () => {
        for (const id of ids) {
          const score = this.scoreFor(id, el.part, el);
          if (!score || !score.notes.length) continue;
          const meta = (DG.data.chants.scores[id] || {});
          DG.emit('rite:say', { who: el.solo ? 'P' : 'C', la: this.scoreText(score), pt: (el.label || meta.name || '') + (meta.mode ? ' · modo ' + meta.mode : ''), voice: el.solo ? 'cantus' : 'cantusChorus', chant: true, score });
          const p = await this.playScore(score, { solo: !!el.solo, volume: el.bg ? 0.75 : 0.95 });
          this.curChant = p;
          await Promise.race([p.promise, new Promise(res => { this.chantSkip = res; })]);
          p.stop(); this.curChant = null;
          if (this.aborted) return;
        }
      };
      if (el.bg) { this.bgChant = run(); return; }
      await run();
      DG.emit('rite:sayEnd', { el });
    }
    async waitChant() {
      if (!this.bgChant) return;
      await this.bgChant; this.bgChant = null;
    }
    async speak(el, txt, who) {
      const voice = el.voice || 'clara';
      if (voice === 'cantus' || voice === 'cantusChorus') {
        // tom ferial: recitação em tom reto (recto tono)
        DG.emit('rite:say', { who, la: txt.la, pt: txt.pt, voice, el });
        const score = DG.chant.fromText(txt.la, { midi: voice === 'cantus' ? 50 : 50 });
        const p = await this.playScore(score, { solo: voice === 'cantus', tempo: 1.15 });
        this.curChant = p;
        await Promise.race([p.promise, new Promise(res => { this.chantSkip = res; })]);
        p.stop(); this.curChant = null;
        DG.emit('rite:sayEnd', { el });
        await DG.wait(0.3);
        return;
      }
      const role = who === 'M' ? 'server' : 'priest';
      const silent = voice === 'secreta' && !DG.settings.ttsSecreta || voice === 'consecr' || voice === 'submissa';
      DG.emit('rite:say', { who, la: txt.la, pt: txt.pt, voice, el });
      const pk = this.paceK();
      let h;
      if (silent) {
        const words = U.words(txt.la).length;
        const dur = voice === 'consecr' ? 6 * pk : Math.max(1.4, Math.min(22, words * 0.2 * pk + 0.8));
        h = { promise: DG.wait(dur), cancel() {} };
        if (voice === 'consecr') DG.emit('rite:silence');
      } else {
        const vol = voice === 'media' ? 0.75 : voice === 'submissa' ? 0.45 : 1;
        h = DG.voice.speak(txt.la, { role, volume: vol, onBoundary: (i) => DG.emit('rite:boundary', i) });
        if (who === 'PM') { /* falam juntos */ }
      }
      this.speechHandle = h;
      const r = await Promise.race([h.promise, new Promise(res => { this.skipResolve = res; })]);
      void r;
      this.skipResolve = null;
      this.speechHandle = null;
      DG.emit('rite:sayEnd', { el });
      await DG.wait(0.25 * pk);
    }
    skip() {
      if (this.speechHandle) { this.speechHandle.cancel(); if (this.skipResolve) this.skipResolve(); }
      if (this.curChant) { this.curChant.stop(); if (this.chantSkip) this.chantSkip(); }
    }
    cancelSpeech() { if (this.speechHandle) this.speechHandle.cancel(); DG.voice.cancel(); if (this.skipResolve) this.skipResolve(); if (this.curChant) this.curChant.stop(); if (this.chantSkip) this.chantSkip(); DG.chant.stop(); }

    // ---------- ações sobre objetos ----------
    async doAct(el, inst) {
      const a = this.actorOf(el.who);
      if (inst || !a) return;
      if (this.isMe(el.who) && !el.npcOnly) {
        if (el.who === 'P') {
          const opts = this.actOptions(el.a);
          await this.require({ type: 'act', a: el.a, el, options: opts, label: DG.ACTS[el.a] || el.a });
        } else {
          await this.require({ type: 'actM', a: el.a, el, label: DG.ACTS[el.a] || el.a });
        }
        this.score.good('rubrica');
        await this.performAct(a, el);
        return;
      }
      if (el.npcOnly && this.isMe(el.who)) return;
      await this.performAct(a, el);
    }
    actOptions(correct) {
      const grp = ACT_GROUPS.find(g => g.includes(correct)) || ACT_GROUPS[0];
      const others = U.shuffle(grp.filter(x => x !== correct)).slice(0, 3);
      return U.shuffle([correct, ...others]).map(id => ({ id, label: DG.ACTS[id] || id }));
    }
    async performAct(a, el) {
      const fx = ACT_FX[el.a];
      if (fx === 'pour') DG.sfx.pour(1.1); else if (fx === 'clink') DG.sfx.clink(); else if (fx === 'page') DG.sfx.page(); else if (fx === 'cloth') DG.sfx.cloth(0.5); else if (fx === 'break') { DG.sfx.clink(); }
      DG.emit('rite:act', { a: el.a, who: el.who });
      const anim = ACT_ANIM[el.a] || (el.who === 'M' ? 'servir' : 'tractare');
      if (el.a === 'distribuere') { await this.communionRoutine(); return; }
      if (el.a === 'praebereBirettum' || el.a === 'tollereBirettum') { await a.play('servir', { dur: 0.8 }); return; }
      await a.play(anim);
    }

    // ---------- postura do acólito ----------
    async doKneel(el, inst) {
      const a = this.actorOf(el.who); if (!a) return;
      if (inst) { if (el.at) { const p = this.pointFor(el.at); if (p) { a.x = p.x; a.y = p.y; a.facing = p.facing || 'up'; } } a.setBase({ pose: 'kneel' }); return; }
      if (this.isMe(el.who)) {
        await this.require({ type: 'kneel', at: el.at, el, label: 'Ajoelhar-se' + (el.at ? ' (' + this.placeName(el.at) + ')' : '') }, () => a.base.pose === 'kneel' && (!el.at || this.inZone(a, el.at)));
        this.score.good('reverencia');
        return;
      }
      if (el.at) { const p = this.pointFor(el.at); if (p && U.dist(a.x, a.y, p.x, p.y) > 2) await a.walkTo(p.x, p.y, { facing: p.facing }); if (p && p.facing) a.facing = p.facing; }
      if (a.base.pose !== 'kneel') await a.play('ajoelhar');
    }
    async doStand(el, inst) {
      const a = this.actorOf(el.who); if (!a) return;
      if (inst) { a.setBase({ pose: 'stand' }); return; }
      if (this.isMe(el.who)) { return; } // o jogador levanta-se ao andar
      if (a.base.pose === 'kneel') await a.play('levantar');
    }
    async doBell(el, inst) {
      if (inst) return;
      const n = el.n || 1;
      if (this.isMe('M')) {
        const w = { type: 'g', g: 'tocar', anim: 'tocar', n, el, win: el.win || 6 };
        if (el.mode === 'window') return this.window(w);
        return this.require(Object.assign({ count: 0 }, w));
      }
      const a = this.M;
      for (let i = 0; i < n; i++) { if (a) a.play('tocar'); DG.sfx.altarBell(1); await DG.wait(0.55); }
    }

    // ---------- exigências do jogador ----------
    require(need, pred) {
      return new Promise((resolve, reject) => {
        need.resolve = resolve; need.reject = reject; need.t0 = DG.time.now; need.count = need.count || 0; need.pred = pred || null; need.wrong = 0;
        this.need = need;
        DG.emit('rite:need', need);
      });
    }
    satisfy(need) {
      if (this.need !== need) return;
      this.need = null;
      DG.emit('rite:need', null);
      need.resolve(true);
    }
    window(w) {
      return new Promise(resolve => {
        w.count = 0; w.t0 = DG.time.now; w.deadline = DG.time.now + w.win * Math.max(1, this.paceK()); w.resolve = resolve;
        this.windows.push(w);
        DG.emit('rite:windows', this.windows);
      });
    }
    async waitWindows() { while (this.windows.length) await DG.wait(0.1); }
    async requireChoice(el, txt) {
      const correct = { la: txt.la, pt: txt.pt, ok: true };
      const len = txt.la.length;
      const cands = this.pool.filter(p => U.plain(p.la) !== U.plain(txt.la));
      cands.sort((a, b) => Math.abs(a.la.length - len) - Math.abs(b.la.length - len) + (Math.random() - 0.5) * 30);
      const distract = cands.slice(0, 6);
      const picks = U.shuffle(distract).slice(0, 2).map(p => ({ la: p.la, pt: p.pt, ok: false }));
      const options = U.shuffle([correct, ...picks]);
      await this.require({ type: 'choice', el, options, label: 'Responder' });
    }

    // entrada do jogador -------------------------------------------------
    onGesture(gid) {
      const me = this.actorOf(this.me);
      if (!me) return;
      const def = DG.GEST.BY[gid];
      // janelas abertas
      const w = this.windows.find(w => w.g === gid && w.count < w.n);
      if (w) {
        w.count++;
        this.playMine(gid, w.anim);
        if (w.count >= w.n) { this.score.good(w.g === 'tocar' ? 'rubrica' : 'rubrica'); }
        return;
      }
      const need = this.need;
      if (need && need.type === 'g') {
        if (gid === need.g) {
          need.count++;
          this.playMine(gid, need.anim);
          if (need.count >= need.n) { this.score.good('rubrica'); this.satisfy(need); }
          return;
        }
        // gesto errado
        need.wrong++;
        this.wrong('rubrica', 'Gesto errado: “' + (def ? def.name : gid) + '”.', 'Agora: ' + DG.GEST.name(need.g) + (need.el.why ? ' — ' + need.el.why : '') + '.', need);
        this.playMine(gid);
        return;
      }
      // fora de hora
      if (gid === 'tocar') {
        if (!this.M || (this.M.base.carry !== 'bell' && !this.hasBell())) { DG.emit('toast', { kind: 'err', text: 'Você não está com a campainha.' }); return; }
        this.wrong('reverencia', 'Campainha tocada fora de hora.', 'A campainha soa no Sanctus, na Consagração e (por costume) no Hanc igitur.', { once: 'bell' + this.stepIdx });
        this.playMine(gid);
        return;
      }
      if (gid === 'beijar' && this.cel.requiem && this.step && /urceoli|adventus|recessus/.test(this.step.id)) {
        this.wrong('rubrica', 'Na Missa de defuntos não se fazem os ósculos de costume.', 'Omitem-se os beijos nas galhetas e no barrete.', {});
        this.playMine(gid); return;
      }
      if (need && (need.type === 'kneel' || need.type === 'go') && gid !== 'genuflectere' && gid !== 'ajoelhar' && gid !== 'signum') {
        // gestos irrelevantes durante deslocamentos: sem penalidade
      }
      this.playMine(gid);
    }
    hasBell() { return this.M && this.M.base.carry === 'bell'; }
    playMine(gid, anim) {
      const me = this.actorOf(this.me);
      const def = DG.GEST.BY[gid];
      if (gid === 'ajoelhar') { if (me.base.pose === 'kneel') me.play('levantar'); else { me.stop(); me.play('ajoelhar'); } return; }
      if (gid === 'tocar') { DG.sfx.altarBell(1); me.play('tocar'); this.flagGenu(); return; }
      if (gid === 'vertere') {
        const toPeople = me.facing === 'up';
        const back = this.need && this.need.el && this.need.el.back;
        me.play(toPeople ? 'vertere' : (back && this.need.el.circle ? 'revertereCirculo' : 'revertere'));
        return;
      }
      if (gid === 'genuflectere') this.flagGenu();
      me.play(anim || (def ? def.anim : gid));
    }
    flagGenu() { if (this.cross.inMid) this.cross.genu = true; }
    onAct(id) {
      const need = this.need;
      if (!need || need.type !== 'act') return;
      if (id === need.a) { this.satisfy(need); return; }
      need.wrong++;
      this.wrong('rubrica', 'Ação fora de ordem: “' + (DG.ACTS[id] || id) + '”.', 'Agora: ' + (DG.ACTS[need.a] || need.a) + '.', need);
    }
    onInteract() {
      const need = this.need;
      if (need && need.type === 'actM') { this.satisfy(need); return true; }
      if (need && need.type === 'recite') { this.satisfy(need); return true; }
      return false;
    }
    onChoice(i) {
      const need = this.need;
      if (!need || need.type !== 'choice') return;
      const opt = need.options[i];
      if (!opt) return;
      if (opt.ok) { DG.emit('rite:choiceResult', { i, ok: true }); this.satisfy(need); return; }
      need.wrong++;
      DG.emit('rite:choiceResult', { i, ok: false });
      this.wrong('resposta', 'Resposta errada: “' + opt.la.slice(0, 60) + (opt.la.length > 60 ? '…' : '') + '”.', 'Correta: “' + need.options.find(o => o.ok).la.slice(0, 80) + '”.', need);
    }
    wrong(cat, what, how, need) {
      const once = need && need.once ? need.once : null;
      const ok = this.score.mistake(cat, what, how, { step: this.step ? this.step.title : '', ref: this.step ? this.step.ref : '', once });
      if (ok) DG.sfx.error();
      DG.emit('toast', { kind: 'err', text: what + (this.hintsOn || (need && need.wrong >= 2) ? ' ' + how : '') });
      DG.emit('rite:wrong', { cat, what, how });
    }

    // ---------- atualização (cada quadro) ----------
    update(dt) {
      if (this.done || this.aborted) return;
      const now = DG.time.now;
      // exigência com predicado (posição, postura)
      const need = this.need;
      if (need) {
        if (need.pred && need.pred()) this.satisfy(need);
        else {
          const waited = now - need.t0;
          const lateAfter = need.type === 'choice' ? 9 : need.type === 'go' || need.type === 'kneel' || need.type === 'actM' ? 16 : 14;
          if (waited > lateAfter && !need.lateMarked && this.mode !== 'tutorial') {
            need.lateMarked = true;
            this.score.mistake('tempo', 'Demora: ' + (need.label || DG.GEST.name(need.g) || 'ação'), 'O rito ficou parado à espera.', { step: this.step && this.step.title });
            DG.emit('toast', { kind: 'info', text: 'O rito está à sua espera: ' + this.needText(need) });
            DG.emit('rite:hint', true);
          }
        }
      }
      // janelas de tempo
      for (let i = this.windows.length - 1; i >= 0; i--) {
        const w = this.windows[i];
        if (w.count >= w.n || now >= w.deadline) {
          if (w.count < w.n && !w.el.opt) {
            const what = (w.g === 'tocar' ? 'Campainha não tocada' : DG.GEST.name(w.g) + ' não feito') + (w.el.why ? ' (' + w.el.why + ')' : '') + '.';
            this.score.mistake(w.el.minor ? 'reverencia' : 'rubrica', what, this.step ? this.step.rub[this.me] || '' : '', { weight: w.el.minor ? 0.4 : 1, step: this.step && this.step.title });
            if (!w.el.minor) DG.emit('toast', { kind: 'err', text: what });
          }
          this.windows.splice(i, 1);
          w.resolve && w.resolve();
          DG.emit('rite:windows', this.windows);
        }
      }
      this.monitors();
    }
    needText(need) {
      if (!need) return '';
      if (need.type === 'g') return DG.GEST.name(need.g) + (need.n > 1 ? ' (' + (need.n - need.count) + '×)' : '');
      if (need.type === 'go') return 'ir a: ' + need.label;
      if (need.type === 'choice') return 'responder em latim';
      if (need.type === 'act' || need.type === 'actM') return need.label;
      if (need.type === 'kneel') return need.label;
      return need.label || '';
    }
    // regras contínuas: passar pelo meio sem genuflectir (acólito)
    monitors() {
      const sc = this.scene(); if (!sc || sc.id !== 'church') return;
      const me = this.actorOf(this.me); if (!me || this.me !== 'M') return;
      const inSanct = me.y > 140 && me.y < 215;
      const mid = Math.abs(me.x - sc.CX) < 9 && inSanct;
      if (mid && !this.cross.inMid) { this.cross.inMid = true; this.cross.genu = false; this.cross.from = me.x < sc.CX ? -1 : 1; this.cross.enterX = me.x; }
      if (!mid && this.cross.inMid) {
        this.cross.inMid = false;
        const side = me.x < sc.CX ? -1 : 1;
        // atravessou de um lado ao outro sem genuflectir (exceto quando sobe ao supedâneo para a Consagração)
        const exempt = this.step && /hancIgitur|quamOblationem|consecratio|orationesAnte|communio/.test(this.step.id);
        if (side !== this.cross.from && !this.cross.genu && !exempt && !me.anim) {
          this.wrong('reverencia', 'Passou pelo meio do altar sem genuflectir.', 'O acólito genuflecte (no chão) sempre que passa diante do meio do altar.', { once: 'mid' + this.stepIdx + '_' + Math.round(DG.time.now) });
        }
      }
    }

    // ---------- eventos ----------
    async event(el, inst) {
      const g = DG.game;
      switch (el.name) {
        case 'sacristyBell': if (!inst) { DG.sfx.sacristyBell(); const sc = this.scene(); if (sc && sc.state) { sc.state.bellSwing = true; await DG.wait(1.2); sc.state.bellSwing = false; } } return;
        case 'procession': return g.procession(inst);
        case 'recessus': return g.recessus(inst, this);
        case 'faithfulStand': return g.faithfulPose('stand');
        case 'faithfulKneel': return g.faithfulPose('kneel');
        case 'faithfulSit': return g.faithfulPose('sit');
        case 'faithfulGenu': if (!inst) g.faithfulAnim('inclinCapitis'); return;
        case 'faithfulAdore': if (!inst) g.faithfulAnim('inclinMedia'); return;
        case 'faithfulSign': if (!inst) g.faithfulAnim('signum'); return;
        case 'quiet': DG.emit('rite:quiet', true); return;
        case 'pascalOut': { const sc = this.scene(); if (sc && sc.state.pascalCandle) { sc.state.pascalCandle = 'out'; if (!inst) { DG.fx.smokePuff(sc.particles, 212, 170); DG.emit('toast', { kind: 'info', text: 'Depois do Evangelho da Ascensão apaga-se o círio pascal.' }); } } return; }
        default: return;
      }
    }
    async communionRoutine() {
      const g = DG.game, sc = this.scene();
      if (!sc || sc.id !== 'church') return;
      const P = this.P, M = this.M;
      P.setBase({ carry: 'ciborium', carryArms: 'hold' });
      // comunhão do acólito
      await DG.wait(0.4);
      DG.emit('rite:say', { who: 'P', la: DG.data.ordo.corpusDominiTuam.la, pt: DG.data.ordo.corpusDominiTuam.pt, voice: 'clara' });
      await P.play('tractare'); await DG.voice.speak(DG.data.ordo.corpusDominiTuam.la, { role: 'priest' }).promise;
      // abre o portão e desce à balaustrada
      sc.state.gateOpen = true; sc.gateBlock(); sc.state.communionCloth = true;
      this.camMode = 'communion';
      DG.emit('rite:cam', 'communion');
      if (M.base.pose === 'kneel') await M.play('levantar');
      const comm = g.faithful.filter(f => f.communicant).slice(0, 6);
      const railX = [214, 238, 262, 314, 338, 362];
      // os fiéis aproximam-se
      comm.forEach((f, i) => { f.target = { x: railX[i], y: sc.K.railY + 14 }; f.walkTo(f.target.x, f.target.y, { facing: 'up' }).then(() => { f.setBase({ pose: 'kneel' }); }); });
      await Promise.all([P.walkTo(railX[0] + 2, sc.K.railY - 6, { facing: 'down' }), M.walkTo(railX[0] + 12, sc.K.railY - 6, { facing: 'down' })]);
      for (let i = 0; i < comm.length; i++) {
        const f = comm[i];
        await DG.waitUntil(() => f.base.pose === 'kneel', 12);
        await Promise.all([P.walkTo(railX[i] + 2, sc.K.railY - 6, { facing: 'down' }), M.walkTo(railX[i] + 12, sc.K.railY - 6, { facing: 'down' })]);
        M.setBase({ carry: 'paten', carryArms: 'hold' });
        DG.emit('rite:say', { who: 'P', la: DG.data.ordo.corpusDominiTuam.la, pt: DG.data.ordo.corpusDominiTuam.pt, voice: 'clara' });
        await P.play('benedicere', { dur: 0.7 });
        if (i < 2 || DG.settings.pace === 'contemplativo') await DG.voice.speak(DG.data.ordo.corpusDominiTuam.la, { role: 'priest', volume: 0.8 }).promise; else await DG.wait(1.6 * this.paceK());
        f.communed = true;
        f.play('inclinCapitis');
      }
      // os fiéis voltam aos bancos
      comm.forEach(f => { f.setBase({ pose: 'stand' }); f.walkTo(f.home.x, f.home.y, { facing: 'up' }).then(() => f.setBase({ pose: 'kneel' })); });
      await Promise.all([P.walkTo(sc.points.P_mid.x, sc.points.P_mid.y, { facing: 'up' }), M.walkTo(sc.points.M_stepEp.x, sc.points.M_stepEp.y, { facing: 'up' })]);
      M.setBase({ carry: null }); P.setBase({ carry: null });
      sc.state.communionCloth = false;
      this.camMode = 'normal';
      DG.emit('rite:cam', 'normal');
    }
  }

  DG.Engine = Engine;
})(window.DG = window.DG || {});
