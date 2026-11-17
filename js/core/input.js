/* DEO GRATIAS — entrada: teclado, mouse e controle (Gamepad API) */
(function (DG) {
  'use strict';

  const keys = new Set();          // teclas pressionadas (code)
  const pressedThisFrame = new Set();
  const handlers = [];             // pilha de manipuladores de interface (topo recebe primeiro)

  // Mapeamento de ações → teclas
  const MAP = {
    up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'], left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'],
    interact: ['KeyE', 'Space', 'Enter', 'NumpadEnter'],
    cancel: ['Escape', 'Backspace'],
    book: ['KeyM'], manual: ['KeyL'], inventory: ['KeyI', 'Tab'], objects: ['KeyO'],
    skip: ['KeyF'], rubric: ['KeyR'], lang: ['KeyT'], slow: ['ShiftLeft', 'ShiftRight'],
    g1: ['Digit1', 'Numpad1'], g2: ['Digit2', 'Numpad2'], g3: ['Digit3', 'Numpad3'], g4: ['Digit4', 'Numpad4'],
    g5: ['Digit5', 'Numpad5'], g6: ['Digit6', 'Numpad6'], g7: ['Digit7', 'Numpad7'], g8: ['Digit8', 'Numpad8'],
    g9: ['Digit9', 'Numpad9'], g0: ['Digit0', 'Numpad0'], gQ: ['KeyQ'], gZ: ['KeyZ'], gX: ['KeyX'], gC: ['KeyC'], gV: ['KeyV'], gB: ['KeyB'], gG: ['KeyG'], gH: ['KeyH'], gJ: ['KeyJ'], gK: ['KeyK'], gN: ['KeyN'], gU: ['KeyU'], gY: ['KeyY'], gP: ['KeyP'],
  };

  const I = DG.input = {
    mouse: { x: 0, y: 0, gx: 0, gy: 0, down: false, clicked: false, rclicked: false, inside: false, wx: 0, wy: 0 },
    pad: { connected: false, axes: [0, 0], buttons: [], prev: [] },
    lastDevice: 'keyboard',
    MAP,
    isDown(action) { const ks = MAP[action]; return ks ? ks.some(k => keys.has(k)) : keys.has(action); },
    pressed(action) { const ks = MAP[action]; return ks ? ks.some(k => pressedThisFrame.has(k)) : pressedThisFrame.has(action); },
    keyLabel(action) {
      const k = (MAP[action] || [action])[0];
      return k.replace(/^Key/, '').replace(/^Digit/, '').replace('Space', 'Espaço').replace('Escape', 'Esc').replace('Enter', 'Enter');
    },
    pushHandler(fn) { handlers.push(fn); return () => { const i = handlers.indexOf(fn); if (i >= 0) handlers.splice(i, 1); }; },
    get uiCaptured() { return handlers.length > 0; },
    endFrame() { pressedThisFrame.clear(); I.mouse.clicked = false; I.mouse.rclicked = false; },
    // direção de movimento (-1..1)
    axis() {
      let x = 0, y = 0;
      if (I.isDown('left')) x -= 1; if (I.isDown('right')) x += 1;
      if (I.isDown('up')) y -= 1; if (I.isDown('down')) y += 1;
      const p = I.pad;
      if (p.connected) {
        if (Math.abs(p.axes[0]) > 0.25) x = p.axes[0];
        if (Math.abs(p.axes[1]) > 0.25) y = p.axes[1];
        if (p.buttons[14]) x = -1; if (p.buttons[15]) x = 1; if (p.buttons[12]) y = -1; if (p.buttons[13]) y = 1;
      }
      const m = Math.hypot(x, y);
      if (m > 1) { x /= m; y /= m; }
      return { x, y };
    },
    clearKeys() { keys.clear(); },
  };

  function dispatch(ev) {
    for (let i = handlers.length - 1; i >= 0; i--) {
      try { if (handlers[i](ev) === true) return true; } catch (e) { console.error(e); }
      // um manipulador "modal" bloqueia os de baixo
      if (handlers[i].modal) return true;
    }
    return false;
  }

  window.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    I.lastDevice = 'keyboard';
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Backspace'].includes(e.code)) e.preventDefault();
    if (!e.repeat) pressedThisFrame.add(e.code);
    keys.add(e.code);
    if (!e.repeat) {
      const consumed = dispatch({ type: 'key', code: e.code, key: e.key, shift: e.shiftKey, action: actionOf(e.code) });
      if (consumed) pressedThisFrame.delete(e.code);
    }
    DG.audio && DG.audio.unlock && DG.audio.unlock();
  });
  window.addEventListener('keyup', (e) => { keys.delete(e.code); });
  window.addEventListener('blur', () => keys.clear());

  function actionOf(code) {
    for (const a in MAP) if (MAP[a].includes(code)) return a;
    return null;
  }
  I.actionOf = actionOf;

  // ---------- mouse (coordenadas de tela → jogo) ----------
  function toGame(e) {
    const stage = document.getElementById('stage');
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    I.mouse.x = e.clientX; I.mouse.y = e.clientY;
    I.mouse.gx = (e.clientX - r.left) / r.width * DG.W;
    I.mouse.gy = (e.clientY - r.top) / r.height * DG.H;
    I.mouse.inside = I.mouse.gx >= 0 && I.mouse.gy >= 0 && I.mouse.gx < DG.W && I.mouse.gy < DG.H;
  }
  window.addEventListener('mousemove', toGame);
  window.addEventListener('mousedown', (e) => {
    toGame(e); I.lastDevice = 'mouse';
    DG.audio && DG.audio.unlock && DG.audio.unlock();
    if (e.target && e.target.id === 'game') {
      if (e.button === 0) { I.mouse.down = true; I.mouse.clicked = true; }
      if (e.button === 2) I.mouse.rclicked = true;
    }
  });
  window.addEventListener('mouseup', () => { I.mouse.down = false; });
  window.addEventListener('contextmenu', (e) => { if (e.target && e.target.id === 'game') e.preventDefault(); });

  // ---------- controle ----------
  // A=0 interagir, B=1 cancelar, X=2 gestos, Y=3 livro, LB=4 / RB=5 trocar gesto, Start=9 pausa
  const PAD_TO_ACTION = { 0: 'interact', 1: 'cancel', 3: 'book', 9: 'cancel', 8: 'manual', 6: 'skip', 7: 'skip' };
  I.pollPad = function () {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = pads && Array.from(pads).find(p => p && p.connected);
    const p = I.pad;
    if (!gp) { p.connected = false; return; }
    p.connected = true;
    p.axes = [gp.axes[0] || 0, gp.axes[1] || 0];
    p.prev = p.buttons;
    p.buttons = gp.buttons.map(b => b.pressed);
    p.buttons.forEach((b, i) => {
      if (b && !p.prev[i]) {
        I.lastDevice = 'pad';
        const act = PAD_TO_ACTION[i];
        const ev = { type: 'pad', button: i, action: act };
        if (i === 12) ev.action = 'up'; if (i === 13) ev.action = 'down'; if (i === 14) ev.action = 'left'; if (i === 15) ev.action = 'right';
        if (i === 4) ev.action = 'gprev'; if (i === 5) ev.action = 'gnext'; if (i === 2) ev.action = 'gfire';
        const consumed = dispatch(ev);
        if (!consumed && act) { const code = MAP[act] && MAP[act][0]; if (code) pressedThisFrame.add(code); }
        if (!consumed && (i === 4 || i === 5 || i === 2)) pressedThisFrame.add('pad' + i);
      }
    });
  };
})(window.DG = window.DG || {});
