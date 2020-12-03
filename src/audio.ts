import * as Tone from 'tone';

export class Audio {
    private readonly synth: Tone.Synth;

    private readonly maxFreq = 800;
    private readonly toneSpan: number;

    private prevTime = -1;

    constructor(length: number) {
        this.synth = new Tone.Synth().toDestination();
        this.synth.volume.value = -10;
        this.synth.detune.value = 100;
        this.toneSpan = length;
    }

    public async play() {
        await Tone.start();
    }

    public update(num: number) {
        let now = Tone.now();
        // sometimes this function is called multiple times at once,
        // and tone js does not like that, so we slightly increase the
        // timing if that happens
        while (now <= this.prevTime) {
            now += 0.0001;
        }
        this.prevTime = now;
        const freq = (num / this.toneSpan) * this.maxFreq;
        const vel = 0.6;
        this.synth.triggerAttackRelease(freq, 0.1, now, vel);
    }
}
