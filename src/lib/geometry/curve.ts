// A curve is an array of points
import { Vec2, Vector2 } from '~/lib/geometry/vector2';
import { MBR } from '~/lib/geometry/mbr';
import { BinaryHeap } from '~/lib/geometry/binary-heap';
import { CatmullRom } from '~/lib/geometry/catmull-rom';

export class Curve extends Array<Vector2> {
  constructor(args: Vector2[] = []) {
    super(...args);
  }

  // Returns an array with the same size as this curve where each element
  // is the total arc length at that point
  arcLength() {
    let q = this[0];
    let r = 0;
    let per = [];
    per[0] = 0;
    for (let i = 1; i < this.length; i++) {
      const p = this[i];
      r += p.dist(q);
      per[i] = r;
      q = p;
    }
    return per;
  }

  // Total length of the curve
  perimeter() {
    return this.arcLength()[this.length - 1];
  }

  // Returns the area enclosed by the curve
  area() {
    let s = 0.0;
    for (let i = 0; i < this.length; i++) {
      let j = (i + 1) % this.length;
      s += this[i].x * this[j].y;
      s -= this[i].y * this[j].x;
    }
    return s;
  }

  // Centroid of the curve
  centroid() {
    let p = Vec2();
    for (let q of this) {
      p.x += q.x;
      p.y += q.y;
    }
    p.x /= this.length;
    p.y /= this.length;
    return p;
  }

  // A minimum bounding rectangle for the curve
  mbr() {
    let r = new MBR();
    for (let p of this) r.add(p);
    return r;
  }

  // Returns true if this curve (assuming it represents a closed simple polygon)
  // contains point p.
  contains(point: Vector2) {
    let n = this.length,
      { x: x0, y: y0 } = this[n - 1],
      { x, y } = point,
      x1,
      y1,
      inside = false;

    for (let { x: x1, y: y1 } of this) {
      if (y1 > y !== y0 > y && x < ((x0 - x1) * (y - y1)) / (y0 - y1) + x1)
        inside = !inside;
      x0 = x1;
      y0 = y1;
    }

    return inside;
  }

  // Returns a subsampled version of this curve, where tol is
  // the maximum allowed Douglas Peucker distance and count is the
  // maximum number of points allowed
  subsample(tol = 0, count = 1e10) {
    let rank = douglasPeuckerRank(this, tol);
    const r = new Curve();
    for (let i = 0; i < this.length; i++) {
      if (rank[i] != undefined && rank[i] < count) {
        r.push(this[i]);
      }
    }
    return r;
  }

  // Returns a Chaikin subsampled version of this curve
  chaikin(closed = false) {
    let r = new Curve();
    let [q, i] = closed ? [this[this.length - 1], 0] : [this[0], 1];
    for (; i < this.length; i++) {
      let p = this[i];
      let e = p.sub(q);
      if (closed || i != 1) r.push(q.add(e.scale(0.25)));
      else r.push(q);
      if (closed || i + 1 < this.length) r.push(q.add(e.scale(0.75)));
      else r.push(p);
      q = p;
    }
    return r;
  }

  // Returns another curve resampled by arc length with n points
  resample(n: number, closed = false) {
    if (closed) {
      n++;
      this.push(this[0]);
    }
    let per = this.arcLength();
    let len = per[per.length - 1];
    let dlen = len / (n - 1);
    let p = this[0];
    let r = new Curve();
    r.push(p.clone());
    let j = 0;
    for (let i = 1; i < n; i++) {
      let d = dlen * i;
      while (j + 1 < this.length - 1 && per[j + 1] < d) j++;
      let rate = per[j + 1] - per[j];
      let alpha = rate == 0 ? 0 : (d - per[j]) / rate;
      let pt = this[j].mix(this[j + 1], alpha);
      r.push(pt);
    }
    if (closed) {
      this.pop();
      r.pop();
    }
    return r;
  }

  // Returns a resampling of this curve with n points where the original points are considered
  // control points. If not closed, the first and last points are considered twice so that
  // the catmull-rom spline interpolates them. If closed, the first and last points are also
  // considered twice, but in the opposite order. The tension parameter controls the spline interpolation
  splineResample(n: number, closed = false, tension = 0.5) {
    let p = (closed ? [] : [this[0]]).concat(this);
    if (!closed) p.push(this[this.length - 1]);
    let cr = new CatmullRom(this);
    cr.tension = tension;
    let r = new Curve();
    let f = closed ? this.length / (n - 1) : (this.length - 1) / (n - 1);
    for (let i = 0; i < n; i++) {
      let u = i * f;
      r.push(cr.point(u));
    }
    return r;
  }

  draw(ctx: CanvasRenderingContext2D, color: string = 'black', size: number = 3) {
    ctx.beginPath();

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = size;

    ctx.moveTo(this[0].x, this[0].y);
    for (let i = 1; i < this.length; i++) {
      ctx.lineTo(this[i].x, this[i].y);
    }

    ctx.stroke();
  }
}

// Creates a Douglas Peucker Item, which
// represents a span of a polyline and the farthest element from the
// line segment connecting the first and the last element of the span.
// Poly is an array of points, first is the index of the first element of the span,
// and last the last element.
function dpItem(first: number, last: number, poly: Vector2[]) {
  let dist = 0;
  let farthest = first + 1;
  const a = poly[first];
  const b = poly[last];

  for (let i = first + 1; i < last; i++) {
    const d = poly[i].distSegment(a, b);
    if (d > dist) {
      dist = d;
      farthest = i;
    }
  }

  return {
    first: first,
    last: last,
    farthest: farthest,
    dist: dist
  };
}

// Returns an array of ranks of vertices of a polyline according to the
// generalization order imposed by the Douglas Peucker algorithm.
// Thus, if the ith element has value k, then vertex i would be the (k+1)th
// element to be included in a generalization (simplification) of this polyline.
// Does not consider vertices farther than tol. Disconsidered
// vertices are left undefined in the result.
function douglasPeuckerRank(poly: Vector2[], tol: number) {
  // A priority queue of intervals to subdivide, where top priority is the biggest dist
  const pq = new BinaryHeap(function (dpi) {
    return -dpi.dist;
  });

  // The result vector
  const r = [];

  // Put the first and last vertices in the result
  r[0] = 0;
  r[poly.length - 1] = 1;

  // Add first interval to pq
  if (poly.length <= 2) {
    return r;
  }
  pq.push(dpItem(0, poly.length - 1, poly));

  // The rank counter
  let rank = 2;

  // Recursively subdivide up to tol
  while (pq.size() > 0) {
    const item = pq.pop();
    if (item.dist < tol) break; // All remaining points are closer
    r[item.farthest] = rank++;
    if (item.farthest > item.first + 1) {
      pq.push(dpItem(item.first, item.farthest, poly));
    }
    if (item.last > item.farthest + 1) {
      pq.push(dpItem(item.farthest, item.last, poly));
    }
  }

  return r;
}
