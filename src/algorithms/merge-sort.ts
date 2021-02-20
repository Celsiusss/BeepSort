import { Algorithm } from './algorithm';
import { AsyncListVisualizer } from '../async-list-visualizer';

export class MergeSort implements Algorithm {

    private displayList: AsyncListVisualizer;

    async sort(displayList: AsyncListVisualizer): Promise<void> {
        this.displayList = displayList;

        const list: number[] = [];
        for (let item of displayList) {
            list.push(item);
        }

        await this.mergeSort(list);
        return;

    }

    async mergeSort(list: number[], startIndex = 0): Promise<number[]> {
        if (list.length <= 1) {
            return list;
        }

        let left: number[] = [];
        let right: number[] = [];
        for (let i = 0; i < list.length; i++) {
            if (i < list.length / 2) {
                left.push(list[i]);
            } else {
                right.push(list[i]);
            }
        }
        right = await this.mergeSort(right, startIndex + left.length);
        left = await this.mergeSort(left, startIndex);

        return this.merge(left, right, startIndex);
    }

    async merge(left: number[], right: number[], startIndex: number): Promise<number[]> {
        const result: number[] = [];
        while (left.length > 0 && right.length > 0) {
            this.displayList.additionalInformation.comparisons++;
            if (left[0] <=  right[0]) {
                result.push(left[0]);
                left = left.slice(1);
            } else {
                result.push(right[0]);
                right = right.slice(1);
            }
        }

        while (left.length > 0) {
            result.push(left[0]);
            left = left.slice(1);
        }
        while (right.length > 0) {
            result.push(right[0]);
            right = right.slice(1);
        }
        await this.updateDisplayList(startIndex, result);
        return result;
    }

    async updateDisplayList(from: number, list: number[]): Promise<void> {
        for (let i = 0; i < list.length; i++) {
            await this.displayList.set(from + i, list[i]);
        }
    }
}
