//
// A 2D ray
//
import { Vector2 } from '~/lib/geometry/vector2';

export class Ray2 {
  p: Vector2;
  v: Vector2;

  constructor (p: Vector2, v: Vector2) {
    // p is the source point and v is the ray direction
    [this.p, this.v] = [p, v];
  }
  point (t: number) {
    // Assuming the ray describes a parametric line p + tv, it returns
    // the point at the given t
    return this.p.add(this.v.scale(t));
  }
  intersectRay (other: Ray2) {
    // Intersection with another ray. Returns [t,u], i.e.,
    // the parameters for the intersection point in both rays parametric
    // space. If no intersection, returns false
    let [p_0, v_0] = [this.p.x, this.v.x];
    let [p_1, v_1] = [this.p.y, this.v.y];
    let [P_0, V_0] = [other.p.x, other.v.x];
    let [P_1, V_1] = [other.p.y, other.v.y];
    let den = v_0 * V_1 - v_1 * V_0;
    if (Math.abs(den) <= Number.EPSILON) return false;
    let t = (V_1*(P_0 - p_0) + p_1*V_0 - P_1*V_0)/den;
    let u = (v_1*(P_0 - p_0) + p_1*v_0 - P_1*v_0)/den;
    return [t,u]
  }
  intersectSegment (a: Vector2, b: Vector2) {
    // Intersection with line segment ab. Returns the value
    // of the parameter for the intersection or a negative
    // value if no intersection
    let R = new Ray2(a, b.sub(a));
    let result = this.intersectRay (R);
    if (result == false) return false;
    let [t,u] = result;
    if (t > 0 && u >= 0 && u <= 1) return t;
    return -1;
  }
}
