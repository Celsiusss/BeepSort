import { AsyncListVisualizer } from '../async-list-visualizer';

export interface Algorithm {
    sort(list: AsyncListVisualizer): Promise<void>;
}
