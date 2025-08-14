export class SoundManager {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private enabled = true;

  constructor() {
    this.initAudio();
  }

  private initAudio(): void {
    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      this.gainNode.connect(this.audioContext.destination);
    } catch (error) {
      console.warn("Web Audio API not supported:", error);
      this.enabled = false;
    }
  }

  private createTone(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine"
  ): void {
    if (!this.enabled || !this.audioContext || !this.gainNode) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.gainNode);

    oscillator.frequency.setValueAtTime(
      frequency,
      this.audioContext.currentTime
    );
    oscillator.type = type;

    // Envelope
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.1,
      this.audioContext.currentTime + 0.01
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioContext.currentTime + duration
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  private createNoiseHit(duration: number): void {
    if (!this.enabled || !this.audioContext || !this.gainNode) return;

    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(
      1,
      bufferSize,
      this.audioContext.sampleRate
    );
    const output = buffer.getChannelData(0);

    // Generate noise
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.audioContext.createBufferSource();
    whiteNoise.buffer = buffer;

    const bandpass = this.audioContext.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 1000;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.05,
      this.audioContext.currentTime + 0.01
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioContext.currentTime + duration
    );

    whiteNoise.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(this.gainNode);

    whiteNoise.start(this.audioContext.currentTime);
    whiteNoise.stop(this.audioContext.currentTime + duration);
  }

  playPaddleHit(): void {
    // Warm, musical tone for paddle hits
    this.createTone(220, 0.1, "sine");
    this.createTone(440, 0.08, "triangle");
  }

  playBoundaryHit(): void {
    // Sharp, bright tone for boundary hits
    this.createTone(660, 0.1, "square");
    this.createNoiseHit(0.05);
  }

  playScore(): void {
    // Musical sequence for scoring
    setTimeout(() => this.createTone(440, 0.15, "sine"), 0);
    setTimeout(() => this.createTone(550, 0.15, "sine"), 100);
    setTimeout(() => this.createTone(660, 0.2, "sine"), 200);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(
        Math.max(0, Math.min(1, volume)) * 0.3,
        this.audioContext!.currentTime
      );
    }
  }
}
