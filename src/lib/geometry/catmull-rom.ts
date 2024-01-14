import { Vector2 } from '~/lib/geometry/vector2';

export class CatmullRom {
  // Catmull-Rom spline
  tau: number = 0.5;
  controlPoints: Vector2[];

  set tension(t: number) {
    this.tau = t;
  }

  get tension() {
    return typeof this.tau === 'undefined' ? 0.5 : this.tau
  }

  constructor (controlPoints: Vector2[] = []) {
    this.controlPoints = controlPoints;
  }

  _blendFactors (u: number) {
    let u1 = u;
    let u2 = u * u;
    let u3 = u2 * u;
    let tau = this.tension;

    return [
      -tau * u1 + 2 * tau * u2 - tau * u3,
      1 + (tau-3) * u2 + (2 - tau) * u3,
      tau * u1 + (3 - 2*tau) * u2 + (tau - 2) * u3,
      -tau * u2 + tau * u3
    ];
  }

  point (u: number) {
    let i = ~~u;

    u = u % 1;
    let n = this.controlPoints.length;

    let [p0, p1, p2, p3] = [
      this.controlPoints[i % n],
      this.controlPoints[(i+1) % n],
      this.controlPoints[(i+2) % n],
      this.controlPoints[(i+3) % n],
    ];

    let [b0, b1, b2, b3] = this._blendFactors(u);

    return new Vector2(
      p0.x * b0 + p1.x * b1 + p2.x * b2 + p3.x * b3,
      p0.y * b0 + p1.y * b1 + p2.y * b2 + p3.y * b3
    );
  }
}
