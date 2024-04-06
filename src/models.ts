import { Visualizer, WebGLVisualizer } from './visualizers/visualizer';
import { Algorithms } from './algorithm-factory';
import { AsyncListVisualizer } from './async-list-visualizer';
import { MutableRefObject } from 'react';

export interface AdditionalAlgorithmInformation {
    shuffling: boolean;
    algorithmName: string;
    arrayAccesses: number;
    comparisons: number;
    fps: number;
    calculationTime: number;
    drawTime: number;
    frameTime: number;
}

export interface RunOptions {
    list: AsyncListVisualizer;
    canvasInfo: CanvasInfo;
    canvasOverlay: MutableRefObject<HTMLCanvasElement>;
}

export interface CanvasInfo {
    canvas: MutableRefObject<HTMLCanvasElement>;
    webglCanvas: MutableRefObject<HTMLCanvasElement>;
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
    maxSampleSize: number;
}
