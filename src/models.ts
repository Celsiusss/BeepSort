import { Visualizer } from './visualizers/visualizer';
import { Algorithms } from './algorithm-factory';
import { AsyncListVisualizer } from './async-list-visualizer';
import { Configuration } from './configuration';

export interface AdditionalAlgorithmInformation {
    shuffling: boolean;
    algorithmName: string;
    arrayAccesses: number;
    comparisons: number;
}

export interface RunOptions {
    list: AsyncListVisualizer;
    configuration: Configuration;
    canvasInfo: CanvasInfo;
}

export interface CanvasInfo {
    context: CanvasRenderingContext2D;
    height: number;
    width: number;
}

export interface IControlsConfiguration {
    speed: number;
    waitDelay: number;
    audio: boolean;
    colors: boolean;
    algorithm: Algorithms;
    visualizer: Visualizer;
    listLength: number;
    animateShuffle: boolean;
}
