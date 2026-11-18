/* DEO GRATIAS — canto gregoriano
   1) leitor de GABC (formato do Gregorio/GregoBase)
   2) síntese de uma schola masculina (formantes vocálicos por sílaba)
   3) reprodução com cronologia (para realçar a notação) */
(function (DG) {
  'use strict';
  const A = DG.audio;
  const SEMI = [0, 2, 4, 5, 7, 9, 11];

  function cleanSyllable(t) {
    return String(t || '')
      .replace(/<sp>\s*V\/\s*<\/sp>/gi, '℣').replace(/<sp>\s*R\/\s*<\/sp>/gi, '℟').replace(/<sp>\s*\*\s*<\/sp>/gi, '*')
      .replace(/<sp>\s*\+\s*<\/sp>/gi, '†').replace(/<sp>[^<]*<\/sp>/gi, '')
      .replace(/<alt>.*?<\/alt>/gi, '').replace(/<\/?[a-z]+[^>]*>/gi, '')
      .replace(/[{}]/g, '').replace(/\[[^\]]*\]/g, '');
  }

  // vogal predominante de uma sílaba latina (para os formantes)
  function vowelOf(syl) {
    const s = DG.util.plain(syl).replace(/[^a-z]/g, '');
    if (!s) return 'a';
    let v = s.replace(/qu/g, 'q').replace(/gu(?=[aeio])/g, 'g');
    const m = v.match(/ae|oe|au|eu|[aeiouy]/g);
    if (!m) return 'a';
    // prefere a vogal "nuclear" (a primeira de um ditongo)
    const k = m[m.length > 1 && /^[iu]$/.test(m[0]) && v.indexOf(m[0]) === 0 ? 1 : 0];
    if (k === 'ae' || k === 'oe') return 'e';
    if (k === 'au') return 'a';
    if (k === 'eu') return 'e';
    if (k === 'y') return 'i';
    return k[0];
  }

  function parse(gabc) {
    const out = { notes: [], syllables: [], events: [], clef: 'c4' };
    if (!gabc) return out;
    let clefType = 'c', clefLine = 4, clefFlat = false;
    const doIndex = () => { const lineIdx = [3, 5, 7, 9][clefLine - 1]; return clefType === 'c' ? lineIdx : lineIdx - 3; };
    const re = /([^()]*)\(([^)]*)\)/g;
    let m, wordIdx = 0, accidentals = {};
    let pendingSpace = true;
    while ((m = re.exec(gabc))) {
      let rawText = m[1];
      const notesStr = m[2].trim();
      const startsWord = /^\s/.test(rawText) || pendingSpace;
      pendingSpace = false;
      if (/\s$/.test(rawText)) pendingSpace = true;
      const text = cleanSyllable(rawText).trim();
      if (startsWord && text) { wordIdx++; accidentals = {}; }
      // clave
      const cm = notesStr.match(/^([cf])(b?)([1-4])$/);
      if (cm) { clefType = cm[1]; clefFlat = !!cm[2]; clefLine = +cm[3]; if (!out.notes.length) out.clef = notesStr; out.events.push({ type: 'clef', clef: notesStr }); continue; }
      const syl = { text, word: wordIdx, firstNote: out.notes.length, count: 0, vowel: vowelOf(text), wordStart: startsWord };
      let i = 0;
      const s = notesStr;
      let lastNote = null;
      let isBarOnly = true;
      while (i < s.length) {
        const ch = s[i];
        if (ch === '[') { const j = s.indexOf(']', i); i = j < 0 ? s.length : j + 1; continue; }
        if (ch === ':' || ch === ';' || ch === ',' || ch === '`') {
          let bar = ch; if (ch === ':' && s[i + 1] === ':') { bar = '::'; i++; }
          i++; while (i < s.length && /[0-9']/.test(s[i])) i++;
          const len = bar === '::' ? 1.6 : bar === ':' ? 1.1 : bar === ';' ? 0.6 : bar === ',' ? 0.35 : 0.15;
          if (lastNote) lastNote.dur *= bar === ',' || bar === '`' ? 1.25 : 1.55;
          out.events.push({ type: 'bar', bar, at: out.notes.length, len, sylText: text });
          out.notes.length && (out.notes[out.notes.length - 1].barAfter = len);
          accidentals = {};
          continue;
        }
        const lc = ch.toLowerCase();
        if (lc >= 'a' && lc <= 'm') {
          const idx = lc.charCodeAt(0) - 97;
          const nx = s[i + 1];
          if (nx === 'x' || nx === 'y' || nx === '#') { accidentals[idx] = nx === 'x' ? -1 : nx === '#' ? 1 : 0; i += 2; while (i < s.length && /[0-9?]/.test(s[i])) i++; continue; }
          isBarOnly = false;
          const note = { idx, deg: idx - doIndex(), dur: ch !== lc ? 0.8 : 1, syl: out.syllables.length, acc: accidentals[idx] || 0, incl: ch !== lc, clefFlat };
          i++;
          while (i < s.length) {
            const c2 = s[i];
            if (c2 === '.') { note.dur *= 1.9; i++; }
            else if (c2 === '_') { note.dur *= 1.3; i++; while (i < s.length && /[0-9]/.test(s[i])) i++; }
            else if (c2 === '~' || c2 === '<' || c2 === '>') { note.dur *= 0.7; note.liq = true; i++; }
            else if (c2 === 'w') { if (lastNote) lastNote.dur *= 1.35; note.quil = true; i++; }
            else if (c2 === 'v' || c2 === 'V') { note.virga = true; i++; }
            else if (c2 === 's') { note.stropha = true; i++; }
            else if (c2 === 'o' || c2 === 'O' || c2 === 'q' || c2 === 'r' || c2 === 'R' || c2 === '\'' || c2 === '@') { i++; while (i < s.length && /[0-9]/.test(s[i])) i++; }
            else if (/[0-9]/.test(c2)) i++;
            else break;
          }
          out.notes.push(note); lastNote = note; syl.count++;
          continue;
        }
        if (ch === '/' || ch === '!' || ch === ' ') { if (lastNote && s[i + 1] === '/') lastNote.gapAfter = 0.05; i++; continue; }
        i++;
      }
      if (syl.count > 0 || (text && !isBarOnly)) out.syllables.push(syl);
      else if (text) { // texto sem notas (ex.: "*" antes de barra)
        out.syllables.push(Object.assign(syl, { count: 0 }));
      }
    }
    // alturas MIDI (Si bemol da clave aplicado ao "ti")
    for (const n of out.notes) {
      const oct = Math.floor(n.deg / 7), pos = ((n.deg % 7) + 7) % 7;
      let semi = oct * 12 + SEMI[pos] + n.acc;
      if (n.clefFlat && pos === 6 && n.acc === 0) semi -= 1;
      n.semi = semi;
    }
    // transposição: centro da tessitura ~ Lá 2/Si 2 (vozes masculinas)
    if (out.notes.length) {
      const sorted = out.notes.map(n => n.semi).sort((a, b) => a - b);
      const lo = sorted[0], hi = sorted[sorted.length - 1];
      const center = (lo + hi) / 2;
      out.base = Math.round(53 - center);
      out.range = [lo + out.base, hi + out.base];
    }
    return out;
  }

  // ---------- síntese ----------
  const FORMANTS = { // F1, F2, F3 (voz masculina)
    a: [730, 1150, 2650], e: [520, 1750, 2500], i: [300, 2150, 2950], o: [520, 880, 2500], u: [340, 720, 2400],
  };
  let wave = null;
  function voiceWave(ctx) {
    if (wave) return wave;
    const n = 40, real = new Float32Array(n), imag = new Float32Array(n);
    for (let k = 1; k < n; k++) imag[k] = 1 / Math.pow(k, 1.15) * (k % 2 ? 1 : 0.8);
    wave = ctx.createPeriodicWave(real, imag);
    return wave;
  }

  // órgão de tubos (flautado de 8' e 4'): sóbrio, sem vibrato nem vogais sintéticas
  let organWave = null;
  function makeOrgan(ctx, dest, opts) {
    if (!organWave) {
      const amp = [0, 1, 0.42, 0.24, 0.12, 0.08, 0.05, 0.035, 0.02];
      const real = new Float32Array(amp.length), imag = new Float32Array(amp);
      organWave = ctx.createPeriodicWave(real, imag);
    }
    const o = ctx.createOscillator(); o.setPeriodicWave(organWave); o.detune.value = opts.detune || 0;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.1; // sem vibrato
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600; lp.Q.value = 0.4;
    const nz = ctx.createBufferSource(); nz.buffer = A.noiseBuffer(); nz.loop = true; // leve sopro do tubo
    const nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 1800; nf.Q.value = 1.2;
    const ng = ctx.createGain(); ng.gain.value = 0.004;
    const env = ctx.createGain(); env.gain.value = 0.0001;
    o.connect(lp); lp.connect(env); nz.connect(nf); nf.connect(ng); ng.connect(env); env.connect(dest);
    return { o, lfo, nz, env, bank: [], organ: true, gain: opts.gain || 0.16, start(t) { o.start(t); lfo.start(t); nz.start(t); }, stop(t) { try { o.stop(t); lfo.stop(t); nz.stop(t); } catch (e) { /* ok */ } } };
  }

  function makeVoice(ctx, dest, opts) {
    if (opts.organ) return makeOrgan(ctx, dest, opts);
    const o = ctx.createOscillator();
    o.setPeriodicWave(voiceWave(ctx));
    o.detune.value = opts.detune || 0;
    // vibrato
    const lfo = ctx.createOscillator(); lfo.frequency.value = 4.6 + Math.random() * 0.8;
    const lfoG = ctx.createGain(); lfoG.gain.value = opts.vib == null ? 7 : opts.vib;
    lfo.connect(lfoG); lfoG.connect(o.detune);
    const pre = ctx.createGain(); pre.gain.value = 1;
    o.connect(pre);
    const bank = [];
    const sum = ctx.createGain(); sum.gain.value = 1;
    [1, 0.5, 0.22].forEach((g, k) => {
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = FORMANTS.a[k]; f.Q.value = [6, 11, 14][k];
      const fg = ctx.createGain(); fg.gain.value = g * [3.2, 4.0, 4.6][k];
      pre.connect(f); f.connect(fg); fg.connect(sum);
      bank.push(f);
    });
    // sopro
    const nz = ctx.createBufferSource(); nz.buffer = A.noiseBuffer(); nz.loop = true;
    const nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 3000; nf.Q.value = 0.7;
    const ng = ctx.createGain(); ng.gain.value = 0.012;
    nz.connect(nf); nf.connect(ng); ng.connect(sum);
    const env = ctx.createGain(); env.gain.value = 0.0001;
    sum.connect(env); env.connect(dest);
    return { o, lfo, nz, env, bank, gain: opts.gain || 0.2, start(t) { o.start(t); lfo.start(t); nz.start(t); }, stop(t) { try { o.stop(t); lfo.stop(t); nz.stop(t); } catch (e) { /* ok */ } } };
  }

  const midiToHz = m => 440 * Math.pow(2, (m - 69) / 12);

  const C = DG.chant = {
    parse, vowelOf,
    cache: {},
    get(id) {
      const sc = DG.data.chants && DG.data.chants.scores[id];
      if (!sc) return null;
      if (!C.cache[id]) C.cache[id] = Object.assign({ id, meta: sc }, parse(sc.gabc));
      return C.cache[id];
    },
    current: null,
    // calcula a cronologia (tempos de início de cada nota)
    timeline(score, tempo) {
      const unit = 0.34 / (tempo || 1);
      let t = 0.15;
      const times = [];
      score.notes.forEach((n, i) => {
        const prev = score.notes[i - 1];
        const newSyl = !prev || prev.syl !== n.syl;
        if (prev && prev.barAfter) t += prev.barAfter * unit * 1.4;
        if (newSyl && prev && !prev.barAfter) t += 0.03;
        times.push(t);
        t += n.dur * unit + (n.gapAfter || 0);
      });
      return { times, total: t + 0.6, unit };
    },
    play(idOrScore, opts) {
      opts = opts || {};
      if (!A.ready || !A.ctx) return null;
      C.stop();
      const score = typeof idOrScore === 'object' ? idOrScore : C.get(idOrScore);
      if (!score || !score.notes.length) return null;
      const ctx = A.ctx;
      const tempo = opts.tempo || (DG.settings.pace === 'rapido' ? 1.2 : DG.settings.pace === 'contemplativo' ? 0.88 : 1);
      const tl = C.timeline(score, tempo);
      const t0 = ctx.currentTime + 0.12;
      const bus = ctx.createGain(); bus.gain.value = opts.volume == null ? 1 : opts.volume;
      bus.connect(A.buses.music);
      const organ = DG.settings.chantTimbre !== 'voices';
      const nVoices = organ ? 2 : opts.solo ? 1 : 4;
      const transpose = (score.base || 50) + (opts.transpose || 0) + (opts.solo && !score.fixedPitch ? 2 : 0);
      const voices = [];
      for (let k = 0; k < nVoices; k++) {
        const v = organ
          ? makeVoice(ctx, bus, { organ: true, detune: k === 1 ? 1200 : 0, gain: k === 1 ? 0.05 : (opts.solo ? 0.2 : 0.17) })
          : makeVoice(ctx, bus, { detune: opts.solo ? 0 : (k - 1.5) * 5 + (Math.random() - 0.5) * 3, gain: (opts.solo ? 0.28 : 0.13) * (1 + (Math.random() - 0.5) * 0.15), vib: opts.solo ? 9 : 5 + Math.random() * 4 });
        voices.push(v);
      }
      // automação
      voices.forEach((v, k) => {
        const lag = opts.solo || v.organ ? 0 : (Math.random() - 0.5) * 0.025;
        let lastSyl = -1, on = false;
        score.notes.forEach((n, i) => {
          const t = t0 + tl.times[i] + lag;
          const f = midiToHz(n.semi + transpose);
          if (i === 0) v.o.frequency.setValueAtTime(f, t0);
          v.o.frequency.setTargetAtTime(f, t, n.liq ? 0.03 : 0.014);
          const syl = score.syllables[n.syl];
          if (n.syl !== lastSyl) {
            const F = FORMANTS[(syl && syl.vowel) || 'a'];
            v.bank.forEach((b, k2) => b.frequency.setTargetAtTime(F[k2] * (1 + (k - 1.5) * 0.015), t, 0.03));
            // pequena articulação consonantal entre sílabas
            if (on) { v.env.gain.setTargetAtTime(v.gain * (v.organ ? 0.72 : 0.45), t - 0.035, 0.012); }
            v.env.gain.setTargetAtTime(v.gain, t, on ? 0.02 : 0.06);
            on = true; lastSyl = n.syl;
          }
          if (n.barAfter) {
            const end = t + n.dur * tl.unit;
            v.env.gain.setTargetAtTime(0.0001, end - 0.02, 0.07);
            on = false; lastSyl = -1;
          }
        });
        const tEnd = t0 + tl.total;
        v.env.gain.setTargetAtTime(0.0001, tEnd - 0.5, 0.15);
        v.start(t0);
        v.stop(tEnd + 1.2);
      });
      let stopped = false, resolveFn;
      const promise = new Promise(res => { resolveFn = res; });
      const handle = {
        score, tl, t0, voices, bus,
        get position() { return A.ctx.currentTime - t0; },
        get duration() { return tl.total; },
        noteAt(pos) { const ts = tl.times; let lo = 0, hi = ts.length - 1, r = -1; while (lo <= hi) { const mid = (lo + hi) >> 1; if (ts[mid] <= pos) { r = mid; lo = mid + 1; } else hi = mid - 1; } return r; },
        stop() {
          if (stopped) return; stopped = true;
          const now = A.ctx.currentTime;
          bus.gain.setTargetAtTime(0.0001, now, 0.08);
          voices.forEach(v => v.stop(now + 0.6));
          if (C.current === handle) C.current = null;
          resolveFn(false);
        },
        promise,
      };
      setTimeout(() => { if (!stopped) { stopped = true; if (C.current === handle) C.current = null; resolveFn(true); } }, (tl.total + 0.4) * 1000);
      C.current = handle;
      return handle;
    },
    stop() { if (C.current) C.current.stop(); },
    // divide um texto latino em sílabas (aproximação suficiente para o canto silábico)
    syllabify(text) {
      const out = [];
      const words = String(text).replace(/[✠+*℣℟]/g, ' ').replace(/\(.*?\)/g, ' ').split(/\s+/).filter(Boolean);
      words.forEach((w, wi) => {
        const punct = /[.:;?!]$/.test(w) ? (/[.?!]$/.test(w) ? 'end' : 'mid') : /,$/.test(w) ? 'comma' : null;
        const clean = w.replace(/[^A-Za-zÀ-ÿæœǽÆŒ]/g, '');
        if (!clean) return;
        const lower = clean.toLowerCase();
        const isV = (ch) => /[aeiouyáéíóúýæœǽ]/.test(ch);
        const nuclei = [];
        for (let i = 0; i < lower.length; i++) {
          if (!isV(lower[i])) continue;
          if ((lower[i] === 'u') && i > 0 && /[qg]/.test(lower[i - 1]) && i + 1 < lower.length && isV(lower[i + 1])) continue;
          const di = lower.slice(i, i + 2);
          nuclei.push(i);
          if (/^(ae|oe|au)$/.test(di)) i++;
        }
        if (!nuclei.length) { out.push({ text: clean, vowel: 'a', word: wi, wordStart: true, punct }); return; }
        let start = 0;
        nuclei.forEach((n, k) => {
          let end;
          if (k === nuclei.length - 1) end = clean.length;
          else {
            const next = nuclei[k + 1];
            let cons = next - n - 1;
            if (/^(ae|oe|au)$/.test(lower.slice(n, n + 2))) cons--;
            end = cons <= 1 ? next - cons : next - (/^[bcdfgptk][rl]$|^(ch|ph|th|qu|gu)$/.test(lower.slice(next - 2, next)) ? 2 : 1);
          }
          const sy = clean.slice(start, end);
          out.push({ text: sy, vowel: vowelOf(sy), word: wi, wordStart: k === 0, punct: k === nuclei.length - 1 ? punct : null });
          start = end;
        });
      });
      return out;
    },
    // partitura em tom reto (recto tono) a partir de um texto
    fromText(text, opts) {
      opts = opts || {};
      const syl = C.syllabify(text);
      const sc = { notes: [], syllables: [], events: [], clef: 'c3', base: opts.midi || 52 };
      syl.forEach((s, i) => {
        sc.syllables.push({ text: s.text + (s.punct ? '' : ''), word: s.word, firstNote: sc.notes.length, count: 1, vowel: s.vowel, wordStart: s.wordStart });
        const last = i === syl.length - 1;
        const n = { idx: 7, deg: 0, semi: 0, dur: s.punct === 'end' || last ? 1.9 : s.punct ? 1.5 : 0.82, syl: i };
        if (s.punct === 'end' || last) n.barAfter = 1.1; else if (s.punct === 'mid') n.barAfter = 0.6; else if (s.punct === 'comma') n.barAfter = 0.3;
        sc.notes.push(n);
      });
      sc.range = [sc.base, sc.base];
      return sc;
    },
    // trecho de uma partitura (por índice de nota): usado nas entoações
    slice(score, from, to) {
      const notes = score.notes.slice(from, to == null ? undefined : to);
      if (!notes.length) return null;
      const s0 = notes[0].syl, s1 = notes[notes.length - 1].syl;
      const syllables = score.syllables.slice(s0, s1 + 1).map(s => Object.assign({}, s, { firstNote: s.firstNote - from }));
      return Object.assign({}, score, { notes: notes.map(n => Object.assign({}, n, { syl: n.syl - s0 })), syllables, events: [] });
    },
    // concatena partituras (reindexando sílabas e notas)
    concat(...parts) {
      const out = { notes: [], syllables: [], events: [], clef: parts[0] && parts[0].clef, base: parts[0] && parts[0].base };
      for (const p of parts) {
        if (!p) continue;
        const so = out.syllables.length, no = out.notes.length;
        const shift = (p.base || out.base) - out.base; // mantém a altura absoluta
        p.syllables.forEach(s => out.syllables.push(Object.assign({}, s, { firstNote: s.firstNote + no })));
        p.notes.forEach(n => out.notes.push(Object.assign({}, n, { syl: n.syl + so, semi: n.semi + shift })));
      }
      return out;
    },
    findSyl(score, re, from) { for (let i = from || 0; i < score.syllables.length; i++) if (re.test(score.syllables[i].text || '')) return i; return -1; },
    firstNoteOf(score, si) { for (let i = si; i < score.syllables.length; i++) if (score.syllables[i].count) return score.syllables[i].firstNote; return score.notes.length; },
    // remove o “T. P. Allelúja” fora do Tempo Pascal
    stripTP(score) {
      const tp = C.findSyl(score, /^T\.\s*P\./);
      if (tp < 0) return score;
      let end = C.findSyl(score, /^(Ps\.|V\.|℣)/, tp + 1);
      const a = C.firstNoteOf(score, tp);
      const b = end < 0 ? score.notes.length : C.firstNoteOf(score, end);
      return C.concat(a > 0 ? C.slice(score, 0, a) : null, b < score.notes.length ? C.slice(score, b) : null);
    },
    // Intróito completo: antífona, versículo, Glória ao Pai (tom reto na dominante) e antífona repetida
    introit(score, opts) {
      opts = opts || {};
      const s = opts.paschal ? score : C.stripTP(score);
      const ps = C.findSyl(s, /^Ps\./);
      if (ps < 0) return s;
      const gl = C.findSyl(s, /^Gl[óo]$/, ps + 1);
      const ant = C.slice(s, 0, C.firstNoteOf(s, ps));
      let verse = C.slice(s, C.firstNoteOf(s, ps), gl < 0 ? undefined : C.firstNoteOf(s, gl));
      if (!ant || !verse) return s;
      // deixa da antífona no fim do versículo (ex.: “Réquiem.”): a antífona é repetida inteira
      const cue = DG.util.plain(ant.syllables[0].text).replace(/[^a-z]/g, '').slice(0, 3);
      for (let i = verse.syllables.length - 1; i > verse.syllables.length / 2; i--) {
        if (verse.syllables[i].wordStart && DG.util.plain(verse.syllables[i].text).replace(/[^a-z]/g, '').startsWith(cue)) { verse = C.slice(verse, 0, verse.syllables[i].firstNote); break; }
      }
      const parts = [ant, verse];
      if (opts.gloriaPatri !== false) {
        const cnt = {}; verse.notes.forEach(n => { cnt[n.semi] = (cnt[n.semi] || 0) + 1; });
        const dom = +Object.keys(cnt).sort((x, y) => cnt[y] - cnt[x])[0];
        const gp = C.fromText('Glória Patri, et Fílio, et Spirítui Sancto. Sicut erat in princípio, et nunc, et semper, et in sǽcula sæculórum. Amen.', { midi: verse.base + dom });
        gp.base = verse.base; gp.notes.forEach(n => { n.semi = dom; });
        parts.push(gp);
      }
      parts.push(ant);
      return C.concat(...parts);
    },
    // índice da primeira nota depois da primeira barra (fim da entoação)
    intonationEnd(score) {
      const ev = score.events.find(e => e.type === 'bar' && e.at > 2);
      return ev ? ev.at : Math.min(score.notes.length, 8);
    },
    // escolhe o Ordinário do Kyriale para uma celebração
    kyrialeFor(cel) {
      const d = DG.data.chants; if (!d) return null;
      const pr = d.propria[cel.id];
      const key = (pr && pr.kyriale) || 'XI';
      return Object.assign({ key }, d.kyriale[key]);
    },
  };
})(window.DG = window.DG || {});
