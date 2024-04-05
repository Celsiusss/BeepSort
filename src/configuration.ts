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
            speed: +(document.getElementById('speed') as HTMLInputElement).value,
            waitDelay: +(document.getElementById('delay') as HTMLInputElement).value,
            colors: (document.getElementById('color') as HTMLInputElement).checked,
            audio: (document.getElementById('audio') as HTMLInputElement).checked,
            listLength: +(document.getElementById('listLength') as HTMLInputElement).value,
            algorithm: Algorithms.QuickSort,
            visualizer: VisualizerFactory.visualizer('stairs'),
            animateShuffle: (document.getElementById('anim-shuffle') as HTMLInputElement).checked,
            showFps: (document.getElementById('show-fps') as HTMLInputElement).checked,
            showComparisons: (document.getElementById('show-comparisons') as HTMLInputElement)
                .checked,
            showAccesses: (document.getElementById('show-accesses') as HTMLInputElement).checked,
            showAlgoName: (document.getElementById('show-algo') as HTMLInputElement).checked
        };
        this.subject = new BehaviorSubject<IControlsConfiguration>(this.controls);
        this.observable = this.subject.asObservable();
    }

    public inputHandler() {
        this.subject.next(this.controls);
    }
}
