import { Vec2, Vector2 } from './vector2';

export class BlobCurve {
  points: Vector2[];

  constructor(origin: Vector2, radius: number = 10, segments: number = 10) {
    this.points = [];
    for (let i = 0; i < segments; i++) {
      let angle = i * Math.PI * 2 / segments;
      this.points.push(origin.add(Vec2(radius, 0).rotate(angle)));
    }
  }

  draw(ctx: CanvasRenderingContext2D, color: string = 'black') {
    ctx.save();

    ctx.beginPath();
    ctx.moveTo(...this.points[0].array());
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(...this.points[i].array());
    }

    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();

    ctx.restore();
  }
}
