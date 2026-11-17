/* DEO GRATIAS — salvamento local (perfil, progresso, histórico, configurações) */
(function (DG) {
  'use strict';
  const KEY = 'deogratias.save.v1';

  const blankProfile = () => ({
    created: Date.now(),
    xp: { sacerdos: 0, minister: 0 },
    masses: 0,
    history: [],                 // registros das celebrações
    best: {},                    // melhor pontuação por celebração+papel
    examined: {},                // objetos examinados (enciclopédia)
    manualRead: {},              // capítulos do manual lidos
    achievements: {},            // conquistas
    tutorialDone: { sacerdos: false, minister: false },
    character: {
      sacerdos: { name: 'Pe. Anselmo', skin: 1, hair: 1, hairColor: 2, age: 'adulto' },
      minister: { name: 'Tarcísio', skin: 1, hair: 0, hairColor: 1, cassock: 'niger' },
    },
    unlocked: { cantata: false },
    lastCelebration: null,
  });

  let data = null;

  function safeParse(s) { try { return JSON.parse(s); } catch (e) { return null; } }

  DG.store = {
    load() {
      let raw = null;
      try { raw = window.localStorage.getItem(KEY); } catch (e) { raw = null; }
      const parsed = raw ? safeParse(raw) : null;
      data = parsed && parsed.profile ? parsed : { profile: blankProfile(), settings: DG.defaultSettings() };
      // mescla com padrões (novas chaves em versões futuras)
      const defP = blankProfile();
      for (const k in defP) if (!(k in data.profile)) data.profile[k] = defP[k];
      for (const r of ['sacerdos', 'minister']) data.profile.character[r] = Object.assign({}, defP.character[r], data.profile.character[r] || {});
      const defS = DG.defaultSettings();
      data.settings = Object.assign({}, defS, data.settings || {});
      data.settings.customs = Object.assign({}, defS.customs, (data.settings || {}).customs || {});
      DG.settings = data.settings;
      DG.profile = data.profile;
      return data;
    },
    save() {
      if (!data) return false;
      try { window.localStorage.setItem(KEY, JSON.stringify(data)); return true; } catch (e) { return false; }
    },
    hasProgress() { return !!(data && data.profile && (data.profile.masses > 0 || data.profile.history.length)); },
    reset() {
      data = { profile: blankProfile(), settings: DG.settings };
      DG.profile = data.profile;
      this.save();
    },
    addHistory(rec) {
      const p = data.profile;
      p.history.unshift(rec);
      if (p.history.length > 200) p.history.length = 200;
      p.masses += rec.completed ? 1 : 0;
      const key = rec.celebration + '|' + rec.role + '|' + rec.form;
      if (rec.completed && (!p.best[key] || p.best[key] < rec.score)) p.best[key] = rec.score;
      p.lastCelebration = rec.celebration;
      this.save();
    },
    exportJSON() { return JSON.stringify(data, null, 1); },
  };
})(window.DG = window.DG || {});
