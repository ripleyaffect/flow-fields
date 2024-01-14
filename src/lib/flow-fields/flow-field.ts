import { FlowFieldSample } from './flow-field-sample';
import { Vec2, Vector2 } from '~/lib/geometry';

type FieldFunction = (position: Vector2) => number;

export class FlowField {
  width: number = 1000;
  height: number = 1000;
  cellSize: number = 50;

  nx: number = this.width / this.cellSize;
  ny: number = this.height / this.cellSize;

  fieldFunction: FieldFunction;

  samples: FlowFieldSample[] = [];
  cells: number[][][] = [];

  constructor(fieldFunction: FieldFunction = () => 0) {
    this.fieldFunction = fieldFunction;
  }

  setFieldFunction(fieldFunction: FieldFunction) {
    this.fieldFunction = fieldFunction;
    return this;
  }

  initialize(width: number, height: number, cellSize: number) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.nx = Math.ceil(width / cellSize);
    this.ny = Math.ceil(height / cellSize);

    return this.clear();
  }

  clear() {
    this.samples = [];
    return this.initializeCells();
  }

  clone() {
    let copy = new FlowField(this.fieldFunction).initialize(this.width, this.height, this.cellSize);
    copy.cells = [...this.cells.map((row) => [...row])];
    return copy;
  }

  getIsPositionInBounds(position: Vector2) {
    return (
      position.x >= 0 && position.x < this.width &&
      position.y >= 0 && position.y < this.height
    );
  }

  sample(position: Vector2) {
    return new FlowFieldSample(position, this.fieldFunction(position));
  }

  addSamples(samples: FlowFieldSample[]) {
    for (const sample of samples) {
      this.addSample(sample);
    }

    return this;
  }

  addSample(sample: FlowFieldSample) {
    // Add the sample to the samples array and get its index
    const sampleIndex = this.samples.push(sample) - 1;
    const { x, y } = this.getContainingCellIndex(sample);

    // Add the sample index to the closest cell
    this.cells[x][y].push(sampleIndex);

    return this;
  }

  private initializeCells() {
    this.cells = [];
    // Initialize cells array
    for (let i = 0; i < this.nx; i++) {
      this.cells[i] = [];
      for (let j = 0; j < this.ny; j++) {
        this.cells[i][j] = [];
      }
    }

    return this;
  }

  getClosestSampleWithinRadius(position: Vector2, radius: number) {
    const closestSample = this.getClosestSample(position, Math.ceil(radius / this.cellSize));

    if (closestSample && closestSample.dist(position) < radius) {
      return closestSample;
    }
    return null;
  }

  getClosestSample(position: Vector2, radius: number = 1) {
    const samples = this.getNeighboringSamples(position);

    if (samples.length === 0) {
      return null;
    }

    let closestSample = samples[0];

    let closestDistance = closestSample.dist(position);

    for (let i = 1; i < samples.length; i++) {
      const sample = samples[i];
      const distance = sample.dist(position);
      if (distance < closestDistance) {
        closestSample = sample;
        closestDistance = distance;
      }
    }

    return closestSample;
  }

  getNeighboringSamples(position: Vector2, radius: number = 1) {
    // Get the integer coordinates of the cell containing the point
    const { x, y } = this.getContainingCellIndex(position);

    const samples: FlowFieldSample[] = [];

    // Get the samples in the neighboring cells
    for (let i = x - radius; i <= x + radius; i++) {
      for (let j = y - radius; j <= y + radius; j++) {
        if (i < 0 || i >= this.nx || j < 0 || j >= this.ny) {
          continue;
        }
        samples.push(...this.cells[i][j].map((sampleIndex) => this.samples[sampleIndex]));
      }
    }

    return samples;
  }

  getSamplesInCell(position: Vector2) {
    return this.getContainingCell(position).map((sampleIndex) => this.samples[sampleIndex]);
  }

  getContainingCell(position: Vector2) {
    const { x, y } = this.getContainingCellIndex(position);
    return this.cells[x][y];
  }

  getContainingCellIndex(position: Vector2) {
    return Vec2(
      ~~(position.x / this.cellSize),
      ~~(position.y / this.cellSize),
    );
  }
}
