/* DEO GRATIAS — notação gregoriana quadrada (pauta de 4 linhas) */
(function (DG) {
  'use strict';

  function layout(score, width, S) {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = Math.round(S * 1.25) + 'px "EB Garamond", Georgia, serif';
    const margin = S * 2.4, lineGap = S * 7.2;
    let x = margin, line = 0;
    const notes = [], sylls = [], bars = [];
    const right = width - S * 1.2;
    const lineH = lineGap;
    // percorre sílabas e barras na ordem dos eventos de notas
    const barAt = {};
    for (const e of score.events) if (e.type === 'bar') (barAt[e.at] = barAt[e.at] || []).push(e);
    const disp = (si) => { const s = score.syllables[si]; const nx = score.syllables[si + 1]; return s.text ? s.text + (nx && nx.text && !nx.wordStart && !/[*†℣℟]$/.test(s.text) ? '-' : '') : ''; };
    score.syllables.forEach((s, si) => {
      const shown = disp(si);
      const tw = shown ? ctx.measureText(shown).width : 0;
      const nN = s.count;
      const neumeW = Math.max(nN * S * 0.82, S);
      const need = Math.max(neumeW, tw + S * 0.4);
      if (x + need > right && x > margin + S) { line++; x = margin; }
      const sx = x;
      for (let k = 0; k < nN; k++) {
        const ni = s.firstNote + k;
        const n = score.notes[ni];
        notes[ni] = { x: sx + k * S * 0.82 + (tw > neumeW ? (tw - neumeW) / 2 : 0), line, n };
      }
      sylls[si] = { x: sx + (neumeW > tw ? (neumeW - tw) / 2 : 0), w: tw, line, text: shown };
      x += need + S * 0.55;
      // barras depois da última nota desta sílaba
      const lastNi = s.firstNote + nN;
      if (barAt[lastNi] && nN > 0) { for (const b of barAt[lastNi]) { bars.push({ x: x - S * 0.1, line, bar: b.bar }); x += S * 0.9; } delete barAt[lastNi]; }
    });
    return { notes, sylls, bars, lines: line + 1, lineH, margin, height: (line + 1) * lineH + S * 2 };
  }

  function draw(canvas, score, opts) {
    opts = opts || {};
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || opts.width || 600;
    const S = opts.S || Math.max(7, Math.min(11, cssW / 70));
    const L = canvas._layout && canvas._layout.w === cssW ? canvas._layout.L : layout(score, cssW, S);
    canvas._layout = { w: cssW, L };
    const cssH = L.height;
    if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) { canvas.width = Math.round(cssW * dpr); canvas.height = Math.round(cssH * dpr); canvas.style.height = cssH + 'px'; }
    const x = canvas.getContext('2d');
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.clearRect(0, 0, cssW, cssH);
    const cur = opts.current == null ? -1 : opts.current;
    const curSyl = cur >= 0 && score.notes[cur] ? score.notes[cur].syl : -1;
    const staffTop = (line) => S * 1.6 + line * L.lineH;
    const yOf = (line, idx) => staffTop(line) + S * 3 - (idx - 3) * S / 2;
    // pautas
    x.strokeStyle = '#b3282d'; x.lineWidth = Math.max(1, S / 9);
    for (let l = 0; l < L.lines; l++) {
      for (let k = 0; k < 4; k++) { const yy = staffTop(l) + k * S; x.beginPath(); x.moveTo(S * 0.6, yy); x.lineTo(cssW - S * 0.6, yy); x.stroke(); }
      // clave
      const clef = score.clef || 'c4';
      const cl = +clef.slice(-1);
      const cy = staffTop(l) + (4 - cl) * S;
      x.fillStyle = '#1e140d';
      if (clef[0] === 'c') { x.fillRect(S * 0.9, cy - S * 0.62, S * 0.5, S * 0.5); x.fillRect(S * 0.9, cy + S * 0.12, S * 0.5, S * 0.5); x.fillRect(S * 0.9, cy - S * 0.62, S * 0.12, S * 1.24); }
      else { x.fillRect(S * 0.7, cy - S * 0.62, S * 0.45, S * 0.5); x.fillRect(S * 0.7, cy + S * 0.12, S * 0.45, S * 0.5); x.fillRect(S * 1.3, cy - S * 0.3, S * 0.45, S * 0.6); x.fillRect(S * 1.3, cy - S * 0.3, S * 0.1, S * 1.5); }
    }
    // barras
    x.fillStyle = '#1e140d';
    for (const b of L.bars) {
      const t = staffTop(b.line);
      const w = Math.max(1, S / 7);
      if (b.bar === ',' || b.bar === '`') x.fillRect(b.x, t - S * 0.4, w, S * 0.9);
      else if (b.bar === ';') x.fillRect(b.x, t + S * 0.6, w, S * 1.8);
      else if (b.bar === ':') x.fillRect(b.x, t, w, S * 3);
      else { x.fillRect(b.x, t, w, S * 3); x.fillRect(b.x + S * 0.35, t, w * 1.6, S * 3); }
    }
    // notas
    L.notes.forEach((p, i) => {
      if (!p) return;
      const n = p.n, yy = yOf(p.line, n.idx);
      const sz = S * 0.78;
      const hi = i === cur;
      const col = hi ? '#c9301f' : '#1e140d';
      x.fillStyle = col;
      // linhas suplementares
      if (n.idx < 3 || n.idx > 9) {
        x.fillStyle = '#b3282d';
        for (let k = n.idx < 3 ? 1 : 11; n.idx < 3 ? k >= n.idx : k <= n.idx; k += n.idx < 3 ? -2 : 2) { const ly = yOf(p.line, k); x.fillRect(p.x - sz * 0.25, ly - 0.5, sz * 1.5, Math.max(1, S / 9)); }
        x.fillStyle = col;
      }
      if (n.incl) {
        x.beginPath(); x.moveTo(p.x + sz / 2, yy - sz * 0.55); x.lineTo(p.x + sz * 0.95, yy); x.lineTo(p.x + sz / 2, yy + sz * 0.55); x.lineTo(p.x + sz * 0.05, yy); x.closePath(); x.fill();
      } else {
        x.fillRect(p.x, yy - sz / 2, sz, sz);
        if (n.virga) x.fillRect(p.x + sz - Math.max(1, S / 8), yy, Math.max(1, S / 8), S * 1.4);
        if (n.quil) { x.fillStyle = hi ? '#c9301f' : '#5a4a3a'; x.fillRect(p.x, yy - sz / 2, sz, sz * 0.3); x.fillStyle = col; }
      }
      if (n.acc === -1) { x.font = 'bold ' + Math.round(S * 1.1) + 'px Georgia'; x.fillText('♭', p.x - S * 0.75, yy + S * 0.35); }
      if (n.dur >= 1.8) { x.beginPath(); x.arc(p.x + sz + S * 0.32, yy - (n.idx % 2 ? S * 0.25 : 0), S * 0.13, 0, Math.PI * 2); x.fill(); }
      if (n.liq) { x.fillStyle = '#f7efda'; x.fillRect(p.x + sz * 0.6, yy - sz / 2, sz * 0.4, sz * 0.4); }
    });
    // texto
    x.textBaseline = 'alphabetic';
    L.sylls.forEach((s, si) => {
      if (!s || !s.text) return;
      const yy = staffTop(s.line) + S * 5.1;
      x.font = (si === curSyl ? '600 ' : '') + Math.round(S * 1.25) + 'px "EB Garamond", Georgia, serif';
      x.fillStyle = si === curSyl ? '#a3161c' : /^[℣℟*†]/.test(s.text) ? '#a3161c' : '#1e140d';
      x.fillText(s.text, s.x, yy);
    });
    return L;
  }

  DG.notation = { layout, draw };
})(window.DG = window.DG || {});
