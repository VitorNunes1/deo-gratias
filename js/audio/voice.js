/* DEO GRATIAS — voz: latim eclesiástico pela síntese de fala do navegador.
   Só vozes MASCULINAS. A pronúncia romana do latim sai certa com uma voz italiana
   (a melhor é a natural "Diego" do Microsoft Edge); na falta dela, usa-se uma voz
   espanhola e, por último, uma portuguesa, cada uma com a grafia adaptada.
   Textos longos são lidos frase a frase (evita cortes da síntese no meio). */
(function (DG) {
  'use strict';
  const synth = window.speechSynthesis;
  let voices = [];
  let current = null;
  let warned = false;

  function loadVoices() { voices = synth ? synth.getVoices() : []; DG.emit('voices', voices); }
  if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }

  // nomes de vozes masculinas conhecidas (Windows, Edge, macOS) e femininas (para excluir)
  const MALE = /(diego|giuseppe|cosimo|luca\b|benigno|calogero|gianni|rinaldo|lisandro|paolo|francesco|alessio|daniel|antonio|donato|fabio|humberto|julio|nicolau|valerio|duarte|felipe|thiago|alvaro|álvaro|jorge|pablo|raul|raúl|dario|darío|elias|gerardo|liberto|sergio|carlos|juan|enrique|arnau|tom[aá]s|david|mark|george|guy\b|ryan|eric\b|roger|christopher|andrew|brian|steffan|james|william|liam|conrad|killian|stefan|henri|remy|claude|jacques|vincent|\bmale\b|homem|masculin)/i;
  const FEMALE = /(maria|francisca|helena|thalita|leila|brenda|giovanna|elsa|isabella|palmira|pierina|fiamma|irma|imelda|elvira|laia|dalia|lucia|paloma|zira|hazel|susan|linda|heather|catherine|jenny|aria\b|sonia|libby|natasha|clara|luciana|alice|female|mulher|feminin|google)/i;
  const isMale = (v) => !!v && MALE.test(v.name) && !FEMALE.test(v.name);
  const langOf = (v) => (v && v.lang || '').slice(0, 2).toLowerCase();
  const isNatural = (v) => /natural|online|neural/i.test(v.name);
  const LANG_SCORE = { la: 120, it: 100, es: 70, pt: 40 };
  const score = (v) => (LANG_SCORE[langOf(v)] || 5) + (isNatural(v) ? 30 : 0);

  // ---------- grafia latina → grafia que cada voz lê à moda romana ----------
  function clean(s) {
    let t = ' ' + String(s) + ' ';
    t = t.replace(/[✠+*†‡℣℟§¶«»“”"]/g, ' ').replace(/\s+N\.(?=\s)/g, ' ').replace(/\(.*?\)|\[.*?\]/g, ' ');
    t = t.replace(/\s+([,.;:!?])/g, '$1');
    t = t.replace(/([.;:!?,])(\s*[.;:!?,])+/g, '$1'); // pontuação repetida (sobra dos símbolos removidos)
    return t;
  }
  function latinForItalian(s) {
    let t = clean(s);
    t = t.replace(/ǽ/g, 'è').replace(/Ǽ/g, 'È').replace(/[æœ]/g, 'e').replace(/[ÆŒ]/g, 'E').replace(/ae\b/g, 'e');
    t = t.replace(/á/g, 'à').replace(/í/g, 'ì').replace(/ó/g, 'ò').replace(/ú/g, 'ù').replace(/ý/g, 'ì');
    t = t.replace(/Á/g, 'À').replace(/Í/g, 'Ì').replace(/Ó/g, 'Ò').replace(/Ú/g, 'Ù');
    t = t.replace(/ë/g, 'e').replace(/ï/g, 'i');
    t = t.replace(/\bm[ií]hi\b/gi, 'michi').replace(/\bn[ií]hil\b/gi, 'nichil');
    t = t.replace(/ph/g, 'f').replace(/Ph/g, 'F').replace(/th/g, 't').replace(/Th/g, 'T');
    t = t.replace(/j/g, 'i').replace(/J/g, 'I').replace(/y/g, 'i').replace(/Y/g, 'I');
    t = t.replace(/([^stxSTX])ti([aeiouàèéìòù])/g, '$1zi$2').replace(/([^stxSTX])Ti([aeiouàèéìòù])/g, '$1Zi$2');
    t = t.replace(/\bh([aeiouàèéìòù])/gi, '$1');
    t = t.replace(/xc([eièé])/gi, 'csc$1');
    return t.replace(/\s+/g, ' ').trim();
  }
  function latinForSpanish(s) {
    let t = clean(s);
    t = t.replace(/ǽ/g, 'é').replace(/Ǽ/g, 'É').replace(/[æœ]/g, 'e').replace(/[ÆŒ]/g, 'E');
    t = t.replace(/ý/g, 'í').replace(/y/g, 'i').replace(/Y/g, 'I');
    t = t.replace(/\bm[ií]hi\b/gi, 'míqui').replace(/\bn[ií]hil\b/gi, 'níquil');
    t = t.replace(/ch/g, 'k').replace(/Ch/g, 'K').replace(/ph/g, 'f').replace(/Ph/g, 'F').replace(/th/g, 't').replace(/Th/g, 'T');
    t = t.replace(/xc([eiéí])/g, 'xch$1');
    t = t.replace(/sc([eiéí])/g, 's$1');
    t = t.replace(/c([eiéí])/g, 'ch$1').replace(/C([eiéí])/g, 'Ch$1');
    t = t.replace(/gn/g, 'ñ');
    t = t.replace(/g([eiéí])/g, 'y$1').replace(/G([eiéí])/g, 'Y$1');
    t = t.replace(/qu([eiéí])/g, 'cu$1').replace(/Qu([eiéí])/g, 'Cu$1');
    t = t.replace(/gu([eiéí])/g, 'gü$1');
    t = t.replace(/([^stx])ti([aeiouáéíóú])/g, '$1tsi$2');
    t = t.replace(/j([aeiouáéíóú])/g, 'y$1').replace(/J([aeiouáéíóú])/g, 'Y$1').replace(/j/g, 'i').replace(/J/g, 'I');
    t = t.replace(/ll/g, 'l').replace(/z/g, 'ds');
    t = t.replace(/\bh/gi, '');
    return t.replace(/\s+/g, ' ').trim();
  }
  function latinForPortuguese(s) {
    let t = clean(s);
    t = t.replace(/ǽ/g, 'é').replace(/Ǽ/g, 'É').replace(/[æœ]/g, 'e').replace(/[ÆŒ]/g, 'E').replace(/ý/g, 'í');
    t = t.replace(/\bm[ií]hi\b/gi, 'míqui').replace(/\bn[ií]hil\b/gi, 'níquil');
    t = t.replace(/ch/g, 'k').replace(/Ch/g, 'K').replace(/ph/g, 'f').replace(/Ph/g, 'F').replace(/th/g, 't').replace(/Th/g, 'T');
    t = t.replace(/xc([eiéí])/g, 'kch$1');
    t = t.replace(/sc([eiéí])/g, 'ch$1');
    t = t.replace(/c([eiéí])/g, 'tch$1').replace(/C([eiéí])/g, 'Tch$1');
    t = t.replace(/g([eiéí])/g, 'dj$1').replace(/G([eiéí])/g, 'Dj$1');
    t = t.replace(/gn/g, 'nh');
    t = t.replace(/qu([eiéí])/g, 'cu$1').replace(/Qu([eiéí])/g, 'Cu$1');
    t = t.replace(/gu([eiéí])/g, 'gü$1');
    t = t.replace(/([^stx])ti([aeiouáéíóú])/g, '$1tsi$2');
    t = t.replace(/j/g, 'i').replace(/J/g, 'I').replace(/y/g, 'i');
    t = t.replace(/x/g, 'cs').replace(/z/g, 'dz');
    t = t.replace(/\bh/gi, '');
    return t.replace(/\s+/g, ' ').trim();
  }
  const CONVERT = { it: latinForItalian, es: latinForSpanish, pt: latinForPortuguese, la: (s) => clean(s).replace(/\s+/g, ' ').trim() };

  // divide o texto em frases curtas (no texto ORIGINAL, para mapear o destaque das palavras)
  function chunks(text) {
    const out = [];
    const re = /[^.;:!?]+[.;:!?]*\s*/g;
    let m;
    while ((m = re.exec(text))) {
      let piece = m[0], start = m.index;
      while (piece.length > 190) { // frase muito longa: corta na vírgula
        const cut = piece.lastIndexOf(',', 180);
        const at = cut > 40 ? cut + 1 : 180;
        out.push({ start, text: piece.slice(0, at) });
        start += at; piece = piece.slice(at);
      }
      if (piece.trim()) out.push({ start, text: piece });
    }
    // junta pedaços muito curtos ao seguinte
    const merged = [];
    for (const c of out) { const last = merged[merged.length - 1]; if (last && last.text.length < 40 && last.text.length + c.text.length < 190) last.text += c.text; else merged.push({ start: c.start, text: c.text }); }
    return merged.length ? merged : [{ start: 0, text }];
  }

  const V = DG.voice = {
    available: !!synth,
    get voices() { return voices; },
    latinForItalian, latinForSpanish, latinForPortuguese, isMale,
    // vozes masculinas, da melhor para o latim à pior
    maleVoices() { return voices.filter(isMale).sort((a, b) => score(b) - score(a)); },
    pick(role) {
      const pref = role === 'priest' ? DG.settings.voicePriest : DG.settings.voiceServer;
      if (pref) { const v = voices.find(v => v.name === pref); if (v && isMale(v)) return v; } // escolha antiga feminina é ignorada
      const males = V.maleVoices();
      if (!males.length) return null;
      if (role === 'priest') return males[0];
      // acólito: outra voz masculina da mesma língua, se houver; senão a mesma do sacerdote
      const p = V.pick('priest');
      return males.find(v => v !== p && langOf(v) === langOf(p)) || p;
    },
    quality() {
      const v = V.pick('priest');
      if (!v) return 'none';
      const l = langOf(v);
      if (l === 'it' || l === 'la') return isNatural(v) ? 'best' : 'good';
      if (l === 'es') return 'fair';
      return 'poor';
    },
    // fala um texto latino; resolve quando termina (ou por estimativa, se não houver voz)
    speak(text, opts) {
      opts = opts || {};
      const words = DG.util.words(text).length;
      const paceK = DG.settings.pace === 'rapido' ? 0.7 : DG.settings.pace === 'contemplativo' ? 1.25 : 1;
      const est = Math.max(0.9, words * 0.42 * paceK + 0.3);
      const role = opts.role || 'priest';
      const voice = synth && DG.settings.tts && !opts.silent && DG.audio.unlocked ? V.pick(role) : null;
      if (!voice) {
        if (synth && DG.settings.tts && !opts.silent && DG.audio.unlocked && !warned) { warned = true; DG.ui && DG.ui.toast('Nenhuma voz masculina instalada: as orações seguem só em texto. Abra o jogo no Microsoft Edge para ouvir a voz italiana masculina “Diego”.', 'info'); }
        return { promise: DG.wait(opts.minTime != null ? Math.max(opts.minTime, est * 0.8) : est), cancel() {}, estimated: est };
      }
      if (!warned && V.quality() === 'poor') { warned = true; DG.ui && DG.ui.toast('Latim com voz portuguesa: a pronúncia fica aproximada. Para o latim correto, abra o jogo no Microsoft Edge (voz italiana masculina “Diego”) ou instale a voz italiana do Windows.', 'info'); }
      V.cancel();
      const conv = CONVERT[langOf(voice)] || latinForItalian;
      const p = V.pick('priest');
      const sameVoice = role === 'server' && voice === p;
      const rate = (DG.settings.ttsRate || 0.92) * (DG.settings.pace === 'contemplativo' ? 0.9 : DG.settings.pace === 'rapido' ? 1.12 : 1) * (role === 'server' ? 1.04 : 1);
      const pitch = sameVoice ? 1.1 : 1; // timbre natural; o acólito, se usar a mesma voz, um pouco mais jovem
      const vol = Math.min(1, (opts.volume == null ? 1 : opts.volume) * DG.settings.volVoice * DG.settings.volMaster);
      let done = false, resolveFn;
      const promise = new Promise(res => { resolveFn = res; });
      const finish = () => { if (done) return; done = true; current = null; resolveFn(true); };
      const parts = chunks(String(text));
      parts.forEach((c, i) => {
        const said = conv(c.text);
        if (!said) { if (i === parts.length - 1) DG.wait(0.05).then(finish); return; }
        const u = new SpeechSynthesisUtterance(said);
        u.voice = voice; u.lang = voice.lang; u.rate = rate; u.pitch = pitch; u.volume = vol;
        if (opts.onBoundary) u.onboundary = (e) => opts.onBoundary(c.start + Math.round(e.charIndex * c.text.length / Math.max(1, said.length)), e);
        if (i === parts.length - 1) { u.onend = finish; u.onerror = finish; }
        try { synth.speak(u); } catch (e) { finish(); }
      });
      current = { finish };
      // salvaguarda: algumas vozes não disparam onend
      DG.wait(est * 2.4 + 4).then(finish);
      return { promise, cancel() { try { synth.cancel(); } catch (e) { /* ok */ } finish(); }, estimated: est };
    },
    // frases em português (tutorial, capela): voz masculina brasileira, se houver
    speakPt(text) {
      if (!synth || !DG.settings.tts) return;
      V.cancel();
      const pt = voices.filter(v => /^pt/i.test(v.lang) && isMale(v)).sort((a, b) => score(b) - score(a))[0];
      if (!pt) return;
      const u = new SpeechSynthesisUtterance(text);
      u.voice = pt; u.lang = pt.lang; u.rate = 1; u.volume = DG.settings.volVoice * DG.settings.volMaster;
      synth.speak(u);
    },
    cancel() { if (synth) { try { synth.cancel(); } catch (e) { /* ok */ } } if (current) current.finish(); },
    pause() { if (synth && synth.speaking) synth.pause(); },
    resume() { if (synth) synth.resume(); },
    describe() {
      const p = V.pick('priest'), s = V.pick('server');
      return { priest: p ? p.name + ' (' + p.lang + ')' : 'nenhuma', server: s ? s.name + ' (' + s.lang + ')' : 'nenhuma', italian: voices.some(v => /^it/i.test(v.lang) && isMale(v)), quality: V.quality() };
    },
  };
})(window.DG = window.DG || {});
