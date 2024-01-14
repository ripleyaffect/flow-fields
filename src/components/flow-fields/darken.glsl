vec4 darken(vec4 original, float by) {
    vec4 new = original * (1.0 - by);
    return vec4(new.rgb, original.a);
}
