/* DEO GRATIAS — inicialização */
(function (DG) {
  'use strict';
  function boot() {
    DG.store.load();
    DG.ui.init();
    DG.game.init();
    // o áudio só pode começar após um gesto do usuário (política dos navegadores)
    const unlock = () => { DG.audio.init(); DG.audio.unlock(); };
    window.addEventListener('pointerdown', unlock, { once: false });
    window.addEventListener('keydown', unlock, { once: false });
    DG.title.show();
    const hideBoot = () => { const b = document.getElementById('boot'); if (b) { b.classList.add('hide'); setTimeout(() => b.remove(), 1400); } };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(hideBoot, 500)); else setTimeout(hideBoot, 800);
    window.addEventListener('beforeunload', () => DG.store.save());
    // pausa automática ao trocar de aba durante a celebração
    document.addEventListener('visibilitychange', () => { if (document.hidden && DG.game.state === 'rite' && !DG.game.paused) DG.screens.pause(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(window.DG = window.DG || {});
