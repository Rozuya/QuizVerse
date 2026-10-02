/**
 * QuizVerse — moteur de synthèse audio (outil de développement)
 *
 * Ce fichier génère TOUTES les musiques et tous les effets sonores de QuizVerse
 * de façon 100 % procédurale : aucune musique existante n'est utilisée, donc
 * aucune question de droits d'auteur ne se pose (voir LICENSE).
 *
 * Les fichiers produits sont : assets/audio/*.mp3
 *
 * Utilisation (nécessite l'encodeur MP3 pure-JS lamejs) :
 *   npm install @breezystack/lamejs
 *   node tools/audio/generate-audio.mjs
 *
 * Si lamejs n'est pas installé, le script bascule automatiquement sur du WAV
 * afin que tu puisses quand même écouter le résultat.
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const OUT = resolve(ROOT, 'assets', 'audio');

const require = createRequire(import.meta.url);
let Mp3Encoder = null;
try {
  ({ Mp3Encoder } = require('@breezystack/lamejs'));
} catch {
  try {
    ({ Mp3Encoder } = require('lamejs'));
  } catch {
    console.warn('[audio] Encodeur MP3 absent — génération en WAV. Lancez `npm i @breezystack/lamejs` pour obtenir des MP3.');
  }
}

/* ------------------------------------------------------------------ *
 *  DSP de base
 * ------------------------------------------------------------------ */

export const SR = 44100;

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const TAU = Math.PI * 2;

/** Dégradé d'attaque / décroissance / maintien / relâchement. */
function adsr(t, dur, a, d, s, r) {
  if (t < 0) return 0;
  if (t < a) return a > 0 ? t / a : 1;
  if (t < a + d) return 1 - (1 - s) * ((t - a) / d);
  if (t < dur) return s;
  const rel = t - dur;
  if (rel >= r) return 0;
  return s * (1 - rel / r);
}

/** Rampe exponentielle douce, utile pour les percussions. */
const expDec = (t, tau) => Math.exp(-t / tau);

/** Filtre passe-bas à 2 pôles (state variable), utile pour doucir les nappes. */
function makeSVF() {
  let low = 0, band = 0;
  return (x, cutoff, q) => {
    const f = 2 * Math.sin((Math.PI * clamp(cutoff, 20, SR * 0.45)) / SR);
    const damp = clamp(1 / clamp(q, 0.5, 4), 0.05, 2);
    const high = x - low - damp * band;
    band += f * high;
    low += f * band;
    return low;
  };
}

/** Bruit blanc déterministe (générateur congruentiel, donc reproductible). */
function makeNoise(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return (s / 0xffffffff) * 2 - 1;
  };
}

/* ------------------------------------------------------------------ *
 *  Théorie musicale
 * ------------------------------------------------------------------ */

