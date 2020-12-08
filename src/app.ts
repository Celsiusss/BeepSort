import './styling/global.scss';
import { AsyncListVisualizer } from './async-list-visualizer';
import { AlgorithmFactory, Algorithms } from './algorithm-factory';
import { AdditionalAlgorithmInformation } from './models/additional-algorithm-information';
import { Audio } from './audio';
import { Controls } from './controls';
import { Configuration } from './configuration';
import { Visualizer } from './visualizers/visualizer';
import {VisualizerFactory, Visualizers, visualizers} from "./visualizer-factory";

// TODO: refactor this entire file

const algoSelect = <HTMLSelectElement>document.getElementById('algoSelect');
const visSelect = <HTMLSelectElement>document.getElementById('visualizer-input');
const lengthInput = <HTMLInputElement>document.getElementById('listLength');
const speedInput = <HTMLInputElement>document.getElementById('speed');
const canvasContainer = <HTMLDivElement>document.getElementById('ccontainer');
const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const context = canvas.getContext('2d');

let visualizer: Visualizer;

const configuration = new Configuration({});

let audio = new Audio(0);
let list = new AsyncListVisualizer();

document.getElementById('button').addEventListener('click', async event => {
    const selected = algoSelect.options[algoSelect.selectedIndex].value;
    const selectedVisualizer = visSelect.options[visSelect.selectedIndex].value as Visualizers;
    visualizer = VisualizerFactory.visualizer(selectedVisualizer);
    const length = +lengthInput.value;
    list = new AsyncListVisualizer();

    if (configuration.controls.audio) {
        audio = new Audio(length);
        await audio.play();
        list.playAudioFn = audio.update.bind(audio);
    } else {
        list.playAudioFn = () => {};
    }
    // @ts-ignore
    const algorithm = <Algorithms>Algorithms[selected]; // TODO: find a better solution for this

    const controlsSubscription = Controls.controlsSubject.subscribe(config => {
        list.drawEvery = config.speed;
        list.playAudioFn = config.audio ? audio.update.bind(audio) : () => {};
        list.changeDelay(config.waitDelay);
    });

    list.drawFn = drawArray.bind(list);
    list.drawEvery = +configuration.controls.speed;
    list.additionalInformation.shuffling = true;
    await list.populate(length, true);
    drawArray(list);
    list.additionalInformation = {
        ...list.additionalInformation,
        algorithmName: algorithm,
        arrayAccesses: 0,
        shuffling: false
    };

    const sortingAlgorithm = AlgorithmFactory.getAlgorithm(algorithm);
    await sortingAlgorithm.sort(list);
    drawArray(list);

    controlsSubscription.unsubscribe();
});

document.getElementById('button-pause').addEventListener('click', event => {
    list.paused = true;
});
document.getElementById('button-resume').addEventListener('click', event => {
    list.paused = false;
});
document.getElementById('button-step').addEventListener('click', event => {
    list.step = true;
});
document.getElementById('tab-controls').addEventListener('click', event => {
    switchTab('controls');
});
document.getElementById('tab-presentation').addEventListener('click', event => {
    switchTab('presentation');
});

const switchTab = (tab: 'controls' | 'presentation') => {
    if (tab === "controls") {
        document.getElementById('config-controls').classList.remove('tab-hidden');
        document.getElementById('config-presentation').classList.add('tab-hidden');
    } else if (tab === "presentation") {
        document.getElementById('config-controls').classList.add('tab-hidden')
        document.getElementById('config-presentation').classList.remove('tab-hidden')
    }
}

document
    .getElementsByClassName('controls-container')
    .item(0)
    .addEventListener('input', Controls.inputHandler.bind(null, configuration.controls));

const drawArray = (list: AsyncListVisualizer) => {
    visualizer.draw(context, canvas.width, canvas.height, configuration.controls, list);
    printInformation(list.additionalInformation);
};
const printInformation = (information: AdditionalAlgorithmInformation) => {
    const { algorithmName, arrayAccesses, comparisons } = information;
    const fontSize = 24;
    context.font = fontSize + 'px serif';
    context.fillStyle = '#fff';
    if (information.shuffling) {
        context.fillText('Shuffling...', 0, fontSize);
        return;
    }
    context.fillText(algorithmName, 0, fontSize);
    context.fillText(
        'Array accesses: ' + Intl.NumberFormat().format(arrayAccesses),
        0,
        fontSize * 2
    );
    context.fillText('Comparisons: ' + Intl.NumberFormat().format(comparisons), 0, fontSize * 3);
};
(async () => {
    canvas.width = canvasContainer.clientWidth;
    canvas.height = canvasContainer.clientHeight;

    context.imageSmoothingEnabled = false;
    context.fillStyle = '#000000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    visualizer = VisualizerFactory.visualizer('stairs');

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
})();

window.onresize = () => {
    canvas.width = canvasContainer.clientWidth;
    canvas.height = canvasContainer.clientHeight;
};
