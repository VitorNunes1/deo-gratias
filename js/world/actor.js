/* DEO GRATIAS — personagens no mundo: movimento, caminhos e animações de gestos */
(function (DG) {
  'use strict';
  const U = DG.util;

  // Animações: f(p, st, actor) altera o estado de desenho; persist altera a postura-base ao final
  const seq = (arr) => (p) => arr[Math.min(arr.length - 1, Math.floor(p * arr.length))];
  const ANIM = {
    genuflectere: { dur: 1.25, sfx: 'kneeler', f: (p, st) => { st.genu = p < 0.3 ? p / 0.3 : p < 0.72 ? 1 : 1 - (p - 0.72) / 0.28; } },
    genuflectereHold: { dur: 0.45, sfx: 'kneeler', f: (p, st) => { st.genu = p; }, persist: { genuHold: true } },
    surgere: { dur: 0.45, f: (p, st) => { st.genu = 1 - p; }, persist: { genuHold: false } },
    inclinCapitis: { dur: 0.85, f: (p, st) => { st.bow = Math.max(st.bow || 0, p > 0.12 && p < 0.85 ? 1 : 0); } },
    inclinMedia: { dur: 1.1, f: (p, st) => { st.bow = Math.max(st.bow || 0, p > 0.1 && p < 0.88 ? 2 : p > 0.05 ? 1 : 0); } },
    inclinProfunda: { dur: 1.6, f: (p, st) => { st.bow = Math.max(st.bow || 0, p > 0.12 && p < 0.88 ? 3 : 1); } },
    osculari: { dur: 1.35, f: (p, st) => { st.bow = 3; st.kiss = p > 0.25 && p < 0.75 ? 1 : 0; st.arms = 'onAltar'; } },
    signum: { dur: 1.5, sfx: 'cloth', f: (p, st) => { st.arms = 'signum'; st.sign = p; } },
    signumParvum: { dur: 1.3, f: (p, st) => { st.arms = 'signum'; st.sign = Math.min(0.49, p * 0.5); } },
    signumLibri: { dur: 1.8, f: (p, st) => { st.arms = p < 0.3 ? 'forward' : 'signum'; st.sign = Math.max(0, (p - 0.3) * 0.33); } },
    percutere: { dur: 0.55, f: (p, st) => { st.arms = 'breast'; } },
    percutereTer: { dur: 1.7, f: (p, st) => { st.arms = (p * 3) % 1 < 0.6 ? 'breast' : 'joined'; } },
    benedicere: { dur: 1.0, f: (p, st) => { st.arms = 'bless'; st.sign = p; } },
    benedicereTer: { dur: 2.4, f: (p, st) => { st.arms = 'bless'; st.sign = (p * 3) % 1; } },
    extendere: { dur: 0.45, sfx: 'cloth', f: (p, st) => { st.arms = 'extended'; }, persist: { arms: 'extended' } },
    jungere: { dur: 0.35, f: (p, st) => { st.arms = 'joined'; }, persist: { arms: 'joined' } },
    extJung: { dur: 1.1, sfx: 'cloth', f: (p, st) => { st.arms = p < 0.55 ? 'extended' : 'joined'; }, persist: { arms: 'joined' } },
    extJungBow: { dur: 1.5, sfx: 'cloth', f: (p, st) => { st.arms = p < 0.4 ? 'extended' : 'joined'; if (p > 0.55) st.bow = 1; }, persist: { arms: 'joined' } },
    manusSuper: { dur: 0.5, f: (p, st) => { st.arms = 'overOblata'; }, persist: { arms: 'overOblata' } },
    manusAltari: { dur: 0.4, f: (p, st) => { st.arms = 'onAltar'; }, persist: { arms: 'onAltar' } },
    elevareOculos: { dur: 0.9, f: (p, st) => { st.lookUp = true; } },
    vertere: { dur: 0.6, f: (p, st, a) => { a.facing = seq(['up', 'right', 'down'])(p); }, end: (a) => { a.facing = 'down'; } },
    revertere: { dur: 0.6, f: (p, st, a) => { a.facing = seq(['down', 'right', 'up'])(p); }, end: (a) => { a.facing = 'up'; } },
    revertereCirculo: { dur: 0.6, f: (p, st, a) => { a.facing = seq(['down', 'left', 'up'])(p); }, end: (a) => { a.facing = 'up'; } },
    elevareHostiam: { dur: 4.2, f: (p, st) => { st.arms = p < 0.15 || p > 0.86 ? 'raisedLow' : 'raised'; st.hold = 'host'; st.glow = p > 0.15 && p < 0.86 ? 1 : 0.4; } },
    elevareCalicem: { dur: 4.2, f: (p, st) => { st.arms = p < 0.15 || p > 0.86 ? 'raisedLow' : 'raised'; st.hold = 'chaliceBare'; st.glow = p > 0.15 && p < 0.86 ? 1 : 0.4; } },
    elevatioMinor: { dur: 1.6, f: (p, st) => { st.arms = 'raisedLow'; st.hold = 'chaliceBare'; } },
    ostendere: { dur: 2.2, f: (p, st) => { st.arms = 'raisedLow'; st.hold = 'host'; } },
    offerre: { dur: 1.8, f: (p, st) => { st.arms = 'raisedLow'; } },
    tractare: { dur: 1.0, f: (p, st) => { st.arms = 'forward'; } },
    sumere: { dur: 2.2, f: (p, st) => { st.bow = 2; st.arms = 'forward'; } },
    genuflectere2: { dur: 2.0, sfx: 'kneeler', f: (p, st) => { st.genu = p < 0.3 ? p / 0.3 : p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3; if (p > 0.3 && p < 0.7) st.bow = 1; } },
    ajoelhar: { dur: 0.5, sfx: 'kneeler', f: (p, st) => { st.genu = p; }, persist: { pose: 'kneel' } },
    levantar: { dur: 0.5, f: (p, st) => { st.genu = 1 - p; st.pose = 'stand'; }, persist: { pose: 'stand' } },
    tocar: { dur: 0.36, sfx: null, f: (p, st) => { st.arms = 'ring'; st.ringing = p < 0.5; } },
    erguerCasula: { dur: 4.2, f: (p, st) => { st.arms = 'chasuble'; } },
    beijar: { dur: 0.7, f: (p, st) => { st.bow = 1; } },
    servir: { dur: 1.2, f: (p, st) => { st.arms = 'hold'; } },
    sentar: { dur: 0.4, f: () => {}, persist: { pose: 'sit' } },
  };

  class Actor {
    constructor(spec, opts) {
      opts = opts || {};
      this.spec = spec;
      this.id = opts.id || U.uid('actor');
      this.name = opts.name || '';
      this.role = opts.role || spec.kind;
      this.x = opts.x || 0; this.y = opts.y || 0;
      this.facing = opts.facing || 'up';
      this.base = Object.assign({ pose: 'stand', arms: 'joined', bow: 0, hold: null, genuHold: false }, opts.base || {});
      this.speed = opts.speed || 34;
      this.path = null; this.pathRes = null;
      this.anim = null;
      this.walkPhase = -1; this.stepT = 0;
      this.visible = true;
      this.isPlayer = !!opts.isPlayer;
      this.st = {};
      this.moving = false;
      this.glow = 0;
      this.sortBias = 0;
      this.onArrive = null;
    }
    setBase(o) { Object.assign(this.base, o); }
    face(f) { if (f) this.facing = f; }
    stop() { this.path = null; this.moving = false; this.walkPhase = -1; if (this.pathRes) { const r = this.pathRes; this.pathRes = null; r(false); } }
    walkTo(x, y, opts) {
      opts = opts || {};
      const scene = DG.game && DG.game.scene;
      let path = opts.direct || !scene ? [[this.x, this.y], [x, y]] : scene.findPath(this.x, this.y, x, y);
      if (!path) path = [[this.x, this.y], [x, y]];
      return this.walkPath(path.slice(1), opts);
    }
    walkPath(points, opts) {
      opts = opts || {};
      if (this.pathRes) { const r = this.pathRes; this.pathRes = null; r(false); }
      this.path = points.map(p => (Array.isArray(p) ? { x: p[0], y: p[1] } : { x: p.x, y: p.y }));
      this.pathFacing = opts.facing || null;
      this.pathSpeed = opts.speed || this.speed;
      this.moving = this.path.length > 0;
      if (this.base.pose === 'kneel') this.base.pose = 'stand';
      return new Promise(res => { this.pathRes = res; if (!this.path.length) { this.pathRes = null; if (this.pathFacing) this.facing = this.pathFacing; res(true); } });
    }
    play(id, opts) {
      opts = opts || {};
      const def = typeof id === 'string' ? ANIM[id] : id;
      if (!def) return Promise.resolve();
      if (this.anim && this.anim.res) this.anim.res(false);
      const dur = (opts.dur || def.dur) * (DG.settings.pace === 'rapido' ? 0.8 : DG.settings.pace === 'contemplativo' ? 1.15 : 1);
      if (def.sfx && DG.sfx[def.sfx]) DG.sfx[def.sfx](0.35);
      return new Promise(res => { this.anim = { def, t: 0, dur, res, id }; });
    }
    get busy() { return !!this.anim || this.moving; }
    update(dt, scene) {
      // caminhada
      if (this.path && this.path.length) {
        const tgt = this.path[0];
        const dx = tgt.x - this.x, dy = tgt.y - this.y;
        const d = Math.hypot(dx, dy);
        const sp = this.pathSpeed * dt;
        if (d <= sp) { this.x = tgt.x; this.y = tgt.y; this.path.shift(); }
        else { this.x += dx / d * sp; this.y += dy / d * sp; }
        if (Math.abs(dx) > Math.abs(dy) * 1.2) this.facing = dx > 0 ? 'right' : 'left';
        else if (d > 0.01) this.facing = dy > 0 ? 'down' : 'up';
        this.walkPhase = ((this.walkPhase < 0 ? 0 : this.walkPhase) + dt * 1.6) % 1;
        this.stepT -= dt;
        if (this.stepT <= 0) { this.stepT = 0.33; if (DG.sfx && scene) DG.sfx.footstep(scene.surfaceAt(this.x, this.y), DG.audio.panFor(this.x)); }
        if (!this.path.length) {
          this.moving = false; this.walkPhase = -1; this.path = null;
          if (this.pathFacing) this.facing = this.pathFacing;
          if (this.pathRes) { const r = this.pathRes; this.pathRes = null; r(true); }
        }
      } else if (!this.isPlayer || !this.manualMoving) {
        if (!this.manualMoving) this.walkPhase = -1;
      }
      // animação
      if (this.anim) {
        this.anim.t += dt;
        if (this.anim.t >= this.anim.dur) {
          const a = this.anim; this.anim = null;
          if (a.def.persist) Object.assign(this.base, a.def.persist);
          if (a.def.end) a.def.end(this);
          if (a.res) a.res(true);
        }
      }
      // brilho (Hóstia/Cálice elevados)
      this.glow += ((this.st.glow || 0) - this.glow) * Math.min(1, dt * 4);
    }
    computeState() {
      const st = { facing: this.facing, pose: this.base.pose, arms: this.base.arms, bow: this.base.bow || 0, hold: this.base.hold, genu: this.base.genuHold ? 1 : 0, walk: this.walkPhase };
      if (this.walkPhase >= 0) { st.pose = 'stand'; st.genu = 0; if (st.arms !== 'hold') st.arms = this.base.carry ? 'hold' : 'joined'; if (st.bow) st.bow = 0; }
      if (this.base.carry) { st.hold = this.base.carry; st.arms = this.base.carryArms || 'hold'; }
      if (this.anim) this.anim.def.f(U.clamp(this.anim.t / this.anim.dur, 0, 0.9999), st, this);
      return st;
    }
    draw(x, cam, t) {
      const st = this.st = this.computeState();
      const sx = this.x - cam.x, sy = this.y - cam.y;
      if (this.glow > 0.05) {
        x.save(); x.globalCompositeOperation = 'lighter';
        const g = x.createRadialGradient(sx, sy - 38, 0, sx, sy - 38, 26);
        g.addColorStop(0, 'rgba(255,240,190,' + (0.55 * this.glow) + ')'); g.addColorStop(1, 'rgba(255,220,150,0)');
        x.fillStyle = g; x.fillRect(sx - 30, sy - 70, 60, 60); x.restore();
      }
      DG.chars.draw(x, sx, sy, this.spec, st, t);
      if (this.marker) { // marcador do jogador
        const bob = Math.sin(t * 4) > 0 ? 1 : 0;
        DG.gfx.rect(x, Math.round(sx) - 1, Math.round(sy) - 36 - bob, 3, 1, '#f1d887'); DG.gfx.px(x, Math.round(sx), Math.round(sy) - 35 - bob, '#f1d887');
      }
    }
  }

  DG.Actor = Actor;
  DG.ANIM = ANIM;
})(window.DG = window.DG || {});