const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** "A4", "C#5", "Eb3" -> fréquence en Hz */
export function note(name) {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
  if (!m) throw new Error('Note invalide: ' + name);
  let n = SEMI[m[1]];
  if (m[2] === '#') n += 1;
  if (m[2] === 'b') n -= 1;
  const midi = n + (parseInt(m[3], 10) + 1) * 12;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/* ------------------------------------------------------------------ *
 *  Rendu des voix
 * ------------------------------------------------------------------ */

const HARMONICS = {
  sine: [1],
  tri: [1, 0, 0.22, 0, 0.12, 0, 0.07, 0, 0.05],
  saw: [1, 0.5, 0.33, 0.25, 0.2, 0.16, 0.14, 0.12, 0.11, 0.1, 0.09, 0.08, 0.07, 0.065, 0.06, 0.055],
  square: [1, 0, 0.33, 0, 0.2, 0, 0.14, 0, 0.11, 0, 0.09, 0, 0.077, 0, 0.067, 0],
  soft: [1, 0.4, 0.18, 0.08, 0.05, 0.03, 0.02, 0.014, 0.01, 0.007],
};

/**
 * Écrit une note polyphonique dans un buffer.
 */
function voice(buf, opt) {
  const {
    start, dur, freq, type = 'saw', gain = 0.2,
    atk = 0.01, dec = 0.12, sus = 0.7, rel = 0.25,
    cutoff = 8000, q = 0.9, cutoffEnd = null,
    vib = 0, vibHz = 5, detune = 0, pan = 0,
  } = opt;

  const s0 = Math.floor(start * SR);
  const total = dur + rel;
  const n = Math.ceil(total * SR) + 4;
  const f = freq;
  const harm = HARMONICS[type] || HARMONICS.saw;
  const svf = makeSVF();
  const nh = harm.length;

  for (let i = 0; i < n; i++) {
    const idx = s0 + i;
    if (idx < 0) continue;
    if (idx >= buf.length) break;
    const t = i / SR;
    const env = adsr(t, dur, atk, dec, sus, rel);
    if (env <= 0.0001) continue;

    let ff = f;
    if (vib) ff *= 1 + vib * Math.sin(TAU * vibHz * t);
    if (detune) ff *= Math.pow(2, detune / 1200);

    const ph = TAU * ff * t;
    let sample = 0;
    for (let h = 0; h < nh; h++) {
      const amp = harm[h];
      if (!amp) continue;
      sample += amp * Math.sin(ph * (h + 1));
    }
    sample /= nh * 0.55;

    const co = cutoffEnd === null ? cutoff : cutoff + (cutoffEnd - cutoff) * clamp(t / total, 0, 1);
    sample = svf(sample, co, q);
    sample *= env * gain;

    if (pan !== 0) {
      buf[idx] += sample * Math.cos((pan + 1) * Math.PI / 4);
    } else {
      buf[idx] += sample;
    }
  }
}

/** Batterie : grosse caisse */
function kick(buf, start, gain = 0.9) {
  const s0 = Math.floor(start * SR);
  const n = Math.floor(0.42 * SR);
  for (let i = 0; i < n; i++) {
    const idx = s0 + i;
    if (idx < 0 || idx >= buf.length) continue;
    const t = i / SR;
    const f = 48 + 105 * expDec(t, 0.035);
    const env = expDec(t, 0.11);
    let s = Math.sin(TAU * f * t) * env;
    s += (makeNoise(7)() * 0.5) * expDec(t, 0.004) * 0.25;
    buf[idx] += s * gain * 0.85;
  }
}

/** Batterie : caisse claire */
function snare(buf, start, gain = 0.5, noise = makeNoise(21)) {
  const s0 = Math.floor(start * SR);
  const n = Math.floor(0.3 * SR);
  const svf = makeSVF();
  for (let i = 0; i < n; i++) {
    const idx = s0 + i;
    if (idx < 0 || idx >= buf.length) continue;
    const t = i / SR;
    const env = expDec(t, 0.075);
    let s = svf(noise(), 2600, 1.6) * env * 0.9;
    s += Math.sin(TAU * 195 * t) * expDec(t, 0.05) * 0.4;
    buf[idx] += s * gain;
  }
}

/** Batterie : charleston */
function hat(buf, start, gain = 0.22, open = false, noise = makeNoise(33)) {
  const s0 = Math.floor(start * SR);
  const tau = open ? 0.14 : 0.022;
  const n = Math.floor((tau * 5) * SR);
  let prev = 0;
  for (let i = 0; i < n; i++) {
    const idx = s0 + i;
    if (idx < 0 || idx >= buf.length) continue;
    const t = i / SR;
    const raw = noise();
    const hp = raw - prev; // passe-haut approximé
    prev = raw * 0.6;
    buf[idx] += hp * expDec(t, tau) * gain;
  }
}

/** Caisse de résonance / toms */
function tom(buf, start, freq = 160, gain = 0.5) {
  const s0 = Math.floor(start * SR);
  const n = Math.floor(0.3 * SR);
  for (let i = 0; i < n; i++) {
    const idx = s0 + i;
    if (idx < 0 || idx >= buf.length) continue;
    const t = i / SR;
    buf[idx] += Math.sin(TAU * (freq + 40 * expDec(t, 0.03)) * t) * expDec(t, 0.09) * gain;
  }
}

/** Cymbale / balancier */
function ride(buf, start, gain = 0.14, noise = makeNoise(55)) {
  const s0 = Math.floor(start * SR);
  const n = Math.floor(1.1 * SR);
  const svf = makeSVF();
  for (let i = 0; i < n; i++) {
    const idx = s0 + i;
    if (idx < 0 || idx >= buf.length) continue;
    const t = i / SR;
    buf[idx] += svf(noise(), 5200, 1.2) * expDec(t, 0.35) * gain;
  }
}

/* ------------------------------------------------------------------ *
 *  Effets
 * ------------------------------------------------------------------ */

/** Réverbération de Schroeder (4 combs en parallèle + 2 passe-tout en série). */
function reverb(buf, mix, decay = 0.8) {
  const combs = [1557, 1617, 1491, 1422].map((d) => ({ buf: new Float32Array(d), i: 0, fb: decay, damp: 0 }));
  const aps = [225, 556].map((d) => ({ buf: new Float32Array(d), i: 0 }));
  const out = new Float32Array(buf.length);
  for (let i = 0; i < buf.length; i++) {
    const x = buf[i];
    let acc = 0;
    for (const c of combs) {
      const y = c.buf[c.i];
      c.buf[c.i] = x + y * c.fb;
      c.i = (c.i + 1) % c.buf.length;
      c.damp += (y - c.damp) * 0.4;
      acc += c.damp;
    }
    let v = acc * 0.25;
    for (const a of aps) {
      const y = a.buf[a.i];
      a.buf[a.i] = v + y * 0.5;
      a.i = (a.i + 1) % a.buf.length;
      v = y - v * 0.5;
    }
    out[i] = v;
  }
  for (let i = 0; i < buf.length; i++) buf[i] += out[i] * mix;
}

/** Écho avec réinjection filtrée. */
function delay(buf, time, fb, mix, damp = 0.3) {
  const d = Math.floor(time * SR);
  if (d < 1) return;
  const tmp = Float32Array.from(buf);
  let lp = 0;
  for (let i = d; i < buf.length; i++) {
    lp += (tmp[i - d] - lp) * (1 - damp);
    buf[i] += lp * fb * mix;
  }
}

/** Saturation douce + limiteur. */
function master(buf, peak = 0.89) {
  let max = 0;
  for (let i = 0; i < buf.length; i++) max = Math.max(max, Math.abs(buf[i]));
  const g = max > 0 ? peak / max : 1;
  for (let i = 0; i < buf.length; i++) buf[i] = Math.tanh(buf[i] * g * 1.15) * 0.9;
  // fondu début/fin pour éviter les clics
  const f = Math.floor(0.03 * SR);
  for (let i = 0; i < f; i++) {
    const k = i / f;
    buf[i] *= k;
    buf[buf.length - 1 - i] *= k;
  }
}

/* ------------------------------------------------------------------ *
 *  Écriture des fichiers
 * ------------------------------------------------------------------ */

function toInt16(buf) {
  const out = new Int16Array(buf.length);
  for (let i = 0; i < buf.length; i++) {
    out[i] = clamp(Math.round(buf[i] * 32767), -32768, 32767);
  }
  return out;
}

function writeWav(path, buf) {
  const data = toInt16(buf);
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length * 2, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SR, 24);
  header.writeUInt32LE(SR * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length * 2, 40);
  writeFileSync(path, Buffer.concat([header, Buffer.from(data.buffer)]));
}

