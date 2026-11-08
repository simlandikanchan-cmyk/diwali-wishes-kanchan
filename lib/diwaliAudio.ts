export type Sfx = "chime" | "sparkle" | "whoosh";

type AudioContextCtor = typeof AudioContext;

const STEP_DURATION = 1.05;

const SCALE = [293.66, 329.63, 369.99, 440.0, 493.88, 587.33];

const MELODY = [
  0, -1, 2, 4, -1, 3, 2, -1,
  4, -1, 5, 4, 2, -1, 1, -1,
  3, 2, 4, -1, 5, 4, -1, 2,
  4, 3, 2, -1, 1, -1, 0, -1,
  2, 4, 5, -1, 4, 2, 3, -1,
  1, 2, -1, 3, 2, 1, -1, -1,
];

const CHORDS: number[][] = [
  [146.83, 220.0, 293.66],
  [164.81, 246.94, 329.63],
  [185.0, 246.94, 369.99],
  [220.0, 293.66, 440.0],
];

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  const legacy = window as Window & { webkitAudioContext?: AudioContextCtor };
  return window.AudioContext ?? legacy.webkitAudioContext ?? null;
}

function createReverbImpulse(
  ctx: AudioContext,
  duration: number,
  decay: number,
): AudioBuffer {
  const rate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(rate * duration));
  const impulse = ctx.createBuffer(2, length, rate);

  for (let channel = 0; channel < 2; channel += 1) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      const t = i / length;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
    }
  }

  return impulse;
}

function createAirBuffer(ctx: AudioContext): AudioBuffer {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * 4);
  const buffer = ctx.createBuffer(1, length, rate);
  const data = buffer.getChannelData(0);
  let last = 0;

  for (let i = 0; i < length; i += 1) {
    last = last * 0.985 + (Math.random() * 2 - 1) * 0.03;
    data[i] = last;
  }

  return buffer;
}

