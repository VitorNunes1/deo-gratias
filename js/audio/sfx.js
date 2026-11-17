/* DEO GRATIAS — efeitos sonoros sintetizados */
(function (DG) {
  'use strict';
  const A = DG.audio;

  function out(bus, pan) {
    const ctx = A.ctx;
    const g = ctx.createGain();
    if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); p.connect(A.buses[bus]); }
    else g.connect(A.buses[bus]);
    return g;
  }
  function osc(type, freq, t0, dur, gainPeak, dest, attack, decayK) {
    const ctx = A.ctx;
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(gainPeak, t0 + (attack || 0.002));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(dest);
    o.start(t0); o.stop(t0 + dur + 0.05);
    return o;
  }
  function noise(t0, dur, dest, filterType, freq, q, gainPeak, attack, pink) {
    const ctx = A.ctx;
    const src = ctx.createBufferSource(); src.buffer = pink ? A.pinkBuffer() : A.noiseBuffer();
    src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = filterType || 'bandpass'; f.frequency.value = freq || 1000; f.Q.value = q || 1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(gainPeak, t0 + (attack || 0.005));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(dest);
    src.start(t0, Math.random() * 1.5); src.stop(t0 + dur + 0.05);
    return { src, f, g };
  }

  const S = DG.sfx = {
    ok() { return A.ready && A.ctx && A.ctx.state === 'running'; },

    // campainhas do altar: conjunto de 4 sinos pequenos
    altarBell(strikes, opts) {
      if (!S.ok()) return;
      opts = opts || {};
      const ctx = A.ctx, dest = out('sfx', opts.pan || 0.25);
      dest.gain.value = 0.55 * (opts.vol || 1);
      const base = [2093, 2489, 2794, 3322];
      for (let s = 0; s < (strikes || 1); s++) {
        const t = ctx.currentTime + 0.02 + s * (opts.gap || 0.32);
        base.forEach((f, i) => {
          const tt = t + Math.random() * 0.03 + i * 0.006;
          const ff = f * (1 + (Math.random() - 0.5) * 0.004);
          osc('sine', ff, tt, 1.6, 0.18, dest, 0.001);
          osc('sine', ff * 2.76, tt, 0.6, 0.06, dest, 0.001);
          osc('sine', ff * 5.4, tt, 0.25, 0.03, dest, 0.001);
        });
        noise(t, 0.04, dest, 'highpass', 6000, 0.7, 0.08, 0.001);
      }
    },
    // sino da torre (grande, parciais de sino de igreja)
    towerBell(opts) {
      if (!S.ok()) return;
      opts = opts || {};
      const ctx = A.ctx, dest = out('ambient', opts.pan || -0.2);
      dest.gain.value = 0.5 * (opts.vol || 1);
      const f0 = opts.freq || 196;
      const t = ctx.currentTime + 0.02;
      const partials = [[0.5, 0.35, 9], [1, 0.4, 7], [1.19, 0.25, 5], [1.5, 0.18, 4], [2, 0.3, 4.5], [2.51, 0.12, 3], [2.66, 0.1, 2.5], [3.01, 0.08, 2], [4.07, 0.05, 1.5]];
      partials.forEach(([m, a, d]) => osc('sine', f0 * m * (1 + (Math.random() - 0.5) * 0.002), t, d, a, dest, 0.004));
      noise(t, 0.12, dest, 'bandpass', 1800, 0.8, 0.2, 0.002);
    },
    // sineta da sacristia (sinal do início da Missa)
    sacristyBell() {
      if (!S.ok()) return;
      const ctx = A.ctx, dest = out('sfx', 0.4); dest.gain.value = 0.5;
      const t = ctx.currentTime + 0.02;
      [1318, 1975, 2637, 3520].forEach((f, i) => osc('sine', f, t, 2.4 - i * 0.4, 0.2 / (i + 1), dest, 0.001));
    },
    footstep(surface, pan) {
      if (!S.ok()) return;
      const ctx = A.ctx, dest = out('sfx', pan || 0); dest.gain.value = 0.45;
      const t = ctx.currentTime;
      if (surface === 'carpet') { noise(t, 0.08, dest, 'lowpass', 500, 0.7, 0.12, 0.004, true); return; }
      if (surface === 'wood') { noise(t, 0.09, dest, 'bandpass', 420 + Math.random() * 80, 2, 0.35, 0.002); osc('triangle', 110 + Math.random() * 20, t, 0.08, 0.12, dest, 0.002); return; }
      noise(t, 0.07, dest, 'bandpass', 1400 + Math.random() * 500, 1.4, 0.22, 0.001);
      noise(t, 0.05, dest, 'lowpass', 300, 0.8, 0.25, 0.001);
    },
    cloth(dur) {
      if (!S.ok()) return;
      const ctx = A.ctx, dest = out('sfx', 0); dest.gain.value = 0.4;
      const n = noise(ctx.currentTime, dur || 0.5, dest, 'bandpass', 2600, 0.6, 0.16, (dur || 0.5) * 0.4);
      n.f.frequency.linearRampToValueAtTime(1600, ctx.currentTime + (dur || 0.5));
    },
    page() {
      if (!S.ok()) return;
      const ctx = A.ctx, dest = out('sfx', 0.1); dest.gain.value = 0.5;
      const t = ctx.currentTime;
      const n = noise(t, 0.28, dest, 'highpass', 2500, 0.8, 0.22, 0.05);
      n.f.frequency.linearRampToValueAtTime(5000, t + 0.25);
      noise(t + 0.18, 0.06, dest, 'bandpass', 900, 1, 0.15, 0.002);
    },
    clink() {
      if (!S.ok()) return;
      const ctx = A.ctx, dest = out('sfx', 0.3); dest.gain.value = 0.35;
      const t = ctx.currentTime;
      [3520, 4699, 6272].forEach((f, i) => osc('sine', f * (1 + Math.random() * 0.01), t + i * 0.003, 0.35, 0.12 / (i + 1), dest, 0.001));
    },
    pour(dur) {
      if (!S.ok()) return;
      const ctx = A.ctx, dest = out('sfx', 0.2); dest.gain.value = 0.35;
      const t = ctx.currentTime;
      const n = noise(t, dur || 1, dest, 'bandpass', 900, 3, 0.18, 0.08);
      for (let k = 0; k < 8; k++) n.f.frequency.setValueAtTime(700 + Math.random() * 700, t + k * (dur || 1) / 8);
    },
    door(close) {
      if (!S.ok()) return;
      const ctx = A.ctx, dest = out('sfx', -0.3); dest.gain.value = 0.5;
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(180, t); o.frequency.linearRampToValueAtTime(240, t + 0.25); o.frequency.linearRampToValueAtTime(160, t + 0.5);
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 6;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.05, t + 0.1); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
      o.connect(f); f.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.6);
      if (close !== false) { noise(t + 0.55, 0.3, dest, 'lowpass', 180, 0.7, 0.5, 0.003); osc('sine', 60, t + 0.55, 0.3, 0.3, dest, 0.003); }
    },
    whoosh() {
      if (!S.ok()) return;
      const ctx = A.ctx, dest = out('sfx', 0); dest.gain.value = 0.3;
      const n = noise(ctx.currentTime, 0.35, dest, 'bandpass', 600, 1.2, 0.2, 0.1);
      n.f.frequency.linearRampToValueAtTime(1400, ctx.currentTime + 0.3);
    },
    kneeler() {
      if (!S.ok()) return;
      const ctx = A.ctx, dest = out('sfx', 0); dest.gain.value = 0.3;
      const t = ctx.currentTime;
      noise(t, 0.12, dest, 'bandpass', 300, 3, 0.3, 0.01);
      osc('triangle', 95, t, 0.1, 0.1, dest, 0.004);
    },
    chains() { // correntes do turíbulo
      if (!S.ok()) return;
      const ctx = A.ctx, dest = out('sfx', 0.1); dest.gain.value = 0.3;
      const t = ctx.currentTime;
      for (let k = 0; k < 5; k++) [3100, 4400].forEach(f => osc('sine', f * (1 + Math.random() * 0.05), t + k * 0.025 + Math.random() * 0.01, 0.12, 0.05, dest, 0.001));
    },
    knock() { // clave de madeira (crótalo) — Semana Santa
      if (!S.ok()) return;
      const ctx = A.ctx, dest = out('sfx', 0.1); dest.gain.value = 0.6;
      const t = ctx.currentTime;
      for (let k = 0; k < 3; k++) { noise(t + k * 0.11, 0.06, dest, 'bandpass', 800, 4, 0.5, 0.001); osc('triangle', 520, t + k * 0.11, 0.06, 0.2, dest, 0.001); }
    },
    // interface
    uiMove() { if (!S.ok()) return; const d = out('sfx', 0); d.gain.value = 0.18; osc('sine', 1568, A.ctx.currentTime, 0.12, 0.08, d, 0.002); },
    uiSelect() { if (!S.ok()) return; const d = out('sfx', 0); d.gain.value = 0.25; const t = A.ctx.currentTime; osc('sine', 1046, t, 0.5, 0.12, d, 0.002); osc('sine', 1568, t + 0.06, 0.6, 0.1, d, 0.002); },
    ok2() { if (!S.ok()) return; const d = out('sfx', 0); d.gain.value = 0.22; const t = A.ctx.currentTime; [784, 988, 1175].forEach((f, i) => osc('sine', f, t + i * 0.07, 0.9, 0.08, d, 0.003)); },
    error() { if (!S.ok()) return; const d = out('sfx', 0); d.gain.value = 0.25; const t = A.ctx.currentTime; osc('triangle', 196, t, 0.35, 0.14, d, 0.004); osc('triangle', 185, t + 0.12, 0.4, 0.12, d, 0.004); },
    chime() { if (!S.ok()) return; const d = out('sfx', 0); d.gain.value = 0.3; const t = A.ctx.currentTime; [1318, 1760, 2093, 2637].forEach((f, i) => osc('sine', f, t + i * 0.1, 1.6, 0.07, d, 0.002)); },
  };

  // ---------------- ambiência ----------------
  const Amb = DG.ambience = {
    nodes: null, kind: null, nextEvent: 0,
    start(kind) {
      if (!A.ready || !A.ctx) return;
      if (Amb.kind === kind && Amb.nodes) return;
      Amb.stop();
      const ctx = A.ctx;
      const src = ctx.createBufferSource(); src.buffer = A.pinkBuffer(); src.loop = true;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = kind === 'outside' ? 900 : 260;
      const g = ctx.createGain(); g.gain.value = 0;
      g.gain.linearRampToValueAtTime(kind === 'outside' ? 0.25 : 0.16, ctx.currentTime + 2);
      src.connect(f); f.connect(g); g.connect(A.buses.ambient);
      src.start();
      Amb.nodes = { src, g }; Amb.kind = kind; Amb.nextEvent = ctx.currentTime + 6;
    },
    stop() {
      if (!Amb.nodes || !A.ctx) return;
      const { src, g } = Amb.nodes;
      g.gain.setTargetAtTime(0, A.ctx.currentTime, 0.4);
      setTimeout(() => { try { src.stop(); } catch (e) { /* ok */ } }, 1500);
      Amb.nodes = null; Amb.kind = null;
    },
    // eventos discretos e raros: rangido de banco, tosse distante, pássaros lá fora
    update(quiet) {
      if (!Amb.nodes || !A.ctx) return;
      const now = A.ctx.currentTime;
      if (now < Amb.nextEvent) return;
      Amb.nextEvent = now + 9 + Math.random() * 16;
      if (quiet) return; // silêncio durante o Cânon
      const r = Math.random();
      const dest = out('ambient', (Math.random() - 0.5) * 1.4); dest.gain.value = 0.18;
      if (Amb.kind === 'outside' || r < 0.25) {
        // pássaro distante
        const t = now; for (let k = 0; k < 3; k++) { const o = A.ctx.createOscillator(); o.type = 'sine'; const g = A.ctx.createGain(); o.frequency.setValueAtTime(3200 + Math.random() * 600, t + k * 0.13); o.frequency.exponentialRampToValueAtTime(4200 + Math.random() * 400, t + k * 0.13 + 0.08); g.gain.setValueAtTime(0.0001, t + k * 0.13); g.gain.linearRampToValueAtTime(0.03, t + k * 0.13 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + k * 0.13 + 0.1); o.connect(g); g.connect(dest); o.start(t + k * 0.13); o.stop(t + k * 0.13 + 0.12); }
      } else if (r < 0.6) {
        noise(now, 0.25, dest, 'bandpass', 380, 4, 0.12, 0.05); // rangido de banco
      } else {
        noise(now, 0.18, dest, 'bandpass', 700, 1.5, 0.06, 0.02, true); // tosse distante abafada
        noise(now + 0.22, 0.14, dest, 'bandpass', 650, 1.5, 0.04, 0.02, true);
      }
    },
  };
})(window.DG = window.DG || {});
