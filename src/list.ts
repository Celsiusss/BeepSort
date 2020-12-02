import { promisify } from 'es6-promisify';
import { AdditionalAlgorithmInformation } from './models/additional-algorithm-information';

const timeout = promisify(setTimeout);

export class List {
    private list: number[];

    public drawFn: (l: List) => void;
    public simulate = true;
    public drawEvery = 1;

    private drawCounter = 0;

    public additionalInformation: AdditionalAlgorithmInformation = {
        shuffling: false,
        algorithmName: '',
        arrayAccesses: 0,
        comparisons: 0
    };

    constructor(list: number[] = []) {
        this.list = list;
    }

    *[Symbol.iterator]() {
        for (let i = 0; i < this.length; i++) {
            yield this.get(i);
        }
    }

    get(n: number): number {
        this.additionalInformation.arrayAccesses++;
        return this.list[n];
    }
    async set(n: number, e: number): Promise<void> {
        this.additionalInformation.arrayAccesses++;
        this.list[n] = e;
        if (this.simulate && this.drawFn) {
            if (this.drawCounter < this.drawEvery) {
                this.drawCounter++;
            } else {
                this.drawCounter = 0;
                this.drawFn(this);
                await timeout();
            }
        }
    }

    async swap(x: number, y: number) {
        const tmp = this.get(x);
        await this.set(x, this.get(y));
        await this.set(y, tmp);
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
            await this.swap(i, j);
        }
    }
}
