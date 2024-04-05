import { mat4 } from 'gl-matrix';
import { AsyncListVisualizer } from '../async-list-visualizer';
import { IControlsConfiguration } from '../models';
import { WebGLVisualizer } from './visualizer';

export class WebGLStairsVisualizer implements WebGLVisualizer {
    type = 'webgl' as const;

    private tex: Float32Array;
    private texWidth: number;
    private texHeight: number;

    private columns: number;
    private maxTexWidth: number;

    private projectionMatrixPosition: WebGLUniformLocation;
    private columnsPosition: WebGLUniformLocation;
    private texWidthPosition: WebGLUniformLocation;

    private projectionMatrix: mat4;

    init(gl: WebGL2RenderingContext, list: AsyncListVisualizer): void {
        this.columns = list.length;
        this.maxTexWidth = Math.ceil(Math.sqrt(this.columns));
        gl.getExtension('OES_texture_float_linear');

        const vShader = loadShader(gl, gl.VERTEX_SHADER, vShaderSrc);
        const fShader = loadShader(gl, gl.FRAGMENT_SHADER, fShaderSrc);

        const shaderProgram = gl.createProgram();
        if (!shaderProgram) {
            throw new Error('wtf');
        }
        gl.attachShader(shaderProgram, vShader);
        gl.attachShader(shaderProgram, fShader);
        gl.linkProgram(shaderProgram);

        gl.useProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.error(
                `Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`
            );
            throw new Error('iskjdfhg');
        }

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = [0.0, 0.0, 100.0, 0.0, 100.0, 100.0, 0.0, 100.0];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        const vertexPosition = gl.getAttribLocation(shaderProgram, 'vertexPosition');
        gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vertexPosition);

        // projection
        this.projectionMatrixPosition = gl.getUniformLocation(shaderProgram, 'projectionMatrix');
        this.projectionMatrix = mat4.create();
        mat4.ortho(this.projectionMatrix, 0, 100, 0, 100, -1.0, 1.0);

        this.columnsPosition = gl.getUniformLocation(shaderProgram, 'columns');
        this.texWidthPosition = gl.getUniformLocation(shaderProgram, 'texWidth');

        // texture
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
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
        const textureCoordPosition = gl.getAttribLocation(shaderProgram, 'textureCoord');
        gl.vertexAttribPointer(textureCoordPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(textureCoordPosition);

        const samplerPosition = gl.getUniformLocation(shaderProgram, 'sampler');
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
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

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniformMatrix4fv(this.projectionMatrixPosition, false, this.projectionMatrix);
        gl.uniform1f(this.columnsPosition, this.columns);
        gl.uniform1f(this.texWidthPosition, this.texWidth);

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

const vShaderSrc = `#version 300 es
  in vec4 vertexPosition;
  in vec4 textureCoord;
  uniform mat4 projectionMatrix;
  
  out vec2 uv;
  
  void main() {
    gl_Position = projectionMatrix * vertexPosition;
    uv = textureCoord.xy;
  }
  `;
const fShaderSrc = `#version 300 es
  precision highp float;
  in vec2 uv;
  uniform sampler2D sampler;
  uniform float columns;
  uniform float texWidth;
  
  out vec4 color;
  
  vec3 hsl2rgb( in vec3 c ) {
      vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
  
      return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
  }
  
  void main() {
    float p = uv.x * columns;
    float u = mod(p, texWidth) / texWidth + (1.0 / (texWidth*texWidth));
    float v = floor(p / texWidth) / texWidth + (1.0 / (texWidth*texWidth));
  
    vec4 val = texture(sampler, vec2(u,v));
    float h = val.y;
    float height = val.x;
  
    if (uv.y < height) {
      color = vec4(hsl2rgb(vec3(height, 1.0, 0.5)), 1.0);
    } else {
      color = vec4(0.0, 0.0, 0.0, 1.0);
    }
  }
  `;