import { mat4 } from 'gl-matrix';
import { AsyncListVisualizer } from '../async-list-visualizer';
import { IControlsConfiguration } from '../models';
import { IWebGLVisualizer } from './visualizer';

import vertexShaderSource from './shaders/vertex.glsl?raw';
import dotsFragShaderSrc from './shaders/dots-frag.glsl?raw';
import barsFragShaderSrc from './shaders/bars-frag.glsl?raw';

export class WebGLVisualizer implements IWebGLVisualizer {
    type = 'webgl' as const;

    private tex: Float32Array;
    private texWidth: number;
    private texHeight: number;

    private columns: number;
    private maxTexWidth: number;

    private shaderProgram: WebGLProgram;
    private columnDataTexture: WebGLTexture;
    private vertexShader = WebGLShader['prototype'];
    private fragmentShader = WebGLShader['prototype'];

    private projectionMatrixPosition: WebGLUniformLocation;
    private columnsPosition: WebGLUniformLocation;
    private texWidthPosition: WebGLUniformLocation;
    private sampleSizePosition: WebGLUniformLocation;
    private screenWidthPosition: WebGLUniformLocation;
    private screenHeightPosition: WebGLUniformLocation;

    private projectionMatrix: mat4;

    constructor(private shader: 'stairs' | 'dots') {}

    init(gl: WebGL2RenderingContext, list: AsyncListVisualizer): void {
        this.columns = list.length;
        this.maxTexWidth = Math.ceil(Math.sqrt(this.columns));

        const maxGlTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);

        if (this.maxTexWidth > maxGlTexSize) {
            alert('List length too large, max ' + maxGlTexSize ** 2);
            throw new Error('Too large texture size');
        }

        gl.getExtension('OES_texture_float_linear');

        this.vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        this.fragmentShader = loadShader(
            gl,
            gl.FRAGMENT_SHADER,
            this.shader === 'stairs' ? barsFragShaderSrc : dotsFragShaderSrc
        );

        this.shaderProgram = gl.createProgram();
        if (!this.shaderProgram) {
            throw new Error('wtf');
        }
        gl.attachShader(this.shaderProgram, this.vertexShader);
        gl.attachShader(this.shaderProgram, this.fragmentShader);
        gl.linkProgram(this.shaderProgram);

        gl.useProgram(this.shaderProgram);

        if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
            console.error(
                `Unable to initialize the shader program: ${gl.getProgramInfoLog(this.shaderProgram)}`
            );
            throw new Error('iskjdfhg');
        }

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = [0.0, 0.0, 100.0, 0.0, 100.0, 100.0, 0.0, 100.0];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        const vertexPosition = gl.getAttribLocation(this.shaderProgram, 'vertexPosition');
        gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vertexPosition);

        // projection
        this.projectionMatrixPosition = gl.getUniformLocation(
            this.shaderProgram,
            'projectionMatrix'
        );
        this.projectionMatrix = mat4.create();
        mat4.ortho(this.projectionMatrix, 0, 100, 0, 100, -1.0, 1.0);

        // unforms
        this.columnsPosition = gl.getUniformLocation(this.shaderProgram, 'columns');
        this.texWidthPosition = gl.getUniformLocation(this.shaderProgram, 'texWidth');
        this.sampleSizePosition = gl.getUniformLocation(this.shaderProgram, 'sampleSize');
        this.screenWidthPosition = gl.getUniformLocation(this.shaderProgram, 'screenWidth');
        this.screenHeightPosition = gl.getUniformLocation(this.shaderProgram, 'screenHeight');

        // texture
        this.columnDataTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.columnDataTexture);
        const { tex, width: texWidth, height: texHeight } = this.genTex(list);
        this.tex = tex;
        this.texWidth = texWidth;
        this.texHeight = texHeight;

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        const textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        const textureCoordinates = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
        const textureCoordPosition = gl.getAttribLocation(this.shaderProgram, 'textureCoord');
        gl.vertexAttribPointer(textureCoordPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(textureCoordPosition);

        const samplerPosition = gl.getUniformLocation(this.shaderProgram, 'sampler');
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.columnDataTexture);
        gl.uniform1i(samplerPosition, 0);
    }
    draw(
        gl: WebGL2RenderingContext,
        width: number,
        height: number,
        controls: IControlsConfiguration,
        changes: [number, number][]
    ): void {
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things

        const [_, __, prevWidth, prevHeight] = gl.getParameter(gl.VIEWPORT);
        if (prevWidth !== width || prevHeight !== height) {
            gl.viewport(0, 0, width, height);
        }

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniformMatrix4fv(this.projectionMatrixPosition, false, this.projectionMatrix);
        gl.uniform1f(this.columnsPosition, this.columns);
        gl.uniform1f(this.texWidthPosition, this.texWidth);
        const sampleSize = Math.min(
            Math.ceil(this.columns / width),
            controls.maxSampleSize == 0 ? Infinity : controls.maxSampleSize
        );
        gl.uniform1i(this.sampleSizePosition, sampleSize);
        gl.uniform1f(this.screenWidthPosition, width);
        gl.uniform1f(this.screenHeightPosition, height);

        for (const [i, e] of changes) {
            this.tex.set([e / this.columns], i);
        }

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.R32F,
            this.texWidth,
            this.texHeight,
            0,
            gl.RED,
            gl.FLOAT,
            this.tex
        );

        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }

    public destroy(gl: WebGL2RenderingContext) {
        gl.deleteTexture(this.columnDataTexture);
        gl.deleteShader(this.fragmentShader);
        gl.deleteShader(this.vertexShader);
        gl.deleteProgram(this.shaderProgram);
    }

    private genTex(list: AsyncListVisualizer): {
        tex: Float32Array;
        width: number;
        height: number;
    } {
        const pixels = [];

        const len = list.length;
        for (let el of list) {
            pixels.push(el / len);
        }
        let width = len;
        let height = 1;

        const size = this.maxTexWidth * this.maxTexWidth;
        const remaining = size - pixels.length;
        pixels.push(...Array.from({ length: remaining }, _ => 0));
        width = this.maxTexWidth;
        height = this.maxTexWidth;

        return { tex: new Float32Array(pixels), width, height };
    }
}

function loadShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type);
    if (shader == null) {
        throw new Error('oops');
    }

    // Send the source to the shader object
    gl.shaderSource(shader, source);

    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
        gl.deleteShader(shader);
        throw new Error('oops');
    }

    return shader;
}
