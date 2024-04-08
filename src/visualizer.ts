import { AsyncListVisualizer } from './async-list-visualizer';
import { filter, tap } from 'rxjs/operators';
import { Audio } from './audio';
import { AlgorithmFactory } from './algorithm-factory';
import { Visualizer, IWebGLVisualizer, isWebGLVisualizer } from './visualizers/visualizer';
import {
    AdditionalAlgorithmInformation,
    CanvasInfo,
    RunOptions,
    IControlsConfiguration
} from './models';
import { Configuration } from './configuration';
import { VisualizerFactory } from './visualizer-factory';

export const runVisualizer = async (options: RunOptions, configuration: Configuration) => {
    const {
        list,
        canvasInfo: { canvas, webglCanvas },
        canvasInfo
    } = options;
    const controls = configuration.controls;
    let selectedVisualizer = configuration.controls.visualizer;
    let visualizer = VisualizerFactory.visualizer(selectedVisualizer);
    let isWebGl = visualizer.type === 'webgl';

    const listLength = controls.listLength;
    const algorithm = controls.algorithm;
    const audio = new Audio(listLength);

    const overlayContext = options.canvasOverlay.current.getContext('2d');

    const contextIsWebGl = (
        context: CanvasRenderingContext2D | WebGL2RenderingContext
    ): context is WebGL2RenderingContext => {
        return isWebGl;
    };
    let context = isWebGl
        ? webglCanvas.current.getContext('webgl2')
        : canvas.current.getContext('2d');

    if (isWebGl) {
        canvas.current.style.display = 'none';
        webglCanvas.current.style.display = 'block';
    } else {
        canvas.current.style.display = 'block';
        webglCanvas.current.style.display = 'none';
    }

    const configurationSubscription = configuration.observable
        .pipe(
            tap(controls => {
                list.drawEvery = controls.speed;
                list.playAudioFn = controls.audio ? audio.update.bind(audio) : () => {};
                list.changeDelay(controls.waitDelay);
            }),
            filter(newControls => selectedVisualizer !== newControls.visualizer),
            tap(controls => {
                // Re-create and change to new visualizer
                selectedVisualizer = controls.visualizer;
                list.recordChanges = false;
                if (isWebGLVisualizer(visualizer) && contextIsWebGl(context)) {
                    visualizer.destroy(context);
                }
                visualizer = VisualizerFactory.visualizer(controls.visualizer);
                isWebGl = visualizer.type === 'webgl';
                context = isWebGl
                    ? webglCanvas.current.getContext('webgl2')
                    : canvas.current.getContext('2d');
                if (isWebGLVisualizer(visualizer) && contextIsWebGl(context)) {
                    visualizer.init(context, list);
                    list.recordChanges = true;
                }
                if (isWebGl) {
                    canvas.current.style.display = 'none';
                    webglCanvas.current.style.display = 'block';
                } else {
                    canvas.current.style.display = 'block';
                    webglCanvas.current.style.display = 'none';
                }
            })
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

    if (isWebGLVisualizer(visualizer) && contextIsWebGl(context)) {
        list.recordChanges = true;
        visualizer.init(context, list);
    }

    if (!contextIsWebGl(context)) {
        context.imageSmoothingEnabled = false;
        context.fillStyle = '#000000';
        context.fillRect(0, 0, canvas.current.width, canvas.current.height);
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
        list.additionalInformation.frameTime = frameEnd - frames[frames.length - 1];
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
    configurationSubscription.unsubscribe();
    setTimeout(() => {
        cancelAnimationFrame(animationId);
        isWebGLVisualizer(visualizer) && contextIsWebGl(context) && visualizer.destroy(context);
    }, 100);
};
const drawWebGl = (
    list: AsyncListVisualizer,
    gl: WebGL2RenderingContext,
    visualizer: IWebGLVisualizer,
    canvasInfo: CanvasInfo,
    controls: IControlsConfiguration
) => {
    visualizer.draw(gl, canvasInfo.width, canvasInfo.height, controls, list.changeHistory);
    list.changeHistory.length = 0;
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
        context.fillText('Frame time: ' + information.frameTime + 'ms', 0, fontSize * 7);
    }
};
