import { AmbientSoundType } from '../types';

class AmbientAudioService {
  private audioCtx: AudioContext | null = null;
  private currentType: AmbientSoundType = 'none';
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private isMuted: boolean = false;
  private currentVolume: number = 0.35;

  private initContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(this.currentVolume, this.audioCtx.currentTime);
        this.masterGain.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setVolume(vol: number) {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.linearRampToValueAtTime(
        this.isMuted ? 0 : this.currentVolume,
        this.audioCtx.currentTime + 0.1
      );
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.setVolume(this.currentVolume);
    return this.isMuted;
  }

  public getCurrentType(): AmbientSoundType {
    return this.currentType;
  }

  public playSound(type: AmbientSoundType) {
    this.stopCurrent();
    this.currentType = type;
    if (type === 'none') return;

    this.initContext();
    if (!this.audioCtx || !this.masterGain) return;

    switch (type) {
      case 'rain':
        this.startRain();
        break;
      case 'library':
        this.startLibrary();
        break;
      case 'night':
        this.startNight();
        break;
      case 'cafe':
        this.startCafe();
        break;
      case 'piano':
        this.startPiano();
        break;
      case 'waves':
        this.startWaves();
        break;
      case 'fireplace':
        this.startFireplace();
        break;
      case 'forest':
        this.startForest();
        break;
    }
  }