export function writeAudio(name, buf, kbps = 112) {
  mkdirSync(OUT, { recursive: true });
  if (Mp3Encoder) {
    const enc = new Mp3Encoder(1, SR, kbps);
    const chunks = [];
    const pcm = toInt16(buf);
    const block = 1152;
    for (let i = 0; i < pcm.length; i += block) {
      const b = enc.encodeBuffer(pcm.subarray(i, Math.min(i + block, pcm.length)));
      if (b.length) chunks.push(Buffer.from(b));
    }
    const last = enc.flush();
    if (last.length) chunks.push(Buffer.from(last));
    writeFileSync(resolve(OUT, name + '.mp3'), Buffer.concat(chunks));
  } else {
    writeFileSync(resolve(OUT, name + '.wav'), wavBuffer(buf));
  }
}

function wavBuffer(buf) {
  const data = toInt16(buf);
  const header = Buffer.alloc(44);
  header.write('RIFF', 0); header.writeUInt32LE(36 + data.length * 2, 4); header.write('WAVE', 8);
  header.write('fmt ', 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22); header.writeUInt32LE(SR, 24); header.writeUInt32LE(SR * 2, 28);
  header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34);
  header.write('data', 36); header.writeUInt32LE(data.length * 2, 40);
  return Buffer.concat([header, Buffer.from(data.buffer)]);
}

/* ------------------------------------------------------------------ *
 *  Fabrique de pistes
 * ------------------------------------------------------------------ */

