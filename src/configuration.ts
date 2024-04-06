import { BehaviorSubject, Observable } from 'rxjs';
import { Algorithms } from './algorithm-factory';
import { IControlsConfiguration } from './models';
import { VisualizerFactory } from './visualizer-factory';

export class Configuration {
    public controls: IControlsConfiguration;
    public observable: Observable<IControlsConfiguration>;

    private subject: BehaviorSubject<IControlsConfiguration>;

    constructor(controls: Partial<IControlsConfiguration> = {}) {
        this.controls = {
            ...controls,
            speed: 0,
            waitDelay: 0,
            colors: false,
            audio: false,
            listLength: 0,
            algorithm: Algorithms.QuickSort,
            visualizer: VisualizerFactory.visualizer('stairs'),
            animateShuffle: false,
            showFps: false,
            showComparisons: false,
            showAccesses: false,
            showAlgoName: false,
            maxSampleSize: 0
        };
        this.subject = new BehaviorSubject<IControlsConfiguration>(this.controls);
        this.observable = this.subject.asObservable();
    }

    public emitValues() {
        this.subject.next(this.controls);
    }
}
