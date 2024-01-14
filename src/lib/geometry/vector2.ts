/**
 * Adapted from https://observablehq.com/@esperanc/2d-geometry-utils
 **/

// Determinant of a 3x3 matrix
let det = (
  t00: number,
  t01: number,
  t02: number,
  t10: number,
  t11: number,
  t12: number,
  t20: number,
  t21: number,
  t22: number,
) =>
  t00 * (t11 * t22 - t12 * t21) +
  t01 * (t12 * t20 - t10 * t22) +
  t02 * (t10 * t21 - t11 * t20);

export const Vec2 = (x: number = 0, y: number = 0) => new Vector2(x, y);

export class Vector2 {
  x = 0;
  y = 0;

  constructor(x = 0, y = 0) {
    [this.x, this.y] = [x, y];
  }

  array(): [number, number] {
    return [this.x, this.y];
  }

  clone() {
    // A copy of this vector
    return new Vector2(this.x, this.y);
  }

  mag() {
    // Magnitude (length)
    return Math.sqrt(this.dot(this));
  }

  set(other: Vector2) {
    // Set from another vector
    [this.x, this.y] = [other.x, other.y];
  }

  add(v: Vector2) {
    // Vector sum
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  sub(v: Vector2) {
    // Vector subtraction
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  dist(q: Vector2) {
    // Distance to point
    return this.sub(q).mag();
  }

  dot(q: Vector2) {
    // Dot product
    return this.x * q.x + this.y * q.y;
  }

  angleBetween(v: Vector2) {
    // Returns the angle between this vector and v
    return Math.acos(
      Math.min(Math.max(this.dot(v) / this.mag() / v.mag(), -1), 1)
    );
  }

  signedAngle(v: Vector2) {
    // Returns the _signed_ angle between this vector and v
    // so that a rotation of this by angle makes it colinear with v
    let a = this.angleBetween(v);
    if (new Vector2(0, 0).orient(this, v) > 0) return -a;
    return a;
  }

  scale(alpha: number) {
    // Multiplication by scalar
    return new Vector2(this.x * alpha, this.y * alpha);
  }

  rotate(angle: number) {
    // Returns this vector rotated by angle radians
    let [c, s] = [Math.cos(angle), Math.sin(angle)];
    return new Vector2(c * this.x - s * this.y, s * this.x + c * this.y);
  }

  mix(q: Vector2, alpha: number) {
    // this vector * (1-alpha) + q * alpha
    return new Vector2(
      this.x * (1 - alpha) + q.x * alpha,
      this.y * (1 - alpha) + q.y * alpha
    );
  }
  normalize() {
    // this vector normalized
    return this.scale(1 / this.mag());
  }

  distSegment(p: Vector2, q: Vector2) {
    // Distance to line segment
    const s = p.dist(q);
    if (s < 0.00001) return this.dist(p);
    const v = q.sub(p).scale(1.0 / s);
    const u = this.sub(p);
    const d = u.dot(v);
    if (d < 0) return this.dist(p);
    if (d > s) return this.dist(q);
    return p.mix(q, d / s).dist(this);
  }

  orient(p: Vector2, q: Vector2) {
    // Returns the orientation of triangle (this,p,q)
    return Math.sign(det(1, 1, 1, this.x, p.x, q.x, this.y, p.y, q.y));
  }

  draw(ctx: CanvasRenderingContext2D, color: string = 'black', radius: number = 2) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
    ctx.fill();
  }
}
