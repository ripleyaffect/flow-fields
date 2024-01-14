import { frameShapes, flowTypes, GeneratorConfig, lineStyles } from '~/components/flow-fields/generator/types';
import { Vec2 } from '~/lib/geometry';

const CANVAS_SIZE = 1024;

export const defaultGeneratorConfig: GeneratorConfig = {
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
  },
  flowField: {
    selectedType: flowTypes.Radial,
    perlin: {
      scale: 1,
      offset: Vec2(),
    },
    radial: {
      centerOffset: Vec2(0.5, 0.5),
      curveFactor: 1,
    },
  },
  lines: {
    maxCount: 250,
    maxLength: 100,
    minThickness: 2,
    maxThickness: 20,
    segmentLength: 5,
    distanceFactor: 1,
  },
  rendering: {
    lineStyle: lineStyles.Solid,
    borderColor: '#FFFFFF',
    backgroundColor: '#000000',
    segmentedRatio: 0,
    palette: [
      '#FF0000',
      '#00FF00',
      '#0000FF',
    ],
  },
  framing: {
    border: {
      shape: frameShapes.Rectangle,
      scale: Vec2(1, 1),
    },
    background: {
      shape: frameShapes.Rectangle,
      scale: Vec2(1, 1),
    }
  }
}
