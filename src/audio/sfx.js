/** Synthesized effects and a soft scene bed. No microphone and no audio files. */

let ctx;
let master;
let musicGain;
let sfxGain;
let timer = null;
let mix = { volume: 0.7, music: true, sfx: true, quietMode: false };

function context() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    ctx = new AudioCtx();
    master = ctx.createGain();
    sfxGain = ctx.createGain();
    musicGain = ctx.createGain();
    sfxGain.connect(master);
    musicGain.connect(master);
    master.connect(ctx.destination);
    applyMix(mix);
  }
  return ctx;
}

export function primeAudio() {
  const audio = context();
  if (audio.state === 'suspended') audio.resume();
}

export function applyMix(settings) {
  mix = { ...mix, ...settings };
  if (!ctx) return;
  const quiet = mix.quietMode ? 0.35 : 1;
  master.gain.value = Math.max(0, Math.min(1, mix.volume ?? 0.7)) * quiet;
  musicGain.gain.value = mix.music ? 0.22 : 0;
  sfxGain.gain.value = mix.sfx ? 1 : 0;
}

function tone(freq, dur, type, gain, toFreq) {
  if (!mix.sfx || (mix.volume ?? 0) <= 0) return;
  const audio = context();
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audio.currentTime);
  if (toFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(40, toFreq), audio.currentTime + dur);
  amp.gain.setValueAtTime(gain, audio.currentTime);
  amp.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + dur);
  osc.connect(amp);
  amp.connect(sfxGain);
  osc.start();
  osc.stop(audio.currentTime + dur + 0.02);
}

export function playTick() {
  tone(760, 0.045, 'sine', 0.06);
}

export function playPop() {
  tone(520, 0.14, 'triangle', 0.1, 880);
  duck();
}

export function playMiss() {
  tone(230, 0.18, 'sine', 0.07, 140);
}

export function playWin() {
  const gap = mix.quietMode ? 90 : 140;
  const dur = mix.quietMode ? 0.08 : 0.16;
  [523, 659, 784].forEach((freq, index) => {
    setTimeout(() => tone(freq, dur, 'triangle', 0.09), index * gap);
  });
}

export function playLose() {
  tone(320, 0.16, 'sine', 0.06, 180);
}

export function speak(text, settings) {
  if (!settings?.speech || settings.quietMode) return;
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  utter.rate = 0.92;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

const SCALES = {
  meadow: [262, 294, 330, 392, 440],
  space: [220, 262, 330, 392, 494],
  ocean: [196, 247, 294, 370, 440],
  forest: [174, 220, 262, 311, 392],
  castle: [247, 311, 370, 415, 494],
  lab: [262, 330, 392, 466, 523],
};

export function startBed(sceneId) {
  stopBed();
  if (!mix.music || (mix.volume ?? 0) <= 0) return;
  primeAudio();
  const scale = SCALES[sceneId] || SCALES.meadow;
  let step = 0;
  const loop = () => {
    const audio = context();
    const osc = audio.createOscillator();
    const amp = audio.createGain();
    osc.type = 'sine';
    osc.frequency.value = scale[step % scale.length];
    amp.gain.setValueAtTime(0.0001, audio.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.07, audio.currentTime + 0.04);
    amp.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.7);
    osc.connect(amp);
    amp.connect(musicGain);
    osc.start();
    osc.stop(audio.currentTime + 0.72);
    step += 1;
  };
  loop();
  timer = setInterval(loop, mix.quietMode ? 1400 : 900);
}

export function stopBed() {
  if (timer) clearInterval(timer);
  timer = null;
}

function duck() {
  if (!musicGain || !ctx || !mix.music) return;
  const now = ctx.currentTime;
  const back = mix.music ? 0.22 : 0;
  musicGain.gain.cancelScheduledValues(now);
  musicGain.gain.setValueAtTime(Math.max(0.001, musicGain.gain.value), now);
  musicGain.gain.linearRampToValueAtTime(0.04, now + 0.04);
  musicGain.gain.linearRampToValueAtTime(back, now + 0.35);
}
