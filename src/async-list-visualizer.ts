import { promisify } from 'es6-promisify';
import { AdditionalAlgorithmInformation } from './models';

export class AsyncListVisualizer {
    private list: number[];

    public changeHistory: [number, number][] = [];
    public recordChanges = false;

    public playAudioFn: (n: number) => void;
    public simulate = true;
    public drawEvery = 1;
    public speedMultiplier = 1;

    public paused = false;
    public step = false;

    public countAccesses = true;

    private drawCounter = 0;

    private delay = 4;
    private timeout = promisify(c => setTimeout(c, this.delay));

    private calculationFrameStart = 0;

    public additionalInformation: AdditionalAlgorithmInformation = {
        shuffling: false,
        algorithmName: '',
        arrayAccesses: 0,
        comparisons: 0,
        fps: 0,
        drawTime: 0,
        calculationTime: 0,
        frameTime: 0
    };

    constructor(list: number[] = []) {
        this.list = list;
    }

    *[Symbol.iterator]() {
        for (let i = 0; i < this.length; i++) {
            yield this.get(i);
        }
    }

    public changeDelay(delay: number) {
        if (delay < 4 && delay !== -1) {
            throw new RangeError('delay must be >= 4');
        }
        this.delay = delay;
    }

    get(n: number): number {
        if (this.countAccesses) {
            this.additionalInformation.arrayAccesses++;
        }
        return this.list[n];
    }
    async set(n: number, e: number, ignoreSim = false): Promise<void> {
        this.additionalInformation.arrayAccesses++;
        this.list[n] = e;
        if (this.simulate && !ignoreSim) {
            if (this.recordChanges) {
                this.changeHistory.push([n, e]);
            }
            if (this.drawCounter < this.drawEvery * this.speedMultiplier) {
                if (this.drawCounter == 0) {
                    this.calculationFrameStart = Date.now();
                }
                this.drawCounter++;
            } else {
                this.additionalInformation.calculationTime =
                    Date.now() - this.calculationFrameStart;
                this.drawCounter = 0;
                this.calculationFrameStart = 0;
                this.playAudioFn(e);
                await this.timeout();
                if (this.paused) {
                    await this.waitUntilNotPaused();
                }
            }
        }
    }

    async swap(x: number, y: number) {
        if (this.simulate) {
            const tmp = this.get(x);
            await this.set(x, this.get(y), true);
            if (this.recordChanges) {
                this.changeHistory.push([x, this.get(y)]);
            }
            await this.set(y, tmp);
        } else {
            const tmp = this.get(x);
            this.set(x, this.get(y), true);
            this.set(y, tmp);
        }
    }

    get length(): number {
        return this.list.length;
    }

    async populate(length: number, shuffle = true) {
        this.list = [];
        this.list = Array.from({ length }, (_, i) => i + 1);
        if (shuffle) {
            await this.shuffle();
        }
    }
    async shuffle() {
        for (let i = this.list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            if (this.simulate) {
                await this.swap(i, j);
            } else {
                const tmp = this.list[i];
                this.list[i] = this.list[j];
                this.list[j] = tmp;
            }
        }
    }

    async waitUntilNotPaused(): Promise<any> {
        const timeout = promisify(c => setTimeout(c, 100));
        while (this.paused) {
            if (this.step) {
                this.step = false;
                break;
            }
            await timeout();
        }
    }

    findHighestNum(): number {
        return this.list.reduce((prev, curr) => (curr > prev ? curr : prev), 0);
    }
}
