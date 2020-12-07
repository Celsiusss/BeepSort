import './styling/global.scss';
import { hsl } from 'color-convert';
import { AsyncListVisualizer } from './async-list-visualizer';
import { AlgorithmFactory, Algorithms } from './algorithm-factory';
import { AdditionalAlgorithmInformation } from './models/additional-algorithm-information';
import { Audio } from './audio';
import { Controls } from './controls';
import { Configuration } from './configuration';

// TODO: refactor this entire file

const select = <HTMLSelectElement>document.getElementById('algoSelect');
const lengthInput = <HTMLInputElement>document.getElementById('listLength');
const speedInput = <HTMLInputElement>document.getElementById('speed');
const canvasContainer = <HTMLDivElement>document.getElementById('ccontainer');
const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const context = canvas.getContext('2d');

const configuration = new Configuration({});

let audio = new Audio(0);
let list = new AsyncListVisualizer();

document.getElementById('button').addEventListener('click', async event => {
    const selected = select.options[select.selectedIndex].value;
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

document
    .getElementsByClassName('controls-container')
    .item(0)
    .addEventListener('input', Controls.inputHandler.bind(null, configuration.controls));

const drawArray = (list: AsyncListVisualizer) => {
    const hasColors = configuration.controls.colors;
    context.fillStyle = '#000000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    const width = canvas.width / list.length;
    const height = canvas.height / list.length;
    for (let i = 0; i < list.length; i++) {
        const hue = 255 - (list.get(i) / list.length) * 255;
        const color = hasColors ? hsl.hex([hue, 100, 50]) : 'fff';
        context.fillStyle = '#' + color;
        context.fillRect(
            i * width,
            list.length * height - Math.ceil(list.get(i) * height),
            width,
            Math.ceil(list.get(i) * height)
        );
    }
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

    for (const algorithm in Algorithms) {
        const element = document.createElement('option');
        element.setAttribute('value', algorithm);
        element.innerText = algorithm;
        select.appendChild(element);
    }
})();

window.onresize = () => {
    canvas.width = canvasContainer.clientWidth;
    canvas.height = canvasContainer.clientHeight;
};
