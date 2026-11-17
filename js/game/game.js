/* DEO GRATIAS — laço principal, cenários, câmera, jogador, fiéis, procissões */
(function (DG) {
  'use strict';
  const U = DG.util, G = DG.gfx;

  const FULL_VEST = { amictus: 1, alba: 1, cingulum: 1, manipulus: 1, stola: 1, casula: 1 };

  const GM = DG.game = {
    canvas: null, ctx: null,
    state: 'boot',            // title | explore | prep | rite | eval
    scene: null, scenes: {}, sceneStates: {},
    camera: { x: 0, y: 0, tx: 0, ty: 0 },
    player: null, priest: null, server: null, faithful: [],
    role: null, cel: null, form: 'lecta', mode: 'celebracao',
    engine: null, prep: null,
    paused: false, last: 0, t: 0,
    camShake: 0, dim: 0, dimTarget: 0,

    init() {
      GM.canvas = document.getElementById('game');
      GM.ctx = GM.canvas.getContext('2d');
      GM.ctx.imageSmoothingEnabled = false;
      GM.canvas.addEventListener('mousemove', GM.onMouseMove);
      requestAnimationFrame(GM.frame);
    },
    // ---------------- laço ----------------
    frame(ts) {
      const dt = Math.min(0.05, (ts - (GM.last || ts)) / 1000) * (DG.time.scale || 1);
      GM.last = ts;
      DG.input.pollPad();
      if (!GM.paused) {
        DG.time.dt = dt; DG.time.now += dt; GM.t += dt;
        DG.tickTimers();
        GM.update(dt);
      }
      GM.render();
      DG.input.endFrame();
      requestAnimationFrame(GM.frame);
    },
    update(dt) {
      if (GM.state === 'title') { DG.exterior.update(dt); return; }
      if (!GM.scene) return;
      GM.handleInput(dt);
      GM.scene.update(dt);
      if (GM.engine) GM.engine.update(dt);
      if (GM.prep) GM.prep.update(dt);
      GM.updateCamera(dt);
      GM.dim += (GM.dimTarget - GM.dim) * Math.min(1, dt * 1.5);
      DG.ambience.update(GM.quiet);
      // exploração: o coro ensaia ao longe, de tempos em tempos
      if (GM.state === 'explore' && DG.settings.ambientChant && DG.audio.unlocked && !DG.chant.current) {
        GM.chantT = (GM.chantT == null ? 25 : GM.chantT) - dt;
        if (GM.chantT <= 0) {
          GM.chantT = 70 + Math.random() * 60;
          const D = DG.data.chants, pr = D.propria[GM.cel.id] || {};
          const pool = GM.scene.id === 'chapel' ? [D.misc.salveSimplex, D.misc.aveRegina, D.misc.almaRedemptoris, D.misc.reginaCaeli] : [pr.in, pr.co, pr.of, D.misc.adoroTe, D.misc.aveVerum, D.misc.tantumErgo];
          const id = pool.filter(Boolean)[Math.floor(Math.random() * pool.filter(Boolean).length)];
          if (id) DG.chant.play(id, { volume: GM.scene.id === 'church' ? 0.45 : 0.28 });
        }
      }
      // mãos do jogador no HUD
      const carry = GM.player && GM.player.base.carry;
      if (carry !== GM._lastCarry) { GM._lastCarry = carry; DG.hud.setHands(carry); }
      GM.updatePrompt();
    },
    render() {
      const x = GM.ctx;
      x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
      if (GM.state === 'title' || !GM.scene) {
        x.fillStyle = '#000'; x.fillRect(0, 0, DG.W, DG.H);
        if (GM.state === 'title') DG.exterior.render(x, GM.t, DG.time.dt || 0.016);
        return;
      }
      const cam = { x: Math.round(GM.camera.x), y: Math.round(GM.camera.y) };
      x.fillStyle = '#060403'; x.fillRect(0, 0, DG.W, DG.H);
      GM.scene.render(x, cam, GM.t);
      GM.drawWorldOverlay(x, cam);
      GM.scene.lighting.render(x, cam, GM.t);
      GM.scene.lighting.renderGlow(x, cam, GM.t, (c) => { if (GM.altarGlow > 0) GM.drawAltarGlow(c, cam); });
      if (GM.dim > 0.01) { x.fillStyle = 'rgba(5,3,2,' + (GM.dim * 0.45) + ')'; x.fillRect(0, 0, DG.W, DG.H); if (GM.priest && GM.scene.id === 'church') GM.drawSpot(x, cam); }
      if (!DG.settings.reduceMotion || true) x.drawImage(DG.fx.getVignette(), 0, 0);
      if (DG.altarView) DG.altarView.render(x);
    },
    drawSpot(x, cam) {
      const p = GM.priest; const sx = p.x - cam.x, sy = p.y - cam.y - 20;
      x.save(); x.globalCompositeOperation = 'lighter';
      const g = x.createRadialGradient(sx, sy, 4, sx, sy, 70);
      g.addColorStop(0, 'rgba(255,225,170,' + (0.22 * GM.dim) + ')'); g.addColorStop(1, 'rgba(255,225,170,0)');
      x.fillStyle = g; x.fillRect(sx - 80, sy - 80, 160, 160); x.restore();
    },
    drawAltarGlow() {},
    // alvo de deslocamento (dica) e marcador do jogador
    drawWorldOverlay(x, cam) {
      const e = GM.engine;
      if (e && e.need && (e.need.type === 'go' || e.need.type === 'kneel') && (e.hintsOn || e.need.lateMarked || DG.hud.forceHint)) {
        const name = e.need.type === 'go' ? e.need.to : e.need.el.at;
        const p = name && GM.scene.points[name];
        if (p) {
          const sx = p.x - cam.x, sy = p.y - cam.y;
          const r = 6 + Math.sin(GM.t * 5) * 1.5;
          x.save(); x.globalAlpha = 0.8;
          G.shape(x, sx - r, sy - r / 2, r * 2 + 1, r + 1, (i, j) => { const dx = (i - r) / r, dy = (j - r / 2) / (r / 2); const d = dx * dx + dy * dy; return d <= 1 && d >= 0.55; }, '#f1d887');
          x.restore();
        }
      }
      if (GM.player && GM.state !== 'rite') GM.player.marker = true; else if (GM.player) GM.player.marker = false;
    },
    // ---------------- câmera ----------------
    updateCamera(dt, snap) {
      const sc = GM.scene; if (!sc) return;
      let tx, ty;
      const em = GM.engine && GM.engine.camMode;
      if (sc.id === 'church' && GM.state === 'rite' && DG.settings.camera === 'auto' && GM.player && GM.player.y < 330) {
        tx = 288 - DG.W / 2;
        ty = em === 'communion' ? 150 : 141 - DG.H / 2 + 4;
        if (GM.player.y > 250 && em !== 'communion') ty = Math.min(GM.player.y - 150, 200);
      } else {
        const tgt = GM.player || { x: sc.w / 2, y: sc.h / 2 };
        tx = tgt.x - DG.W / 2; ty = tgt.y - DG.H / 2 - 20;
      }
      const b = sc.camBounds || { x0: 0, y0: 0, x1: sc.w - DG.W, y1: sc.h - DG.H };
      if (sc.w <= DG.W) tx = (sc.w - DG.W) / 2; else tx = U.clamp(tx, b.x0, Math.max(b.x0, b.x1));
      if (sc.h <= DG.H) ty = (sc.h - DG.H) / 2; else ty = U.clamp(ty, b.y0, Math.max(b.y0, b.y1));
      const k = snap ? 1 : Math.min(1, dt * 3.2);
      GM.camera.x += (tx - GM.camera.x) * k; GM.camera.y += (ty - GM.camera.y) * k;
      DG.dimFlag = GM.dimTarget;
    },
    snapCamera() { GM.updateCamera(0, true); },
    // ---------------- entrada ----------------
    canControl() {
      if (!GM.player || GM.paused || DG.input.uiCaptured) return false;
      if (GM.cutscene) return false;
      return GM.state === 'explore' || GM.state === 'prep' || GM.state === 'rite';
    },
    handleInput(dt) {
      if (!GM.canControl()) { if (GM.player) GM.player.manualMoving = false; return; }
      const p = GM.player;
      const I = DG.input;
      // gestos
      for (const gd of DG.GEST.forRole(GM.role)) if (I.pressed(gd.key)) GM.gesture(gd.id);
      ['gZ', 'gX', 'gC', 'gV'].forEach((k, i) => { if (I.pressed(k) && DG.hud.altarKeys && DG.hud.altarGrp && DG.hud.altarGrp.style.display !== 'none') GM.altarAct(DG.hud.altarKeys[i]); });
      if (I.pressed('interact')) GM.interact();
      if (I.pressed('skip') && GM.engine) GM.engine.skip();
      if (I.pressed('book')) DG.book.open('missal');
      if (I.pressed('manual')) DG.book.open('manual');
      if (I.pressed('objects')) DG.book.open('objects');
      if (I.pressed('rubric') && DG.hud.el) DG.hud.toggleRubric();
      if (I.pressed('lang')) { const m = ['both', 'latin', 'pt']; DG.settings.textMode = m[(m.indexOf(DG.settings.textMode) + 1) % 3]; DG.ui.toast('Texto: ' + { both: 'latim e tradução', latin: 'só latim', pt: 'só tradução' }[DG.settings.textMode], 'info'); DG.store.save(); }
      if (I.pressed('cancel')) { DG.screens.pause(); return; }
      if (I.pressed('inventory')) DG.screens.inventory();
      // movimento
      if (p.anim && !/levantar/.test(p.anim.id)) { p.manualMoving = false; return; }
      const ax = I.axis();
      if (ax.x || ax.y) {
        if (p.path) p.stop();
        if (p.base.pose === 'kneel') { p.setBase({ pose: 'stand' }); }
        const sp = (I.isDown('slow') ? 20 : 38) * dt;
        const nx = p.x + ax.x * sp, ny = p.y + ax.y * sp;
        const sc = GM.scene;
        if (sc.canStand(nx, p.y)) p.x = nx;
        if (sc.canStand(p.x, ny)) p.y = ny;
        if (Math.abs(ax.x) > Math.abs(ax.y)) p.facing = ax.x > 0 ? 'right' : 'left'; else p.facing = ax.y > 0 ? 'down' : 'up';
        p.manualMoving = true;
        p.walkPhase = ((p.walkPhase < 0 ? 0 : p.walkPhase) + dt * 1.6) % 1;
        p.stepT -= dt; if (p.stepT <= 0) { p.stepT = 0.33; DG.sfx.footstep(sc.surfaceAt(p.x, p.y)); }
        GM.checkDoors();
      } else if (p.manualMoving) { p.manualMoving = false; p.walkPhase = -1; }
      // clique do mouse: andar até o ponto ou interagir
      if (I.mouse.clicked && I.mouse.inside) GM.click(I.mouse.gx, I.mouse.gy);
      if (I.mouse.rclicked && I.mouse.inside) GM.examineAt(I.mouse.gx, I.mouse.gy);
    },
    gesture(id) {
      if (!GM.player) return;
      if (GM.engine && GM.state === 'rite') { GM.engine.onGesture(id); return; }
      if (GM.prep && GM.prep.onGesture(id)) return;
      const def = DG.GEST.BY[id];
      if (id === 'ajoelhar') { GM.player.play(GM.player.base.pose === 'kneel' ? 'levantar' : 'ajoelhar'); return; }
      if (id === 'tocar') { if (GM.player.base.carry === 'bell') { DG.sfx.altarBell(1); GM.player.play('tocar'); } else DG.ui.toast('Você não está com a campainha.', 'err'); return; }
      if (id === 'vertere') { GM.player.play(GM.player.facing === 'up' ? 'vertere' : 'revertere'); return; }
      GM.player.play(def ? def.anim : id);
    },
    altarAct(id) { if (GM.engine && id) GM.engine.onAct(id); },
    interact() {
      if (GM.engine && GM.state === 'rite' && GM.engine.onInteract()) return;
      if (GM.prep && GM.prep.interact()) return;
      const sc = GM.scene, p = GM.player;
      const near = sc.interactablesNear(p.x, p.y, 22);
      if (!near.length) return;
      const it = near[0];
      if (it.door) { GM.useDoor(it.p); return; }
      GM.useProp(it.p);
    },
    useProp(prop) {
      if (GM.prep && GM.prep.onProp(prop)) return;
      if (prop.onUse) { prop.onUse(); return; }
      if (prop.examine) DG.book.examine(prop.examine);
    },
    examineAt(gx, gy) {
      const prop = GM.scene.propAtScreen(gx, gy, GM.camera);
      if (prop && prop.examine) DG.book.examine(prop.examine);
    },
    click(gx, gy) {
      const sc = GM.scene, p = GM.player;
      const prop = sc.propAtScreen(gx, gy, GM.camera);
      const wx = gx + GM.camera.x, wy = gy + GM.camera.y;
      if (prop) {
        const tx = prop.ix != null ? prop.ix : prop.door ? prop.x + prop.w / 2 : prop.x;
        const ty = prop.iy != null ? prop.iy : prop.door ? prop.y + prop.h / 2 : (prop.y + 10);
        if (U.dist(p.x, p.y, tx, ty) < 24) { if (prop.door) GM.useDoor(prop); else if (prop.interact || prop.examine) GM.useProp(prop); return; }
        p.walkTo(tx, ty).then(ok => { if (ok && U.dist(p.x, p.y, tx, ty) < 26) { if (prop.door) GM.useDoor(prop); else if (prop.interact) GM.useProp(prop); else if (prop.examine) DG.book.examine(prop.examine); } });
        return;
      }
      if (sc.canStand(wx, wy) || true) p.walkTo(wx, wy);
    },
    onMouseMove(e) {
      if (!GM.scene || GM.state === 'title') return;
      const I = DG.input;
      const prop = GM.scene.propAtScreen(I.mouse.gx, I.mouse.gy, GM.camera);
      GM.canvas.style.cursor = prop ? 'pointer' : 'default';
      if (prop && prop.examine && DG.data.objects) {
        const o = DG.data.objects.get(prop.examine);
        DG.ui.tip(o ? '<b>' + o.name + '</b> <i>(' + o.la + ')</i><br><span class="small">Clique: usar · Botão direito: examinar</span>' : null, e.clientX, e.clientY);
      } else DG.ui.tip(null);
    },
    updatePrompt() {
      const p = GM.player; if (!p || !GM.canControl()) { DG.hud.prompt(null); return; }
      let text = null;
      const e = GM.engine;
      if (e && e.need && (e.need.type === 'actM' || e.need.type === 'recite')) text = (e.hintsOn || e.need.lateMarked || DG.hud.forceHint) ? e.need.label : 'Servir';
      if (!text && GM.prep) text = GM.prep.promptText();
      if (!text) {
        const near = GM.scene.interactablesNear(p.x, p.y, 22)[0];
        if (near) text = near.door ? ((GM.state === 'explore' && near.p.labelExplore) || near.p.label) : (near.p.interact ? near.p.interact.label : null);
      }
      if (text) DG.hud.prompt(text, p.x - GM.camera.x, p.y - GM.camera.y - 34); else DG.hud.prompt(null);
    },
    // ---------------- cenários ----------------
    async useDoor(dr) {
      if (!dr.to) {
        if (dr.exit && GM.state === 'explore') { if (await DG.ui.confirm('Sair da igreja', 'Encerrar a exploração e voltar ao menu principal?', 'Sair', 'Ficar')) GM.toTitle(); return; }
        DG.ui.toast(dr.label, 'info'); return;
      }
      if (GM.state === 'rite') { DG.ui.toast('Durante a celebração, não se deixa o presbitério.', 'err'); return; }
      if (GM.prep && !GM.prep.canLeave(GM.scene.id, dr.to)) return;
      await GM.goScene(dr.to, dr.spawn);
    },
    checkDoors() {
      const sc = GM.scene, p = GM.player;
      for (const dr of sc.doors) if (dr.to && p.x >= dr.x - 2 && p.x <= dr.x + dr.w + 2 && p.y >= dr.y && p.y <= dr.y + dr.h) {
        if (GM.state === 'rite') return;
        if ((dr.x < 20 && p.x < dr.x + dr.w) || (dr.x > sc.w - 40 && p.x > dr.x)) { if (!GM.prep || GM.prep.canLeave(sc.id, dr.to)) GM.goScene(dr.to, dr.spawn); return; }
      }
    },
    async goScene(id, spawn, opts) {
      if (GM.transitioning) return; GM.transitioning = true;
      DG.sfx.door(true);
      await DG.ui.fade(true);
      GM.loadScene(id, spawn, opts);
      await DG.ui.fade(false);
      GM.transitioning = false;
    },
    loadScene(id, spawn, opts) {
      opts = opts || {};
      if (GM.scene) GM.sceneStates[GM.scene.id] = GM.scene.state;
      const maker = DG.maps[id];
      const sc = maker(GM.cel || DG.cel.list[0], { state: GM.sceneStates[id] });
      GM.scene = sc;
      // personagens presentes
      sc.actors = [];
      const sp = spawn && sc.points[spawn];
      const place = (a, pt, dx) => { if (pt) { a.x = pt.x + (dx || 0); a.y = pt.y; a.facing = pt.facing || 'up'; } };
      for (const a of [GM.priest, GM.server]) {
        if (!a) continue;
        if (a === GM.player || opts.withBoth || a.followPlayer) {
          if (a === GM.player) place(a, sp || sc.points.start); else place(a, sp || sc.points.start, a === GM.priest ? 8 : -8);
          a.scene = id; a.stop();
        }
        if (a.scene === id) sc.actors.push(a);
      }
      if (id === 'church' && (GM.state === 'rite' || GM.state === 'prep' || GM.withFaithful)) GM.spawnFaithful(sc);
      else GM.faithful = [];
      if (id === 'church') sc.actors.push(...GM.faithful);
      DG.ambience.start(id === 'exterior' ? 'outside' : 'inside');
      GM.snapCamera();
      DG.emit('scene', sc);
      if (DG.hud.el && GM.state !== 'rite') DG.hud.setBanner(sc.name, GM.cel ? GM.cel.title : '');
      return sc;
    },
    // ---------------- personagens ----------------
    makeActors(role, opts) {
      opts = opts || {};
      const prof = DG.profile.character;
      const cp = prof.sacerdos, cm = prof.minister;
      const pSpec = { kind: 'priest', skin: cp.skin, hairColor: cp.age === 'idoso' ? 4 : cp.hairColor, age: cp.age, beard: cp.beard, color: GM.cel ? GM.cel.color : 'albus', tonsure: true, vest: opts.vested ? Object.assign({}, FULL_VEST) : {}, collar: true, biretta: false };
      const mSpec = { kind: 'server', skin: cm.skin, hairColor: cm.hairColor, hair: cm.hair, cassock: cm.cassock, surplice: opts.vested !== false || role !== 'minister' };
      GM.priest = new DG.Actor(pSpec, { name: cp.name, role: 'priest', speed: 30 });
      GM.server = new DG.Actor(mSpec, { name: cm.name, role: 'server', speed: 36 });
      GM.player = role === 'sacerdos' ? GM.priest : GM.server;
      GM.player.isPlayer = true;
      return { priest: GM.priest, server: GM.server };
    },
    // fiéis nos bancos
    spawnFaithful(sc) {
      if (GM.faithful.length && GM.faithful[0]._scene === sc) return;
      const r = U.seeded(GM.cel ? GM.cel.id.length * 31 + 7 : 7);
      const list = [];
      const rows = [];
      for (let k = 0; k < 20; k++) rows.push(356 + k * 26);
      const clothes = [['#3b3f4a', '#2a2d36', '#1c1e25'], ['#4a3a2e', '#382b21', '#251c15'], ['#2e3d52', '#22303f', '#16202a'], ['#5a2a30', '#462026', '#30151a'], ['#3e4a3a', '#2e382b', '#1f261d'], ['#6a5a4a', '#524538', '#3a3128'], ['#2a2a2e', '#1c1c20', '#121214']];
      const veils = ['#ece6d8', '#f4f1ea', '#1c1c1c', '#d8d2c4'];
      const n = 22;
      for (let i = 0; i < n; i++) {
        const row = Math.floor(r() * 12);
        const left = r() < 0.5;
        const x = (left ? 150 : 318) + Math.floor(r() * 108);
        const y = rows[row] - 2;
        if (list.some(f => Math.abs(f.home.x - x) < 10 && f.home.y === y)) continue;
        const female = r() < 0.55, child = r() < 0.12;
        const spec = { kind: 'faithful', skin: Math.floor(r() * 5), hairColor: Math.floor(r() * 5), female, child, veil: female ? veils[Math.floor(r() * veils.length)] : null, cloth: clothes[Math.floor(r() * clothes.length)], trousers: '#24252b' };
        const a = new DG.Actor(spec, { role: 'faithful', x, y, facing: 'up', base: { pose: 'kneel' }, speed: 26 });
        a.home = { x, y }; a.communicant = !child && r() < 0.45; a._scene = sc;
        list.push(a);
      }
      // comungantes primeiro, ordenados por proximidade do corredor
      GM.faithful = list;
    },
    faithfulPose(pose) {
      for (const f of GM.faithful) { if (f.moving) continue; f.setBase({ pose }); }
      if (pose === 'kneel' || pose === 'stand') DG.sfx.kneeler();
    },
    faithfulAnim(anim) { for (const f of GM.faithful) if (!f.moving) f.play(anim); },
    // ---------------- procissões ----------------
    async procession(inst) {
      const P = GM.priest, M = GM.server;
      if (inst) {
        GM.loadScene('church', 'sacristyDoor', { withBoth: true });
        P.scene = M.scene = 'church';
        GM.scene.actors = [P, M, ...GM.faithful];
        P.setBase({ carry: null }); M.setBase({ carry: null });
        P.spec.biretta = false;
        return;
      }
      GM.cutscene = true;
      P.spec.biretta = true; P.setBase({ carry: 'chalice', carryArms: 'hold' }); M.setBase({ carry: 'missal', carryArms: 'hold' });
      const sc = GM.scene;
      const door = sc.points.exit || sc.points.churchDoor;
      await Promise.all([M.walkTo(door.x, door.y - 6), DG.wait(0.6).then(() => P.walkTo(door.x - 18, door.y + 4))]);
      P.followPlayer = M.followPlayer = true;
      P.scene = M.scene = 'church';
      DG.sfx.door(true);
      await DG.ui.fade(true);
      GM.loadScene('church', 'sacristyDoor', { withBoth: true });
      GM.scene.actors = [P, M, ...GM.faithful];
      M.x = 470; M.y = 214; P.x = 486; P.y = 218;
      P.followPlayer = M.followPlayer = false;
      GM.faithfulPose('stand');
      await DG.ui.fade(false);
      GM.cutscene = false;
    },
    async recessus(inst, engine) {
      const P = GM.priest, M = GM.server;
      P.spec.biretta = true; P.setBase({ carry: 'chalice', carryArms: 'hold' }); M.setBase({ carry: 'missal', carryArms: 'hold' });
      if (inst) return;
      GM.cutscene = true;
      GM.faithfulPose('stand');
      await Promise.all([M.walkTo(470, 214), DG.wait(0.5).then(() => P.walkTo(452, 218))]);
      DG.sfx.door(true);
      await DG.ui.fade(true);
      P.scene = M.scene = 'sacristy';
      GM.loadScene('sacristy', 'churchDoor', { withBoth: true });
      GM.scene.actors = [P, M];
      await DG.ui.fade(false);
      const sc = GM.scene;
      await Promise.all([P.walkTo(sc.points.crucifix.x, sc.points.crucifix.y, { facing: 'up' }), M.walkTo(sc.points.crucifixM.x, sc.points.crucifixM.y, { facing: 'up' })]);
      GM.cutscene = false;
      // inclinação final ao crucifixo da sacristia
      const me = engine.me;
      await Promise.all([
        me === 'P' ? engine.require({ type: 'g', g: 'inclinCapitis', anim: 'inclinCapitis', n: 1, count: 0, el: { why: 'ao crucifixo da sacristia' } }) : P.play('inclinCapitis'),
        me === 'M' ? engine.require({ type: 'g', g: 'inclinMedia', anim: 'inclinMedia', n: 1, count: 0, el: { why: 'com o sacerdote, ao crucifixo' } }) : M.play('inclinMedia'),
      ]);
      if (DG.settings.customs.prosit) {
        await engine.speak({ voice: 'clara' }, DG.data.ordo.prosit, 'P');
        if (me === 'M') { await engine.requireChoice({}, DG.data.ordo.prositR); }
        await engine.speak({ voice: 'clara' }, DG.data.ordo.prositR, 'M');
      }
      P.setBase({ carry: null }); M.setBase({ carry: null }); P.spec.biretta = false;
    },
    // ---------------- início das partidas ----------------
    async startCelebration(o) {
      // o: { role, celId, form, mode, startSection, endSection }
      GM.reset();
      GM.role = o.role; GM.cel = DG.cel.get(o.celId) || DG.cel.list[0]; GM.form = o.form || 'lecta'; GM.mode = o.mode || 'celebracao';
      GM.sceneStates = {};
      const skipPrep = !!o.startSection || o.skipPrep;
      GM.makeActors(o.role, { vested: skipPrep });
      DG.ui.clear();
      await DG.ui.fade(true);
      GM.state = skipPrep ? 'rite' : 'prep';
      DG.hud.build(GM.state === 'rite' ? 'rite' : 'prep');
      DG.altarView && DG.altarView.reset(GM.cel);
      GM.engine = null;
      if (skipPrep) {
        // diretamente na igreja, já paramentados
        GM.priest.spec.vest = Object.assign({}, FULL_VEST); GM.server.spec.surplice = true;
        GM.sceneStates.church = { candles: GM.form === 'cantata' ? [true, true, true, true, true, true] : [false, false, true, true, false, false] };
        GM.priest.scene = GM.server.scene = 'church';
        GM.loadScene('church', 'sacristyDoor', { withBoth: true });
        GM.priest.x = 288; GM.priest.y = 196; GM.server.x = 372; GM.server.y = 200;
        GM.scene.actors = [GM.priest, GM.server, ...GM.faithful];
        GM.beginRite(o);
      } else {
        GM.prep = new DG.Prep(o.role, GM.cel, GM.mode);
        GM.prep.start();
      }
      await DG.ui.fade(false);
      DG.voice.cancel();
      if (GM.mode === 'tutorial') GM.tutorialIntro();
    },
    tutorialIntro() {
      const { h } = DG.ui;
      GM.paused = true;
      const priest = GM.role === 'sacerdos';
      const sc = { modal: true };
      const close = () => { DG.ui.pop(sc); };
      sc.onClose = () => { GM.paused = false; };
      sc.onBack = close;
      sc.el = h('div', { class: 'screen dim' }, h('div', { class: 'panel scroll', style: { width: 'calc(var(--u)*330)', maxHeight: '92%' } },
        h('h2', null, 'Primeiros passos — ' + (priest ? 'o celebrante' : 'o acólito')), h('div', { class: 'sep' }),
        h('p', null, priest
          ? 'Você vai celebrar uma Missa rezada dominical, da sacristia à sacristia. Primeiro, prepare-se: marque o Missal, lave as mãos, prepare o cálice e reveste-se na sala ao lado, escolhendo a cor do dia. Depois, no altar, siga as rubricas.'
          : 'Você vai servir uma Missa rezada dominical. Primeiro, prepare a sacristia e o altar (veja a lista à direita). Depois, no altar, responda em latim, ajoelhe-se do lado oposto ao Missal, transporte-o, apresente as galhetas e toque a campainha.'),
        h('h4', null, 'Como ler a tela'),
        h('p', null, h('b', null, 'Painel vermelho (à esquerda): '), 'a rubrica — o que o Missal manda fazer agora, com a fonte. A linha “➤” diz a ação esperada e a tecla.'),
        h('p', null, h('b', null, 'Caixa inferior: '), 'o texto em latim (com a tradução). As orações do sacerdote avançam sozinhas; F pula a leitura.'),
        h('p', null, h('b', null, 'Barra de gestos: '), priest ? 'sinal da cruz, inclinações, genuflexão, beijo do altar, mãos estendidas e juntas, bater no peito, abençoar, elevar os olhos, voltar-se ao povo. Quando aparecerem botões de texto à direita (teclas Z X C V), são ações sobre o cálice, a hóstia e o Missal.' : 'sinal da cruz, inclinações, genuflexão, bater no peito, ajoelhar/levantar (K), campainha (B), beijar a galheta (X), erguer a casula (Z). Para responder, escolha a frase latina certa (1, 2, 3).'),
        h('p', null, h('b', null, 'Anel dourado no chão: '), 'o lugar aonde você deve ir. Ande com WASD/setas ou clique no chão; use E para interagir.'),
        h('div', { class: 'note' }, 'No tutorial, tudo o que se espera de você fica destacado. Nos modos Treino e Celebração as dicas diminuem — e na Celebração completa cada rubrica conta para a avaliação.'),
        h('div', { class: 'row', style: { justifyContent: 'space-between', marginTop: '1em' } },
          h('button', { class: 'btn ghost', 'data-nav': 1, onclick: () => { close(); DG.book.open('manual', 'controles'); } }, 'Ver todos os controles'),
          h('button', { class: 'btn gold', 'data-nav': 1, onclick: close }, 'Começar ✠'))));
      DG.ui.push(sc);
    },
    beginRite(o) {
      o = o || {};
      GM.prep = null;
      GM.state = 'rite';
      DG.hud.build('rite');
      DG.hud.setTasks(null);
      GM.engine = new DG.Engine({ cel: GM.cel, role: GM.role, form: GM.form, mode: GM.mode, startSection: o.startSection, endSection: o.endSection });
      GM.riteStart = Date.now();
      const offEnd = DG.on('rite:end', (d) => { offEnd(); GM.finish(d); });
      const offCam = DG.on('rite:cam', (m) => { GM.dimTarget = m === 'consecr' ? 1 : m === 'canon' ? 0.45 : 0; GM.quiet = m === 'consecr' || m === 'canon'; });
      GM._offs = [offCam];
      GM.engine.run();
    },
    async startExplore(role, celId) {
      GM.reset();
      GM.role = role || 'minister'; GM.cel = DG.cel.get(celId) || DG.calendar.suggested() || DG.cel.list[0]; GM.mode = 'explorar';
      GM.makeActors(GM.role, { vested: true });
      GM.priest.spec.vest = Object.assign({}, FULL_VEST);
      DG.ui.clear();
      await DG.ui.fade(true);
      GM.state = 'explore';
      DG.hud.build('explore');
      GM.withFaithful = true;
      GM.sceneStates.church = { candles: [false, false, true, true, false, false], chalice: 'none' };
      GM.player.scene = 'church';
      const other = GM.player === GM.priest ? GM.server : GM.priest;
      other.scene = 'none';
      GM.loadScene('church', 'entry');
      GM.faithfulPose('kneel');
      DG.hud.setBanner('Exploração livre', 'Examine os objetos (clique direito ou E) · Portas levam à sacristia e à capela');
      setTimeout(() => DG.hud.setBanner(GM.scene.name, GM.cel.title), 6000);
      await DG.ui.fade(false);
    },
    reset() {
      if (GM.engine) { GM.engine.abort(); GM.engine = null; }
      (GM._offs || []).forEach(f => f()); GM._offs = [];
      GM.prep = null; GM.scene = null; GM.faithful = []; GM.withFaithful = false; GM.cutscene = false; GM.dim = GM.dimTarget = 0; GM.quiet = false;
      DG.hud.destroy(); DG.voice.cancel(); DG.chant.stop(); DG.clearTimers();
      DG.hud.forceHint = false;
    },
    async finish(d) {
      const e = d.engine;
      const completed = !!d.completed;
      GM.state = 'eval';
      DG.voice.cancel();
      const rec = {
        date: Date.now(), celebration: GM.cel.id, celTitle: GM.cel.title, color: GM.cel.color, role: GM.role, form: GM.form, mode: GM.mode,
        score: e.score.total(), grade: e.score.grade()[1], completed, duration: Math.round((Date.now() - (GM.riteStart || Date.now())) / 1000),
        cats: Object.fromEntries(Object.keys(DG.SCORE_CATS).map(k => [k, e.score.catScore(k)])), mistakes: e.score.mistakes.length,
        section: e.opts.startSection || null,
      };
      if (completed && !d.aborted && GM.mode !== 'tutorial') {
        const xpKey = GM.role === 'sacerdos' ? 'sacerdos' : 'minister';
        const gain = Math.round((e.opts.startSection ? 30 : 100) * (0.4 + rec.score / 100 * 0.6) * (GM.mode === 'celebracao' ? 1.5 : 1));
        DG.profile.xp[xpKey] += gain; rec.xp = gain;
        if (!e.opts.startSection) DG.profile.unlocked.cantata = true;
        DG.achievements.check(rec, e);
      }
      if (GM.mode === 'tutorial' && completed) DG.profile.tutorialDone[GM.role] = true;
      if (!d.aborted) DG.store.addHistory(rec); else DG.store.save();
      DG.screens.evaluation(rec, e);
    },
    async toTitle() {
      await DG.ui.fade(true);
      GM.reset();
      GM.state = 'title';
      DG.ui.clear();
      DG.title.show();
      await DG.ui.fade(false);
    },
  };

  // ---------------- conquistas ----------------
  const ACH = [
    { id: 'primeira', name: 'Primeira Missa', desc: 'Concluir uma celebração completa.', test: (r) => r.completed && !r.section },
    { id: 'optime', name: 'Optime!', desc: 'Obter “Optime” numa celebração completa.', test: (r) => r.completed && !r.section && r.score >= 97 },
    { id: 'acolito10', name: 'Servo fiel', desc: 'Servir dez Missas como acólito.', test: () => DG.profile.history.filter(h => h.role === 'minister' && h.completed && !h.section).length >= 10 },
    { id: 'sacerdote10', name: 'Dez vezes ao altar', desc: 'Celebrar dez Missas como sacerdote.', test: () => DG.profile.history.filter(h => h.role === 'sacerdos' && h.completed && !h.section).length >= 10 },
    { id: 'requiem', name: 'Réquiem', desc: 'Celebrar ou servir a Missa dos Fiéis Defuntos sem erros de rubrica próprios do Réquiem.', test: (r, e) => r.celebration === 'defuncti' && r.completed && !e.score.mistakes.some(m => /defuntos/.test(m.what)) },
    { id: 'cores', name: 'Arco litúrgico', desc: 'Celebrar Missas nas seis cores litúrgicas.', test: () => new Set(DG.profile.history.filter(h => h.completed && !h.section).map(h => h.color)).size >= 6 },
    { id: 'curioso', name: 'Sacristão curioso', desc: 'Examinar trinta objetos litúrgicos.', test: () => Object.keys(DG.profile.examined).length >= 30 },
    { id: 'estudioso', name: 'Estudioso das rubricas', desc: 'Ler dez capítulos do Manual.', test: () => Object.keys(DG.profile.manualRead).length >= 10 },
    { id: 'ano', name: 'Ano litúrgico', desc: 'Concluir celebrações em todos os tempos do ano litúrgico.', test: () => new Set(DG.profile.history.filter(h => h.completed && !h.section).map(h => (DG.cel.get(h.celebration) || {}).tempus)).size >= 7 },
  ];
  DG.achievements = {
    list: ACH,
    check(rec, e) {
      for (const a of ACH) {
        if (DG.profile.achievements[a.id]) continue;
        let ok = false; try { ok = a.test(rec, e || { score: { mistakes: [] } }); } catch (er) { ok = false; }
        if (ok) { DG.profile.achievements[a.id] = Date.now(); setTimeout(() => { DG.ui.toast('Conquista: ' + a.name, 'ok'); DG.sfx.chime(); }, 1200); }
      }
      DG.store.save();
    },
    checkPassive() { DG.achievements.check({ completed: false }, null); },
  };
  // posto (títulos) conforme a experiência
  DG.ranks = {
    sacerdos: [[0, 'Neossacerdote'], [400, 'Vigário paroquial'], [1200, 'Pároco'], [2600, 'Cônego'], [5000, 'Monsenhor']],
    minister: [[0, 'Aspirante'], [300, 'Coroinha'], [900, 'Acólito'], [2000, 'Acólito-mor'], [4000, 'Cerimoniário']],
    of(role) { const xp = DG.profile.xp[role] || 0; const t = DG.ranks[role]; let cur = t[0], next = null; for (let i = 0; i < t.length; i++) { if (xp >= t[i][0]) { cur = t[i]; next = t[i + 1] || null; } } return { title: cur[1], xp, next: next ? next[0] : null, nextTitle: next ? next[1] : null, base: cur[0] }; },
  };
})(window.DG = window.DG || {});
