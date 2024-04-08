import { Visualizer, IWebGLVisualizer } from './visualizers/visualizer';
import { StairsVisualizer } from './visualizers/stairs-visualizer';
import { PyramidVisualizer } from './visualizers/pyramid-visualizer';
import { DotsVisualizer } from './visualizers/dots-visualizer';
import { CircleVisualizer } from './visualizers/circle-visualizer';
import { WebGLVisualizer } from './visualizers/webgl-visualizer';

export class VisualizerFactory {
    static visualizer(visualizer: Visualizers): Visualizer | IWebGLVisualizer {
        switch (visualizer) {
            case Visualizers.Stairs:
                return new StairsVisualizer();
            case Visualizers.Pyramid:
                return new PyramidVisualizer();
            case Visualizers.Dots:
                return new DotsVisualizer();
            case Visualizers.Circle:
                return new CircleVisualizer();
            case Visualizers.Webgl_Stairs:
                return new WebGLVisualizer('stairs');
            case Visualizers.Webgl_Dots:
                return new WebGLVisualizer('dots');
            case Visualizers.Webgl_Circle:
                return new WebGLVisualizer('circle');
            default:
                throw new Error(`${visualizer} not allowed`);
        }
    }
}

export enum Visualizers {
    Stairs,
    Pyramid,
    Dots,
    Circle,
    Webgl_Stairs,
    Webgl_Dots,
    Webgl_Circle
}
