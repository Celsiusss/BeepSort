#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D sampler;
uniform float columns;
uniform float texWidth;
uniform int sampleSize;

out vec4 color;

vec3 hsl2rgb( in vec3 c ) {
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
    return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
}

void main() {
    color = vec4(0.0, 0.0, 0.0, 0.0);
    int adds = 0;
    for (int i = 0; i < sampleSize; i++) {
    float p = uv.x * columns + float(i);
    float u = mod(p, texWidth);
    float v = floor(p / texWidth);

    vec4 val = texelFetch(sampler, ivec2(u,v), 0);
    float h = val.y;
    float height = val.x;

    if (uv.y < height) {
        color += vec4(hsl2rgb(vec3(-height - 0.29, 1.0, 0.5)), 1.0) / float(sampleSize);
        // color += vec4(1.0) / float(sampleSize);
        adds += 1;
    } else {
        color += vec4(color.rgb, 1.0) / float(sampleSize);
    }
    //   color = texture(sampler, uv);
    }
    float rem = color.a;
    // color.rgb *= 1.0 / rem;
}
