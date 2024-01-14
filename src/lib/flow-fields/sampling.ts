import { FlowFieldSample } from '~/lib/flow-fields/flow-field-sample';
import { Vec2, Vector2 } from '~/lib/geometry';
import { FlowField } from '~/lib/flow-fields/flow-field';

export type FlowFieldSampleFunction<T> = (sample: FlowFieldSample) => T;

type FlowFieldRendererConfig = {
  maxLineCount: number,
  dSep: number,
  dTest: number,
  getSampleStepLength: FlowFieldSampleFunction<number>,
  getSampleStepWidth: FlowFieldSampleFunction<number>,
  debug: boolean,
}

const defaultConfig: FlowFieldRendererConfig = {
  maxLineCount: 10,
  dSep: 10,
  dTest: 5,
  getSampleStepLength: (sample: FlowFieldSample) => sample.length,
  getSampleStepWidth: (sample: FlowFieldSample) => sample.width,
  debug: false,
};

export const sampleFlowField = async (
  flowField: FlowField,
  config: Partial<FlowFieldRendererConfig> = defaultConfig,
) => {
  const c = { ...defaultConfig, ...config };

  const renderLineConfig = {
    ...c,
    angleOffset: 0,
  }

  // Get the starting position
  let result = await getNextStartingPosition(
    flowField,
    c.dSep,
    c.dTest,
    -1,
    1,
  );

  let lineIndex = 0;
  let checkDirection = 1;
  while (result.success && lineIndex < c.maxLineCount) {
    // Draw the current line
    const samples = await sampleFlowFieldLine(
      flowField,
      lineIndex,
      result.position!,
      renderLineConfig,
    )

    // Draw the line backwards
    const samplesBackwards = samples.length ? await sampleFlowFieldLine(
      flowField,
      lineIndex,
      result.position!,
      { ...renderLineConfig, angleOffset: Math.PI, initialOffset: samples[0].getVector().rotate(Math.PI) },
    ) : [];

    // Add samples to the cells
    flowField.addSamples(samples);
    flowField.addSamples(samplesBackwards);

    // Get the next starting position
    result = await getNextStartingPosition(
      flowField,
      c.dSep,
      c.dTest,
      result.currentSampleIndex,
      checkDirection,
    );

    lineIndex++;
  }
}

const getNextStartingPosition = async (
  flowField: FlowField,
  dSep: number,
  dTest: number,
  currentSampleIndex: number = -1,
  checkDirection = 1,
): Promise<{
  success: boolean;
  position: Vector2 | null;
  currentSampleIndex: number;
}> => {
  // Start at the center of the canvas
  if (currentSampleIndex == -1) {
    return {
      success: true,
      position: Vec2(flowField.width / 2, flowField.height / 2),
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

    currentSampleIndex++;
    checkDirection *= -1;

    // Check if the point is too close to another sample
    if (
      flowField.getIsPositionInBounds(position) &&
      flowField.getClosestSampleWithinRadius(position, sample.width + dTest) === null
    ) {
      return {
        success: true,
        position,
        currentSampleIndex: currentSampleIndex - 1,
      };
    }

    attempts++;
  }

  return {
    success: false,
    position: null,
    currentSampleIndex,
  };
}

type FlowFieldLineRendererConfig = Pick<
  FlowFieldRendererConfig,
  'dTest' | 'getSampleStepLength' | 'getSampleStepWidth' | 'debug'
> & { angleOffset: number, initialOffset: Vector2 }

const defaultLineConfig: FlowFieldLineRendererConfig = {
  ...defaultConfig,
  angleOffset: 0,
  initialOffset: Vec2(),
}

const sampleFlowFieldLine = async (
  flowField: FlowField,
  lineId: number,
  startPosition: Vector2,
  config: Partial<FlowFieldLineRendererConfig> = defaultConfig,
): Promise<FlowFieldSample[]> => {
  const c = { ...defaultLineConfig, ...config };

  const samples: FlowFieldSample[] = [];

  const currentPosition = startPosition.clone().add(c.initialOffset);

  let attempts = 0;
  let currentWidth = 0;

  while (
    attempts < 200 &&
    flowField.getIsPositionInBounds(currentPosition) &&
    flowField.getClosestSampleWithinRadius(currentPosition, currentWidth + c.dTest) === null
  ) {
    attempts++;

    const sample = flowField
      .sample(currentPosition)
      .setLineId(lineId);

    currentWidth = c.getSampleStepWidth(sample);

    sample
      .setLength(c.getSampleStepLength(sample))
      .setWidth(currentWidth);

    const angle = sample.angle + c.angleOffset;

    // Move to the current position
    currentPosition.x += Math.cos(angle) * sample.length;
    currentPosition.y += Math.sin(angle) * sample.length;

    samples.push(sample);
  }

  return samples;
}
