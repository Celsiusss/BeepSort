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
vec3 colorize(in float uvy, in float height, in float dotHeight) {
    return hsl2rgb(vec3(-height - 0.29, 1.0, 0.5));
}

void main() {
    color = vec4(0.0, 0.0, 0.0, 0.0);
    int adds = 0;
    float columnWidth = screenWidth / columns;
    float dotSize = 0.005;
    float dotWidth = (screenWidth * dotSize) / columnWidth;
    float dotHeight = dotSize;
    float dotDiff = dotWidth - 1.0;
    float p = uv.x * columns;
    float u = mod(p, texWidth);
    float v = floor(p / texWidth);

    float sp = p - floor(p);

    vec4 val = texelFetch(sampler, ivec2(u,v), 0);
    float h = val.y;
    float height = val.x;

    if (uv.y < height && uv.y > height - dotHeight && sp < dotWidth ) {
        color = vec4(colorize(uv.y, height, dotHeight), 1.0);
    } else {
        color = vec4(color.rgb, 1.0);
        if (dotDiff >= 0.0) {
            float normalizedDotDiff = dotDiff * columnWidth / screenWidth;
            for (float j = 0.0; j <= normalizedDotDiff; j += 1.0 / columns) {
                p = (uv.x - normalizedDotDiff + j) * columns;
                u = mod(p, texWidth);
                v = floor(p / texWidth);
                float height = texelFetch(sampler, ivec2(u,v), 0).x;
                if (uv.y < height && uv.y > height - dotHeight) {
                    color = vec4(colorize(uv.y, height, dotHeight), 1.0);
                }
            }
        }

    //   color = texture(sampler, uv);
    }
    float rem = color.a;
    // color.rgb *= 1.0 / rem;
}
