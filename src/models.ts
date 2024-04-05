import { Visualizer, WebGLVisualizer } from './visualizers/visualizer';
import { Algorithms } from './algorithm-factory';
import { AsyncListVisualizer } from './async-list-visualizer';
import { Configuration } from './configuration';

export interface AdditionalAlgorithmInformation {
    shuffling: boolean;
    algorithmName: string;
    arrayAccesses: number;
    comparisons: number;
    fps: number;
    calculationTime: number;
    drawTime: number;
}

export interface RunOptions {
    list: AsyncListVisualizer;
    configuration: Configuration;
    canvasInfo: CanvasInfo;
    canvasOverlay: HTMLCanvasElement;
    isWebGl: boolean;
}

export interface CanvasInfo {
    canvas: HTMLCanvasElement;
    webglCanvas: HTMLCanvasElement;
    height: number;
    width: number;
}

export interface IControlsConfiguration {
    speed: number;
    waitDelay: number;
    audio: boolean;
    colors: boolean;
    algorithm: Algorithms;
    visualizer: Visualizer | WebGLVisualizer;
    listLength: number;
    animateShuffle: boolean;
    showFps: boolean;
    showComparisons: boolean;
    showAccesses: boolean;
    showAlgoName: boolean;
}
