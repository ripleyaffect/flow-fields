import { Vector2 } from '~/lib/geometry';

export enum GeneratorConfigTab {
  canvas,
  flowField,
  lines,
  rendering,
  framing,
}

export type GeneratorConfig = {
  canvas: CanvasConfig;
  framing: FramingConfig;
  flowField: FlowFieldConfig;
  lines: LinesConfig;
  rendering: RenderingConfig;
};

export type CanvasConfig = {
  width: number;
  height: number;
};


// Discriminated union type for flow field configs
export type FlowFieldConfig = {
  selectedType: FlowType;
  perlin: PerlinFlowFieldConfig;
  radial: RadialFlowFieldConfig;
}
export type PerlinFlowFieldConfig = {
  scale: number;
  offset: Vector2;
};


export type RadialFlowFieldConfig = {
  centerOffset: Vector2;
  curveFactor: number;
};

export const flowTypes = {
  Perlin: 'Perlin',
  Radial: 'Radial',
} as const;

export type FlowType = keyof typeof flowTypes;

export type LinesConfig = {
  maxCount: number;
  maxLength: number;
  minThickness: number;
  maxThickness: number;
  distanceFactor: number;
  segmentLength: number;
};

export type RenderingConfig = {
  lineStyle: LineStyle,
  borderColor: string;
  backgroundColor: string;
  segmentedRatio: number;
  palette: string[];
};

export const lineStyles = {
  Solid: 'Solid',
  Dotted: 'Dotted',
} as const;

export type LineStyle = keyof typeof lineStyles;

export type FramingConfig = {
  border: {
    shape: FrameShape;
    scale: Vector2;
  }
  background: {
    shape: FrameShape;
    scale: Vector2;
  },
};

export const frameShapes = {
  Rectangle: 'Rectangle',
  Circle: 'Circle',
} as const;

export type FrameShape = keyof typeof frameShapes;
