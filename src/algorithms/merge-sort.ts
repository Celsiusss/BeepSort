import { Algorithm } from './algorithm';
import { List } from '../list';

export class MergeSort implements Algorithm {
    async sort(list: List, min = 0, max = list.length): Promise<void> {
        if (max - min === 0) {
            return;
        }
        const middle = Math.floor((min + max) / 2);
        await this.sort(list, min, middle);
        await this.sort(list, middle + 1, max);
        await this.merge2(list, min, max, middle);
    }

    async merge2(list: List, min: number, max: number, mid: number) {
        const origSpeed = list.drawEvery;
        list.drawEvery = list.drawEvery * 10;
        let i = min;
        while (i <= mid) {
            if (list.get(i) > list.get(mid + 1)) {
                list.additionalInformation.comparisons++;
                await list.swap(i, mid + 1);
                await this.push(list, mid + 1, max);
            }
            i++;
        }
        list.drawEvery = origSpeed;
    }

    private async push(list: List, start: number, end: number) {
        for (let i = start; i < end; i++) {
            if (list.get(i) > list.get(i + 1)) {
                list.additionalInformation.comparisons++;
                await list.swap(i, i + 1);
            }
        }
    }
}
