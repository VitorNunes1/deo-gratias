/* DEO GRATIAS — interface: telas, navegação, avisos, escala */
(function (DG) {
  'use strict';
  const U = DG.util;

  function h(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'text') e.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) { if (kid == null || kid === false) continue; e.appendChild(typeof kid === 'string' || typeof kid === 'number' ? document.createTextNode(String(kid)) : kid); }
    return e;
  }

  const UI = DG.ui = {
    h,
    root: null, stack: [],
    init() {
      UI.root = document.getElementById('ui');
      UI.toastWrap = h('div', { class: 'toast-wrap' });
      UI.fadeEl = h('div', { class: 'fade' });
      UI.tipEl = h('div', { class: 'tip', style: { display: 'none' } });
      UI.root.append(UI.toastWrap, UI.fadeEl, UI.tipEl);
      UI.layout();
      window.addEventListener('resize', UI.layout);
      DG.on('toast', (t) => UI.toast(t.text, t.kind));
    },
    layout() {
      const ww = window.innerWidth, wh = window.innerHeight;
      let scale = Math.min(ww / DG.W, wh / DG.H);
      if (scale >= 2) scale = Math.floor(scale * 2) / 2; // passos de meio pixel para nitidez
      const w = Math.floor(DG.W * scale), hh = Math.floor(DG.H * scale);
      const st = document.getElementById('stage');
      st.style.width = w + 'px'; st.style.height = hh + 'px';
      document.documentElement.style.setProperty('--u', (w / DG.W) + 'px');
      UI.scale = w / DG.W;
    },
    // ---------- telas (pilha) ----------
    push(screen) {
      // screen: { el, onKey(ev)->bool, onClose(), modal }
      UI.root.insertBefore(screen.el, UI.toastWrap);
      const handler = (ev) => {
        if (screen.onKey && screen.onKey(ev) === true) return true;
        if (UI.navigate(screen, ev)) return true;
        return !!screen.modal;
      };
      handler.modal = screen.modal !== false;
      screen._pop = DG.input.pushHandler(handler);
      UI.stack.push(screen);
      setTimeout(() => UI.focusFirst(screen), 0);
      return screen;
    },
    pop(screen) {
      screen = screen || UI.stack[UI.stack.length - 1];
      if (!screen) return;
      const i = UI.stack.indexOf(screen);
      if (i >= 0) UI.stack.splice(i, 1);
      if (screen._pop) screen._pop();
      if (screen.el && screen.el.parentNode) screen.el.parentNode.removeChild(screen.el);
      if (screen.onClose) screen.onClose();
    },
    clear() { while (UI.stack.length) UI.pop(); },
    top() { return UI.stack[UI.stack.length - 1]; },
    // navegação por teclado/controle entre elementos [data-nav]
    navigate(screen, ev) {
      const items = Array.from(screen.el.querySelectorAll('[data-nav]')).filter(e => !e.disabled && e.offsetParent !== null);
      if (!items.length) return false;
      let i = items.indexOf(document.activeElement);
      if (i < 0) i = items.findIndex(e => e.classList.contains('focus'));
      const move = (d) => { const n = items[(i + d + items.length) % items.length]; items.forEach(e => e.classList.remove('focus')); n.classList.add('focus'); n.focus({ preventScroll: false }); n.scrollIntoView && n.scrollIntoView({ block: 'nearest' }); DG.sfx.uiMove(); };
      if (ev.action === 'down' || ev.action === 'right' && screen.navH) { move(1); return true; }
      if (ev.action === 'up' || ev.action === 'left' && screen.navH) { move(-1); return true; }
      if (ev.action === 'interact' && ev.code !== 'Space') { const cur = items[i] || items[0]; if (cur) { cur.click(); return true; } }
      if (ev.action === 'cancel' && screen.onBack) { screen.onBack(); return true; }
      return false;
    },
    focusFirst(screen) {
      const it = screen.el.querySelector('[data-nav].focus') || screen.el.querySelector('[data-nav]');
      if (it) { it.classList.add('focus'); try { it.focus({ preventScroll: true }); } catch (e) { /* ok */ } }
    },
    // ---------- avisos ----------
    toast(text, kind) {
      const t = h('div', { class: 'toast ' + (kind || 'info') }, text);
      UI.toastWrap.appendChild(t);
      while (UI.toastWrap.children.length > 3) UI.toastWrap.removeChild(UI.toastWrap.firstChild);
      setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 600); }, kind === 'err' ? 4200 : 3200);
    },
    fade(on) { return new Promise(res => { UI.fadeEl.classList.toggle('on', on); setTimeout(res, 650); }); },
    tip(text, x, y) {
      if (!text) { UI.tipEl.style.display = 'none'; return; }
      UI.tipEl.innerHTML = text; UI.tipEl.style.display = 'block';
      const r = document.getElementById('stage').getBoundingClientRect();
      UI.tipEl.style.left = Math.min(r.width - 200, Math.max(0, x - r.left + 12)) + 'px';
      UI.tipEl.style.top = Math.max(0, y - r.top - 50) + 'px';
    },
    // diálogo de confirmação
    confirm(title, text, yes, no) {
      return new Promise(res => {
        const sc = { modal: true };
        const done = (v) => { UI.pop(sc); res(v); };
        sc.el = h('div', { class: 'screen dim' }, h('div', { class: 'panel', style: { maxWidth: 'calc(var(--u)*200)' } },
          h('h3', null, title), h('p', null, text),
          h('div', { class: 'row', style: { justifyContent: 'flex-end' } },
            h('button', { class: 'btn ghost', 'data-nav': 1, onclick: () => done(false) }, no || 'Cancelar'),
            h('button', { class: 'btn', 'data-nav': 1, onclick: () => done(true) }, yes || 'Confirmar'))));
        sc.onBack = () => done(false);
        UI.push(sc);
      });
    },
    // mini-retrato de personagem como canvas
    portrait(spec, st, scale) { const c = DG.chars.portrait(spec, st, scale || 3); c.style.width = (40 * (scale || 3)) / 3 * 1 + 'px'; return c; },
    iconCanvas(id, color, size) { const c = DG.spr.icon(id, color, 32); const cv = document.createElement('canvas'); cv.width = 32; cv.height = 32; cv.getContext('2d').drawImage(c, 0, 0); cv.style.width = (size || 64) + 'px'; cv.style.height = (size || 64) + 'px'; cv.style.imageRendering = 'pixelated'; return cv; },
    esc: U.escape,
    // texto com cruzes litúrgicas destacadas
    fmtLatin(s) { return U.escape(s).replace(/✠|\+/g, '<span class="rub">✠</span>').replace(/℣/g, '<span class="vr">℣</span>').replace(/℟/g, '<span class="vr">℟</span>').replace(/\*/g, '<span class="rub">*</span>'); },
  };
})(window.DG = window.DG || {});
