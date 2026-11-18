/* DEO GRATIAS — núcleo: namespace, utilidades, eventos, tempo */
(function (DG) {
  'use strict';

  DG.VERSION = '1.0.0';
  DG.W = 480;          // resolução interna (pixels do jogo)
  DG.H = 270;
  DG.TILE = 16;
  DG.data = DG.data || {};

  // ---------- utilidades matemáticas ----------
  const U = DG.util = {
    clamp: (v, a, b) => (v < a ? a : v > b ? b : v),
    lerp: (a, b, t) => a + (b - a) * t,
    ease: t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    easeOut: t => 1 - (1 - t) * (1 - t),
    easeIn: t => t * t,
    dist: (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay),
    sign: v => (v > 0 ? 1 : v < 0 ? -1 : 0),
    rnd: (a, b) => a + Math.random() * (b - a),
    irnd: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
    pick: arr => arr[Math.floor(Math.random() * arr.length)],
    shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
    // gerador pseudoaleatório determinístico (para arte procedural estável)
    seeded(seed) {
      let s = seed >>> 0 || 1;
      return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
    },
    hash2(x, y) { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; },
    uid: (() => { let n = 0; return (p = 'id') => p + (++n); })(),
    fmtTime(sec) { sec = Math.max(0, Math.round(sec)); const m = Math.floor(sec / 60), s = sec % 60; return m + ':' + String(s).padStart(2, '0'); },
    fmtDate(d) { return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }); },
    escape(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); },
    // remove acentos do latim para comparação
    plain(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/æ/g, 'ae').replace(/œ/g, 'oe').replace(/Æ/g, 'Ae').replace(/Œ/g, 'Oe').toLowerCase(); },
    words(s) { return String(s || '').trim().split(/\s+/).filter(Boolean); },
    deepClone: o => JSON.parse(JSON.stringify(o)),
  };

  // ---------- eventos ----------
  const listeners = {};
  DG.on = (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); return () => DG.off(ev, fn); };
  DG.off = (ev, fn) => { const l = listeners[ev]; if (l) { const i = l.indexOf(fn); if (i >= 0) l.splice(i, 1); } };
  DG.emit = (ev, data) => { const l = listeners[ev]; if (l) l.slice().forEach(fn => { try { fn(data); } catch (e) { console.error('[evento ' + ev + ']', e); } }); };

  // ---------- tempo do jogo e esperas ----------
  // Todas as esperas do rito usam o relógio do jogo (respeitam a pausa).
  DG.time = { now: 0, dt: 0, paused: false, scale: 1 };
  const timers = [];
  DG.wait = (sec) => new Promise(res => { timers.push({ t: DG.time.now + Math.max(0, sec), res }); });
  DG.waitUntil = (pred, timeout) => new Promise(res => {
    const start = DG.time.now;
    timers.push({ pred, res, start, timeout });
  });
  DG.tickTimers = () => {
    for (let i = timers.length - 1; i >= 0; i--) {
      const tm = timers[i];
      if (tm.pred) {
        let ok = false;
        try { ok = tm.pred(); } catch (e) { ok = true; }
        if (ok) { timers.splice(i, 1); tm.res(true); }
        else if (tm.timeout != null && DG.time.now - tm.start >= tm.timeout) { timers.splice(i, 1); tm.res(false); }
      } else if (DG.time.now >= tm.t) { timers.splice(i, 1); tm.res(true); }
    }
  };
  DG.clearTimers = () => { timers.length = 0; };

  // Erro usado para cancelar a execução do rito (sair da Missa)
  DG.Abort = class extends Error { constructor() { super('abort'); this.abort = true; } };

  // ---------- configuração padrão ----------
  DG.defaultSettings = () => ({
    volMaster: 0.9, volMusic: 0.7, volSfx: 0.8, volVoice: 1.0, volAmbient: 0.6,
    tts: true, ttsSecreta: false, chantTimbre: 'organ', voicePriest: '', voiceServer: '', ttsRate: 0.92,
    showLatin: true, showTrans: true, textMode: 'both', // both | latin | pt
    autoRecite: true,        // orações avançam sozinhas
    pace: 'normal',          // contemplativo | normal | rapido
    hints: 'auto',           // auto (conforme modo) | sempre | nunca
    camera: 'auto',          // auto | seguir
    reverb: 0.55,
    ambientChant: true,
    customs: { confiteorCommunion: false, bellDomineNonSum: false, bellHancIgitur: true, holyWaterSacristy: true, sacristyBell: true, prosit: false },
    fullscreen: false,
    reduceMotion: false,
  });

  DG.settings = DG.defaultSettings();
})(window.DG = window.DG || {});
