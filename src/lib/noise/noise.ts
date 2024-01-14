import { Vec2, Vector2 } from '~/lib/geometry';

import { P } from './p';

const p = new Uint8Array(512);
for (let i = 0; i < 256; ++i) p[i] = p[i + 256] = P[i];

export class Noise {
  static random2(): Vector2 {
    return Vec2(Math.random(), Math.random());
  }

  static perlin2(x: number, y: number): number {
    const xi = Math.floor(x), yi = Math.floor(y);
    const X = xi & 255, Y = yi & 255;
    const u = fade(x -= xi), v = fade(y -= yi);
    const A = p[X] + Y, B = p[X + 1] + Y;
    return lerp(
      v,
      lerp(u, grad2(p[A], x, y), grad2(p[B], x - 1, y)),
      lerp(u, grad2(p[A + 1], x, y - 1), grad2(p[B + 1], x - 1, y - 1))
    );
  }
}


function octave2(noise: (x: number, y: number) => number, octaves: number) {
  return function(x: number, y: number) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let value = 0;
    for (let i = 0; i < octaves; ++i) {
      value += noise(x * frequency, y * frequency) * amplitude;
      total += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }
    return value / total;
  };
}

function grad2(i: number, x: number, y: number) {
  const v = i & 1 ? y : x;
  return i & 2 ? -v : v;
}

function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(t: number, a: number, b: number) {
  return a + t * (b - a);
}
