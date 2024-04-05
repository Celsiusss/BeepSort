import { Visualizer, WebGLVisualizer } from './visualizers/visualizer';
import { StairsVisualizer } from './visualizers/stairs-visualizer';
import { PyramidVisualizer } from './visualizers/pyramid-visualizer';
import { DotsVisualizer } from './visualizers/dots-visualizer';
import { CircleVisualizer } from './visualizers/circle-visualizer';
import { WebGLStairsVisualizer } from './visualizers/webgl-stairs-visualizer';

export class VisualizerFactory {
    static visualizer(visualizer: Visualizers): Visualizer | WebGLVisualizer {
        switch (visualizer) {
            case 'stairs':
                return new StairsVisualizer();
            case 'pyramid':
                return new PyramidVisualizer();
            case 'dots':
                return new DotsVisualizer();
            case 'circle':
                return new CircleVisualizer();
            case 'webgl':
                return new WebGLStairsVisualizer();
            default:
                throw new Error(`${visualizer} not allowed`);
        }
    }
}

export const visualizers: Visualizers[] = ['stairs', 'pyramid', 'dots', 'circle', 'webgl'];

export type Visualizers = 'stairs' | 'pyramid' | 'dots' | 'circle' | 'webgl';
