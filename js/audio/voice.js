/* DEO GRATIAS — voz: latim eclesiástico pela síntese de fala do navegador.
   A pronúncia romana (italiana) do latim é aproximada adaptando a grafia para
   uma voz italiana; na falta dela, usa-se uma voz portuguesa com regras próprias. */
(function (DG) {
  'use strict';
  const synth = window.speechSynthesis;
  let voices = [];
  let current = null;

  function loadVoices() { voices = synth ? synth.getVoices() : []; DG.emit('voices', voices); }
  if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }

  const MALE = /(diego|giuseppe|cosimo|luca|benigno|calogero|gianni|rinaldo|paolo|francesco|daniel|antonio|thiago|valerio|male|masculin|homem)/i;

  // grafia latina -> grafia que uma voz italiana lê à moda romana
  function latinForItalian(s) {
    let t = ' ' + String(s) + ' ';
    t = t.replace(/[+*†℣℟]/g, ' ').replace(/\s+N\.\s+/g, ' ').replace(/\(.*?\)/g, ' ');
    t = t.replace(/ǽ/g, 'è').replace(/Ǽ/g, 'È').replace(/æ/g, 'e').replace(/Æ/g, 'E').replace(/œ/g, 'e').replace(/Œ/g, 'E');
    t = t.replace(/á/g, 'à').replace(/í/g, 'ì').replace(/ó/g, 'ò').replace(/ú/g, 'ù').replace(/ý/g, 'ì');
    t = t.replace(/Á/g, 'À').replace(/Í/g, 'Ì').replace(/Ó/g, 'Ò').replace(/Ú/g, 'Ù');
    t = t.replace(/ë/g, 'e').replace(/ï/g, 'i');
    t = t.replace(/\bmihi\b/gi, 'michi').replace(/\bnihil\b/gi, 'nichil').replace(/\bmíhi\b/gi, 'michi');
    t = t.replace(/j/g, 'i').replace(/J/g, 'I').replace(/y/g, 'i').replace(/Y/g, 'I');
    // ti + vogal (não depois de s, t, x) soa "tsi"
    t = t.replace(/([^stxSTX])ti([aeiouàèéìòù])/g, '$1zi$2').replace(/([^stxSTX])Ti([aeiouàèéìòù])/g, '$1Zi$2');
    // "h" mudo (o italiano já o ignora, mas evita leituras estranhas)
    t = t.replace(/\bh([aeiouàèéìòù])/gi, '$1');
    // "xc" + e/i = "ksh"
    t = t.replace(/xc([eièé])/gi, 'csc$1');
    // "gn" já é como em italiano; "qu" idem
    return t.replace(/\s+/g, ' ').trim();
  }
  // para uma voz portuguesa (aproximação)
  function latinForPortuguese(s) {
    let t = ' ' + String(s) + ' ';
    t = t.replace(/[+*†℣℟]/g, ' ').replace(/\(.*?\)/g, ' ');
    t = t.replace(/[ǽæ]/g, 'é').replace(/œ/g, 'é');
    t = t.replace(/\bmihi\b/gi, 'míqui').replace(/\bnihil\b/gi, 'níquil');
    t = t.replace(/ch/g, 'k').replace(/Ch/g, 'K');
    t = t.replace(/sc([eiéí])/g, 'ch$1');
    t = t.replace(/c([eiéí])/g, 'tch$1');
    t = t.replace(/g([eiéí])/g, 'dj$1');
    t = t.replace(/gn/g, 'nh');
    t = t.replace(/qu([eiéí])/g, 'cu$1');
    t = t.replace(/([^stx])ti([aeiouáéíóú])/g, '$1tsi$2');
    t = t.replace(/j/g, 'i').replace(/J/g, 'I');
    t = t.replace(/\bh/gi, '');
    return t.replace(/\s+/g, ' ').trim();
  }

  const V = DG.voice = {
    available: !!synth,
    get voices() { return voices; },
    latinForItalian, latinForPortuguese,
    pick(role) {
      const pref = role === 'priest' ? DG.settings.voicePriest : DG.settings.voiceServer;
      if (pref) { const v = voices.find(v => v.name === pref); if (v) return v; }
      const it = voices.filter(v => /^it/i.test(v.lang));
      const pt = voices.filter(v => /^pt/i.test(v.lang));
      const pool = it.length ? it : pt.length ? pt : voices;
      if (!pool.length) return null;
      const male = pool.filter(v => MALE.test(v.name));
      const natural = (arr) => arr.find(v => /natural|online|neural/i.test(v.name)) || arr[0];
      if (role === 'priest') return natural(male.length ? male : pool);
      // acólito: outra voz se houver; senão a mesma com tom mais agudo
      const others = pool.filter(v => v !== V.pick('priest'));
      const nonMale = others.filter(v => !MALE.test(v.name));
      return natural(male.length > 1 ? male.filter(v => v !== V.pick('priest')) : (nonMale.length ? nonMale : others.length ? others : pool));
    },
    // fala um texto latino; resolve quando termina (ou por estimativa, se não houver voz)
    speak(text, opts) {
      opts = opts || {};
      const words = DG.util.words(text).length;
      const paceK = DG.settings.pace === 'rapido' ? 0.7 : DG.settings.pace === 'contemplativo' ? 1.25 : 1;
      const est = Math.max(0.9, words * 0.42 * paceK + 0.3);
      if (!synth || !DG.settings.tts || opts.silent || !DG.audio.unlocked) {
        return { promise: DG.wait(opts.minTime != null ? Math.max(opts.minTime, est * 0.8) : est), cancel() {}, estimated: est };
      }
      V.cancel();
      const role = opts.role || 'priest';
      const voice = V.pick(role);
      const isIt = voice && /^it/i.test(voice.lang);
      const u = new SpeechSynthesisUtterance(isIt || !voice ? latinForItalian(text) : latinForPortuguese(text));
      if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = 'it-IT';
      const sameVoice = voice && role === 'server' && voice === V.pick('priest');
      u.rate = (DG.settings.ttsRate || 0.92) * (role === 'server' ? 1.05 : 1) * (DG.settings.pace === 'contemplativo' ? 0.9 : DG.settings.pace === 'rapido' ? 1.15 : 1);
      u.pitch = role === 'priest' ? 0.82 : sameVoice ? 1.45 : 1.15;
      u.volume = Math.min(1, (opts.volume == null ? 1 : opts.volume) * DG.settings.volVoice * DG.settings.volMaster);
      let done = false, resolveFn;
      const promise = new Promise(res => { resolveFn = res; });
      const finish = () => { if (done) return; done = true; current = null; resolveFn(true); };
      u.onend = finish; u.onerror = finish;
      if (opts.onBoundary) u.onboundary = (e) => opts.onBoundary(e.charIndex, e);
      current = { u, finish };
      try { synth.speak(u); } catch (e) { finish(); }
      // salvaguarda: algumas vozes não disparam onend
      DG.wait(est * 2.2 + 3).then(finish);
      return { promise, cancel() { try { synth.cancel(); } catch (e) { /* ok */ } finish(); }, estimated: est };
    },
    speakPt(text) {
      if (!synth || !DG.settings.tts) return;
      V.cancel();
      const pt = voices.find(v => /^pt-BR/i.test(v.lang)) || voices.find(v => /^pt/i.test(v.lang));
      const u = new SpeechSynthesisUtterance(text);
      if (pt) { u.voice = pt; u.lang = pt.lang; } else u.lang = 'pt-BR';
      u.rate = 1; u.volume = DG.settings.volVoice * DG.settings.volMaster;
      synth.speak(u);
    },
    cancel() { if (synth) { try { synth.cancel(); } catch (e) { /* ok */ } } if (current) current.finish(); },
    pause() { if (synth && synth.speaking) synth.pause(); },
    resume() { if (synth) synth.resume(); },
    describe() {
      const p = V.pick('priest'), s = V.pick('server');
      return { priest: p ? p.name + ' (' + p.lang + ')' : 'nenhuma', server: s ? s.name + ' (' + s.lang + ')' : 'nenhuma', italian: voices.some(v => /^it/i.test(v.lang)) };
    },
  };
})(window.DG = window.DG || {});
