import { Algorithms } from './algorithm-factory';

export class Configuration {
    controls: IControlsConfiguration;

    constructor(controls: Partial<IControlsConfiguration>) {
        this.controls = {
            algorithm: Algorithms.QuickSort,
            audio: true,
            colors: true,
            listLength: 1000,
            speed: 1,
            waitDelay: 4,
            ...controls
        };
    }
}

export interface IControlsConfiguration {
    speed: number;
    waitDelay: number;
    audio: boolean;
    colors: boolean;

    algorithm: Algorithms;
    listLength: number;
}
