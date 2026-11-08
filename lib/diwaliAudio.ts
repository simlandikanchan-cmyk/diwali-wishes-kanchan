export type Sfx = "chime" | "sparkle" | "whoosh";

type AudioContextCtor = typeof AudioContext;

const STEP_DURATION = 0.9;

const SCALE = [293.66, 329.63, 369.99, 440.0, 493.88, 587.33];

const MELODY = [
  0, -1, 2, 4, -1, 3, 2, -1, 4, -1, 5, 4, 2, -1, 1, -1, 3, -1, 5, 4, 2, -1, 0,
  -1, 2, 4, -1, 3, 2, -1, 1, -1,
];

const CHORDS = [
  [0, 2, 3],
  [1, 3, 5],
  [0, 2, 4],
  [1, 3, 4],
];

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  const legacy = window as Window & { webkitAudioContext?: AudioContextCtor };
  return window.AudioContext ?? legacy.webkitAudioContext ?? null;
}

export class DiwaliAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private pad: GainNode | null = null;
  private melody: GainNode | null = null;
  private sources: AudioScheduledSourceNode[] = [];
  private enabled = false;
  private disposed = false;
  private step = 0;
  private nextNoteTime = 0;
  private timer: number | null = null;

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
    this.nextNoteTime = now + 0.15;
    this.step = 0;
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
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
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
    this.pad = null;
    this.melody = null;
  }

  private buildAmbience(): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(ctx.destination);

    const music = ctx.createGain();
    music.gain.value = 0.8;
    music.connect(master);

    const pad = ctx.createGain();
    pad.gain.value = 0.6;
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = 1150;
    padFilter.Q.value = 0.6;
    pad.connect(padFilter);
    padFilter.connect(music);

    const melody = ctx.createGain();
    melody.gain.value = 0.55;
    melody.connect(music);

    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.32;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.26;
    const wet = ctx.createGain();
    wet.gain.value = 0.22;
    melody.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(music);

    const drone = ctx.createGain();
    drone.gain.value = 0.5;
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = "lowpass";
    droneFilter.frequency.value = 420;
    drone.connect(droneFilter);
    droneFilter.connect(music);

    const voices: Array<[number, number, OscillatorType, number]> = [
      [73.42, 0.32, "sine", -3],
      [110, 0.18, "sine", 4],
      [146.83, 0.08, "triangle", -6],
      [220, 0.035, "sine", 2],
    ];

    voices.forEach(([frequency, gain, type, detune]) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = frequency;
      osc.detune.value = detune;

      const voiceGain = ctx.createGain();
      voiceGain.gain.value = gain;

      osc.connect(voiceGain);
      voiceGain.connect(drone);
      osc.start();
      this.sources.push(osc);
    });

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.045;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 220;
    lfo.connect(lfoGain);
    lfoGain.connect(padFilter.frequency);
    lfo.start();
    this.sources.push(lfo);

    this.master = master;
    this.pad = pad;
    this.melody = melody;

    this.nextNoteTime = ctx.currentTime + 0.2;
    this.timer = window.setInterval(() => this.tick(), 120);
  }

  private tick(): void {
    const ctx = this.ctx;
    if (!ctx || !this.enabled || this.disposed) return;

    if (this.nextNoteTime < ctx.currentTime - 1) {
      this.nextNoteTime = ctx.currentTime + 0.05;
    }

    const horizon = ctx.currentTime + 0.5;
    while (this.nextNoteTime < horizon) {
      this.scheduleStep(this.step, this.nextNoteTime);
      this.step = (this.step + 1) % MELODY.length;
      this.nextNoteTime += STEP_DURATION;
    }
  }

  private scheduleStep(step: number, time: number): void {
    const noteIndex = MELODY[step];
    if (noteIndex >= 0) {
      this.pluck(SCALE[noteIndex], time);
    }

    if (step % 8 === 0) {
      const chord = CHORDS[Math.floor(step / 8) % CHORDS.length];
      this.swell(chord, time);
    }
  }

  private pluck(frequency: number, time: number): void {
    const ctx = this.ctx;
    const melody = this.melody;
    if (!ctx || !melody) return;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = frequency;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.12, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.7);

    osc.connect(gain);
    gain.connect(melody);
    osc.start(time);
    osc.stop(time + 1.8);

    const harmonic = ctx.createOscillator();
    harmonic.type = "triangle";
    harmonic.frequency.value = frequency * 2.004;

    const harmonicGain = ctx.createGain();
    harmonicGain.gain.setValueAtTime(0.0001, time);
    harmonicGain.gain.exponentialRampToValueAtTime(0.025, time + 0.012);
    harmonicGain.gain.exponentialRampToValueAtTime(0.0001, time + 1.1);

    harmonic.connect(harmonicGain);
    harmonicGain.connect(melody);
    harmonic.start(time);
    harmonic.stop(time + 1.2);
  }

  private swell(chord: number[], time: number): void {
    const ctx = this.ctx;
    const pad = this.pad;
    if (!ctx || !pad) return;

    const length = STEP_DURATION * 8;
    const attack = 1.6;
    const release = 2.4;
    const holdUntil = time + Math.max(attack, length - release);

    chord.forEach((noteIndex, index) => {
      const osc = ctx.createOscillator();
      osc.type = index % 2 === 0 ? "sine" : "triangle";
      osc.frequency.value = SCALE[noteIndex] / 2;
      osc.detune.value = (index - 1) * 4;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(0.055, time + attack);
      gain.gain.setValueAtTime(0.055, holdUntil);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + length);

      osc.connect(gain);
      gain.connect(pad);
      osc.start(time);
      osc.stop(time + length + 0.1);
    });
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