function alloc(seconds) {
  return new Float32Array(Math.ceil(seconds * SR));
}

/**
 * Piste ambient lente : nappe + arpège + basse douce.
 */
function ambient({ seconds, bpm, root, progression, arp = true, melody = null, padGain = 0.16, arpGain = 0.1, bassGain = 0.16, cutoff = 2600, rv = 0.5 }) {
  const buf = alloc(seconds);
  const spb = 60 / bpm;
  const beat = spb;
  const bar = beat * 4;
  const bars = Math.floor(seconds / bar);
  const chordProgression = progression;

  for (let b = 0; b < bars; b++) {
    const ch = chordProgression[b % chordProgression.length];
    const t0 = b * bar;
    // Nappe
    for (const f of ch.freqs) {
      voice(buf, {
        start: t0, dur: bar * 0.98, freq: f, type: 'soft', gain: padGain,
        atk: bar * 0.28, dec: 0.4, sus: 0.75, rel: bar * 0.5, cutoff, cutoffEnd: cutoff * 1.5, q: 0.7,
        detune: b % 2 ? 6 : -6,
      });
    }
    // Basse
    voice(buf, {
      start: t0, dur: bar * 0.9, freq: ch.freqs[0] / 2, type: 'tri', gain: bassGain,
      atk: 0.05, dec: 0.5, sus: 0.6, rel: 0.5, cutoff: 700,
    });
    // Arpège
    if (arp) {
      const notes = [...ch.freqs, ...ch.freqs.map((f) => f * 2)];
      const steps = 8;
      for (let i = 0; i < steps; i++) {
        const t = t0 + i * (bar / steps);
        if (t > seconds - 0.4) break;
        const f = notes[(i + b) % notes.length];
        voice(buf, {
          start: t, dur: bar / steps * 0.5, freq: f, type: 'tri', gain: arpGain * (i % 2 ? 0.7 : 1),
          atk: 0.006, dec: 0.09, sus: 0.25, rel: 0.18, cutoff: 3200, q: 1.1, pan: i % 2 ? 0.35 : -0.35,
        });
      }
    }
    // Mélodie (cloche)
    if (melody) {
      for (const ev of melody) {
        if (ev.bar === b % melody.length) {
          voice(buf, {
            start: t0 + ev.at * beat, dur: 0.5, freq: ev.f, type: 'sine', gain: 0.09,
            atk: 0.004, dec: 0.25, sus: 0.2, rel: 0.9, cutoff: 6000,
          });
        }
      }
    }
  }
  reverb(buf, rv);
  delay(buf, beat * 0.75, 0.32, 0.35, 0.4);
  master(buf);
  return buf;
}

/**
 * Piste rythmique : basse pulsée + arpège + batterie + lead.
 */
