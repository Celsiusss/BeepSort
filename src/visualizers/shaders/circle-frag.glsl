#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D sampler;
uniform float columns;
uniform float texWidth;
uniform int sampleSize;

uniform float screenWidth;
uniform float screenHeight;


out vec4 color;

vec3 hsl2rgb( in vec3 c ) {
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
    return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
}

void main() {
    color = vec4(0.0, 0.0, 0.0, 0.0);
    float minSize = min(screenWidth, screenHeight);
    float x = (uv.x / minSize * screenWidth * 2.0 - 1.0) * -1.0;
    float y = (uv.y / minSize * screenHeight * 2.0 - 1.0) * -1.0;
    float r = sqrt(pow(x, 2.0) + pow(y, 2.0));
    float angle = 3.14159 - atan(y, x);

    for (int i = 0; i < sampleSize; i++) {
        float p = (angle / (2.0*3.14159)) * columns + float(i);
        float u = mod(p, texWidth);
        float v = floor(p / texWidth);

        vec4 val = texelFetch(sampler, ivec2(u,v), 0);
        float h = val.y;
        float height = val.x;


        color += vec4(hsl2rgb(vec3(-height - 0.29, 1.0, 0.5)), 1.0) / float(sampleSize);
        if (r > 1.0) {
            color = vec4(vec3(0.0), 1.0);
        }
    }
    float rem = color.a;
    // color.rgb *= 1.0 / rem;
}
