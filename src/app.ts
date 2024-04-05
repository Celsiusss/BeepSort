import './styling/global.scss';
import { Algorithms } from './algorithm-factory';
import { visualizers } from './visualizer-factory';
import { AsyncListVisualizer } from './async-list-visualizer';
import { RunOptions } from './models';
import { Configuration } from './configuration';
import { registerDomEvents } from './event-handlers';

const algoSelect = <HTMLSelectElement>document.getElementById('algoSelect');
const visSelect = <HTMLSelectElement>document.getElementById('visualizer-input');
const canvasContainer = <HTMLDivElement>document.getElementById('ccontainer');
const canvas = <HTMLCanvasElement>document.getElementById('canvas');
// const context = canvas.getContext('2d');

const fillSelects = () => {
    for (const algorithm in Algorithms) {
        const element = document.createElement('option');
        element.setAttribute('value', algorithm);
        element.innerText = algorithm;
        algoSelect.appendChild(element);
    }
    visualizers.forEach(visualizer => {
        const element = document.createElement('option');
        element.setAttribute('value', visualizer);
        element.innerText = visualizer;
        visSelect.appendChild(element);
    });
};

(async () => {
    canvas.width = canvasContainer.clientWidth;
    canvas.height = canvasContainer.clientHeight;
    fillSelects();

    const list = new AsyncListVisualizer();
    const configuration = new Configuration();

    const runOptions: RunOptions = {
        list,
        canvasInfo: {
            canvas,
            height: canvas.height,
            width: canvas.width
        },
        configuration,
        isWebGl: false
    };
    registerDomEvents(configuration, runOptions);
})();
