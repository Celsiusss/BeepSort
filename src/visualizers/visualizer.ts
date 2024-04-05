import { AsyncListVisualizer } from '../async-list-visualizer';
import { IControlsConfiguration } from '../models';

export interface Visualizer {
    type: "normal";
    draw(
        context: CanvasRenderingContext2D,
        width: number,
        height: number,
        controls: IControlsConfiguration,
        list: AsyncListVisualizer
    ): void;
}
export interface WebGLVisualizer {
    type: "webgl";

    init(context: WebGL2RenderingContext, list: AsyncListVisualizer): void;

    draw(
        context: WebGL2RenderingContext,
        width: number,
        height: number,
        controls: IControlsConfiguration,
        changes: [number, number][]
    ): void;
}
export function isWebGLVisualizer(visualizer: Visualizer | WebGLVisualizer): visualizer is WebGLVisualizer {
    return visualizer.type == "webgl";
}
