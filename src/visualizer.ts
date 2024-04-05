import { AsyncListVisualizer } from './async-list-visualizer';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { Audio } from './audio';
import { AlgorithmFactory } from './algorithm-factory';
import { Visualizer, WebGLVisualizer, isWebGLVisualizer } from './visualizers/visualizer';
import {
    AdditionalAlgorithmInformation,
    CanvasInfo,
    RunOptions,
    IControlsConfiguration
} from './models';

export const runVisualizer = async (options: RunOptions) => {
    const {
        list,
        configuration,
        canvasInfo: { canvas, webglCanvas },
        canvasInfo,
        isWebGl
    } = options;
    const controls = configuration.controls;
    const visualizer = controls.visualizer;

    const listLength = controls.listLength;
    const algorithm = controls.algorithm;
    const audio = new Audio(listLength);

    const overlayContext = options.canvasOverlay.getContext('2d');

    const sortingDone$ = new Subject();

    if (isWebGl) {
        canvas.style.display = 'none';
        webglCanvas.style.display = 'block';
    } else {
        canvas.style.display = 'block';
        webglCanvas.style.display = 'none';
    }

    configuration.observable
        .pipe(
            tap(controls => {
                list.drawEvery = controls.speed;
                list.playAudioFn = controls.audio ? audio.update.bind(audio) : () => {};
                list.changeDelay(controls.waitDelay);
                console.log(controls.speed);
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

    list.simulate = controls.animateShuffle;
    await list.populate(listLength, true);
    list.simulate = true;

    const contextIsWebGl = (
        context: CanvasRenderingContext2D | WebGL2RenderingContext
    ): context is WebGL2RenderingContext => {
        return isWebGl;
    };
    const context = isWebGl ? webglCanvas.getContext('webgl2') : canvas.getContext('2d');

    if (isWebGLVisualizer(visualizer) && contextIsWebGl(context)) {
        list.recordChanges = true;
        visualizer.init(context, list);
    }

    if (!contextIsWebGl(context)) {
        context.imageSmoothingEnabled = false;
        context.fillStyle = '#000000';
        context.fillRect(0, 0, canvas.width, canvas.height);
    }

    list.drawEvery = controls.speed;
    list.additionalInformation.shuffling = true;

    const frames: number[] = [];
    let animationId: number;
    const drawCanvas = () => {
        const frameStart = Date.now();
        if (!contextIsWebGl(context) && !isWebGLVisualizer(visualizer)) {
            drawArray(list, context, visualizer, canvasInfo, controls);
        }
        if (contextIsWebGl(context) && isWebGLVisualizer(visualizer)) {
            drawWebGl(list, context, visualizer, canvasInfo, controls);
        }
        printInformation(list.additionalInformation, overlayContext, controls);
        const frameEnd = Date.now();
        const fps = frames.length / ((frameEnd - frames[0]) / 1000);
        frames.push(frameEnd);
        if (frames.length > 20) {
            frames.shift();
        }
        list.additionalInformation.fps = Math.floor(fps);
        list.additionalInformation.drawTime = frameEnd - frameStart;
        animationId = requestAnimationFrame(drawCanvas);
    };
    animationId = requestAnimationFrame(drawCanvas);

    list.simulate = controls.animateShuffle;
    // await list.populate(listLength, true);
    list.simulate = true;

    list.additionalInformation = {
        ...list.additionalInformation,
        algorithmName: algorithm,
        arrayAccesses: 0,
        shuffling: false
    };

    const sortingAlgorithm = AlgorithmFactory.getAlgorithm(algorithm);
    await sortingAlgorithm.sort(list);
    sortingDone$.next();
    sortingDone$.complete();
    setTimeout(() => {
        cancelAnimationFrame(animationId);
    }, 100);
};
const drawWebGl = (
    list: AsyncListVisualizer,
    gl: WebGL2RenderingContext,
    visualizer: WebGLVisualizer,
    canvasInfo: CanvasInfo,
    controls: IControlsConfiguration
) => {
    visualizer.draw(gl, canvasInfo.width, canvasInfo.height, controls, list.changeHistory);
    list.changeHistory = [];
};

const drawArray = (
    list: AsyncListVisualizer,
    context: CanvasRenderingContext2D,
    visualizer: Visualizer,
    canvasInfo: CanvasInfo,
    controls: IControlsConfiguration
) => {
    list.countAccesses = false;
    visualizer.draw(context, canvasInfo.width, canvasInfo.height, controls, list);
    printInformation(list.additionalInformation, context, controls);
    list.countAccesses = true;
};
const printInformation = (
    information: AdditionalAlgorithmInformation,
    context: CanvasRenderingContext2D,
    controls: IControlsConfiguration
) => {
    const { algorithmName, arrayAccesses, comparisons } = information;
    const fontSize = 24;
    context.fillStyle = '#000000';
    context.fillRect(0, 0, 400, 200);
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
    if (controls.showFps) {
        context.fillText('FPS: ' + information.fps, 0, fontSize * 4);
        context.fillText('Draw time: ' + information.drawTime + 'ms', 0, fontSize * 5);
        context.fillText('Calc time: ' + information.calculationTime + 'ms', 0, fontSize * 6);
    }
};
