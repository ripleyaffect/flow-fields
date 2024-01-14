import { angleLerp } from './angle-lerp';
import { Arrow } from '~/lib/flow-fields/arrow';
import { BlobCurve, Curve, Vec2, Vector2 } from '~/lib/geometry';

export class GridField {
  width: number;
  height: number;
  cellSize: number;

  nx: number;
  ny: number;
  grid: number[][];

  constructor(width: number, height: number, cellSize: number) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.nx = Math.round(width / cellSize);
    this.ny = Math.round(height / cellSize);

    this.grid = [];

    const defaultAngle = Math.PI*0.25;

    // Initialize grid
    for (let i = 0; i < this.nx; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.ny; j++) {
        this.grid[i][j] = defaultAngle;
      }
    }
  }
  clone() {
    let copy = new GridField(this.width, this.height, this.cellSize);
    copy.grid = [...this.grid.map((row) => [...row])];
    return copy;
  }
  getCell(ix: number, iy: number) {
    ix = Math.min(this.nx - 1, Math.max(0, ix));
    iy = Math.min(this.ny - 1, Math.max(0, iy));
    return this.grid[ix][iy];
  }
  setCell(ix: number, iy: number, angle: number) {
    if (ix < this.nx && ix >= 0 && iy < this.ny && iy >= 0)
      this.grid[ix][iy] = angle;
  }
  getCellIndex(x: number, y: number) {
    return [~~(x / this.cellSize), ~~(y / this.cellSize)];
  }

  getField(x: number, y: number) {
    let [ix, iy] = this.getCellIndex(x, y);
    let alphax = (x % this.cellSize) / this.cellSize;
    let alphay = (y % this.cellSize) / this.cellSize;

    return angleLerp(
      angleLerp(this.getCell(ix, iy), this.getCell(ix + 1, iy), alphax),
      angleLerp(this.getCell(ix, iy + 1), this.getCell(ix + 1, iy + 1), alphax),
      alphay
    );
  }

  draw(ctx: CanvasRenderingContext2D, color: string = 'black') {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;

    for (let i = 0; i < this.nx; i++) {
      for (let j = 0; j < this.ny; j++) {
        const arrow = new Arrow(
          Vec2((i + 0.5) * this.cellSize, (j + 0.5) * this.cellSize),
          this.getCell(i, j),
          this.cellSize * 0.8
        )
        arrow.draw(ctx, color);
      }
    }

    ctx.stroke();
  }

  getCurve(origin: Vector2, stepLength: number, numSteps: number) {
    const curve = new Curve();

    let current = origin;
    for (let i = 0; i < numSteps; i++) {
      const angle = this.getField(...current.array());
      const arrow = new Arrow(current, angle, stepLength);
      curve.push(arrow.end);
      current = arrow.end;
    }

    return curve;
  }

  adjustBlobCurve(blob: BlobCurve, stepLength: number, numSteps: number) {
    for (let i = 0; i < blob.points.length; i++) {
      for (let j = 0; j < numSteps; j++) {
        const angle = this.getField(...blob.points[i].array());
        const arrow = new Arrow(blob.points[i], angle, stepLength);
        blob.points[i] = arrow.end;
      }
    }
  }
}
