import { IControlsConfiguration } from './configuration';
import { validateNumber } from './validators';
import { BehaviorSubject } from 'rxjs';
import { Algorithms } from './algorithm-factory';

export namespace Controls {

    const initialControls: IControlsConfiguration = {
        speed: 1,
        waitDelay: 4,
        colors: true,
        audio: true,
        listLength: 200,
        algorithm: Algorithms.QuickSort
    }

    export const controlsSubject = new BehaviorSubject<IControlsConfiguration>(initialControls);

    let controls: IControlsConfiguration;
    export const inputHandler = (ctrls: IControlsConfiguration, event: InputEvent) => {
        // TODO: fix this mess
        const target = event.target;
        if (!isInputElement(target)) {
            return;
        }
        if (!controls) {
            controls = ctrls;
        }
        switch (target.id) {
            case 'speed':
                const speed = target.value;
                if (validateNumber(speed, 1)) {
                    controls.speed = +speed;
                }
                break;
            case 'audio':
                controls.audio = target.checked;
                break;
            case 'color':
                controls.colors = target.checked;
                break;
            case 'delay':
                const delay = target.value;
                if (validateNumber(delay, 4)) {
                    controls.waitDelay = +delay;
                }
                break;
            default:
                break;
        }
        controlsSubject.next(controls);
    };

    const isInputElement = (eventTarget: EventTarget): eventTarget is HTMLInputElement => {
        return <HTMLInputElement>eventTarget instanceof HTMLInputElement;
    };
}
