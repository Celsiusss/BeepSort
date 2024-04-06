import { useContext, useEffect, useRef } from 'react';
import { RunOptionsContext } from '../app';

export function CanvasView() {
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const webglCanvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

    const runOptions = useContext(RunOptionsContext);

    useEffect(() => {
        canvasRef.current!.width = canvasContainerRef.current!.clientWidth;
        canvasRef.current!.height = canvasContainerRef.current!.clientHeight;
        webglCanvasRef.current!.width = canvasContainerRef.current!.clientWidth;
        webglCanvasRef.current!.height = canvasContainerRef.current!.clientHeight;
        overlayCanvasRef.current!.width = 400;
        overlayCanvasRef.current!.height = 200;

        runOptions.canvasInfo = {
            width: canvasRef.current.width,
            height: canvasRef.current.height,
            canvas: canvasRef,
            webglCanvas: webglCanvasRef
        };
        runOptions.canvasOverlay = overlayCanvasRef;
    }, []);
    useEffect(() => {
        window.addEventListener('resize', () => {
            canvasRef.current!.width = canvasContainerRef.current!.clientWidth;
            canvasRef.current!.height = canvasContainerRef.current!.clientHeight;
            webglCanvasRef.current!.width = canvasContainerRef.current!.clientWidth;
            webglCanvasRef.current!.height = canvasContainerRef.current!.clientHeight;
            overlayCanvasRef.current!.width = 400;
            overlayCanvasRef.current!.height = 200;
            runOptions.canvasInfo.width = canvasRef.current!.width;
            runOptions.canvasInfo.height = canvasRef.current!.height;
        });
    }, []);

    return (
        <div id="ccontainer" className="canvas-container" ref={canvasContainerRef}>
            <canvas id="canvas" ref={canvasRef}></canvas>
            <canvas id="webglCanvas" ref={webglCanvasRef}></canvas>
            <canvas id="overlay" ref={overlayCanvasRef}></canvas>
        </div>
    );
}