function rhythmic({ seconds, bpm, root, progression, style = 'pulse', drums = true, lead = null, cutoff = 4200 }) {
  const buf = alloc(seconds);
  const spb = 60 / bpm;
  const beat = spb;
  const bar = beat * 4;
  const bars = Math.floor(seconds / bar);
  const noise = makeNoise(1234);
  const gainScale = { pulse: 1, flow: 0.9, drive: 1.15, triumph: 1, ascend: 0.85 }[style] || 1;

  for (let b = 0; b < bars; b++) {
    const ch = progression[b % progression.length];
    const t0 = b * bar;
    // Nappe de fond discrète
    for (const f of ch.freqs) {
      voice(buf, {
        start: t0, dur: bar * 0.95, freq: f, type: 'saw', gain: 0.055 * gainScale,
        atk: 0.02, dec: 0.3, sus: 0.5, rel: 0.3, cutoff: cutoff * 0.55, q: 1.2,
      });
    }
    // Basse
    const pattern = style === 'drive' ? [0, 3, 6, 8, 11, 14] : style === 'flow' ? [0, 6, 10, 12, 14] : [0, 4, 8, 12];
    for (const step of pattern) {
      const t = t0 + step * (beat / 4);
      if (t > seconds - 0.3) break;
      const oct = step >= 12 ? 2 : 1;
      voice(buf, {
        start: t, dur: beat / 4 * 0.7, freq: (ch.freqs[0] / 2) * oct, type: style === 'drive' ? 'saw' : 'square',
        gain: 0.15 * gainScale, atk: 0.004, dec: 0.05, sus: 0.55, rel: 0.06, cutoff: style === 'drive' ? 1600 : 1100, q: 2.2,
      });
    }
    // Arpège
    const notes = [...ch.freqs, ch.freqs[1] * 2, ch.freqs[2] * 2, ch.freqs[1] * 2];
    const steps = style === 'drive' ? 16 : 16;
    for (let i = 0; i < steps; i++) {
      const t = t0 + i * (beat / 4);
      if (t > seconds - 0.3) break;
      const f = notes[(i + b * 2) % notes.length];
      const g = (style === 'drive' ? 0.06 : 0.075) * (i % 4 === 0 ? 1.25 : 0.85);
      voice(buf, {
        start: t, dur: beat / 4 * 0.6, freq: f, type: style === 'drive' ? 'saw' : 'square',
        gain: g * gainScale, atk: 0.003, dec: 0.04, sus: 0.3, rel: 0.05,
        cutoff: cutoff * (style === 'drive' ? 0.5 : 0.8), q: 1.6, pan: i % 2 ? 0.4 : -0.4,
      });
    }
    // Lead
    if (lead) {
      for (const ev of lead) {
        if (ev.bar === b % lead.length) {
          voice(buf, {
            start: t0 + ev.at * beat, dur: ev.len * beat, freq: ev.f, type: 'saw',
            gain: 0.1 * gainScale, atk: 0.02, dec: 0.12, sus: 0.7, rel: 0.2,
            cutoff: cutoff * 1.1, q: 1.4, detune: 8, vib: 0.004, vibHz: 5.5,
          });
        }
      }
    }
    // Batterie
    if (drums) {
      if (style === 'drive') {
        for (let i = 0; i < 8; i++) kick(buf, t0 + i * (beat / 2), 0.75);
        snare(buf, t0 + beat, 0.42, noise);
        snare(buf, t0 + 3 * beat, 0.42, noise);
        for (let i = 0; i < 8; i++) hat(buf, t0 + i * (beat / 2) + beat / 4, 0.15, false, noise);
        ride(buf, t0 + bar - 0.02, 0.1, noise);
      } else if (style === 'triumph') {
        kick(buf, t0, 0.7); kick(buf, t0 + 2 * beat, 0.7); kick(buf, t0 + 2 * beat + beat / 2, 0.4);
        snare(buf, t0 + beat, 0.4, noise); snare(buf, t0 + 3 * beat, 0.45, noise);
        for (let i = 0; i < 4; i++) hat(buf, t0 + i * beat + beat / 2, 0.16, false, noise);
        ride(buf, t0 + bar - 0.02, 0.12, noise);
      } else if (style === 'ascend') {
        kick(buf, t0, 0.6); kick(buf, t0 + 2 * beat, 0.55);
        snare(buf, t0 + 2 * beat, 0.3, noise);
        for (let i = 0; i < 8; i++) hat(buf, t0 + i * (beat / 2), 0.12, i % 4 === 3, noise);
      } else if (style === 'flow') {
        kick(buf, t0, 0.62); kick(buf, t0 + 2 * beat + beat / 2, 0.5);
        snare(buf, t0 + beat, 0.34, noise); snare(buf, t0 + 3 * beat, 0.34, noise);
        for (let i = 0; i < 8; i++) hat(buf, t0 + i * (beat / 2) + beat / 4, 0.11, false, noise);
      } else {
        kick(buf, t0, 0.6); kick(buf, t0 + 2 * beat, 0.55);
        snare(buf, t0 + beat, 0.32, noise); snare(buf, t0 + 3 * beat, 0.34, noise);
        for (let i = 0; i < 8; i++) hat(buf, t0 + i * (beat / 2) + beat / 4, 0.1, false, noise);
      }
    }
  }
  reverb(buf, 0.22);
  delay(buf, beat * 0.5, 0.24, 0.22, 0.45);
  master(buf);
  return buf;
}

/* ---------------------------- accords ---------------------------- */

function ch(rootName, degs, oct = 0) {
  // degs : liste de demi-tons depuis la fondamentale
  const base = note(rootName);
  return { freqs: degs.map((d) => base * Math.pow(2, (d + oct * 12) / 12)), root: rootName };
}

/* ---------------------------- effets sonores ---------------------------- */