export class DiwaliAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private music: GainNode | null = null;
  private pad: GainNode | null = null;
  private melody: GainNode | null = null;
  private reverbSend: GainNode | null = null;
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
    this.master?.gain.setTargetAtTime(0.62, now, 0.4);
    this.nextNoteTime = now + 0.15;
    this.step = 0;
  }

  disable(): void {
    this.enabled = false;
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(0.0001, now, 0.18);
  }

  play(kind: Sfx): void {
    if (!this.enabled || !this.ctx || !this.master) return;
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }

    if (kind === "chime") {
      this.bell([783.99, 1046.5, 1318.51], 0.11, 0.09, 1.7);
    } else if (kind === "sparkle") {
      this.bell([1567.98, 2093.0, 2637.02, 3135.96, 2637.02], 0.06, 0.06, 0.9);
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
    this.music = null;
    this.pad = null;
    this.melody = null;
    this.reverbSend = null;
  }

  private buildAmbience(): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const master = ctx.createGain();
    master.gain.value = 0.0001;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.knee.value = 26;
    compressor.ratio.value = 2.4;
    compressor.attack.value = 0.02;
    compressor.release.value = 0.35;
    master.connect(compressor);
    compressor.connect(ctx.destination);

    const music = ctx.createGain();
    music.gain.value = 0.82;
    music.connect(master);

    const reverb = ctx.createConvolver();
    reverb.buffer = createReverbImpulse(ctx, 3.2, 2.5);
    const reverbReturn = ctx.createGain();
    reverbReturn.gain.value = 0.5;
    reverb.connect(reverbReturn);
    reverbReturn.connect(master);

    const reverbSend = ctx.createGain();
    reverbSend.gain.value = 0.38;
    reverbSend.connect(reverb);

    const pad = ctx.createGain();
    pad.gain.value = 0.55;
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = 1050;
    padFilter.Q.value = 0.4;
    pad.connect(padFilter);
    padFilter.connect(music);
    const padSend = ctx.createGain();
    padSend.gain.value = 0.5;
    padFilter.connect(padSend);
    padSend.connect(reverbSend);

    const melody = ctx.createGain();
    melody.gain.value = 0.5;
    melody.connect(music);
    const melodySend = ctx.createGain();
    melodySend.gain.value = 0.32;
    melody.connect(melodySend);
    melodySend.connect(reverbSend);

    const delay = ctx.createDelay(1.5);
    delay.delayTime.value = 0.42;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.24;
    const wet = ctx.createGain();
    wet.gain.value = 0.17;
    melody.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(music);

    const drone = ctx.createGain();
    drone.gain.value = 0.4;
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = "lowpass";
    droneFilter.frequency.value = 460;
    drone.connect(droneFilter);
    droneFilter.connect(music);
    const droneSend = ctx.createGain();
    droneSend.gain.value = 0.22;
    droneFilter.connect(droneSend);
    droneSend.connect(reverbSend);

    const voices: Array<[number, number, OscillatorType, number, number]> = [
      [73.42, 0.3, "sine", -4, -0.18],
      [110, 0.16, "sine", 3, 0.16],
      [146.83, 0.09, "triangle", -7, -0.1],
      [196, 0.05, "sine", 5, 0.22],
      [293.66, 0.022, "sine", 2, 0],
    ];

    voices.forEach(([frequency, gain, type, detune, pan], index) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = frequency;
      osc.detune.value = detune;

      const voiceGain = ctx.createGain();
      voiceGain.gain.value = gain;

      const tremolo = ctx.createOscillator();
      tremolo.type = "sine";
      tremolo.frequency.value = 0.045 + index * 0.011;
      const tremoloGain = ctx.createGain();
      tremoloGain.gain.value = gain * 0.32;
      tremolo.connect(tremoloGain);
      tremoloGain.connect(voiceGain.gain);
      tremolo.start();
      this.sources.push(tremolo);

      const panner = ctx.createStereoPanner();
      panner.pan.value = pan;

      osc.connect(voiceGain);
      voiceGain.connect(panner);
      panner.connect(drone);
      osc.start();
      this.sources.push(osc);
    });

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 240;
    lfo.connect(lfoGain);
    lfoGain.connect(padFilter.frequency);
    lfo.start();
    this.sources.push(lfo);

    const air = ctx.createBufferSource();
    air.buffer = createAirBuffer(ctx);
    air.loop = true;
    const airFilter = ctx.createBiquadFilter();
    airFilter.type = "lowpass";
    airFilter.frequency.value = 900;
    const airGain = ctx.createGain();
    airGain.gain.value = 0.05;
    air.connect(airFilter);
    airFilter.connect(airGain);
    airGain.connect(music);
    air.start();
    this.sources.push(air);

    this.master = master;
    this.music = music;
    this.pad = pad;
    this.melody = melody;
    this.reverbSend = reverbSend;

    this.nextNoteTime = ctx.currentTime + 0.2;
    this.timer = window.setInterval(() => this.tick(), 120);
  }

  private tick(): void {
    const ctx = this.ctx;
    if (!ctx || !this.enabled || this.disposed) return;

    if (this.nextNoteTime < ctx.currentTime - 1) {
      this.nextNoteTime = ctx.currentTime + 0.05;
    }

    const horizon = ctx.currentTime + 0.6;
    while (this.nextNoteTime < horizon) {
      this.scheduleStep(this.step, this.nextNoteTime);
      this.step = (this.step + 1) % MELODY.length;
      this.nextNoteTime += STEP_DURATION;
    }
  }

  private scheduleStep(step: number, time: number): void {
    const noteIndex = MELODY[step];
    if (noteIndex >= 0) {
      const velocity = 0.7 + Math.random() * 0.3;
      const pan = (step % 2 === 0 ? -1 : 1) * 0.16;
      this.pluck(SCALE[noteIndex], time, velocity, pan);
    }

    if (step % 8 === 0) {
      const chord = CHORDS[Math.floor(step / 8) % CHORDS.length];
      this.swell(chord, time);
      this.pluck(SCALE[0] / 2, time + 0.02, 0.32, -0.24);
      this.pluck(SCALE[3] / 2, time + STEP_DURATION * 2, 0.26, 0.24);
    }

    if (step % 16 === 12) {
      this.pluck(SCALE[5] * 2, time, 0.2, 0.3);
    }
  }

  private pluck(
    frequency: number,
    time: number,
    velocity: number,
    pan: number,
  ): void {
    const ctx = this.ctx;
    const melody = this.melody;
    if (!ctx || !melody) return;

    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;
    panner.connect(melody);

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = frequency;

    const gain = ctx.createGain();
    const peak = Math.max(0.001, 0.1 * velocity);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(peak, time + 0.014);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 2.2);

    osc.connect(gain);
    gain.connect(panner);
    osc.start(time);
    osc.stop(time + 2.3);

    const harmonic = ctx.createOscillator();
    harmonic.type = "triangle";
    harmonic.frequency.value = frequency * 2.004;

    const harmonicGain = ctx.createGain();
    harmonicGain.gain.setValueAtTime(0.0001, time);
    harmonicGain.gain.exponentialRampToValueAtTime(peak * 0.3, time + 0.014);
    harmonicGain.gain.exponentialRampToValueAtTime(0.0001, time + 1.1);

    harmonic.connect(harmonicGain);
    harmonicGain.connect(panner);
    harmonic.start(time);
    harmonic.stop(time + 1.2);
  }

  private swell(chord: number[], time: number): void {
    const ctx = this.ctx;
    const pad = this.pad;
    if (!ctx || !pad) return;

    const length = STEP_DURATION * 8;
    const attack = 1.9;
    const release = 3.2;
    const holdUntil = time + Math.max(attack, length - release);

    chord.forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      osc.type = index % 2 === 0 ? "sine" : "triangle";
      osc.frequency.value = frequency;
      osc.detune.value = (index - 1) * 4;

      const gain = ctx.createGain();
      const peak = 0.042;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(peak, time + attack);
      gain.gain.setValueAtTime(peak, holdUntil);
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
      if (this.reverbSend) gain.connect(this.reverbSend);
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
      if (this.reverbSend) harmonicGain.connect(this.reverbSend);
      harmonic.start(start);
      harmonic.stop(start + decay);
    });
  }

  private whoosh(): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;

    const now = ctx.currentTime;
    const duration = 0.8;
    const frameCount = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < frameCount; i += 1) {
      const t = i / frameCount;
      data[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * t);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const bandPass = ctx.createBiquadFilter();
    bandPass.type = "bandpass";
    bandPass.Q.value = 1.1;
    bandPass.frequency.setValueAtTime(320, now);
    bandPass.frequency.exponentialRampToValueAtTime(2600, now + 0.6);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.09);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(bandPass);
    bandPass.connect(gain);
    gain.connect(master);
    if (this.reverbSend) gain.connect(this.reverbSend);
    source.start(now);
    source.stop(now + duration);
  }
}
