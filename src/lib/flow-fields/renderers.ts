import { FlowField } from '~/lib/flow-fields/flow-field';
import { FlowFieldSample } from '~/lib/flow-fields/flow-field-sample';
import { Vec2, Vector2 } from '~/lib/geometry';

export const renderFlowFieldCells = (
  ctx: CanvasRenderingContext2D,
  flowField: FlowField,
  color = 'black',
  lineWidth = 1,
) => {
  ctx.save();

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  ctx.beginPath();

  // Draw vertical lines
  for (let x = 1; x < flowField.nx; x++) {
    ctx.moveTo(x * flowField.cellSize, 0);
    ctx.lineTo(x * flowField.cellSize, flowField.height);
  }

  // Draw horizontal lines
  for (let y = 1; y < flowField.ny; y++) {
    ctx.moveTo(0, y * flowField.cellSize);
    ctx.lineTo(flowField.width, y * flowField.cellSize);
  }

  ctx.stroke();

  ctx.restore();
}

export const renderFlowFieldSamples = (
  ctx: CanvasRenderingContext2D,
  flowField: FlowField,
  color = 'black',
  scale = 5,
) => {
  ctx.save();

  ctx.strokeStyle = color;

  ctx.beginPath();

  for (const sample of flowField.samples) {
    sample.draw(ctx, color, scale * sample.angle / (2 * Math.PI));
  }

  ctx.restore();
}


// const DEBUG = false;
const DEBUG = true;

export type FlowFieldSampleFunction<T> = (sample: FlowFieldSample) => T;

type FlowFieldRendererConfig = {
  maxLineCount: number,
  dSep: number,
  dTest: number,
  getIsPositionInBounds: (position: Vector2) => boolean,
  getSampleStepLength: FlowFieldSampleFunction<number>,
  getSampleStepWidth: FlowFieldSampleFunction<number>,
  getSampleStepColor: FlowFieldSampleFunction<string>,
  debug: boolean,
}

const defaultConfig: FlowFieldRendererConfig = {
  maxLineCount: 10,
  dSep: 10,
  dTest: 5,
  getIsPositionInBounds: (position: Vector2) => false,
  getSampleStepLength: (sample: FlowFieldSample) => sample.length,
  getSampleStepWidth: (sample: FlowFieldSample) => 2,
  getSampleStepColor: (sample: FlowFieldSample) => 'black',
  debug: false,
};

export const renderFlowField = async (
  ctx: CanvasRenderingContext2D,
  flowField: FlowField,
  config: Partial<FlowFieldRendererConfig> = defaultConfig,
) => {
  const c = { ...defaultConfig, ...config };

  const renderLineConfig = {
    ...c,
    angleOffset: 0,
  }

  ctx.save();

  // Get the starting position
  let result = await getNextStartingPosition(
    ctx,
    flowField,
    c.dSep,
    c.dTest,
    -1,
    1,
    c.debug,
    c.getIsPositionInBounds,
  );

  let lineIndex = 0;
  let checkDirection = 1;
  while (result.success && lineIndex < c.maxLineCount) {
    // Move to starting point
    ctx.moveTo(result.position!.x, result.position!.y);

    // Draw the current line
    const samples = await renderFlowFieldLine(
      ctx,
      flowField,
      lineIndex,
      result.position!,
      renderLineConfig,
    )
    // Add samples to the cells

    const samplesBackwards = samples.length ? await renderFlowFieldLine(
      ctx,
      flowField,
      lineIndex,
      result.position!,
      { ...renderLineConfig, angleOffset: Math.PI, initialOffset: samples[0].getVector().rotate(Math.PI) },
    ) : [];
    flowField.addSamples(samples);
    flowField.addSamples(samplesBackwards);


    // Get the next starting position
    result = await getNextStartingPosition(
      ctx,
      flowField,
      c.dSep,
      c.dTest,
      result.currentSampleIndex,
      checkDirection,
      c.debug,
      c.getIsPositionInBounds,
    );


    lineIndex++;
  }

  console.log('Failed to find a starting position')
  console.log(lineIndex);
  console.log(result)
}