function sfxClick() {
  const b = alloc(0.09);
  voice(b, { start: 0, dur: 0.02, freq: 1400, type: 'sine', gain: 0.5, atk: 0.001, dec: 0.03, sus: 0, rel: 0.04, cutoff: 5000 });
  voice(b, { start: 0, dur: 0.015, freq: 2600, type: 'sine', gain: 0.2, atk: 0.001, dec: 0.02, sus: 0, rel: 0.02, cutoff: 8000 });
  master(b, 0.7);
  return b;
}

function sfxCorrect() {
  const b = alloc(0.85);
  const ns = [note('C6'), note('E6'), note('G6')];
  ns.forEach((f, i) => {
    voice(b, { start: i * 0.055, dur: 0.12, freq: f, type: 'sine', gain: 0.42, atk: 0.003, dec: 0.14, sus: 0.2, rel: 0.35, cutoff: 9000 });
    voice(b, { start: i * 0.055, dur: 0.1, freq: f * 2, type: 'sine', gain: 0.1, atk: 0.003, dec: 0.1, sus: 0.1, rel: 0.2, cutoff: 12000 });
  });
  voice(b, { start: 0.14, dur: 0.4, freq: note('C5'), type: 'tri', gain: 0.16, atk: 0.01, dec: 0.3, sus: 0.3, rel: 0.3, cutoff: 3000 });
  reverb(b, 0.2);
  master(b, 0.82);
  return b;
}

function sfxWrong() {
  const b = alloc(0.6);
  const svf = makeSVF();
  const n = Math.floor(0.42 * SR);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 240 - 150 * clamp(t / 0.35, 0, 1);
    const saw = Math.sin(TAU * f * t) + 0.4 * Math.sin(TAU * f * 2 * t);
    const s = svf(saw, 1800 - 1200 * clamp(t / 0.35, 0, 1), 1.4);
    b[i] += s * expDec(t, 0.16) * 0.42;
  }
  voice(b, { start: 0.02, dur: 0.2, freq: 110, type: 'tri', gain: 0.22, atk: 0.005, dec: 0.2, sus: 0.3, rel: 0.2, cutoff: 500 });
  master(b, 0.78);
  return b;
}

function sfxLevelUp() {
  const b = alloc(1.6);
  const seq = ['C5', 'E5', 'G5', 'C6', 'E6', 'G6'];
  seq.forEach((nn, i) => {
    voice(b, { start: i * 0.085, dur: 0.14, freq: note(nn), type: 'tri', gain: 0.34, atk: 0.003, dec: 0.16, sus: 0.3, rel: 0.4, cutoff: 8000 });
  });
  voice(b, { start: 0.52, dur: 0.6, freq: note('C4'), type: 'saw', gain: 0.16, atk: 0.02, dec: 0.3, sus: 0.6, rel: 0.6, cutoff: 2200 });
  voice(b, { start: 0.52, dur: 0.6, freq: note('G4'), type: 'saw', gain: 0.12, atk: 0.02, dec: 0.3, sus: 0.6, rel: 0.6, cutoff: 2200 });
  reverb(b, 0.35);
  master(b, 0.86);
  return b;
}

function sfxBadge() {
  const b = alloc(1.3);
  const ns = [note('E6'), note('A6'), note('C#7'), note('E7')];
  ns.forEach((f, i) => {
    voice(b, { start: i * 0.07, dur: 0.1, freq: f, type: 'sine', gain: 0.3, atk: 0.002, dec: 0.2, sus: 0.2, rel: 0.5, cutoff: 14000 });
  });
  for (let i = 0; i < 5; i++) {
    voice(b, { start: 0.2 + i * 0.05, dur: 0.05, freq: note('A7') * (1 + i * 0.01), type: 'sine', gain: 0.09, atk: 0.001, dec: 0.05, sus: 0, rel: 0.15, cutoff: 16000 });
  }
  reverb(b, 0.4);
  master(b, 0.8);
  return b;
}

