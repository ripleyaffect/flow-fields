import { Vec2, Vector2 } from '~/lib/geometry';

const DEFAULT_SAMPLE_LENGTH = 10;
const DEFAULT_SAMPLE_WIDTH = 2;

export class FlowFieldSample extends Vector2 {
  lineId: number = 0;

  angle: number;
  length: number = DEFAULT_SAMPLE_LENGTH;
  width: number = DEFAULT_SAMPLE_WIDTH;

  constructor(
    position: Vector2,
    angle: number,
    length: number = DEFAULT_SAMPLE_LENGTH,
    width: number = DEFAULT_SAMPLE_WIDTH,
  ) {
    super(position.x, position.y);
    this.angle = angle;
    this.length = length;
    this.width = width;
  }

  setLineId(lineId: number) {
    this.lineId = lineId;
    return this;
  }

  setAngle(angle: number) {
    this.angle = angle;
    return this;
  }

  setLength(length: number) {
    this.length = length;
    return this;
  }

  setWidth(width: number) {
    this.width = width;
    return this;
  }

  getEndPoint() {
    return this.add(this.getVector());
  }

  getVector() {
    return Vec2(
      this.length * Math.cos(this.angle),
      this.length * Math.sin(this.angle)
    );
  }
}
