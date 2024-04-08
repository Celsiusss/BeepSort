#version 300 es
in vec4 vertexPosition;
in vec4 textureCoord;
uniform mat4 projectionMatrix;

out vec2 uv;

void main() {
    gl_Position = projectionMatrix * vertexPosition;
    uv = textureCoord.xy;
}
