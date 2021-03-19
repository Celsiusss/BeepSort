import { Algorithm } from './algorithm';
import { AsyncListVisualizer } from '../async-list-visualizer';

export class InsertionSort implements Algorithm {
    async sort(list: AsyncListVisualizer): Promise<void> {
        // list.speedMultiplier = 10;
        let i = 1;
        while (i < list.length) {
            let j = i;
            while (j > 0 && list.get(j - 1) > list.get(j)) {
                list.additionalInformation.comparisons++;
                await list.swap(j, j - 1);
                j--;
            }
            i++;
        }
    }
}
