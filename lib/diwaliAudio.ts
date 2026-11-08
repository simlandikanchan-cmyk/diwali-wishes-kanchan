export type Sfx = "chime" | "sparkle" | "whoosh";

type AudioContextCtor = typeof AudioContext;

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  const legacy = window as Window & { webkitAudioContext?: AudioContextCtor };
  return window.AudioContext ?? legacy.webkitAudioContext ?? null;
}

export class DiwaliAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sources: AudioScheduledSourceNode[] = [];
  private enabled = false;
  private disposed = false;

  async enable(): Promise<void> {
    if (this.disposed) return;

    if (!this.ctx) {
      const Ctor = getAudioContextCtor();
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.buildAmbience();
    }

    if (this.ctx.state === "suspended") {
      try {
        await this.ctx.resume();
      } catch {
        return;
      }
    }

    this.enabled = true;
    const now = this.ctx.currentTime;
    this.master?.gain.cancelScheduledValues(now);
    this.master?.gain.setTargetAtTime(0.75, now, 0.25);
  }

  disable(): void {
    this.enabled = false;
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(0.0001, now, 0.12);
  }

  play(kind: Sfx): void {
    if (!this.enabled || !this.ctx || !this.master) return;
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }

    if (kind === "chime") {
      this.bell([783.99, 1046.5, 1318.51], 0.13, 0.085, 1.5);
    } else if (kind === "sparkle") {
      this.bell([1567.98, 2093.0, 2637.02, 3135.96, 2637.02], 0.07, 0.055, 0.85);
    } else {
      this.whoosh();
    }
  }

  dispose(): void {
    this.disposed = true;
    this.enabled = false;
    this.sources.forEach((source) => {
      try {
        source.stop();
      } catch {
        // already stopped
      }
    });
    this.sources = [];
    if (this.ctx) {
      void this.ctx.close().catch(() => undefined);
      this.ctx = null;
    }
    this.master = null;
  }

  private buildAmbience(): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 760;
    filter.Q.value = 0.8;

    const ambient = ctx.createGain();
    ambient.gain.value = 0.16;

    filter.connect(ambient);
    ambient.connect(master);

    const voices: Array<[number, number, OscillatorType, number]> = [
      [110, 0.24, "sine", -5],
      [164.81, 0.15, "sine", 4],
      [220, 0.07, "triangle", -2],
    ];

    voices.forEach(([frequency, gain, type, detune]) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = frequency;
      osc.detune.value = detune;

      const voiceGain = ctx.createGain();
      voiceGain.gain.value = gain;

      osc.connect(voiceGain);
      voiceGain.connect(filter);
      osc.start();
      this.sources.push(osc);
    });

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.055;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    this.sources.push(lfo);

    this.master = master;
  }

  private bell(
    frequencies: number[],
    peak: number,
    spacing: number,
    decay: number,
  ): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;

    const now = ctx.currentTime;

    frequencies.forEach((frequency, index) => {
      const start = now + index * spacing;

      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = frequency;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + decay);

      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + decay + 0.05);

      const harmonic = ctx.createOscillator();
      harmonic.type = "triangle";
      harmonic.frequency.value = frequency * 2.005;

      const harmonicGain = ctx.createGain();
      harmonicGain.gain.setValueAtTime(0.0001, start);
      harmonicGain.gain.exponentialRampToValueAtTime(peak * 0.22, start + 0.02);
      harmonicGain.gain.exponentialRampToValueAtTime(
        0.0001,
        start + decay * 0.6,
      );

      harmonic.connect(harmonicGain);
      harmonicGain.connect(master);
      harmonic.start(start);
      harmonic.stop(start + decay);
    });
  }

  private whoosh(): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;

    const now = ctx.currentTime;
    const duration = 0.7;
    const frameCount = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < frameCount; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / frameCount);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const bandPass = ctx.createBiquadFilter();
    bandPass.type = "bandpass";
    bandPass.Q.value = 1.1;
    bandPass.frequency.setValueAtTime(300, now);
    bandPass.frequency.exponentialRampToValueAtTime(2400, now + 0.55);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(bandPass);
    bandPass.connect(gain);
    gain.connect(master);
    source.start(now);
    source.stop(now + duration);
  }
}
