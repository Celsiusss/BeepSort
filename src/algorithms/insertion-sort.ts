import { Algorithm } from './algorithm';
import { List } from '../list';

export class InsertionSort implements Algorithm {
    async sort(list: List): Promise<void> {
        const origSpeed = list.drawEvery;
        list.drawEvery = list.drawEvery * 10;
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
        list.drawEvery = origSpeed;
    }

}
