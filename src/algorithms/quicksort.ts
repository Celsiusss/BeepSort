import { Algorithm } from './algorithm';
import { List } from '../list';

export class Quicksort implements Algorithm {
    async sort(list: List, low = 0, high = list.length - 1): Promise<void> {
        if (low < high) {
            const pi = await this.partition(list, high, low);
            await this.sort(list, low, pi - 1); // Before pi
            await this.sort(list, pi + 1, high); // After pi
        }
    }

    private async partition(list: List, hi: number, lo: number): Promise<number> {
        const pivot = list.get(hi);
        let i = lo - 1;
        for (let j = lo; j <= hi - 1; j++) {
            if (list.get(j) < pivot) {
                list.additionalInformation.comparisons++;
                i++;
                await list.swap(i, j);
            }
        }
        await list.swap(i + 1, hi);
        return i + 1;
    }
}
