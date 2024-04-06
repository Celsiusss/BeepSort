import { IControlsConfiguration } from './models';
import { validateNumber } from './validators';
import { ChangeEvent } from 'react';

export const handleInput = (event: ChangeEvent, controls: IControlsConfiguration) => {
    const target = event.target;
    if (!isInputElement(target)) {
        return;
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
        case 'listLength':
            const length = target.value;
            if (validateNumber(length, 1)) {
                controls.listLength = +length;
            }
            break;
        case 'anim-shuffle':
            controls.animateShuffle = target.checked;
            break;
        case 'show-fps':
            controls.showFps = target.checked;
            break;
        case 'maxSampleSize':
            controls.maxSampleSize = +target.value;
            break;
        default:
            break;
    }
};

const isInputElement = (eventTarget: EventTarget): eventTarget is HTMLInputElement => {
    return <HTMLInputElement>eventTarget instanceof HTMLInputElement;
};
