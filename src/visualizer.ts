import { AsyncListVisualizer } from './async-list-visualizer';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { Audio } from './audio';
import { AlgorithmFactory } from './algorithm-factory';
import { Visualizer } from './visualizers/visualizer';
import {
    AdditionalAlgorithmInformation,
    CanvasInfo,
    RunOptions,
    IControlsConfiguration
} from './models';

export const runVisualizer = async (options: RunOptions) => {
    const { list, configuration, canvasInfo } = options;
    const controls = configuration.controls;
    const visualizer = controls.visualizer;

    const listLength = controls.listLength;
    const algorithm = controls.algorithm;
    const audio = new Audio(listLength);

    const sortingDone$ = new Subject();

    configuration.observable
        .pipe(
            tap(controls => {
                list.drawEvery = controls.speed;
                list.playAudioFn = controls.audio ? audio.update.bind(audio) : () => {};
                list.changeDelay(controls.waitDelay);
            }),
            takeUntil(sortingDone$)
        )
        .subscribe();

    if (controls.audio) {
        await audio.play();
        list.playAudioFn = audio.update.bind(audio);
    } else {
        list.playAudioFn = () => {};
    }

    list.drawEvery = controls.speed;
    list.additionalInformation.shuffling = true;

    let animationId: number;
    const drawCanvas = () => {
        drawArray(list, visualizer, canvasInfo, controls);
        animationId = requestAnimationFrame(drawCanvas);
    };
    animationId = requestAnimationFrame(drawCanvas);

    await list.populate(listLength, true);

    list.additionalInformation = {
        ...list.additionalInformation,
        algorithmName: algorithm,
        arrayAccesses: 0,
        shuffling: false
    };

    const sortingAlgorithm = AlgorithmFactory.getAlgorithm(algorithm);
    sortingAlgorithm.sort(list).then(() => {
        drawArray(list, visualizer, canvasInfo, controls);
        sortingDone$.next();
        cancelAnimationFrame(animationId);
    });
};

const drawArray = (
    list: AsyncListVisualizer,
    visualizer: Visualizer,
    canvasInfo: CanvasInfo,
    controls: IControlsConfiguration
) => {
    list.countAccesses = false;
    visualizer.draw(canvasInfo.context, canvasInfo.width, canvasInfo.height, controls, list);
    printInformation(list.additionalInformation, canvasInfo);
    list.countAccesses = true;
};
const printInformation = (information: AdditionalAlgorithmInformation, canvasInfo: CanvasInfo) => {
    const { algorithmName, arrayAccesses, comparisons } = information;
    const context = canvasInfo.context;
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
