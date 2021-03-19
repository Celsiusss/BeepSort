import { Algorithm } from './algorithm';
import { AsyncListVisualizer } from '../async-list-visualizer';

export class CountingSort implements Algorithm {
    async sort(list: AsyncListVisualizer): Promise<void> {
        const highest = list.findHighestNum();
        const count = Array.from({ length: highest + 1 }, () => 0);

        for (const x of list) {
            count[x - 1] += 1;
        }

        let total = 0;
        for (let i = 0; i < highest; i++) {
            total = count[i] + total;
            count[i] = total;
        }

        const listCopy = [];
        for (const x of list) {
            listCopy.push(x);
        }
        for (const x of listCopy) {
            await list.set(count[x - 1] - 1, x);
            count[x - 1] += 1;
        }
    }
}
