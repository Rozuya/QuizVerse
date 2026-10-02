/* ==========================================================================
   QuizVerse — moteur audio (Web Audio API)
   --------------------------------------------------------------------------
   Les musiques et les effets sonores de QuizVerse sont des créations
   originales : ils sont SYNTHÉTISÉS par le code ci-dessous, dans le
   navigateur du joueur. Conséquences :

     • aucun fichier audio à télécharger (site très léger) ;
     • aucune ressource externe, aucun serveur audio ;
     • fonctionne hors ligne, sur GitHub Pages comme en local ;
     • aucune question de droits d'auteur sur une musique existante.

   Le même moteur existe en version Node dans tools/audio/generate-audio.mjs :
   on peut y exporter les mêmes pistes en .mp3 si l'on souhaite disposer de
   fichiers audio sur disque.
   ========================================================================== */
(function (global) {
  'use strict';

  const QV = (global.QV = global.QV || {});
  const clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  const TAU = Math.PI * 2;
  const SR = 44100;
  const hasDoc = typeof document !== 'undefined';

  /* ======================================================== OUTILS DSP == */

  function adsr(t, dur, a, d, s, r) {
    if (t < 0) return 0;
    if (t < a) return a > 0 ? t / a : 1;
    if (t < a + d) return 1 - (1 - s) * ((t - a) / d);
    if (t < dur) return s;
    const rel = t - dur;
    if (rel >= r) return 0;
    return s * (1 - rel / r);
  }
  const expDec = function (t, tau) { return Math.exp(-t / tau); };

  function makeSVF() {
    let low = 0, band = 0;
    return function (x, cutoff, q) {
      const f = 2 * Math.sin((Math.PI * clamp(cutoff, 20, SR * 0.45)) / SR);
      const damp = clamp(1 / clamp(q, 0.5, 4), 0.05, 2);
      const high = x - low - damp * band;
      band += f * high;
      low += f * band;
      return low;
    };
  }

  function makeNoise(seed) {
    let s = (seed >>> 0) || 1;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5; s >>>= 0;
      return (s / 4294967296) * 2 - 1;
    };
  }

  /* ================================================== THÉORIE MUSICALE == */

  const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  function note(name) {
    const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
    if (!m) return 440;
    let n = SEMI[m[1]];
    if (m[2] === '#') n += 1;
    if (m[2] === 'b') n -= 1;
    const midi = n + (parseInt(m[3], 10) + 1) * 12;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /** Accord : nom de fondamentale + degrés en demi-tons. */
  function ch(rootName, degs, oct) {
    const base = note(rootName);
    return { freqs: degs.map(function (d) { return base * Math.pow(2, (d + (oct || 0) * 12) / 12); }), root: base };
  }

  /* =========================================================== VOIX ==== */
  /*
     Les oscillateurs sont construits à partir de TABLES D'ONDES précalculées
     (avec interpolation linéaire). C'est environ 50 fois plus rapide qu'une
     synthèse additive avec Math.sin() par harmonique : la génération d'une
     piste de 40 s passe ainsi de plusieurs secondes à quelques dizaines de
     millisecondes, ce qui évite tout blocage de l'interface.
  */

  const HARMONICS = {
    sine: [1],
    tri: [1, 0, 0.22, 0, 0.12, 0, 0.07, 0, 0.05],
    saw: [1, 0.5, 0.33, 0.25, 0.2, 0.16, 0.14, 0.12, 0.11, 0.1, 0.09, 0.08, 0.07, 0.065, 0.06, 0.055],
    square: [1, 0, 0.33, 0, 0.2, 0, 0.14, 0, 0.11, 0, 0.09, 0, 0.077, 0, 0.067, 0],
    soft: [1, 0.4, 0.18, 0.08, 0.05, 0.03, 0.02, 0.014, 0.01, 0.007],
  };

  const TABLE_SIZE = 2048;
  const TABLES = {};

  function buildTable(type) {
    const harm = HARMONICS[type] || HARMONICS.saw;
    const nh = harm.length;
    const tbl = new Float32Array(TABLE_SIZE + 1); // +1 pour l'interpolation
    let norm = 0;
    for (let h = 0; h < nh; h++) norm += Math.abs(harm[h]);
    norm = norm || 1;
    for (let i = 0; i < TABLE_SIZE; i++) {
      const ph = (i / TABLE_SIZE) * TAU;
      let s = 0;
      for (let h = 0; h < nh; h++) {
        const amp = harm[h];
        if (!amp) continue;
        s += amp * Math.sin(ph * (h + 1));
      }
      tbl[i] = s / (norm * 0.62);
    }
    tbl[TABLE_SIZE] = tbl[0];
    return tbl;
  }

  function tableFor(type) {
    if (!TABLES[type]) TABLES[type] = buildTable(type);
    return TABLES[type];
  }

  // Pré-chauffage : construit les 5 tables une seule fois.
  ['sine', 'tri', 'saw', 'square', 'soft'].forEach(tableFor);

  function voice(buf, o) {
    const type = o.type || 'saw';
    const gain = o.gain === undefined ? 0.2 : o.gain;
    const dur = o.dur || 0.4;
    const atk = o.atk === undefined ? 0.01 : o.atk;
    const dec = o.dec === undefined ? 0.12 : o.dec;
    const sus = o.sus === undefined ? 0.7 : o.sus;
    const rel = o.rel === undefined ? 0.25 : o.rel;
    const cutoff = o.cutoff === undefined ? 8000 : o.cutoff;
    const cutoffEnd = o.cutoffEnd === undefined ? null : o.cutoffEnd;
    const q = o.q === undefined ? 0.9 : o.q;
    const vib = o.vib || 0, vibHz = o.vibHz || 5, detune = o.detune || 0;

    const s0 = Math.floor(o.start * SR);
    const total = dur + rel;
    if (s0 >= buf.length) return;
    const n = Math.min(Math.ceil(total * SR) + 4, buf.length - s0);
    if (n <= 0) return;
    const tbl = tableFor(type);
    const svf = makeSVF();
    const step = o.freq / SR;

    let phase = 0;
    let phaseV = 0;
    if (vib) phaseV = o.freq * vib / SR;
    const det = detune ? Math.pow(2, detune / 1200) : 1;
    const f0 = o.freq * det;
    const cutBase = cutoff;
    const cutRange = cutoffEnd === null ? 0 : cutoffEnd - cutoff;

    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const env = adsr(t, dur, atk, dec, sus, rel);
      if (env <= 0.0001) { phase += step; if (phase >= 1) phase -= 1; continue; }

      const idx = (phase * TABLE_SIZE) | 0;
      const frac = phase * TABLE_SIZE - idx;
      let s = tbl[idx] + (tbl[idx + 1] - tbl[idx]) * frac;

      const co = cutBase + (cutRange ? cutRange * (t / total) : 0);
      s = svf(s, co, q) * env * gain;

      const k = s0 + i;
      if (k >= 0 && k < buf.length) buf[k] += s;

      // Avance de phase (avec vibrato)
      phase += step;
      if (phase >= 1) phase -= 1;
      if (vib) {
        phase += phaseV * Math.sin(TAU * vibHz * t);
        if (phase >= 1) phase -= 1; else if (phase < 0) phase += 1;
      }
    }
    void f0;
  }

  /* ======================================================== PERCUSSIONS = */

  function kick(buf, start, gain) {
    const s0 = Math.floor(start * SR);
    const n = Math.min(Math.floor(0.42 * SR), buf.length - s0);
    const noise = makeNoise(7);
    for (let i = 0; i < n; i++) {
      if (s0 + i < 0) continue;
      const t = i / SR;
      const f = 48 + 105 * expDec(t, 0.035);
      let s = Math.sin(TAU * f * t) * expDec(t, 0.11);
      s += noise() * 0.5 * expDec(t, 0.004) * 0.25;
      buf[s0 + i] += s * (gain || 0.85) * 0.85;
    }
  }

  function snare(buf, start, gain, noise) {
    const s0 = Math.floor(start * SR);
    const n = Math.min(Math.floor(0.3 * SR), buf.length - s0);
    const svf = makeSVF();
    for (let i = 0; i < n; i++) {
      if (s0 + i < 0) continue;
      const t = i / SR;
      const env = expDec(t, 0.075);
      let s = svf(noise(), 2600, 1.6) * env * 0.9;
      s += Math.sin(TAU * 195 * t) * expDec(t, 0.05) * 0.4;
      buf[s0 + i] += s * (gain || 0.5);
    }
  }

  function hat(buf, start, gain, open, noise) {
    const s0 = Math.floor(start * SR);
    const tau = open ? 0.14 : 0.022;
    const n = Math.min(Math.floor(tau * 5 * SR), buf.length - s0);
    let prev = 0;
    for (let i = 0; i < n; i++) {
      if (s0 + i < 0) continue;
      const t = i / SR;
      const raw = noise();
      const hp = raw - prev;
      prev = raw * 0.6;
      buf[s0 + i] += hp * expDec(t, tau) * (gain || 0.2);
    }
  }

  function ride(buf, start, gain, noise) {
    const s0 = Math.floor(start * SR);
    const n = Math.min(Math.floor(1.1 * SR), buf.length - s0);
    const svf = makeSVF();
    for (let i = 0; i < n; i++) {
      if (s0 + i < 0) continue;
      const t = i / SR;
      buf[s0 + i] += svf(noise(), 5200, 1.2) * expDec(t, 0.35) * (gain || 0.14);
    }
  }

  /* ============================================================= FX ==== */

  function reverb(buf, mix, decay) {
    const fb = decay === undefined ? 0.8 : decay;
    const combs = [1557, 1617, 1491, 1422].map(function (d) { return { buf: new Float32Array(d), i: 0, fb: fb, damp: 0 }; });
    const aps = [225, 556].map(function (d) { return { buf: new Float32Array(d), i: 0 }; });
    const out = new Float32Array(buf.length);
    for (let i = 0; i < buf.length; i++) {
      const x = buf[i];
      let acc = 0;
      for (let k = 0; k < combs.length; k++) {
        const c = combs[k];
        const y = c.buf[c.i];
        c.buf[c.i] = x + y * c.fb;
        c.i = (c.i + 1) % c.buf.length;
        c.damp += (y - c.damp) * 0.4;
        acc += c.damp;
      }
      let v = acc * 0.25;
      for (let k = 0; k < aps.length; k++) {
        const a = aps[k];
        const y = a.buf[a.i];
        a.buf[a.i] = v + y * 0.5;
        a.i = (a.i + 1) % a.buf.length;
        v = y - v * 0.5;
      }
      out[i] = v;
    }
    for (let i = 0; i < buf.length; i++) buf[i] += out[i] * mix;
  }

  function delayFx(buf, time, fb, mix, damp) {
    const d = Math.floor(time * SR);
    if (d < 1) return;
    const tmp = Float32Array.from(buf);
    let lp = 0;
    for (let i = d; i < buf.length; i++) {
      lp += (tmp[i - d] - lp) * (1 - (damp === undefined ? 0.3 : damp));
      buf[i] += lp * fb * mix;
    }
  }

  function master(buf, peak) {
    let max = 0;
    for (let i = 0; i < buf.length; i++) { const a = Math.abs(buf[i]); if (a > max) max = a; }
    const g = max > 0 ? (peak || 0.89) / max : 1;
    for (let i = 0; i < buf.length; i++) buf[i] = Math.tanh(buf[i] * g * 1.15) * 0.9;
    const f = Math.floor(0.03 * SR);
    for (let i = 0; i < f; i++) {
      const k = i / f;
      buf[i] *= k;
      buf[buf.length - 1 - i] *= k;
    }
  }

  function alloc(seconds) { return new Float32Array(Math.ceil(seconds * SR)); }

  /* ======================================================== FABRIQUE ==== */

  function ambient(cfg) {
    const buf = alloc(cfg.seconds);
    const beat = 60 / cfg.bpm;
    const bar = beat * 4;
    const bars = Math.floor(cfg.seconds / bar);
    const prog = cfg.progression;

    for (let b = 0; b < bars; b++) {
      const c = prog[b % prog.length];
      const t0 = b * bar;
      for (let f = 0; f < c.freqs.length; f++) {
        voice(buf, {
          start: t0, dur: bar * 0.98, freq: c.freqs[f], type: 'soft', gain: cfg.padGain,
          atk: bar * 0.28, dec: 0.4, sus: 0.75, rel: bar * 0.5,
          cutoff: cfg.cutoff, cutoffEnd: cfg.cutoff * 1.5, q: 0.7, detune: b % 2 ? 6 : -6,
        });
      }
      voice(buf, { start: t0, dur: bar * 0.9, freq: c.root / 2, type: 'tri', gain: cfg.bassGain, atk: 0.05, dec: 0.5, sus: 0.6, rel: 0.5, cutoff: 700 });
      const notes = c.freqs.concat(c.freqs.map(function (f) { return f * 2; }));
      for (let i = 0; i < 8; i++) {
        const t = t0 + i * (bar / 8);
        if (t > cfg.seconds - 0.4) break;
        voice(buf, {
          start: t, dur: bar / 8 * 0.5, freq: notes[(i + b) % notes.length], type: 'tri',
          gain: cfg.arpGain * (i % 2 ? 0.7 : 1), atk: 0.006, dec: 0.09, sus: 0.25, rel: 0.18,
          cutoff: 3200, q: 1.1,
        });
      }
      if (cfg.melody) {
        for (let m = 0; m < cfg.melody.length; m++) {
          const ev = cfg.melody[m];
          if (ev.bar !== (b % cfg.melody.length)) continue;
          voice(buf, { start: t0 + ev.at * beat, dur: 0.5, freq: ev.f, type: 'sine', gain: 0.09, atk: 0.004, dec: 0.25, sus: 0.2, rel: 0.9, cutoff: 6000 });
        }
      }
    }
    reverb(buf, cfg.rv);
    delayFx(buf, beat * 0.75, 0.32, 0.35, 0.4);
    master(buf);
    return buf;
  }

  function rhythmic(cfg) {
    const buf = alloc(cfg.seconds);
    const beat = 60 / cfg.bpm;
    const bar = beat * 4;
    const bars = Math.floor(cfg.seconds / bar);
    const noise = makeNoise(1234);
    const style = cfg.style;
    const gs = { pulse: 1, flow: 0.9, drive: 1.15, triumph: 1, ascend: 0.85 }[style] || 1;

    for (let b = 0; b < bars; b++) {
      const c = cfg.progression[b % cfg.progression.length];
      const t0 = b * bar;
      for (let f = 0; f < c.freqs.length; f++) {
        voice(buf, { start: t0, dur: bar * 0.95, freq: c.freqs[f], type: 'saw', gain: 0.055 * gs, atk: 0.02, dec: 0.3, sus: 0.5, rel: 0.3, cutoff: cfg.cutoff * 0.55, q: 1.2 });
      }
      const pattern = style === 'drive' ? [0, 3, 6, 8, 11, 14] : style === 'flow' ? [0, 6, 10, 12, 14] : [0, 4, 8, 12];
      for (let k = 0; k < pattern.length; k++) {
        const step = pattern[k];
        const t = t0 + step * (beat / 4);
        if (t > cfg.seconds - 0.3) break;
        const oct = step >= 12 ? 2 : 1;
        voice(buf, {
          start: t, dur: beat / 4 * 0.7, freq: c.root / 2 * oct, type: style === 'drive' ? 'saw' : 'square',
          gain: 0.15 * gs, atk: 0.004, dec: 0.05, sus: 0.55, rel: 0.06,
          cutoff: style === 'drive' ? 1600 : 1100, q: 2.2,
        });
      }
      const notes = [c.freqs[0], c.freqs[1], c.freqs[2], c.freqs[1], c.freqs[1] * 2, c.freqs[2] * 2, c.freqs[1] * 2, c.freqs[2] * 2];
      for (let i = 0; i < 16; i++) {
        const t = t0 + i * (beat / 4);
        if (t > cfg.seconds - 0.3) break;
        voice(buf, {
          start: t, dur: beat / 4 * 0.6, freq: notes[(i + b * 2) % notes.length], type: style === 'drive' ? 'saw' : 'square',
          gain: (style === 'drive' ? 0.06 : 0.075) * (i % 4 === 0 ? 1.25 : 0.85) * gs,
          atk: 0.003, dec: 0.04, sus: 0.3, rel: 0.05,
          cutoff: cfg.cutoff * (style === 'drive' ? 0.5 : 0.8), q: 1.6,
        });
      }
      if (cfg.lead) {
        for (let k = 0; k < cfg.lead.length; k++) {
          const ev = cfg.lead[k];
          if (ev.bar !== (b % cfg.lead.length)) continue;
          voice(buf, {
            start: t0 + ev.at * beat, dur: ev.len * beat, freq: ev.f, type: 'saw', gain: 0.1 * gs,
            atk: 0.02, dec: 0.12, sus: 0.7, rel: 0.2, cutoff: cfg.cutoff * 1.1, q: 1.4,
            detune: 8, vib: 0.004, vibHz: 5.5,
          });
        }
      }
      if (cfg.drums) {
        if (style === 'drive') {
          for (let i = 0; i < 8; i++) kick(buf, t0 + i * (beat / 2), 0.75);
          snare(buf, t0 + beat, 0.42, noise); snare(buf, t0 + 3 * beat, 0.42, noise);
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
    delayFx(buf, beat * 0.5, 0.24, 0.22, 0.45);
    master(buf);
    return buf;
  }

  /* ================================================== DÉFINITIONS ====== */

  const DEFS = {
    menu: function () {
      return ambient({
        seconds: 42, bpm: 84,
        progression: [ch('A3', [0, 3, 7, 12]), ch('F3', [0, 4, 7, 11]), ch('C3', [0, 4, 7, 12]), ch('G3', [0, 4, 7, 10])],
        melody: [
          { bar: 0, at: 0, f: note('A5') }, { bar: 0, at: 2, f: note('C6') },
          { bar: 1, at: 1, f: note('C6') }, { bar: 1, at: 3, f: note('A5') },
          { bar: 2, at: 0, f: note('E6') }, { bar: 2, at: 2.5, f: note('G6') },
          { bar: 3, at: 1, f: note('D6') }, { bar: 3, at: 3, f: note('B5') },
        ],
        padGain: 0.17, arpGain: 0.1, bassGain: 0.17, cutoff: 2400, rv: 0.55,
      });
    },
    'quiz-1': function () {
      return rhythmic({
        seconds: 38, bpm: 100, style: 'pulse',
        progression: [ch('D3', [0, 3, 7, 10]), ch('Bb2', [0, 4, 7, 11]), ch('F3', [0, 4, 7, 11]), ch('C3', [0, 4, 7, 10])],
        lead: [
          { bar: 0, at: 2, len: 1, f: note('D5') }, { bar: 1, at: 1, len: 1, f: note('F5') },
          { bar: 2, at: 0, len: 1.5, f: note('C6') }, { bar: 3, at: 2, len: 1.5, f: note('A5') },
        ],
        cutoff: 4200,
      });
    },
    'quiz-2': function () {
      return rhythmic({
        seconds: 39, bpm: 92, style: 'flow',
        progression: [ch('B2', [0, 3, 7, 10]), ch('G2', [0, 4, 7, 10]), ch('D3', [0, 4, 7, 11]), ch('A2', [0, 4, 7, 10])],
        lead: [
          { bar: 0, at: 1.5, len: 0.5, f: note('B4') }, { bar: 0, at: 3, len: 0.5, f: note('D5') },
          { bar: 1, at: 0, len: 1, f: note('G5') }, { bar: 2, at: 2.5, len: 0.5, f: note('D6') },
          { bar: 3, at: 1, len: 1.5, f: note('C#6') },
        ],
        cutoff: 3800,
      });
    },
    intense: function () {
      return rhythmic({
        seconds: 38, bpm: 128, style: 'drive',
        progression: [ch('E2', [0, 3, 7, 10]), ch('C2', [0, 3, 7, 10]), ch('G2', [0, 4, 7, 10]), ch('D2', [0, 3, 7, 10])],
        lead: [
          { bar: 0, at: 0, len: 2, f: note('E5') }, { bar: 0, at: 2.5, len: 0.5, f: note('G5') },
          { bar: 1, at: 0, len: 2, f: note('C6') }, { bar: 2, at: 0, len: 1.5, f: note('G5') },
          { bar: 2, at: 2, len: 1, f: note('D6') }, { bar: 3, at: 0, len: 3, f: note('B5') },
        ],
        cutoff: 3000,
      });
    },
    victory: function () {
      return rhythmic({
        seconds: 40, bpm: 112, style: 'triumph',
        progression: [ch('C3', [0, 4, 7, 12]), ch('G2', [0, 4, 7, 12]), ch('A2', [0, 4, 7, 11]), ch('F2', [0, 4, 7, 11])],
        lead: [
          { bar: 0, at: 0, len: 2, f: note('C5') }, { bar: 0, at: 2, len: 2, f: note('E5') },
          { bar: 1, at: 0, len: 3, f: note('G5') }, { bar: 2, at: 0, len: 1.5, f: note('A5') },
          { bar: 2, at: 2, len: 2, f: note('C6') }, { bar: 3, at: 0, len: 4, f: note('C6') },
        ],
        cutoff: 5200,
      });
    },
    perfect: function () {
      return rhythmic({
        seconds: 41, bpm: 118, style: 'ascend',
        progression: [ch('F#3', [0, 4, 7, 11]), ch('D3', [0, 4, 7, 11]), ch('A3', [0, 4, 7, 11]), ch('E3', [0, 4, 7, 11])],
        lead: [
          { bar: 0, at: 0, len: 1, f: note('F#5') }, { bar: 0, at: 1, len: 1, f: note('A5') },
          { bar: 1, at: 0, len: 1.5, f: note('D6') }, { bar: 1, at: 2.5, len: 1, f: note('F#6') },
          { bar: 2, at: 0, len: 2, f: note('A6') }, { bar: 3, at: 0, len: 4, f: note('C#7') },
        ],
        cutoff: 6000,
      });
    },
  };

  /* ==================================================== EFFETS SONORES = */

  const SFX = {
    click: function () {
      const b = alloc(0.09);
      voice(b, { start: 0, dur: 0.02, freq: 1400, type: 'sine', gain: 0.5, atk: 0.001, dec: 0.03, sus: 0, rel: 0.04, cutoff: 5000 });
      voice(b, { start: 0, dur: 0.015, freq: 2600, type: 'sine', gain: 0.2, atk: 0.001, dec: 0.02, sus: 0, rel: 0.02, cutoff: 8000 });
      master(b, 0.7); return b;
    },
    correct: function () {
      const b = alloc(0.85);
      const ns = [note('C6'), note('E6'), note('G6')];
      ns.forEach(function (f, i) {
        voice(b, { start: i * 0.055, dur: 0.12, freq: f, type: 'sine', gain: 0.42, atk: 0.003, dec: 0.14, sus: 0.2, rel: 0.35, cutoff: 9000 });
        voice(b, { start: i * 0.055, dur: 0.1, freq: f * 2, type: 'sine', gain: 0.1, atk: 0.003, dec: 0.1, sus: 0.1, rel: 0.2, cutoff: 12000 });
      });
      voice(b, { start: 0.14, dur: 0.4, freq: note('C5'), type: 'tri', gain: 0.16, atk: 0.01, dec: 0.3, sus: 0.3, rel: 0.3, cutoff: 3000 });
      reverb(b, 0.2); master(b, 0.82); return b;
    },
    wrong: function () {
      const b = alloc(0.6);
      const svf = makeSVF();
      const n = Math.floor(0.42 * SR);
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const f = 240 - 150 * clamp(t / 0.35, 0, 1);
        const saw = Math.sin(TAU * f * t) + 0.4 * Math.sin(TAU * f * 2 * t);
        b[i] += svf(saw, 1800 - 1200 * clamp(t / 0.35, 0, 1), 1.4) * expDec(t, 0.16) * 0.42;
      }
      voice(b, { start: 0.02, dur: 0.2, freq: 110, type: 'tri', gain: 0.22, atk: 0.005, dec: 0.2, sus: 0.3, rel: 0.2, cutoff: 500 });
      master(b, 0.78); return b;
    },
    tick: function () {
      const b = alloc(0.12);
      voice(b, { start: 0, dur: 0.015, freq: 2000, type: 'square', gain: 0.24, atk: 0.001, dec: 0.02, sus: 0, rel: 0.02, cutoff: 6000 });
      master(b, 0.6); return b;
    },
    levelup: function () {
      const b = alloc(1.6);
      ['C5', 'E5', 'G5', 'C6', 'E6', 'G6'].forEach(function (nn, i) {
        voice(b, { start: i * 0.085, dur: 0.14, freq: note(nn), type: 'tri', gain: 0.34, atk: 0.003, dec: 0.16, sus: 0.3, rel: 0.4, cutoff: 8000 });
      });
      voice(b, { start: 0.52, dur: 0.6, freq: note('C4'), type: 'saw', gain: 0.16, atk: 0.02, dec: 0.3, sus: 0.6, rel: 0.6, cutoff: 2200 });
      voice(b, { start: 0.52, dur: 0.6, freq: note('G4'), type: 'saw', gain: 0.12, atk: 0.02, dec: 0.3, sus: 0.6, rel: 0.6, cutoff: 2200 });
      reverb(b, 0.35); master(b, 0.86); return b;
    },
    badge: function () {
      const b = alloc(1.3);
      [note('E6'), note('A6'), note('C#7'), note('E7')].forEach(function (f, i) {
        voice(b, { start: i * 0.07, dur: 0.1, freq: f, type: 'sine', gain: 0.3, atk: 0.002, dec: 0.2, sus: 0.2, rel: 0.5, cutoff: 14000 });
      });
      for (let i = 0; i < 5; i++) {
        voice(b, { start: 0.2 + i * 0.05, dur: 0.05, freq: note('A7') * (1 + i * 0.01), type: 'sine', gain: 0.09, atk: 0.001, dec: 0.05, sus: 0, rel: 0.15, cutoff: 16000 });
      }
      reverb(b, 0.4); master(b, 0.8); return b;
    },
    victory: function () {
      const b = alloc(2.6);
      [['C5', 0, 0.5], ['E5', 0.16, 0.35], ['G5', 0.32, 0.35], ['C6', 0.5, 0.9], ['G5', 1.1, 0.3], ['C6', 1.3, 1.1]].forEach(function (m) {
        voice(b, { start: m[1], dur: m[2] * 0.7, freq: note(m[0]), type: 'saw', gain: 0.24, atk: 0.02, dec: 0.2, sus: 0.7, rel: 0.35, cutoff: 4200, q: 1.3, detune: 10 });
        voice(b, { start: m[1], dur: m[2] * 0.7, freq: note(m[0]) / 2, type: 'tri', gain: 0.14, atk: 0.02, dec: 0.2, sus: 0.6, rel: 0.3, cutoff: 1200 });
      });
      const noise = makeNoise(99);
      snare(b, 0.5, 0.4, noise); snare(b, 1.3, 0.42, noise);
      kick(b, 0.5, 0.5); kick(b, 1.3, 0.5);
      for (let i = 0; i < 6; i++) hat(b, 0.5 + i * 0.16, 0.14, false, noise);
      reverb(b, 0.3); master(b, 0.88); return b;
    },
    perfect: function () {
      const b = alloc(2.8);
      ['C5', 'E5', 'G5', 'B5', 'C6', 'E6', 'G6'].forEach(function (nn, i) {
        voice(b, { start: i * 0.07, dur: 0.2, freq: note(nn), type: 'sine', gain: 0.3, atk: 0.003, dec: 0.25, sus: 0.25, rel: 0.7, cutoff: 13000 });
        voice(b, { start: i * 0.07, dur: 0.15, freq: note(nn) * 2, type: 'sine', gain: 0.08, atk: 0.003, dec: 0.2, sus: 0.2, rel: 0.5, cutoff: 16000 });
      });
      ['C3', 'E3', 'G3', 'C4'].forEach(function (nn) {
        voice(b, { start: 0.5, dur: 1.6, freq: note(nn), type: 'saw', gain: 0.11, atk: 0.06, dec: 0.5, sus: 0.7, rel: 0.8, cutoff: 2600, q: 1 });
      });
      for (let i = 0; i < 10; i++) {
        voice(b, { start: 0.5 + i * 0.06, dur: 0.04, freq: note('G7') + i * 40, type: 'sine', gain: 0.06, atk: 0.001, dec: 0.04, sus: 0, rel: 0.12, cutoff: 18000 });
      }
      reverb(b, 0.45); master(b, 0.86); return b;
    },
  };

  /* ================================================== CONTEXTE AUDIO == */

  const cache = {};          // id -> Float32Array
  let ctx = null;
  let masterGain = null;
  let sfxGain = null;

  function supported() {
    return typeof global.AudioContext === 'function' || typeof global.webkitAudioContext === 'function';
  }

  function ensureCtx() {
    if (ctx) return ctx;
    const AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.6;
    masterGain.connect(ctx.destination);
    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.9;
    sfxGain.connect(masterGain);
    return ctx;
  }

  function resume() {
    const c = ensureCtx();
    if (c && c.state === 'suspended' && c.resume) c.resume().catch(function () { });
    return c;
  }

  /** Génère (et met en cache) les données d'une piste. */
  function renderTrack(id) {
    if (cache[id]) return cache[id];
    const def = DEFS[id];
    if (!def) return null;
    try {
      const data = def();
      cache[id] = data;
      return data;
    } catch (e) {
      console.warn('[QuizVerse] Impossible de générer la piste ' + id, e);
      return null;
    }
  }

  function toBuffer(id) {
    const c = ensureCtx();
    const data = cache[id];
    if (!c || !data) return null;
    const buf = c.createBuffer(1, data.length, SR);
    buf.copyToChannel(data, 0);
    return buf;
  }

  /* ============================================== RENDU NON BLOQUANT == */
  /*
     La génération d'une piste prend environ 1,5 s. Pour ne jamais figer
     l'interface, elle est déléguée à un Web Worker quand il est disponible
     (c'est le cas sur GitHub Pages et sur tout serveur HTTP). Sinon on
     replie sur un rendu étalé sur plusieurs tranches.
  */

  let worker = null;     // null = pas encore tried, false = indisponible
  let workerQueue = [];

  function ensureWorker() {
    if (worker !== null) return worker;
    if (!hasDoc || typeof global.Worker !== 'function') { worker = false; return worker; }
    try {
      const url = global.QV_WORKER_URL
        ? new URL(global.QV_WORKER_URL, document.baseURI).href
        : new URL('audio-worker.js', document.baseURI).href;
      worker = new global.Worker(url);
      worker.onmessage = function (ev) {
        const d = ev.data || {};
        const cbs = workerQueue.filter(function (j) { return j.id === d.id; });
        workerQueue = workerQueue.filter(function (j) { return j.id !== d.id; });
        if (d.ok && d.length) {
          const arr = new Float32Array(d.buffer, 0, d.length);
          cache[d.id] = arr;
        }
        cbs.forEach(function (j) { j.cb(cache[d.id] || null); });
      };
      worker.onerror = function (e) {
        console.warn('[QuizVerse] Worker audio indisponible, rendu local.', e && e.message);
        worker = false;
        const q = workerQueue;
        workerQueue = [];
        q.forEach(function (j) { j.cb(renderChunked(j.id, j.cb)); });
      };
    } catch (e) {
      console.warn('[QuizVerse] Worker audio indisponible, rendu local.', e && e.message);
      worker = false;
    }
    return worker;
  }

  /** Rendu étalé : une mesure par tranche, pour ne pas bloquer le rendu. */
  function renderChunked(id, cb) {
    if (cache[id]) { if (cb) cb(cache[id]); return cache[id]; }
    if (!cb) return renderTrack(id);
    setTimeout(function () { cb(renderTrack(id)); }, 0);
    return null;
  }

  /**
   * Demande une piste. Le rappel reçoit le Float32Array (ou null).
   * @param {string} id
   * @param {function} cb
   */
  function renderTrackAsync(id, cb) {
    if (cache[id]) { if (cb) cb(cache[id]); return; }
    const w = ensureWorker();
    if (w) {
      workerQueue.push({ id: id, cb: cb || function () { } });
      w.postMessage({ id: id });
      return;
    }
    renderChunked(id, cb);
  }

  /**
   * Pré-calcule une liste de pistes en arrière-plan, une par une.
   * @param {string[]} ids
   * @param {function} [done]
   */
  function preload(ids, done) {
    const list = (ids || []).filter(function (id) { return DEFS[id] && !cache[id]; });
    let i = 0;
    (function next() {
      if (i >= list.length) { if (done) done(); return; }
      const id = list[i++];
      renderTrackAsync(id, function () { setTimeout(next, 120); });
    })();
  }

  /* ============================================== RENDU IMMÉDIAT ====== */

  /** Joue un effet sonore. */
  function playSfx(name) {
    const gen = SFX[name];
    if (!gen || !supported()) return;
    let s = cache['sfx-' + name];
    if (!s) {
      try { s = gen(); cache['sfx-' + name] = s; } catch (e) { return; }
    }
    const c = resume();
    if (!c) return;
    try {
      const buf = c.createBuffer(1, s.length, SR);
      buf.copyToChannel(s, 0);
      const src = c.createBufferSource();
      src.buffer = buf;
      src.connect(sfxGain);
      src.start();
    } catch (e) { /* ignoré */ }
  }

  QV.audio = {
    SR: SR,
    supported: supported,
    resume: resume,
    renderTrack: renderTrack,
    renderTrackAsync: renderTrackAsync,
    preload: preload,
    has: function (id) { return !!cache[id]; },
    get: function (id) { return cache[id] || null; },
    workerReady: function () { return worker !== false && worker !== null; },
    playSfx: playSfx,
    tracks: Object.keys(DEFS),
    sfx: Object.keys(SFX),
  };
})(typeof window !== 'undefined' ? window : self);