const getNextStartingPosition = async (
  ctx: CanvasRenderingContext2D,
  flowField: FlowField,
  dSep: number,
  dTest: number,
  currentSampleIndex: number = -1,
  checkDirection = 1,
  debug: boolean = false,
  getIsPositionInBounds: (position: Vector2) => boolean = flowField.getIsPositionInBounds,
): Promise<{
  success: boolean;
  position: Vector2 | null;
  currentSampleIndex: number;
}> => {
  // Start at the center of the canvas
  if (currentSampleIndex == -1) {
    return {
      success: true,
      position: Vec2(flowField.width / 2 + (Math.random() * 20), flowField.height / 2 + (Math.random() * 20)),
      currentSampleIndex: 0,
    };
  }

  const position = Vec2();

  const maxStartAttempts = 300000000;
  let attempts = 0;
  // Check each sample
  while (currentSampleIndex < flowField.samples.length) {
    const sample = flowField.samples[currentSampleIndex];

    // Get a point perpendicular to the sample, based on its angle
    let angle = sample.angle + Math.PI / 2 * checkDirection;

    position.x = sample.x + Math.cos(angle) * (dSep + sample.width);
    position.y = sample.y + Math.sin(angle) * (dSep + sample.width);

    if (debug) {
      // Draw a line from the sample to the test position
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 1;
      ctx.moveTo(sample.x, sample.y);
      ctx.lineTo(position.x, position.y);
      ctx.stroke();

      // Draw a circle at the test position
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(position.x, position.y, 2, 0, 2 * Math.PI)
      ctx.fill();


      ctx.restore();
    }

    console.log(currentSampleIndex, flowField.samples.length);
    currentSampleIndex++;
    checkDirection *= -1;

    // Check if the point is too close to another sample
    if (
      getIsPositionInBounds(position) &&
      flowField.getClosestSampleWithinRadius(position, dTest) === null
    ) {
      return {
        success: true,
        position,
        currentSampleIndex: currentSampleIndex - 1,
      };
    }

    attempts++;
  }

  console.log('Failed to find a starting position')
  console.log(attempts)
  console.log(currentSampleIndex)

  return {
    success: false,
    position: null,
    currentSampleIndex,
  };
}

type FlowFieldLineRendererConfig = Pick<
  FlowFieldRendererConfig,
  'dTest' | 'getIsPositionInBounds' | 'getSampleStepLength' | 'getSampleStepWidth' | 'getSampleStepColor' | 'debug'
> & { angleOffset: number, initialOffset: Vector2 }

const defaultLineConfig: FlowFieldLineRendererConfig = {
  ...defaultConfig,
  angleOffset: 0,
  initialOffset: Vec2(),
}

const renderFlowFieldLine = async (
  ctx: CanvasRenderingContext2D,
  flowField: FlowField,
  lineId: number,
  startPosition: Vector2,
  config: Partial<FlowFieldLineRendererConfig> = defaultConfig,
): Promise<FlowFieldSample[]> => {
  const c = { ...defaultLineConfig, ...config };

  ctx.beginPath();

  const samples: FlowFieldSample[] = [];

  const currentPosition = startPosition.clone().add(c.initialOffset);

  let attempts = 0;

  while (
    attempts < 200 &&
    c.getIsPositionInBounds(currentPosition) &&
    flowField.getClosestSampleWithinRadius(currentPosition, c.dTest) === null
  ) {
    attempts++;

    const sample = flowField
      .sample(currentPosition)
      .setLineId(lineId);

    sample
      .setLength(c.getSampleStepLength(sample))
      .setWidth(c.getSampleStepWidth(sample));

    const angle = sample.angle + c.angleOffset;

    // const inBounds = c.getIsPositionInBounds(currentPosition);
    // if (!inBounds) {
    //   break;
    // }

    // TODO switch between drawing a line and drawing a circle
    // Draw a circle at the current position
    ctx.fillStyle = c.getSampleStepColor(sample);
    ctx.beginPath();
    ctx.arc(currentPosition.x, currentPosition.y, sample.width, 0, 2 * Math.PI)
    ctx.fill();

    // Draw a circle at the current position
    if (c.debug) {
      ctx.strokeStyle = 'blue';
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.arc(currentPosition.x, currentPosition.y, c.dTest, 0, 2 * Math.PI)
      ctx.stroke();
    }

    // // Draw the current line segment
    // ctx.lineWidth = sample.width;
    // ctx.strokeStyle = color;
    // ctx.lineTo(currentPosition.x, currentPosition.y);
    //
    // ctx.stroke();

    if (c.debug) {
      await new Promise((resolve) => setTimeout(resolve, 2));
    }

    // Move to the current position
    currentPosition.x += Math.cos(angle) * sample.length;
    currentPosition.y += Math.sin(angle) * sample.length;

    samples.push(sample);
  }

  return samples;
}
