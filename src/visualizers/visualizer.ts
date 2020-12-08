import { AsyncListVisualizer } from '../async-list-visualizer';
import { IControlsConfiguration } from '../models';

export interface Visualizer {
    draw(
        context: CanvasRenderingContext2D,
        width: number,
        height: number,
        controls: IControlsConfiguration,
        list: AsyncListVisualizer
    ): void;
}
