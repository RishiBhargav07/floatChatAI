// Web Audio API SOS Siren & Strobe Synthesizer
let audioCtx = null;
let sirenInterval = null;
let isSirenActive = false;

export function startEmergencySiren() {
  if (isSirenActive) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    isSirenActive = true;
    let step = 0;

    // Dual-tone high-decibel sweep (880Hz / 440Hz alert warble)
    sirenInterval = setInterval(() => {
      if (!isSirenActive || !audioCtx) return;
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        // Warble between 700Hz and 950Hz
        const freq = step % 2 === 0 ? 920 : 680;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
        step++;
      } catch (err) {
        console.warn('Audio tone err:', err);
      }
    }, 400);

    return true;
  } catch (err) {
    console.error('Failed to start audio siren:', err);
    return false;
  }
}

export function stopEmergencySiren() {
  isSirenActive = false;
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
}

export function isSirenRunning() {
  return isSirenActive;
}
