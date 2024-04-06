import { Visualizer } from './visualizer';
import { AsyncListVisualizer } from '../async-list-visualizer';
import { IControlsConfiguration } from '../models';

export class CircleVisualizer implements Visualizer {
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
        context.lineWidth = 1.5;
        const center = [Math.floor(cWidth / 2), Math.floor(cHeight / 2)];
        const radius = Math.min(center[0], center[1]);
        let prevAngle = 0;
        for (let i = 0; i < list.length; i++) {
            const hue = 255 - (list.get(i) / list.length) * 360;
            const color = hasColors ? `hsl(${hue},100%,50%)` : '#fff';
            const angle = prevAngle + (1 / list.length) * Math.PI * 2;
            context.fillStyle = color;
            context.strokeStyle = color;
            context.beginPath();
            context.arc(center[0], center[1], radius, prevAngle, angle);
            context.lineTo(center[0], center[1]);
            context.fill();
            context.stroke();
            prevAngle = angle;
        }
    }
}
