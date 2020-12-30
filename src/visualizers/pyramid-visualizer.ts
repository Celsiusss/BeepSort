import { Visualizer } from './visualizer';
import { IControlsConfiguration } from '../models';
import { AsyncListVisualizer } from '../async-list-visualizer';
import { hsl } from 'color-convert';

export class PyramidVisualizer implements Visualizer {
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
        const middle = cWidth / 2;
        for (let i = 0; i < list.length; i++) {
            const eWidth = list.get(i) / 2;
            const hue = 255 - (list.get(i) / list.length) * 360;
            context.fillStyle = hasColors ? `hsl(${hue},100%,50%)` : '#fff';
            context.fillRect(
                middle - eWidth * width,
                height * i,
                list.get(i) * width,
                Math.ceil(height)
            );
        }
    }
}
