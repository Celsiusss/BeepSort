import { Visualizer } from './visualizers/visualizer';
import { StairsVisualizer } from './visualizers/stairs-visualizer';
import { PyramidVisualizer } from './visualizers/pyramid-visualizer';
import { DotsVisualizer } from './visualizers/dots-visualizer';

export class VisualizerFactory {
    static visualizer(visualizer: Visualizers): Visualizer {
        switch (visualizer) {
            case 'stairs':
                return new StairsVisualizer();
            case 'pyramid':
                return new PyramidVisualizer();
            case 'dots':
                return new DotsVisualizer();
            default:
                throw new Error(`${visualizer} not allowed`);
        }
    }
}

export const visualizers: Visualizers[] = ['stairs', 'pyramid', 'dots'];

export type Visualizers = 'stairs' | 'pyramid' | 'dots';
