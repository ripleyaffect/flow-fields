import { Vector2 } from '~/lib/geometry/vector2';
import { Matrix3x2 } from '~/lib/geometry/matrix';

export class MBR {
  // Minimum Bounding Rectangle
  min: Vector2;
  max: Vector2;

  constructor(args: Vector2[] = []) {
    // MBR for a variable number of points
    this.min = new Vector2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    this.max = new Vector2(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
    for (let p of args) this.add(p);
  }

  valid() {
    // Whether this is a valid MBR
    return this.min.x <= this.max.x && this.min.y <= this.max.y;
  }

  size() {
    // Size of this box
    return new Vector2(this.max.x - this.min.x, this.max.y - this.min.y);
  }

  center() {
    // Center of the box
    return this.min.add(this.max).scale(0.5);
  }

  add(p: Vector2) {
    // Adds a new point to this MBR
    this.min.x = Math.min(p.x, this.min.x);
    this.min.y = Math.min(p.y, this.min.y);
    this.max.x = Math.max(p.x, this.max.x);
    this.max.y = Math.max(p.y, this.max.y);
  }

  contains(p: Vector2, r: number = 0) {
    // Whether MBR contains a point / circle
    return (
      p.x + r >= this.min.x &&
      p.y + r >= this.min.y &&
      p.x - r < this.max.x &&
      p.y - r < this.max.y
    );
  }

  pointDist(p: Vector2) {
    // Distance from box to point
    let dx = Math.max(this.min.x - p.x, 0, p.x - this.max.x);
    let dy = Math.max(this.min.y - p.y, 0, p.y - this.max.y);
    return Math.sqrt(dx * dx + dy * dy);
  }

  intersects(other: MBR) {
    // Whether this MBR intersects another MBR
    let minx = Math.max(other.min.x, this.min.x);
    let maxx = Math.min(other.max.x, this.max.x);
    if (minx >= maxx) return false;
    let miny = Math.max(other.min.y, this.min.y);
    let maxy = Math.min(other.max.y, this.max.y);
    return miny < maxy;
  }

  intersection(other: MBR) {
    // Returns intersection with another MBR
    let ret = new MBR();
    ret.min.x = Math.max(other.min.x, this.min.x);
    ret.max.x = Math.min(other.max.x, this.max.x);
    ret.min.y = Math.max(other.min.y, this.min.y);
    ret.max.y = Math.min(other.max.y, this.max.y);
    return ret;
  }

  union(other: MBR) {
    // Returns union with another MBR
    let ret = new MBR();
    ret.min.x = Math.min(other.min.x, this.min.x);
    ret.max.x = Math.max(other.max.x, this.max.x);
    ret.min.y = Math.min(other.min.y, this.min.y);
    ret.max.y = Math.max(other.max.y, this.max.y);
    return ret;
  }

  transform(matrix: Matrix3x2) {
    // Returns a new MBR transformed by matrix
    return new MBR([matrix.applyPoint(this.min), matrix.applyPoint(this.max)]);
  }
  draw(ctx: CanvasRenderingContext2D) {
    // Draw on a canvas
    let s = this.size();
    ctx.beginPath();
    ctx.rect(this.min.x, this.min.y, s.x, s.y);
    ctx.stroke();
  }
}
