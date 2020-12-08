import { Configuration } from './configuration';
import { AsyncListVisualizer } from './async-list-visualizer';
import { RunOptions } from './models';
import { runVisualizer } from './visualizer';

const canvasContainer = <HTMLDivElement>document.getElementById('ccontainer');
const canvas = <HTMLCanvasElement>document.getElementById('canvas');

const onStart = (runOptions: RunOptions) => {
    runVisualizer(runOptions);
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

export const registerEventHandlers = (configuration: Configuration, runOptions: RunOptions) => {
    const list = runOptions.list;
    const ids = {
        button: onStart.bind(null, runOptions),
        'button-pause': onPause.bind(null, list),
        'button-resume': onResume.bind(null, list),
        'button-step': onStep.bind(null, list),
        'tab-controls': onTabControls,
        'tab-presentation': onTabPresentation
    };
    Object.entries(ids).forEach(arr => {
        const id = arr[0];
        const handler = arr[1] as (this: HTMLElement, ev: MouseEvent) => any;
        document.getElementById(id).addEventListener('click', handler);
    });

    document
        .getElementsByClassName('controls-container')
        .item(0)
        .addEventListener('input', configuration.inputHandler.bind(configuration));

    document.addEventListener('resize', _ => {
        canvas.width = canvasContainer.clientWidth;
        canvas.height = canvasContainer.clientHeight;
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
