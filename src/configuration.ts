import { BehaviorSubject, Observable } from 'rxjs';
import { Algorithms } from './algorithm-factory';
import { IControlsConfiguration } from './models';
import { VisualizerFactory } from './visualizer-factory';
import { handleInput } from './event-handlers';

export class Configuration {
    public controls: IControlsConfiguration;
    public observable: Observable<IControlsConfiguration>;

    private subject: BehaviorSubject<IControlsConfiguration>;

    constructor(controls: Partial<IControlsConfiguration> = {}) {
        this.controls = {
            ...controls,
            speed: 1,
            waitDelay: 4,
            colors: true,
            audio: true,
            listLength: 200,
            algorithm: Algorithms.QuickSort,
            visualizer: VisualizerFactory.visualizer('stairs'),
            animateShuffle: true
        };
        this.subject = new BehaviorSubject<IControlsConfiguration>(this.controls);
        this.observable = this.subject.asObservable();
    }

    public inputHandler(event: InputEvent) {
        handleInput(event, this.controls);
        this.subject.next(this.controls);
    }
}
