import { Configuration } from './configuration';
import { AsyncListVisualizer } from './async-list-visualizer';
import { RunOptions, IControlsConfiguration } from './models';
import { runVisualizer } from './visualizer';
import Contsants from './contsants';
import { VisualizerFactory, Visualizers } from './visualizer-factory';
import { Algorithms } from './algorithm-factory';
import { validateNumber } from './validators';

const canvasContainer = <HTMLDivElement>document.getElementById('ccontainer');
const canvas = <HTMLCanvasElement>document.getElementById('canvas');

const onStart = async (runOptions: RunOptions) => {
    const button = document.getElementById(Contsants.Buttons.START) as HTMLButtonElement;
    if (button.disabled) {
        return;
    }
    button.disabled = true;
    await runVisualizer(runOptions);
    button.disabled = false;
};
const onPause = (list: AsyncListVisualizer) => {
    list.paused = true;
};
const onResume = (list: AsyncListVisualizer) => {
    list.paused = false;
};
const onStep = (list: AsyncListVisualizer) => {
    list.step = true;
};
const onTabControls = () => {
    switchTab('controls');
};
const onTabPresentation = () => {
    switchTab('presentation');
};

export const handleInput = (
    event: InputEvent,
    runOptions: RunOptions,
    controls: IControlsConfiguration
) => {
    const target = event.target;
    if (isSelectElement(target)) {
        selectHandler(target);
        return;
    }
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
        default:
            break;
    }

    function selectHandler(target: HTMLSelectElement) {
        switch (target.id) {
            case 'visualizer-input':
                controls.visualizer = VisualizerFactory.visualizer(
                    target.options[target.selectedIndex].value as Visualizers
                );
                runOptions.isWebGl = controls.visualizer.type === 'webgl';

                break;
            case 'algoSelect':
                // @ts-ignore
                controls.algorithm = Algorithms[target.options[target.selectedIndex].value];
                break;
        }
    }
};

export const registerDomEvents = (configuration: Configuration, runOptions: RunOptions) => {
    const list = runOptions.list;
    const ids = {
        [Contsants.Buttons.START]: () => onStart(runOptions),
        [Contsants.Buttons.PAUSE]: () => onPause(list),
        [Contsants.Buttons.RESUME]: () => onResume(list),
        [Contsants.Buttons.STEP]: () => onStep(list),
        [Contsants.Tabs.CONTROLS]: onTabControls,
        [Contsants.Tabs.PRESENTATION]: onTabPresentation
    };
    Object.entries(ids).forEach(arr => {
        const id = arr[0];
        const handler = arr[1] as (this: HTMLElement, ev: MouseEvent) => any;
        console.log(id);
        document.getElementById(id).addEventListener('click', handler);
    });

    document
        .getElementsByClassName('controls-container')
        .item(0)
        .addEventListener('input', event => {
            handleInput(event as InputEvent, runOptions, configuration.controls);
            configuration.inputHandler.bind(configuration);
        });

    window.addEventListener('resize', _ => {
        console.log('resize');
        canvas.width = canvasContainer.clientWidth;
        canvas.height = canvasContainer.clientHeight;
        runOptions.canvasInfo.height = canvas.height;
        runOptions.canvasInfo.width = canvas.width;
    });
};

const switchTab = (tab: 'controls' | 'presentation') => {
    if (tab === 'controls') {
        document.getElementById('config-controls').classList.remove('tab-hidden');
        document.getElementById('config-presentation').classList.add('tab-hidden');
    } else if (tab === 'presentation') {
        document.getElementById('config-controls').classList.add('tab-hidden');
        document.getElementById('config-presentation').classList.remove('tab-hidden');
    }
};

const isInputElement = (eventTarget: EventTarget): eventTarget is HTMLInputElement => {
    return <HTMLInputElement>eventTarget instanceof HTMLInputElement;
};

const isSelectElement = (eventTarget: EventTarget): eventTarget is HTMLSelectElement => {
    return <HTMLSelectElement>eventTarget instanceof HTMLSelectElement;
};
