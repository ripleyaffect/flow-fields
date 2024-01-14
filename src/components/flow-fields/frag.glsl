#version 300 es


precision highp float;

in highp vec2 vTextureCoord;

uniform sampler2D uSampler;
out vec4 fragColor;

vec4 darken(vec4 original, float by) {
    vec4 new = original * (1.0 - by);
    return vec4(new.rgb, original.a);
}

vec4 box_blur(vec2 uv, float radius) {
    vec4 color = vec4(0.0);
    float total = 0.0;

    for (float x = -1.0; x <= 1.0; x += 1.0) {
        for (float y = -1.0; y <= 1.0; y += 1.0) {
            vec4 xy_color = texture(uSampler, uv + radius * vec2(x, y) / 512.0);
            color += xy_color;
            total += 1.0;
        }
    }

    return color / total;
}

void main(void) {
    vec4 color = texture(uSampler, vTextureCoord);

    color = darken(color, 0.5);

    vec4 blur_color = (box_blur(vTextureCoord, 5.) - box_blur(vTextureCoord, 1.)) + 0.2;

    fragColor = blur_color;
//    fragColor = smoothstep(0.1, .2, blur_color.rrrr);
}
