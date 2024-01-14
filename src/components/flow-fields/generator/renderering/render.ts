import { FlowField, FlowFieldSample } from '~/lib/flow-fields';
import {
  CanvasConfig,
  RenderingConfig,
  FramingConfig,
  GeneratorConfig,
  lineStyles, frameShapes
} from '~/components/flow-fields/generator/types';
import { Vec2, Vector2 } from '~/lib/geometry';

export const render = (
  ctx: CanvasRenderingContext2D,
  flowField: FlowField,
  canvasConfig: CanvasConfig,
  coloringConfig: RenderingConfig,
  framingConfig: FramingConfig,
) => {
  ctx.clearRect(0, 0, canvasConfig.width, canvasConfig.height);

  renderBorder(
    ctx,
    canvasConfig,
    coloringConfig,
  );

  renderBackground(
    ctx,
    canvasConfig,
    coloringConfig,
    framingConfig,
  );

  renderFlowField(
    ctx,
    flowField,
    canvasConfig,
    coloringConfig,
    framingConfig,
  );
}

const renderBorder = (
  ctx: CanvasRenderingContext2D,
  canvasConfig: CanvasConfig,
  renderingConfig: RenderingConfig,
) => {
  ctx.fillStyle = renderingConfig.borderColor;
  ctx.fillRect(0, 0, canvasConfig.width, canvasConfig.height);
};

const renderBackground = (
  ctx: CanvasRenderingContext2D,
  canvasConfig: CanvasConfig,
  renderingConfig: RenderingConfig,
  framingConfig: FramingConfig,
) => {
  ctx.fillStyle = renderingConfig.backgroundColor;

  switch (framingConfig.background.shape) {
    case 'Rectangle':
      renderRectangleBackground(ctx, canvasConfig, framingConfig);
      break;
    case 'Circle':
      renderEllipseBackground(ctx, canvasConfig, framingConfig);
      break;
  }
};

const renderRectangleBackground = (
  ctx: CanvasRenderingContext2D,
  canvasConfig: CanvasConfig,
  framingConfig: FramingConfig,
) => {
  const width = framingConfig.background.scale.x * canvasConfig.width;
  const height = framingConfig.background.scale.y * canvasConfig.height;
  const bufferX = (canvasConfig.width - width) / 2
  const bufferY = (canvasConfig.height - height) / 2

  ctx.fillRect(
    bufferX,
    bufferY,
    width,
    height,
  );
};

const renderEllipseBackground = (
  ctx: CanvasRenderingContext2D,
  canvasConfig: CanvasConfig,
  framingConfig: FramingConfig,
) => {
  const radius = Math.min(
    canvasConfig.width,
    canvasConfig.height,
  ) / 2 * framingConfig.background.scale.x;
  ctx.beginPath();
  ctx.ellipse(
    canvasConfig.width / 2,
    canvasConfig.height / 2,
    radius,
    radius,
    0,
    0,
    2 * Math.PI,
  );
  ctx.fill();
};

const renderFlowField = (
  ctx: CanvasRenderingContext2D,
  flowField: FlowField,
  canvasConfig: CanvasConfig,
  renderingConfig: RenderingConfig,
  framingConfig: FramingConfig,
) => {
  console.log('Drawing flow field');

  console.log(flowField.samples.length);
  for (const sample of flowField.samples) {
    if (!getShouldRender(sample, canvasConfig, framingConfig)) continue;
    renderSampleLine(ctx, sample, renderingConfig);
    // sample.draw(ctx, coloringConfig.palette[0], 10);
  }
}

const getShouldRender = (
  sample: FlowFieldSample,
  canvasConfig: CanvasConfig,
  framingConfig: FramingConfig
) => {
  switch (framingConfig.border.shape) {
    case frameShapes.Rectangle:
      return getShouldRenderRectangle(
        sample,
        canvasConfig,
        framingConfig,
      );
    case frameShapes.Circle:
      return getShouldRenderCircle(
        sample,
        canvasConfig,
        framingConfig,
      );
  }
}

const getShouldRenderRectangle = (
  sample: FlowFieldSample,
  canvasConfig: CanvasConfig,
  framingConfig: FramingConfig
) => {
  const posX = sample.x / canvasConfig.width;
  const posY = sample.y / canvasConfig.height;

  const offsetX = (1 - framingConfig.border.scale.x) / 2;
  const offsetY = (1 - framingConfig.border.scale.y) / 2

  return (
    posX >= offsetX &&
    posX <= 1 - offsetX &&
    posY >= offsetY &&
    posY <= 1 - offsetY
  );
}

const getShouldRenderCircle = (
  sample: FlowFieldSample,
  canvasConfig: CanvasConfig,
  framingConfig: FramingConfig
) => {
  const normalizedPos = Vec2(
    sample.x / canvasConfig.width,
    sample.y / canvasConfig.height,
  );
  const center = Vec2(0.5, 0.5);

  return normalizedPos.sub(center).mag() < framingConfig.border.scale.x / 2;
}

const renderSampleLine = (
  ctx: CanvasRenderingContext2D,
  sample: FlowFieldSample,
  renderingConfig: RenderingConfig,
) => {
  const distVector = sample.getVector().scale(1);

  const isSegmented =
    renderingConfig.segmentedRatio > 0 &&
    ((sample.lineId + 3) * 13 % 100 / 100) < renderingConfig.segmentedRatio;

  const color = isSegmented
    ? renderingConfig.palette[Math.floor(Math.random() * renderingConfig.palette.length)]
    : renderingConfig.palette[sample.lineId % renderingConfig.palette.length];

  switch (renderingConfig.lineStyle) {
    case lineStyles.Solid:
      renderLine(
        ctx,
        sample.sub(distVector),
        sample.add(distVector),
        color,
        sample.width,
      );
      break;
    case lineStyles.Dotted:
      renderPoint(
        ctx,
        sample,
        color,
        sample.width
      );
      break;

  }
}

const renderLine = (
  ctx: CanvasRenderingContext2D,
  from: Vector2,
  to: Vector2,
  color: string = 'red',
  thickness: number = 5
) => {
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.stroke();
}

const renderPoint = (
  ctx: CanvasRenderingContext2D,
  position: Vector2,
  color: string = 'red',
  thickness: number = 5
) => {
  ctx.beginPath();
  ctx.arc(position.x, position.y, thickness / 2, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}
