export class Audio {
    private context = new AudioContext();

    private readonly maxFreq = 800;
    private readonly toneSpan: number;

    private oscillator: OscillatorNode;

    constructor(length: number) {
        this.toneSpan = length;
        const gainNode = this.context.createGain();
        this.oscillator = this.context.createOscillator();
        this.oscillator.connect(gainNode);
        this.oscillator.type = 'sine';
        gainNode.connect(this.context.destination);
        this.oscillator.detune.value = 100;
        gainNode.gain.value = 0.01;
    }

    public play() {
        this.oscillator.start();
    }

    public update(num: number) {
        this.oscillator.frequency.value = (num / this.toneSpan) * this.maxFreq;
    }

    public stop() {
        this.oscillator.stop();
    }
}
