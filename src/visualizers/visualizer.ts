import { AsyncListVisualizer } from '../async-list-visualizer';
import { IControlsConfiguration } from '../models';

export interface Visualizer {
    type: 'normal';
    draw(
        context: CanvasRenderingContext2D,
        width: number,
        height: number,
        controls: IControlsConfiguration,
        list: AsyncListVisualizer
    ): void;
}
export interface IWebGLVisualizer {
    type: 'webgl';

    init(context: WebGL2RenderingContext, list: AsyncListVisualizer): void;

    draw(
        context: WebGL2RenderingContext,
        width: number,
        height: number,
        controls: IControlsConfiguration,
        changes: [number, number][]
    ): void;

    destroy(context: WebGL2RenderingContext): void;
}
export function isWebGLVisualizer(
    visualizer: Visualizer | IWebGLVisualizer
): visualizer is IWebGLVisualizer {
    return visualizer.type == 'webgl';
}
