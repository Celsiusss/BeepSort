import { Algorithm } from './algorithm';
import { AsyncListVisualizer } from '../async-list-visualizer';

export class GravitySort implements Algorithm {
    async sort(list: AsyncListVisualizer): Promise<void> {
        list.speedMultiplier = 1000;
        let abacus: number[][] = new Array(list.length)
            .fill(0)
            .map(_ => new Array(list.length).fill(0));
        for (let i = 0; i < list.length; i++) {
            for (let j = 0; j < list.get(i); j++) {
                abacus[i][j] = 1;
            }
        }

        for (let i = 0; i < abacus.length; i++) {
            for (let j = 0; j < abacus.length; j++) {
                let dropRow = j;
                while (dropRow < abacus.length - 1) {
                    if (abacus[dropRow][i] == 0) {
                        break;
                    }
                    dropRow++;
                }
                if (abacus[dropRow][i] == 0) {
                    abacus[j][i] = 0;
                    abacus[dropRow][i] = 1;
                }
            }
            for (let n = 0; n < abacus.length; n++) {
                const count = abacus[n].reduce((prev, curr) => prev + curr);
                await list.set(n, count);
            }
        }
    }
}
