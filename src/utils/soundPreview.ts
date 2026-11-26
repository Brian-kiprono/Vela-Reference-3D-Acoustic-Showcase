/**
 * Lightweight Web Audio API spatial acoustic chord synthesizer for auditioning soundstage.
 */
class AcousticPreviewEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private isPlaying = false;

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    }
    this.start();
    return true;
  }

  public start(): void {
    if (this.isPlaying) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = this.ctx ?? new AudioCtx();
    this.ctx = ctx;

    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.65);
    master.connect(ctx.destination);
    this.masterGain = master;

    // Warm studio major-9th harmonic chord (A2, E3, B3, C#4, G#4)
    const freqs = [110, 164.81, 246.94, 277.18, 415.3];
    const pans = [-0.45, -0.2, 0.0, 0.25, 0.45];

    this.oscillators = freqs.map((freq, idx) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const panner = ctx.createStereoPanner();
      const oscGain = ctx.createGain();

      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);

      panner.pan.setValueAtTime(pans[idx], ctx.currentTime);
      oscGain.gain.setValueAtTime(idx === 0 ? 0.35 : 0.16, ctx.currentTime);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(panner);
      panner.connect(master);

      osc.start();
      return osc;
    });

    this.isPlaying = true;
  }

  public stop(): void {
    if (!this.isPlaying || !this.ctx || !this.masterGain) {
      this.isPlaying = false;
      return;
    }

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(Math.max(this.masterGain.gain.value, 0.0001), now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    const oldOscs = this.oscillators;
    this.oscillators = [];
    this.isPlaying = false;

    window.setTimeout(() => {
      oldOscs.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // Ignore already stopped oscillators
        }
      });
    }, 380);
  }
}

export const acousticPreview = new AcousticPreviewEngine();
