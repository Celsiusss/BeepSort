import { Visualizer } from './visualizer';
import { IControlsConfiguration } from '../models';
import { AsyncListVisualizer } from '../async-list-visualizer';

export class DotsVisualizer implements Visualizer {
    type = 'normal' as const;
    draw(
        context: CanvasRenderingContext2D,
        cWidth: number,
        cHeight: number,
        controls: IControlsConfiguration,
        list: AsyncListVisualizer
    ): void {
        const hasColors = controls.colors;
        context.fillStyle = '#000000';
        context.fillRect(0, 0, cWidth, cHeight);
        const width = cWidth / list.length;
        const height = cHeight / list.length;
        const dotWidth = 5;
        for (let i = 0; i < list.length; i++) {
            const hue = 255 - (list.get(i) / list.length) * 360;
            context.fillStyle = hasColors ? `hsl(${hue},100%,50%)` : '#fff';
            context.fillRect(
                i * width,
                list.length * height - Math.ceil(list.get(i) * height),
                Math.ceil(dotWidth),
                Math.ceil(dotWidth)
            );
        }
    }
}
