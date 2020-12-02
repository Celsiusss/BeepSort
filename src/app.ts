import { hsl } from 'color-convert';
import { List } from './list';
import { AlgorithmFactory, Algorithms } from './algorithm-factory';
import { AdditionalAlgorithmInformation } from './models/additional-algorithm-information';
import { Audio } from './audio';

const select = <HTMLSelectElement>document.getElementById('algoSelect');
const lengthInput = <HTMLInputElement>document.getElementById('listLength');
const speedInput = <HTMLInputElement>document.getElementById('speed');
const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const context = canvas.getContext('2d');

let audio = new Audio(0);

document.getElementById('button').addEventListener('click', async event => {
    const selected = select.options[select.selectedIndex].value;
    const length = +lengthInput.value;
    audio = new Audio(length);
    audio.play();
    // @ts-ignore
    const algorithm = <Algorithms>Algorithms[selected];

    const list = new List();
    list.drawFn = drawArray.bind(list);
    list.drawEvery = +speedInput.value;
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
    audio.stop();
});

const drawArray = (list: List) => {
    context.fillStyle = '#000000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    const width = canvas.width / list.length;
    const height = canvas.height / list.length;
    for (let i = 0; i < list.length; i++) {
        const hue = 255 - (i / list.length) * 255;
        context.fillStyle = '#' + hsl.hex([hue, 100, 50]);
        context.fillRect(
            i * width,
            list.length * height - Math.ceil(list.get(i) * height),
            width,
            Math.ceil(list.get(i) * height)
        );
        audio.update(i);
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
