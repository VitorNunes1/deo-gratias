/* DEO GRATIAS — motor de áudio (Web Audio): barramentos e reverberação de igreja */
(function (DG) {
  'use strict';
  const A = DG.audio = {
    ctx: null, ready: false,
    buses: {},
    unlocked: false,
    init() {
      if (A.ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = A.ctx = new AC();
      const master = ctx.createGain();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.3;
      master.connect(comp); comp.connect(ctx.destination);
      // reverberação (nave de igreja de pedra, ~4,5 s)
      const conv = ctx.createConvolver();
      conv.buffer = A.makeIR(4.6, 2.2, 0.035);
      const wet = ctx.createGain(); const dry = ctx.createGain();
      const sendBus = ctx.createGain();
      const pre = ctx.createBiquadFilter(); pre.type = 'lowpass'; pre.frequency.value = 6500;
      sendBus.connect(pre); pre.connect(conv); conv.connect(wet); wet.connect(master);
      dry.connect(master);
      A.buses.master = master; A.buses.wet = wet; A.buses.dry = dry; A.buses.send = sendBus;
      // barramentos de categoria (cada um envia ao seco e à reverberação)
      for (const name of ['music', 'sfx', 'ambient', 'voice']) {
        const g = ctx.createGain();
        const s = ctx.createGain();
        g.connect(dry); g.connect(s); s.connect(sendBus);
        A.buses[name] = g; A.buses[name + 'Send'] = s;
      }
      A.buses.musicSend.gain.value = 1.0;
      A.buses.sfxSend.gain.value = 0.55;
      A.buses.ambientSend.gain.value = 0.35;
      A.buses.voiceSend.gain.value = 0.4;
      A.applySettings();
      A.ready = true;
    },
    unlock() {
      if (!A.ctx) A.init();
      if (A.ctx && A.ctx.state === 'suspended') A.ctx.resume();
      if (!A.unlocked && A.ctx) { A.unlocked = true; DG.emit('audio:unlocked'); }
    },
    applySettings() {
      if (!A.ctx) return;
      const s = DG.settings, t = A.ctx.currentTime;
      A.buses.master.gain.setTargetAtTime(s.volMaster, t, 0.05);
      A.buses.music.gain.setTargetAtTime(s.volMusic, t, 0.05);
      A.buses.sfx.gain.setTargetAtTime(s.volSfx, t, 0.05);
      A.buses.ambient.gain.setTargetAtTime(s.volAmbient, t, 0.05);
      A.buses.voice.gain.setTargetAtTime(s.volVoice, t, 0.05);
      A.buses.wet.gain.setTargetAtTime(0.25 + s.reverb * 0.9, t, 0.05);
      A.buses.dry.gain.setTargetAtTime(1 - s.reverb * 0.35, t, 0.05);
    },
    // resposta impulsiva sintética: primeiras reflexões + cauda difusa com decaimento exponencial
    makeIR(seconds, decay, predelay) {
      const ctx = A.ctx, rate = ctx.sampleRate, len = Math.floor(rate * seconds);
      const buf = ctx.createBuffer(2, len, rate);
      for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        const pd = Math.floor(predelay * rate);
        for (let i = 0; i < len; i++) {
          if (i < pd) { d[i] = 0; continue; }
          const t = (i - pd) / rate;
          // a cauda perde agudos com o tempo (pedra absorve pouco, mas o ar atenua)
          d[i] = (Math.random() * 2 - 1) * Math.pow(1 - (i - pd) / (len - pd), decay) * (0.6 + 0.4 * Math.exp(-t * 3));
        }
        // primeiras reflexões
        for (let k = 0; k < 14; k++) {
          const at = pd + Math.floor((0.008 + Math.random() * 0.09) * rate);
          if (at < len) d[at] += (Math.random() < 0.5 ? -1 : 1) * (0.5 - k * 0.03);
        }
        // suaviza (passa-baixas simples) para cauda mais escura
        let prev = 0;
        for (let i = 0; i < len; i++) { const a = 0.35 + 0.6 * (1 - i / len); prev = prev + (d[i] - prev) * a; d[i] = prev; }
      }
      return buf;
    },
    now() { return A.ctx ? A.ctx.currentTime : 0; },
    noiseBuffer() {
      if (A._noise) return A._noise;
      const ctx = A.ctx, len = ctx.sampleRate * 2;
      const b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      A._noise = b; return b;
    },
    pinkBuffer() {
      if (A._pink) return A._pink;
      const ctx = A.ctx, len = ctx.sampleRate * 4;
      const b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
      }
      A._pink = b; return b;
    },
    // posicionamento estéreo simples segundo a posição na tela
    panFor(worldX) {
      const cam = DG.game && DG.game.camera;
      if (!cam) return 0;
      return DG.util.clamp(((worldX - cam.x) / DG.W) * 2 - 1, -0.8, 0.8);
    },
  };
})(window.DG = window.DG || {});
