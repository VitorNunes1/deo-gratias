/* DEO GRATIAS — avaliação da execução das rubricas */
(function (DG) {
  'use strict';
  const CATS = {
    rubrica: { name: 'Rubricas', desc: 'Gestos e ações prescritos' },
    posicao: { name: 'Posição', desc: 'Estar no lugar certo do altar' },
    resposta: { name: 'Respostas', desc: 'Latim das respostas' },
    tempo: { name: 'Prontidão', desc: 'Sem atrasar nem antecipar' },
    reverencia: { name: 'Reverência', desc: 'Postura, genuflexões, gravidade' },
  };
  const GRADES = [
    [97, 'Optime', 'Excelente: execução digna de um cerimoniário.'],
    [90, 'Valde bene', 'Muito bem: pequenas imperfeições.'],
    [80, 'Bene', 'Bem: o rito foi respeitado, com alguns deslizes.'],
    [65, 'Satis', 'Suficiente: convém treinar as partes assinaladas.'],
    [0, 'Emendandum', 'A corrigir: reveja o Manual e use o modo de treino.'],
  ];

  class Score {
    constructor(opts) {
      this.opts = opts || {};
      this.ok = {}; this.bad = {}; this.mistakes = [];
      for (const k in CATS) { this.ok[k] = 0; this.bad[k] = 0; }
      this.start = Date.now();
      this.stepFlags = {};
    }
    good(cat, n) { this.ok[cat] = (this.ok[cat] || 0) + (n || 1); }
    mistake(cat, what, how, opts) {
      opts = opts || {};
      const key = opts.once ? opts.once : null;
      if (key && this.stepFlags[key]) return false;
      if (key) this.stepFlags[key] = true;
      const w = opts.weight || 1;
      this.bad[cat] = (this.bad[cat] || 0) + w;
      this.mistakes.push({ cat, what, how, ref: opts.ref || '', step: opts.step || '', t: Date.now() - this.start });
      DG.emit('mistake', { cat, what, how });
      return true;
    }
    catScore(cat) {
      const ok = this.ok[cat] || 0, bad = this.bad[cat] || 0;
      if (ok + bad === 0) return 100;
      return Math.max(0, Math.round(100 * ok / (ok + bad * 1.6)));
    }
    total() {
      const weights = { rubrica: 3, posicao: 2, resposta: 3, tempo: 1, reverencia: 2 };
      let s = 0, w = 0;
      for (const k in CATS) { const n = (this.ok[k] || 0) + (this.bad[k] || 0); if (!n) continue; s += this.catScore(k) * weights[k]; w += weights[k]; }
      return w ? Math.round(s / w) : 100;
    }
    grade() { const t = this.total(); return GRADES.find(g => t >= g[0]); }
    get duration() { return (Date.now() - this.start) / 1000; }
  }
  DG.Score = Score;
  DG.SCORE_CATS = CATS;
  DG.GRADES = GRADES;
})(window.DG = window.DG || {});
