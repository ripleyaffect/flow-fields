import {
  CanvasConfig,
  FlowFieldConfig,
  flowTypes,
  LinesConfig,
  PerlinFlowFieldConfig, RadialFlowFieldConfig
} from '~/components/flow-fields/generator/types';
import { useEffect, useState } from 'react';
import { FlowField, FlowFieldSample, FlowFieldSampleFunction } from '~/lib/flow-fields';
import { Vec2, Vector2 } from '~/lib/geometry';
import { Noise } from '~/lib/noise';
import { sampleFlowField } from '~/lib/flow-fields/sampling';
import Poisson from 'poisson-disk-sampling';

const DEBUG = false;
// const DEBUG = true;

export const useFlowField = (
  canvasConfig: CanvasConfig,
  flowFieldConfig: FlowFieldConfig,
  linesConfig: LinesConfig,
) => {
  const [flowField, setFlowField] = useState(new FlowField(getFlowFieldFunction(canvasConfig, flowFieldConfig)));
  const [isGeneratingSamples, setIsGeneratingSamples] = useState(false);

  const generateSamples = async (
    flowField: FlowField,
    linesConfig: LinesConfig,
    debug: boolean,
  ) => {
    console.log('Generating samples...');

    setIsGeneratingSamples(true);

    if (debug) {
      await generateDebugSamples(flowField, linesConfig);
      return;
    } else {
      await generateLineSamples(flowField, linesConfig);
    }

    setIsGeneratingSamples(false);
  };

  useEffect(() => {
    const newFlowField = new FlowField(
      getFlowFieldFunction(canvasConfig, flowFieldConfig)
    ).initialize(
      canvasConfig.width,
      canvasConfig.height,
      linesConfig.maxThickness,
    );

    // Wait until the samples are generated before setting the new flow field,
    // so that we don't trigger a re-render until the samples are ready.
    generateSamples(
      newFlowField,
      linesConfig,
      DEBUG,
    ).then(() => {
      setFlowField(newFlowField);
    });
  }, [canvasConfig, flowFieldConfig, linesConfig]);

  return {
    flowField,
    isGeneratingSamples,
  };
};

const getFlowFieldFunction = (canvasConfig: CanvasConfig, flowFieldConfig: FlowFieldConfig) => {
  switch (flowFieldConfig.selectedType) {
    case flowTypes.Perlin:
      return getPerlinFlowFieldFunction(canvasConfig, flowFieldConfig.perlin);
    case flowTypes.Radial:
      return getRadialFlowFieldFunction(canvasConfig, flowFieldConfig.radial);
  }
};

const getPerlinFlowFieldFunction = (canvasConfig: CanvasConfig, config: PerlinFlowFieldConfig) => {
  return (position: Vector2) => (Noise.perlin2(
    config.offset.x + (position.x / canvasConfig.width * config.scale),
    config.offset.y + (position.y / canvasConfig.height * config.scale)
  ) + 1) * Math.PI;
};

const getRadialFlowFieldFunction = (canvasConfig: CanvasConfig, flowFieldConfig: RadialFlowFieldConfig) => {
  return (position: Vector2) => {
    const normalizedPosition = Vec2(
      position.x / canvasConfig.width,
      position.y / canvasConfig.height,
    ).sub(flowFieldConfig.centerOffset);

    return (
      Math.atan2(normalizedPosition.y, normalizedPosition.x) +
      Math.PI * normalizedPosition.mag() * flowFieldConfig.curveFactor
    );
  }
};

const generateDebugSamples = async (flowField: FlowField, linesConfig: LinesConfig) => {
  for (let x = 1; x < flowField.nx - 1; x += 1) {
    for (let y = 1; y < flowField.ny - 1; y += 1) {
      const position = Vec2(x * flowField.cellSize, y * flowField.cellSize);
      const sample = flowField
        .sample(position)
        .setLength(linesConfig.segmentLength)
        .setWidth(linesConfig.minThickness);

      flowField.addSample(sample);
    }
  }
};

const generateLineSamples = async (flowField: FlowField, linesConfig: LinesConfig) => {
  await sampleFlowField(
    flowField,
    {
      maxLineCount: linesConfig.maxCount,
      dSep: linesConfig.maxThickness,
      dTest: linesConfig.maxThickness * linesConfig.distanceFactor,
      getSampleStepLength: (sample) => getSampleStepLength(sample, linesConfig),
      getSampleStepWidth: (sample) => getSampleStepWidth(sample, linesConfig)
    },
  );
}

const getSampleStepLength = (sample: FlowFieldSample, linesConfig: LinesConfig) => {
  return linesConfig.segmentLength;
};

// Possible size values
const SIZES = 100;

const getSampleStepWidth = (sample: FlowFieldSample, linesConfig: LinesConfig) => {
  const sizeRatio = ((sample.lineId + 17) * 19 % SIZES / SIZES);
  return linesConfig.minThickness + (linesConfig.maxThickness - linesConfig.minThickness) * sizeRatio;
};
