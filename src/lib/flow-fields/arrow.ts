import { Vec2, Vector2 } from '~/lib/geometry';

export class Arrow {
  origin: Vector2;
  angle: number;
  length: number;

  constructor(origin: Vector2, angle: number = 0, length: number = 10) {
    this.origin = origin;
    this.angle = angle;
    this.length = length;
  }

  get end() {
    const v = Vec2(1, 0).rotate(this.angle);
    return this.origin.add(v.scale(this.length));
  }

  draw(ctx: CanvasRenderingContext2D, color: string = 'black', stroke: Boolean = false) {
    ctx.save()

    let v = Vec2(1, 0).rotate(this.angle);
    let p = this.origin;
    ctx.moveTo(...p.sub(v.scale(this.length / 2)).array());
    let q = p.add(v.scale(this.length / 2));
    ctx.lineTo(...q.array());
    let u = v.scale(this.length / 4);
    ctx.moveTo(...q.add(u.rotate(Math.PI * 0.75)).array());
    ctx.lineTo(...q.array());
    ctx.lineTo(...q.add(u.rotate(-Math.PI * 0.75)).array());

    if (stroke) {
      ctx.strokeStyle = color;
      ctx.stroke();
    }

    ctx.restore();
  }
}
