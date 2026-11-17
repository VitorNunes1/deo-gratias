/* DEO GRATIAS — cenário: camadas, colisão, caminhos, objetos, portas e zonas */
(function (DG) {
  'use strict';
  const G = DG.gfx, U = DG.util;
  const CELL = 4;

  class Scene {
    constructor(opts) {
      this.id = opts.id; this.name = opts.name || opts.id;
      this.w = opts.w; this.h = opts.h;
      this.cols = Math.ceil(this.w / CELL); this.rows = Math.ceil(this.h / CELL);
      this.grid = new Uint8Array(this.cols * this.rows);
      this.bg = null; this.fg = null; this.fgY = null;
      this.props = []; this.zones = {}; this.points = {}; this.doors = [];
      this.actors = [];
      this.lighting = new DG.fx.Lighting();
      this.lighting.setAmbient(opts.ambient || '#6a5a50');
      this.particles = new DG.fx.Particles();
      this.surfaces = []; // {x,y,w,h,kind}
      this.music = opts.music || null;
      this.dustAreas = [];
      this.camBounds = opts.camBounds || null;
      this.state = {};
      this.t = 0;
    }
    // ---------- colisão ----------
    block(x, y, w, h, v) {
      const c0 = Math.max(0, Math.floor(x / CELL)), r0 = Math.max(0, Math.floor(y / CELL));
      const c1 = Math.min(this.cols - 1, Math.floor((x + w - 1) / CELL)), r1 = Math.min(this.rows - 1, Math.floor((y + h - 1) / CELL));
      for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) this.grid[r * this.cols + c] = v == null ? 1 : v;
    }
    free(x, y, w, h) { this.block(x, y, w, h, 0); }
    cellBlocked(c, r) { if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) return true; return this.grid[r * this.cols + c] === 1; }
    blockedAt(x, y) { return this.cellBlocked(Math.floor(x / CELL), Math.floor(y / CELL)); }
    // caixa dos pés do personagem (6x3)
    canStand(x, y) {
      return !(this.blockedAt(x - 3, y - 2) || this.blockedAt(x + 3, y - 2) || this.blockedAt(x - 3, y) || this.blockedAt(x + 3, y) || this.blockedAt(x, y - 1));
    }
    surfaceAt(x, y) {
      for (let i = this.surfaces.length - 1; i >= 0; i--) { const s = this.surfaces[i]; if (x >= s.x && y >= s.y && x < s.x + s.w && y < s.y + s.h) return s.kind; }
      return 'stone';
    }
    // ---------- caminho (A* em grade de 4 px, 8 direções) ----------
    findPath(sx, sy, tx, ty) {
      const cols = this.cols, rows = this.rows;
      const start = [Math.floor(sx / CELL), Math.floor(sy / CELL)];
      let goal = [Math.floor(tx / CELL), Math.floor(ty / CELL)];
      const okCell = (c, r) => !this.cellBlocked(c, r) && !this.cellBlocked(c - 1, r) && !this.cellBlocked(c + 1, r);
      if (!okCell(goal[0], goal[1])) {
        // procura célula livre mais próxima
        let found = null;
        for (let rad = 1; rad < 12 && !found; rad++) for (let dy = -rad; dy <= rad && !found; dy++) for (let dx = -rad; dx <= rad; dx++) {
          if (okCell(goal[0] + dx, goal[1] + dy)) { found = [goal[0] + dx, goal[1] + dy]; break; }
        }
        if (!found) return null;
        goal = found;
      }
      const key = (c, r) => r * cols + c;
      const open = new Map(), came = new Map(), gS = new Map();
      const h = (c, r) => { const dx = Math.abs(c - goal[0]), dy = Math.abs(r - goal[1]); return (dx + dy) + (1.414 - 2) * Math.min(dx, dy); };
      const sk = key(start[0], start[1]);
      gS.set(sk, 0); open.set(sk, h(start[0], start[1]));
      const dirs = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]];
      let iter = 0;
      while (open.size && iter++ < 30000) {
        let cur = null, best = Infinity;
        for (const [k, f] of open) if (f < best) { best = f; cur = k; }
        const c = cur % cols, r = Math.floor(cur / cols);
        if (c === goal[0] && r === goal[1]) {
          const path = [];
          let k = cur;
          while (k != null) { path.push([(k % cols) * CELL + CELL / 2, Math.floor(k / cols) * CELL + CELL / 2]); k = came.get(k); }
          path.reverse();
          path[path.length - 1] = [tx, ty].every(v => v != null) && this.canStand(tx, ty) ? [tx, ty] : path[path.length - 1];
          return this.smooth([[sx, sy]].concat(path.slice(1)));
        }
        open.delete(cur);
        for (const [dx, dy, cost] of dirs) {
          const nc = c + dx, nr = r + dy;
          if (!okCell(nc, nr)) continue;
          if (dx && dy && (!okCell(c + dx, r) || !okCell(c, r + dy))) continue;
          const nk = key(nc, nr);
          const g = gS.get(cur) + cost;
          if (g < (gS.has(nk) ? gS.get(nk) : Infinity)) { came.set(nk, cur); gS.set(nk, g); open.set(nk, g + h(nc, nr)); }
        }
      }
      return null;
    }
    lineFree(ax, ay, bx, by) {
      const d = Math.hypot(bx - ax, by - ay), n = Math.ceil(d / 2);
      for (let i = 0; i <= n; i++) { const x = ax + (bx - ax) * i / n, y = ay + (by - ay) * i / n; if (!this.canStand(x, y)) return false; }
      return true;
    }
    smooth(path) {
      if (!path || path.length < 3) return path;
      const out = [path[0]];
      let i = 0;
      while (i < path.length - 1) {
        let j = path.length - 1;
        while (j > i + 1 && !this.lineFree(path[i][0], path[i][1], path[j][0], path[j][1])) j--;
        out.push(path[j]); i = j;
      }
      return out;
    }
    // ---------- objetos ----------
    addProp(p) { p.id = p.id || U.uid('prop'); p.visible = p.visible !== false; this.props.push(p); return p; }
    prop(id) { return this.props.find(p => p.id === id); }
    point(name) { return this.points[name]; }
    zone(name) { return this.zones[name]; }
    inZone(name, x, y) { const z = this.zones[name]; return z && x >= z.x && y >= z.y && x < z.x + z.w && y < z.y + z.h; }
    zonesAt(x, y) { return Object.keys(this.zones).filter(k => this.inZone(k, x, y)); }
    // objetos interativos próximos
    interactablesNear(x, y, range) {
      const res = [];
      for (const p of this.props) {
        if (!p.visible || !p.interact) continue;
        const ix = p.ix != null ? p.ix : p.x, iy = p.iy != null ? p.iy : p.y;
        const d = Math.hypot(ix - x, (iy - y) * 1.3);
        if (d <= (p.range || range || 20)) res.push({ p, d });
      }
      for (const dr of this.doors) {
        const cx = dr.x + dr.w / 2, cy = dr.y + dr.h / 2;
        const d = Math.hypot(cx - x, cy - y);
        if (d <= (dr.range || 22)) res.push({ p: dr, d, door: true });
      }
      res.sort((a, b) => a.d - b.d);
      return res;
    }
    propAtScreen(gx, gy, cam) {
      const wx = gx + cam.x, wy = gy + cam.y;
      let best = null;
      for (const p of this.props) {
        if (!p.visible || !(p.interact || p.examine)) continue;
        const b = p.hit || { x: (p.x || 0) - 6, y: (p.y || 0) - 12, w: 12, h: 14 };
        if (wx >= b.x && wy >= b.y && wx < b.x + b.w && wy < b.y + b.h) { if (!best || (p.y || 0) > (best.y || 0)) best = p; }
      }
      for (const dr of this.doors) if (wx >= dr.x && wy >= dr.y && wx < dr.x + dr.w && wy < dr.y + dr.h) best = best || Object.assign({ door: true }, dr);
      return best;
    }
    // ---------- renderização ----------
    update(dt) {
      this.t += dt;
      this.particles.update(dt);
      // poeira dourada nos feixes de luz
      for (const a of this.dustAreas) {
        if (Math.random() < dt * (a.rate || 3)) {
          this.particles.add({ kind: 'dust', x: a.x + Math.random() * a.w, y: a.y + Math.random() * a.h, vx: U.rnd(-2, 2), vy: U.rnd(-1.5, 1.5), life: U.rnd(4, 8), color: a.color || '#fff4cf', alpha: 0.7, size: 1, seed: Math.random() * 10 });
        }
      }
      if (this.onUpdate) this.onUpdate(dt);
      for (const a of this.actors) a.update(dt, this);
    }
    render(x, cam, t) {
      const cx = Math.round(cam.x), cy = Math.round(cam.y);
      x.drawImage(this.bg, -cx, -cy);
      if (this.drawFloorFx) this.drawFloorFx(x, cam, t);
      const list = [];
      for (const p of this.props) if (p.visible && p.draw) list.push({ y: p.sortY != null ? p.sortY : p.y, p });
      for (const a of this.actors) if (a.visible !== false) list.push({ y: a.y + (a.sortBias || 0), a });
      list.sort((a, b) => a.y - b.y);
      for (const it of list) {
        if (it.p) it.p.draw(x, it.p.x - cx, it.p.y - cy, t, this, cam);
        else it.a.draw(x, cam, t);
      }
      if (this.fg) x.drawImage(this.fg, -cx, -cy);
      if (this.drawOverlay) this.drawOverlay(x, cam, t);
      this.particles.draw(x, { x: cx, y: cy });
    }
  }

  DG.Scene = Scene;
  DG.CELL = CELL;
})(window.DG = window.DG || {});
