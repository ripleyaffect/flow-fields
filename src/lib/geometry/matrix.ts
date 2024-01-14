import { Vec2, Vector2 } from './vector2';

export class Matrix3x2 {
  // 3x2 Matrix

  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;

  // Constructor from elements specified in column-wise order, i.e., a and b are the elements in the first
  // column, c,d are the elements in the second column and e,f the elements in the third column
  constructor(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) {
    [this.a, this.b, this.c, this.d, this.e, this.f] = [a, b, c, d, e, f];
  }

  // Builds a translation matrix
  static translate(dx = 0, dy = 0) {
    return new Matrix3x2(1, 0, 0, 1, dx, dy);
  }

  // Builds a scale matrix
  static scale(sx = 1, sy = 1) {
    return new Matrix3x2(sx, 0, 0, sy);
  }

  // Builds a shear (skew) matrix
  static shear(sx = 0, sy = 0) {
    return new Matrix3x2(1, sx, sy, 1);
  }

  // Builds a rotation matrix
  static rotate(angle = 0) {
    let [s, c] = [Math.sin(angle), Math.cos(angle)];
    return new Matrix3x2(c, s, -s, c);
  }

  // Returns point p transformed by this matrix (assumes p is a point)
  apply(p: Vector2) {
    return Vec2(
      this.a * p.x + this.c * p.y + this.e,
      this.b * p.x + this.d * p.y + this.f
    );
  }

  // Returns point p transformed by this matrix (assumes p is a point)
  applyPoint(p: Vector2) {
    return Vec2(
      this.a * p.x + this.c * p.y + this.e,
      this.b * p.x + this.d * p.y + this.f
    );
  }

  // Returns vector v transformed by this matrix (assumes p is a point)
  applyVector(v: Vector2) {
    return Vec2(this.a * v.x + this.c * v.y, this.b * v.x + this.d * v.y);
  }

  // Returns this multiplied by m
  mult(m: Matrix3x2) {
    return new Matrix3x2(
      this.a * m.a + this.c * m.b,
      this.b * m.a + this.d * m.b,
      this.a * m.c + this.c * m.d,
      this.b * m.c + this.d * m.d,
      this.a * m.e + this.c * m.f + this.e,
      this.b * m.e + this.d * m.f + this.f
    );
  }

  // Returns the inverse matrix
  inverse() {
    let { a, b, c, d, e, f } = this;
    let det = a * d - b * c;
    if (!det) {
      return null;
    }
    det = 1.0 / det;
    return new Matrix3x2(
      d * det,
      -b * det,
      -c * det,
      a * det,
      (c * f - d * e) * det,
      (b * e - a * f) * det
    );
  }
}
