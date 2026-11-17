/* DEO GRATIAS — efeitos: partículas, iluminação, feixes de luz, vinheta */
(function (DG) {
  'use strict';
  const G = DG.gfx;

  // ---------------- partículas ----------------
  class Particles {
    constructor() { this.list = []; }
    add(p) { if (this.list.length < 900) this.list.push(Object.assign({ age: 0, life: 2, vx: 0, vy: 0, size: 1, alpha: 1, grow: 0 }, p)); }
    update(dt) {
      const L = this.list;
      for (let i = L.length - 1; i >= 0; i--) {
        const p = L[i];
        p.age += dt;
        if (p.age >= p.life) { L.splice(i, 1); continue; }
        if (p.kind === 'dust') { p.vx += Math.sin(p.age * 0.7 + p.seed) * 0.6 * dt; p.vy += Math.cos(p.age * 0.5 + p.seed) * 0.4 * dt; }
        if (p.kind === 'smoke') { p.vx += Math.sin(p.age * 1.3 + p.seed) * 3 * dt; p.vy -= 2 * dt; p.size += p.grow * dt; }
        p.x += p.vx * dt; p.y += p.vy * dt;
      }
    }
    // camada: 'world' (com câmera)
    draw(x, cam) {
      for (const p of this.list) {
        const t = p.age / p.life;
        let a = p.alpha;
        if (p.kind === 'dust') a *= Math.sin(t * Math.PI) * (p.lit ? p.lit(p.x, p.y) : 1);
        else a *= (1 - t) * Math.min(1, t * 6);
        if (a <= 0.02) continue;
        x.globalAlpha = Math.min(1, a);
        x.fillStyle = p.color;
        const s = Math.max(1, Math.round(p.size));
        x.fillRect(Math.round(p.x - cam.x - s / 2), Math.round(p.y - cam.y - s / 2), s, s);
      }
      x.globalAlpha = 1;
    }
    clear() { this.list.length = 0; }
  }

  // ---------------- iluminação ----------------
  // O mapa de luz é composto com 'multiply' sobre a cena; depois um brilho aditivo.
  class Lighting {
    constructor() {
      this.cv = G.canvas(DG.W, DG.H);
      this.glow = G.canvas(DG.W, DG.H);
      this.ambient = '#6a5a50';
      this.lights = [];       // {x,y,r,color,intensity,flicker}
      this.shafts = [];       // feixes de luz dos vitrais
    }
    setAmbient(c) { this.ambient = c; }
    render(target, cam, t) {
      const L = this.cv.x;
      L.globalCompositeOperation = 'source-over';
      L.fillStyle = this.ambient; L.fillRect(0, 0, DG.W, DG.H);
      L.globalCompositeOperation = 'lighter';
      for (const l of this.lights) {
        if (l.off) continue;
        const fl = l.flicker ? (0.9 + 0.1 * Math.sin(t * 11 + l.x) * Math.sin(t * 7.1 + l.y)) : 1;
        const sx = l.x - cam.x, sy = l.y - cam.y, r = l.r * fl;
        if (sx < -r || sy < -r || sx > DG.W + r || sy > DG.H + r) continue;
        const g = L.createRadialGradient(sx, sy, 0, sx, sy, r);
        g.addColorStop(0, G.rgba(l.color, (l.intensity || 0.6) * fl));
        g.addColorStop(1, G.rgba(l.color, 0));
        L.fillStyle = g; L.fillRect(sx - r, sy - r, r * 2, r * 2);
      }
      // feixes (iluminam o chão)
      for (const s of this.shafts) this.drawShaft(L, s, cam, t, 0.55);
      L.globalCompositeOperation = 'source-over';
      target.save();
      target.globalCompositeOperation = 'multiply';
      target.drawImage(this.cv.c, 0, 0);
      target.restore();
    }
    // brilho aditivo por cima (feixes visíveis no ar, halos de velas)
    renderGlow(target, cam, t, extra) {
      target.save();
      target.globalCompositeOperation = 'lighter';
      for (const s of this.shafts) this.drawShaft(target, s, cam, t, 0.16);
      for (const l of this.lights) {
        if (l.off || !l.halo) continue;
        const fl = l.flicker ? (0.85 + 0.15 * Math.sin(t * 13 + l.x * 3)) : 1;
        const sx = l.x - cam.x, sy = l.y - cam.y, r = l.halo * fl;
        const g = target.createRadialGradient(sx, sy, 0, sx, sy, r);
        g.addColorStop(0, G.rgba(l.color, 0.32 * fl));
        g.addColorStop(1, G.rgba(l.color, 0));
        target.fillStyle = g; target.fillRect(sx - r, sy - r, r * 2, r * 2);
      }
      if (extra) extra(target);
      target.restore();
    }
    drawShaft(ctx, s, cam, t, k) {
      // polígono do vitral (x0..x1 em y0) até a mancha no chão (fx0..fx1 em fy)
      const pulse = 0.85 + 0.15 * Math.sin(t * 0.35 + s.x0 * 0.01);
      const a = s.alpha * k * pulse * (s.mul == null ? 1 : s.mul);
      if (a <= 0.003) return;
      const g = ctx.createLinearGradient(0, s.y0 - cam.y, 0, s.fy - cam.y);
      g.addColorStop(0, G.rgba(s.color, a));
      g.addColorStop(1, G.rgba(s.color2 || s.color, a * 0.55));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(s.x0 - cam.x, s.y0 - cam.y); ctx.lineTo(s.x1 - cam.x, s.y0 - cam.y);
      ctx.lineTo(s.fx1 - cam.x, s.fy - cam.y); ctx.lineTo(s.fx0 - cam.x, s.fy - cam.y);
      ctx.closePath(); ctx.fill();
    }
  }

  // vinheta pré-renderizada
  let vignette = null;
  function getVignette() {
    if (vignette) return vignette;
    const cv = G.canvas(DG.W, DG.H);
    const g = cv.x.createRadialGradient(DG.W / 2, DG.H / 2, DG.H * 0.35, DG.W / 2, DG.H / 2, DG.H * 0.95);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(8,4,2,0.55)');
    cv.x.fillStyle = g; cv.x.fillRect(0, 0, DG.W, DG.H);
    vignette = cv.c; return vignette;
  }

  DG.fx = {
    Particles, Lighting, getVignette,
    // fumaça de vela apagada
    smokePuff(parts, x, y) { for (let i = 0; i < 10; i++) parts.add({ kind: 'smoke', x: x + DG.util.rnd(-0.5, 0.5), y: y - i * 0.5, vx: DG.util.rnd(-2, 2), vy: DG.util.rnd(-9, -5), life: DG.util.rnd(1.2, 2.4), color: '#cfc8bd', alpha: 0.55, size: 1, grow: 0.8, seed: Math.random() * 9 }); },
    incense(parts, x, y, n) { for (let i = 0; i < (n || 3); i++) parts.add({ kind: 'smoke', x: x + DG.util.rnd(-1, 1), y, vx: DG.util.rnd(-3, 3), vy: DG.util.rnd(-12, -6), life: DG.util.rnd(2.5, 4.5), color: Math.random() < 0.5 ? '#e8e2d6' : '#cfc6b6', alpha: 0.5, size: 1, grow: 1.4, seed: Math.random() * 9 }); },
    sparkle(parts, x, y, col) { for (let i = 0; i < 8; i++) { const a = Math.random() * Math.PI * 2; parts.add({ kind: 'spark', x, y, vx: Math.cos(a) * 14, vy: Math.sin(a) * 14 - 6, life: 0.7, color: col || '#fff2b8', alpha: 1, size: 1 }); } },
    water(parts, x, y) { for (let i = 0; i < 6; i++) parts.add({ kind: 'drop', x: x + DG.util.rnd(-1, 1), y, vx: DG.util.rnd(-1, 1), vy: DG.util.rnd(10, 22), life: 0.35, color: '#bfe3f2', alpha: 0.9, size: 1 }); },
  };
})(window.DG = window.DG || {});