function sfxVictory() {
  const b = alloc(2.6);
  // motif de fanfare
  const motif = [['C5', 0, 0.5], ['E5', 0.16, 0.35], ['G5', 0.32, 0.35], ['C6', 0.5, 0.9], ['G5', 1.1, 0.3], ['C6', 1.3, 1.1]];
  for (const [nn, t, d] of motif) {
    voice(b, { start: t, dur: d * 0.7, freq: note(nn), type: 'saw', gain: 0.24, atk: 0.02, dec: 0.2, sus: 0.7, rel: 0.35, cutoff: 4200, q: 1.3, detune: 10 });
    voice(b, { start: t, dur: d * 0.7, freq: note(nn) / 2, type: 'tri', gain: 0.14, atk: 0.02, dec: 0.2, sus: 0.6, rel: 0.3, cutoff: 1200 });
  }
  const noise = makeNoise(99);
  snare(b, 0.5, 0.4, noise); snare(b, 1.3, 0.42, noise);
  kick(b, 0.5, 0.5); kick(b, 1.3, 0.5);
  for (let i = 0; i < 6; i++) hat(b, 0.5 + i * 0.16, 0.14, false, noise);
  reverb(b, 0.3);
  master(b, 0.88);
  return b;
}

function sfxPerfect() {
  const b = alloc(2.8);
  const notes = ['C5', 'E5', 'G5', 'B5', 'C6', 'E6', 'G6'];
  notes.forEach((nn, i) => {
    voice(b, { start: i * 0.07, dur: 0.2, freq: note(nn), type: 'sine', gain: 0.3, atk: 0.003, dec: 0.25, sus: 0.25, rel: 0.7, cutoff: 13000 });
    voice(b, { start: i * 0.07, dur: 0.15, freq: note(nn) * 2, type: 'sine', gain: 0.08, atk: 0.003, dec: 0.2, sus: 0.2, rel: 0.5, cutoff: 16000 });
  });
  const chord = ['C3', 'E3', 'G3', 'C4'];
  for (const nn of chord) {
    voice(b, { start: 0.5, dur: 1.6, freq: note(nn), type: 'saw', gain: 0.11, atk: 0.06, dec: 0.5, sus: 0.7, rel: 0.8, cutoff: 2600, q: 1 });
  }
  for (let i = 0; i < 10; i++) {
    voice(b, { start: 0.5 + i * 0.06, dur: 0.04, freq: note('G7') + i * 40, type: 'sine', gain: 0.06, atk: 0.001, dec: 0.04, sus: 0, rel: 0.12, cutoff: 18000 });
  }
  reverb(b, 0.45);
  master(b, 0.86);
  return b;
}

function sfxTick() {
  const b = alloc(0.12);
  voice(b, { start: 0, dur: 0.015, freq: 2000, type: 'square', gain: 0.24, atk: 0.001, dec: 0.02, sus: 0, rel: 0.02, cutoff: 6000 });
  master(b, 0.6);
  return b;
}

/* ------------------------------------------------------------------ *
 *  Exécution
 * ------------------------------------------------------------------ */

