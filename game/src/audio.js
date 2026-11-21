// Mirror Meadow — all sounds are synthesized with WebAudio oscillators.
// One job: turn game moments (a find, a miss, a hint, a win) into short tones.
// No audio files are loaded; the context is created lazily on the first user gesture.

let audioContext = null;
let muted = false;

/** Create (or reuse) the AudioContext; safe to call before any gesture. */
export function ensureAudio() {
  if (audioContext === null) {
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

/** Play one oscillator note with a quick attack and a soft exponential decay. */
function playTone(frequency, startAt, duration, type, volume) {
  const context = ensureAudio();
  if (context === null || muted) return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, context.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(volume, context.currentTime + startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + startAt + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(context.currentTime + startAt);
  oscillator.stop(context.currentTime + startAt + duration + 0.05);
}

/** Two rising notes: the satisfying chime on every found difference. */
export function playFindChime() {
  playTone(659.25, 0, 0.18, 'sine', 0.22);
  playTone(987.77, 0.09, 0.28, 'sine', 0.22);
  playTone(1318.5, 0.18, 0.32, 'triangle', 0.1);
}

/** A low dull buzz for a wrong click. */
export function playWrongBuzz() {
  playTone(160, 0, 0.22, 'sawtooth', 0.12);
  playTone(110, 0.05, 0.25, 'sawtooth', 0.1);
}

/** A soft tick for ordinary button presses. */
export function playClickTick() {
  playTone(880, 0, 0.07, 'sine', 0.12);
}

/** A gentle shimmer when a hint is spent. */
export function playHintShimmer() {
  playTone(1046.5, 0, 0.16, 'sine', 0.14);
  playTone(1567.98, 0.12, 0.3, 'sine', 0.12);
}

/** A rising arpeggio when a level — or the whole game — is complete. */
export function playLevelFanfare() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((frequency, index) => {
    playTone(frequency, index * 0.12, 0.35, 'triangle', 0.18);
  });
  playTone(1318.5, 0.5, 0.6, 'sine', 0.16);
}
