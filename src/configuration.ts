import { validateNumber } from './validators';
import { BehaviorSubject, Observable } from 'rxjs';
import { Algorithms } from './algorithm-factory';
import { IControlsConfiguration } from './models';
import { VisualizerFactory, Visualizers } from './visualizer-factory';

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
            visualizer: VisualizerFactory.visualizer('stairs')
        };
        this.subject = new BehaviorSubject<IControlsConfiguration>(this.controls);
        this.observable = this.subject.asObservable();
    }

    public inputHandler(event: InputEvent) {
        const target = event.target;
        if (isSelectElement(target)) {
            this.selectHandler(target);
            return;
        }
        if (!isInputElement(target)) {
            return;
        }
        switch (target.id) {
            case 'speed':
                const speed = target.value;
                if (validateNumber(speed, 1)) {
                    this.controls.speed = +speed;
                }
                break;
            case 'audio':
                this.controls.audio = target.checked;
                break;
            case 'color':
                this.controls.colors = target.checked;
                break;
            case 'delay':
                const delay = target.value;
                if (validateNumber(delay, 4)) {
                    this.controls.waitDelay = +delay;
                }
                break;
            case 'listLength':
                const length = target.value;
                if (validateNumber(length, 1)) {
                    this.controls.listLength = +length;
                }
                break;
            default:
                break;
        }
        this.subject.next(this.controls);
    }
    private selectHandler(target: HTMLSelectElement) {
        switch (target.id) {
            case 'visualizer-input':
                this.controls.visualizer = VisualizerFactory.visualizer(
                    target.options[target.selectedIndex].value as Visualizers
                );
                break;
            case 'algoSelect':
                // @ts-ignore
                this.controls.algorithm = Algorithms[target.options[target.selectedIndex].value];
                break;
        }
    }
}

const isInputElement = (eventTarget: EventTarget): eventTarget is HTMLInputElement => {
    return <HTMLInputElement>eventTarget instanceof HTMLInputElement;
};

const isSelectElement = (eventTarget: EventTarget): eventTarget is HTMLSelectElement => {
    return <HTMLSelectElement>eventTarget instanceof HTMLSelectElement;
};
