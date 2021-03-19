import { Algorithm } from './algorithm';
import { AsyncListVisualizer } from '../async-list-visualizer';

export class RadixSort implements Algorithm {
    displayList: AsyncListVisualizer;
    async sort(displayList: AsyncListVisualizer): Promise<void> {
        this.displayList = displayList;
        const list: string[] = [];
        const longest = displayList.length.toString().length;
        for (const item of displayList) {
            list.push(item.toString());
        }

        const buckets: string[][] = Array.from({ length: 10 }, () => []);

        for (const value of list) {
            const digit = +value.charAt(longest - 1);
            buckets[digit].push(value);
        }
        await this.updateDisplayList(buckets);
        for (let i = longest - 1; i > 0; i--) {
            for (const [num, bucket] of buckets.entries()) {
                for (const [pos, value] of bucket.entries()) {
                    let digit = +(value.charAt(i - 1) || '0');
                    if (digit === num) {
                        continue;
                    }
                    bucket.splice(pos, 1);

                    const sorted = this.countSort(bucket.map(v => +v));
                    console.log(sorted);
                    for (const [i, x] of sorted.entries()) {
                        bucket[i] = (x || 0).toString();
                    }
                    // const length = value.length;
                    // for (let i = buckets[digit].length - 1; i >= 0; i--) {
                    //     if (buckets[digit][i].length >= length) {
                    //         buckets[digit].splice(i, 0, value);
                    //         break;
                    //     }
                    // }

                    // buckets[digit].push(value);
                }
            }
            await this.updateDisplayList(buckets);
        }

        return;
    }

    private async updateDisplayList(buckets: string[][]) {
        let index = 0;
        for (const bucket of buckets) {
            for (const value of bucket) {
                await this.displayList.set(index, +value);
                index++;
            }
        }
    }

    private countSort(input: number[]): number[] {
        const highest = input.reduce((prev, curr) => (curr > prev ? curr : prev), 0);
        const count = Array.from({ length: highest + 1 }, () => 0);
        for (const x of input) {
            count[x + 1] += 1;
        }

        let total = 0;
        for (let i = 0; i < highest; i++) {
            total = count[i] + total;
            count[i] = total;
        }
        const output: number[] = Array.from({ length: input.length });
        for (const x of input) {
            output[count[x - 1]] = x;
            count[x - 1] += 1;
        }
        return output;
    }
}
