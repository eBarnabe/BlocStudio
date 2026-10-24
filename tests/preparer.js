// Tests automatiques — chargé par verifier.ps1 AVANT les scripts de BlocStudio.
// Le navigateur de test tourne sans écran (« headless »), à temps virtuel et sans matériel :
//  - on note les erreurs de chargement des scripts ;
//  - requestAnimationFrame ne tourne qu'une fois à temps virtuel : il passe par un minuteur ;
//  - une fausse caméra (une image grise) et un faux micro (silencieux).
window.__erreursChargement = [];
window.addEventListener('error', e => {
  window.__erreursChargement.push(`${e.message} (${(e.filename || '').split('/').pop()}:${e.lineno})`);
});

window.requestAnimationFrame = f => setTimeout(() => f(performance.now()), 16);
window.cancelAnimationFrame = id => clearTimeout(id);

(function () {
  async function getUserMedia(contraintes) {
    if (contraintes && contraintes.video) {
      const c = document.createElement('canvas');
      c.width = 320;
      c.height = 240;
      const g = c.getContext('2d');
      g.fillStyle = '#64748b';
      g.fillRect(0, 0, 320, 240);
      return c.captureStream(10);
    }
    const ctx = new AudioContext();
    const silence = ctx.createGain();
    silence.gain.value = 0;
    const sortie = ctx.createMediaStreamDestination();
    const o = ctx.createOscillator();
    o.connect(silence).connect(sortie);
    o.start();
    return sortie.stream;
  }
  if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = getUserMedia;
  else Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia } });
})();
