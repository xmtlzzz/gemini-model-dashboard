import type { HeatLevel, ReactionType } from '../types/lab';

class LabSoundEngine {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private ensureContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playDrop(atomicNumber = 10) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const baseFreq = 260 + Math.max(0, 120 - atomicNumber) * 2.4;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * 0.72, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.09);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.11, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);

    // Subtle glass clink harmonic
    const clink = ctx.createOscillator();
    const clinkGain = ctx.createGain();
    clink.type = 'triangle';
    clink.frequency.setValueAtTime(1780 + (atomicNumber % 12) * 45, now);
    clinkGain.gain.setValueAtTime(0.032, now);
    clinkGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.07);

    clink.connect(clinkGain);
    clinkGain.connect(ctx.destination);
    clink.start(now);
    clink.stop(now + 0.08);
  }

  public playRemove() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(190, now + 0.09);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  public playSelect() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [523.25, 659.25];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.055);
      gain.gain.setValueAtTime(0.001, now + i * 0.055);
      gain.gain.exponentialRampToValueAtTime(0.07, now + i * 0.055 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.055 + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.055);
      osc.stop(now + i * 0.055 + 0.17);
    });
  }

  public playHeat(heat: HeatLevel) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqMap: Record<HeatLevel, number> = { low: 290, medium: 390, high: 520 };
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freqMap[heat], now);
    osc.frequency.exponentialRampToValueAtTime(freqMap[heat] * 1.15, now + 0.06);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playBrewStart(reactionType: ReactionType) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const isDangerous = reactionType === 'explosion' || reactionType === 'volatile';
    const bubbleCount = reactionType === 'explosion' ? 13 : reactionType === 'boiling' ? 10 : 7;

    for (let i = 0; i < bubbleCount; i++) {
      const step = isDangerous ? 0.078 : 0.11;
      const t = now + i * step;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = isDangerous ? 'sawtooth' : 'sine';
      const f = (isDangerous ? 200 : 300) + i * (isDangerous ? 56 : 34) + Math.random() * 45;
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(f * 1.4, t + 0.065);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(isDangerous ? 0.048 : 0.055, t + 0.014);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.085);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.095);
    }

    // Rising pressure whine right before explosion!
    if (reactionType === 'explosion') {
      const whine = ctx.createOscillator();
      const wGain = ctx.createGain();
      whine.type = 'sawtooth';
      whine.frequency.setValueAtTime(140, now + 0.12);
      whine.frequency.exponentialRampToValueAtTime(980, now + 1.05);
      wGain.gain.setValueAtTime(0.001, now + 0.12);
      wGain.gain.exponentialRampToValueAtTime(0.065, now + 0.98);
      wGain.gain.exponentialRampToValueAtTime(0.001, now + 1.08);
      whine.connect(wGain);
      wGain.connect(ctx.destination);
      whine.start(now + 0.12);
      whine.stop(now + 1.1);
    }
  }

  public playExplosionBoom() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Deep sub-bass punch
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(125, now);
    sub.frequency.exponentialRampToValueAtTime(26, now + 0.65);
    subGain.gain.setValueAtTime(0.32, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.72);
    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start(now);
    sub.stop(now + 0.75);

    // 2. Filtered broadband noise blast wave
    const bufferSize = Math.floor(ctx.sampleRate * 1.15);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.34));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + 1.05);

    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.28, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 1.12);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(ctx.destination);
    noise.start(now);

    // 3. Glass shatter sparkles
    for (let i = 0; i < 6; i++) {
      const t = now + 0.04 + i * 0.055;
      const shard = ctx.createOscillator();
      const sGain = ctx.createGain();
      shard.type = 'triangle';
      shard.frequency.setValueAtTime(1900 + Math.random() * 2200, t);
      sGain.gain.setValueAtTime(0.035, t);
      sGain.gain.exponentialRampToValueAtTime(0.0005, t + 0.14);
      shard.connect(sGain);
      sGain.connect(ctx.destination);
      shard.start(t);
      shard.stop(t + 0.15);
    }
  }

  public playEasterEggUnlock() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Shimmering 5-note Google Gemini crystalline arpeggio
    const notes = [523.25, 659.25, 783.99, 987.77, 1318.5];
    notes.forEach((freq, i) => {
      const t = now + i * 0.065;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.075, t + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0006, t + 0.52);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.55);
    });
  }

  public playBrewComplete(rarity: string) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const chord =
      rarity === 'radioactive'
        ? [369.99, 466.16, 554.37, 739.99]
        : rarity === 'legendary'
          ? [523.25, 659.25, 783.99, 1046.5]
          : [440, 554.37, 659.25, 880];

    chord.forEach((freq, i) => {
      const t = now + i * 0.05;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.075, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.55);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.58);
    });
  }
}

export const labSound = new LabSoundEngine();