function buildAll() {
  console.log('[audio] Génération des pistes QuizVerse...');

  // 1. MENU — calme, moderne, ambient
  writeAudio('menu', ambient({
    seconds: 46, bpm: 84, root: 'A3',
    progression: [ch('A3', [0, 3, 7, 12]), ch('F3', [0, 4, 7, 11]), ch('C3', [0, 4, 7, 12]), ch('G3', [0, 4, 7, 10])],
    melody: [
      { bar: 0, at: 0, f: note('A5') }, { bar: 0, at: 2, f: note('C6') },
      { bar: 1, at: 1, f: note('C6') }, { bar: 1, at: 3, f: note('A5') },
      { bar: 2, at: 0, f: note('E6') }, { bar: 2, at: 2.5, f: note('G6') },
      { bar: 3, at: 1, f: note('D6') }, { bar: 3, at: 3, f: note('B5') },
    ],
    padGain: 0.17, arpGain: 0.1, bassGain: 0.17, cutoff: 2400, rv: 0.55,
  }), 112);
  console.log('  menu ✔');

  // 2. QUIZ 1 — dynamique mais discrète
  writeAudio('quiz-1', rhythmic({
    seconds: 40, bpm: 100, root: 'D3', style: 'pulse',
    progression: [ch('D3', [0, 3, 7, 10]), ch('Bb2', [0, 4, 7, 11]), ch('F3', [0, 4, 7, 11]), ch('C3', [0, 4, 7, 10])],
    lead: [
      { bar: 0, at: 2, len: 1, f: note('D5') }, { bar: 1, at: 1, len: 1, f: note('F5') },
      { bar: 2, at: 0, len: 1.5, f: note('C6') }, { bar: 3, at: 2, len: 1.5, f: note('A5') },
    ],
    cutoff: 4200,
  }), 112);
  console.log('  quiz-1 ✔');

  // 3. QUIZ 2 — second groove
  writeAudio('quiz-2', rhythmic({
    seconds: 41, bpm: 92, root: 'B2', style: 'flow',
    progression: [ch('B2', [0, 3, 7, 10]), ch('G2', [0, 4, 7, 10]), ch('D3', [0, 4, 7, 11]), ch('A2', [0, 4, 7, 10])],
    lead: [
      { bar: 0, at: 1.5, len: 0.5, f: note('B4') }, { bar: 0, at: 3, len: 0.5, f: note('D5') },
      { bar: 1, at: 0, len: 1, f: note('G5') }, { bar: 2, at: 2.5, len: 0.5, f: note('D6') },
      { bar: 3, at: 1, len: 1.5, f: note('C#6') },
    ],
    cutoff: 3800,
  }), 112);
  console.log('  quiz-2 ✔');

  // 4. INTENSE — mode difficile
  writeAudio('intense', rhythmic({
    seconds: 40, bpm: 128, root: 'E2', style: 'drive',
    progression: [ch('E2', [0, 3, 7, 10]), ch('C2', [0, 3, 7, 10]), ch('G2', [0, 4, 7, 10]), ch('D2', [0, 3, 7, 10])],
    lead: [
      { bar: 0, at: 0, len: 2, f: note('E5') }, { bar: 0, at: 2.5, len: 0.5, f: note('G5') },
      { bar: 1, at: 0, len: 2, f: note('C6') }, { bar: 2, at: 0, len: 1.5, f: note('G5') },
      { bar: 2, at: 2, len: 1, f: note('D6') }, { bar: 3, at: 0, len: 3, f: note('B5') },
    ],
    cutoff: 3000,
  }), 112);
  console.log('  intense ✔');

  // 5. VICTORY — résultats
  writeAudio('victory', rhythmic({
    seconds: 41, bpm: 112, root: 'C3', style: 'triumph',
    progression: [ch('C3', [0, 4, 7, 12]), ch('G2', [0, 4, 7, 12]), ch('A2', [0, 4, 7, 11]), ch('F2', [0, 4, 7, 11])],
    lead: [
      { bar: 0, at: 0, len: 2, f: note('C5') }, { bar: 0, at: 2, len: 2, f: note('E5') },
      { bar: 1, at: 0, len: 3, f: note('G5') }, { bar: 2, at: 0, len: 1.5, f: note('A5') },
      { bar: 2, at: 2, len: 2, f: note('C6') }, { bar: 3, at: 0, len: 4, f: note('C6') },
    ],
    cutoff: 5200,
  }), 112);
  console.log('  victory ✔');

  // 6. PERFECT — réussite parfaite
  writeAudio('perfect', rhythmic({
    seconds: 42, bpm: 118, root: 'F#3', style: 'ascend',
    progression: [ch('F#3', [0, 4, 7, 11]), ch('D3', [0, 4, 7, 11]), ch('A3', [0, 4, 7, 11]), ch('E3', [0, 4, 7, 11])],
    lead: [
      { bar: 0, at: 0, len: 1, f: note('F#5') }, { bar: 0, at: 1, len: 1, f: note('A5') },
      { bar: 1, at: 0, len: 1.5, f: note('D6') }, { bar: 1, at: 2.5, len: 1, f: note('F#6') },
      { bar: 2, at: 0, len: 2, f: note('A6') }, { bar: 3, at: 0, len: 4, f: note('C#7') },
    ],
    cutoff: 6000,
  }), 112);
  console.log('  perfect ✔');

  console.log('[audio] Génération des effets sonores...');
  const sfx = {
    'sfx-click': sfxClick, 'sfx-correct': sfxCorrect, 'sfx-wrong': sfxWrong,
    'sfx-levelup': sfxLevelUp, 'sfx-badge': sfxBadge, 'sfx-victory': sfxVictory,
    'sfx-perfect': sfxPerfect, 'sfx-tick': sfxTick,
  };
  for (const [name, fn] of Object.entries(sfx)) {
    writeAudio(name, fn(), 96);
    console.log('  ' + name + ' ✔');
  }
  console.log('[audio] Terminé →', OUT);
}

if (process.argv[1] && existsSync(process.argv[1])) {
  if (resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) buildAll();
}