  public stopCurrent() {
    // Clear scheduled intervals/timeouts
    this.activeNodes.forEach((node) => {
      if (typeof node === 'number') {
        window.clearInterval(node);
        window.clearTimeout(node);
      } else if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
        try {
          (node as AudioScheduledSourceNode).stop();
        } catch {}
      } else if ('disconnect' in node) {
        try {
          node.disconnect();
        } catch {}
      }
    });
    this.activeNodes = [];
    this.currentType = 'none';
  }

  // Pink noise generator for soothing rain
  private createNoiseBuffer(durationSeconds = 5): AudioBuffer | null {
    if (!this.audioCtx) return null;
    const bufferSize = this.audioCtx.sampleRate * durationSeconds;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  private startRain() {
    if (!this.audioCtx || !this.masterGain) return;

    const noiseBuffer = this.createNoiseBuffer(4);
    if (!noiseBuffer) return;

    // Loop noise
    const noiseSource = this.audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Filter for rain frequencies
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.audioCtx.currentTime);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.4, this.audioCtx.currentTime);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noiseSource.start();

    this.activeNodes.push(noiseSource, filter, gain);

    // Random raindrops
    const dropInterval = window.setInterval(() => {
      if (!this.audioCtx || !this.masterGain || this.currentType !== 'rain') return;
      const osc = this.audioCtx.createOscillator();
      const dropGain = this.audioCtx.createGain();
      osc.type = 'sine';
      const freq = 1200 + Math.random() * 2000;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + 0.08);

      dropGain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      dropGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

      osc.connect(dropGain);
      dropGain.connect(this.masterGain);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.09);
    }, 180);

    this.activeNodes.push(dropInterval);
  }

  private startLibrary() {
    if (!this.audioCtx || !this.masterGain) return;
    // Low ambient room hum + warm fireplace rustle
    const noiseBuffer = this.createNoiseBuffer(5);
    if (!noiseBuffer) return;

    const noiseSource = this.audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, this.audioCtx.currentTime);
    filter.Q.setValueAtTime(0.8, this.audioCtx.currentTime);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noiseSource.start();

    this.activeNodes.push(noiseSource, filter, gain);
  }

  private startNight() {
    if (!this.audioCtx || !this.masterGain) return;

    // Soft wind pad
    const noiseBuffer = this.createNoiseBuffer(6);
    if (!noiseBuffer) return;

    const windSource = this.audioCtx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, this.audioCtx.currentTime);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);

    windSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    windSource.start();

    this.activeNodes.push(windSource, filter, gain);

    // Subtle cricket chirps
    const chirpInterval = window.setInterval(() => {
      if (!this.audioCtx || !this.masterGain || this.currentType !== 'night') return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const chirpGain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(4200, now);
      osc.frequency.setValueAtTime(4600, now + 0.03);

      chirpGain.gain.setValueAtTime(0.02, now);
      chirpGain.gain.linearRampToValueAtTime(0.001, now + 0.08);

      osc.connect(chirpGain);
      chirpGain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.09);
    }, 1200);

    this.activeNodes.push(chirpInterval);
  }

  private startCafe() {
    if (!this.audioCtx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(5);
    if (!noiseBuffer) return;

    const cafeSource = this.audioCtx.createBufferSource();
    cafeSource.buffer = noiseBuffer;
    cafeSource.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.audioCtx.currentTime);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.18, this.audioCtx.currentTime);

    cafeSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    cafeSource.start();

    this.activeNodes.push(cafeSource, filter, gain);
  }

  private startPiano() {
    if (!this.audioCtx || !this.masterGain) return;

    // Gentle ambient pentatonic chords
    const chordNotes = [261.63, 329.63, 392.00, 493.88, 523.25, 659.25]; // C4, E4, G4, B4, C5, E5
    const pianoInterval = window.setInterval(() => {
      if (!this.audioCtx || !this.masterGain || this.currentType !== 'piano') return;
      const note = chordNotes[Math.floor(Math.random() * chordNotes.length)];
      const now = this.audioCtx.currentTime;

      const osc = this.audioCtx.createOscillator();
      const noteGain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note, now);

      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.12, now + 0.15);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 3.6);
    }, 2800);

    this.activeNodes.push(pianoInterval);
  }

  private startWaves() {
    if (!this.audioCtx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(8);
    if (!noiseBuffer) return;

    const noiseSource = this.audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, this.audioCtx.currentTime);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noiseSource.start();

    this.activeNodes.push(noiseSource, filter, gain);

    // Periodic wave ebb and flow LFO simulation
    const waveInterval = window.setInterval(() => {
      if (!this.audioCtx || !this.masterGain || this.currentType !== 'waves') return;
      const now = this.audioCtx.currentTime;
      filter.frequency.linearRampToValueAtTime(700, now + 3.5);
      gain.gain.linearRampToValueAtTime(0.35, now + 3.5);

      filter.frequency.linearRampToValueAtTime(250, now + 7.5);
      gain.gain.linearRampToValueAtTime(0.08, now + 7.5);
    }, 8000);

    this.activeNodes.push(waveInterval);
  }

  private startFireplace() {
    if (!this.audioCtx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(6);
    if (!noiseBuffer) return;

    const noiseSource = this.audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, this.audioCtx.currentTime);
    filter.Q.setValueAtTime(0.6, this.audioCtx.currentTime);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.22, this.audioCtx.currentTime);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noiseSource.start();

    this.activeNodes.push(noiseSource, filter, gain);

    // Fireplace pop sounds
    const popInterval = window.setInterval(() => {
      if (!this.audioCtx || !this.masterGain || this.currentType !== 'fireplace') return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const popGain = this.audioCtx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(150 + Math.random() * 300, now);

      popGain.gain.setValueAtTime(0.05, now);
      popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(popGain);
      popGain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.05);
    }, 450);

    this.activeNodes.push(popInterval);
  }

  private startForest() {
    if (!this.audioCtx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(7);
    if (!noiseBuffer) return;

    const windSource = this.audioCtx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, this.audioCtx.currentTime);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.18, this.audioCtx.currentTime);

    windSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    windSource.start();

    this.activeNodes.push(windSource, filter, gain);

    // Subtle forest bird whistle
    const birdInterval = window.setInterval(() => {
      if (!this.audioCtx || !this.masterGain || this.currentType !== 'forest') return;
      if (Math.random() > 0.6) return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const birdGain = this.audioCtx.createGain();

      osc.type = 'sine';
      const baseFreq = 2200 + Math.random() * 800;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + 400, now + 0.1);

      birdGain.gain.setValueAtTime(0.015, now);
      birdGain.gain.linearRampToValueAtTime(0.0001, now + 0.18);

      osc.connect(birdGain);
      birdGain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.2);
    }, 3200);

    this.activeNodes.push(birdInterval);
  }
}

export const ambientAudioService = new AmbientAudioService();
