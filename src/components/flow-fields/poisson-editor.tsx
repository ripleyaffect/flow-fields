'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Slider } from '~/components/ui/slider';
import { Label } from '~/components/ui/label';
import Poisson from 'poisson-disk-sampling';
import { Noise } from '~/lib/noise';
import {
  Arrow,
  FlowField, FlowFieldSample, renderFlowField,
  renderFlowFieldCells,
  renderFlowFieldSamples
} from '~/lib/flow-fields';
import { Vec2, Vector2 } from '~/lib/geometry';
import { Checkbox } from '~/components/ui/checkbox';

const size = 1000;

export const PoissonEditor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [borderWidth, setBorderWidth] = React.useState(10);
  const [borderColor, setBorderColor] = React.useState('#AAAAAA');
  const [backgroundScale, setBackgroundScale] = React.useState(1);
  const [bgColor, setBgColor] = React.useState('#FFFFFF');
  const [color1, setColor1] = React.useState('#000000');
  const [color2, setColor2] = React.useState('#000000');
  const [noiseScale, setNoiseScale] = React.useState(2);
  const [noiseOffsetX, setNoiseOffsetX] = React.useState(0);
  const [noiseOffsetY, setNoiseOffsetY] = React.useState(0);
  const [maxLineCount, setMaxLineCount] = React.useState(100);
  const [lineWidth, setLineWidth] = React.useState(5);
  const [lineStepLength, setLineStepLength] = React.useState(20);
  const [maxLineLength, setMaxLineLength] = React.useState(100);
  const [distanceThreshold, setDistanceThreshold] = React.useState(10);
  const [testDistanceMultiplier, setTestDistanceMultiplier] = React.useState(0.5);
  const [debug, setDebug] = React.useState(false);

  const fieldFunction = useCallback((position: Vector2) => {
    const center = size / 2;

    // place the positions in a -1 to 1 range
    const x = (position.x - center) / (size / 2);
    const y = (position.y - center) / (size / 2);

    // Handle the center point
    if (x === 0 && y === 0) {
      return 0; // Default angle at the center
    }

    // Calculate the angle from the center to the point
    let angle = Math.atan2(y, x);

    // Calculate distance from the center
    let distance = Math.sqrt(x * x + y * y);

    // Implement a minimum distance threshold
    const minDistance = 0.01; // Adjust as needed
    if (distance < minDistance) {
      distance = minDistance; // Avoid tight loops near the center
    }

    // Adjust the angle based on the distance and curl factor
    // The adjustment is reduced as the distance approaches the threshold
    let adjustment = noiseScale / 10 * (distance - minDistance);
    return angle + adjustment;


    // const angle = Math.atan2(y, x);
    // const distance = Math.sqrt(x * x + y * y);
    //
    // return angle + noiseScale * distance;

    return (Noise.perlin2(
      noiseOffsetX + (position.x / size * noiseScale),
      noiseOffsetY + (position.y / size * noiseScale)
    ) + 1) * Math.PI;
  }, [noiseScale, noiseOffsetX, noiseOffsetY]);

  const [flowField] = React.useState<FlowField>(
    new FlowField(fieldFunction).initialize(size, size, lineWidth + distanceThreshold)
  );

  const [points, setPoints] = React.useState<[number, number][]>([]);

  const getIsPositionInBounds = useCallback((position: Vector2) => {
    return (
      position.x >= borderWidth && position.x < size - borderWidth &&
      position.y >= borderWidth && position.y < size - borderWidth
    );
  }, [flowField, borderWidth]);

  const getSampleStepLength = useCallback((sample: FlowFieldSample) => {
    return lineStepLength;
  }, [lineStepLength]);

  const getSampleStepWidth = useCallback((sample: FlowFieldSample) => {
    const center = size / 2;
    const distance = Math.sqrt((sample.x - center) ** 2 + (sample.y - center) ** 2);

    // return lineWidth * (1 - distance / size / 1.2);

    return lineWidth;
    return Math.max((sample.lineId % 3) * lineWidth, lineWidth);
  }, [lineWidth]);

  const getSampleStepColor = useCallback((sample: FlowFieldSample) => {
    // console.log(sample.id % 2)
    if ((sample.lineId % 2) < 1) {
      return color2;
    }
    return color1;

    // const center = size / 2;
    // const distance = Math.sqrt((sample.x - center) ** 2 + (sample.y - center) ** 2);
    //
    return Math.random() > (.5) ? color2 : color1;
  }, [color1, color2]);

  const recalculatePoints = () => {
    setPoints([] as [number, number][]);

    flowField
      .setFieldFunction(fieldFunction)
      .initialize(size, size, lineWidth * 2)
      // .addSamplesAtPositions(newPoints as [number, number][]);
  }

  useEffect(recalculatePoints, [
    borderWidth,
    backgroundScale,
    noiseScale,
    noiseOffsetX,
    noiseOffsetY,
    maxLineCount,
    lineWidth,
    lineStepLength,
    maxLineLength,
    distanceThreshold,
    testDistanceMultiplier,
  ]);

  useEffect(() => {
    draw();
  }, [fieldFunction, points, color2]);

  const draw = () => {
    console.log('draw');
    flowField.clear();

    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('no canvas');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('no context');
      return;
    }

    ctx.fillStyle = borderColor;
    ctx.fillRect(0, 0, size, size);

    // Calculate background bounds
    const backgroundSize = (size - borderWidth) * backgroundScale;
    const backgroundOffset = (size - backgroundSize) / 2;

    ctx.fillStyle = bgColor;

    // Draw a circle in the background
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, backgroundSize / 2, 0, 2 * Math.PI);
    ctx.fill();

    // ctx.fillRect(backgroundOffset, backgroundOffset, backgroundSize, backgroundSize);

    if (debug) {
      renderFlowFieldCells(ctx, flowField);
    }

    renderFlowField(ctx, flowField, {
      maxLineCount: maxLineCount,
      dSep: lineWidth + distanceThreshold,
      dTest: lineWidth + distanceThreshold * testDistanceMultiplier,
      getIsPositionInBounds,
      getSampleStepLength,
      getSampleStepWidth,
      getSampleStepColor,
      debug,
    })

    // drawFlowFieldLines(
    //   ctx,
    //   flowField,
    //   maxLines,
    //   maxLineLength,
    //   distanceThreshold,
    //   color1,
    //   getIsPositionInBounds,
    //   getSampleStepLength,
    //   getSampleStepWidth,
    //   getSampleStepColor,
    // );
    // console.log(flowField.samples.length);
    // renderFlowFieldSamples(ctx, flowField, color, pointSize);
    // for (let i = 0; i < 100; i++) {
    //   drawFlowFieldLine(ctx, flowField, color, pointSize, 5, 100);
    // }
  }

  // const v = (Noise.perlin2(point[0] / size * noiseScale, point[1] / size * noiseScale) + 1) * Math.PI;
  const updateNoiseScale = (newNoiseScale: number) => {
    setNoiseScale(newNoiseScale);
  }

  const updateMaxLines = (newMaxLines: number) => {
    setMaxLineCount(newMaxLines);
  }

  const updatePointSize = (newPointSize: number) => {
    setLineWidth(newPointSize);
  }

  const updateDistanceThreshold = (newDistanceThreshold: number) => {
    setDistanceThreshold(newDistanceThreshold);
  }

  return (
    <div className="grid grid-cols-4 gap-2 aspect-[4/3]">
      <Card>
        <CardHeader>
          Controls
        </CardHeader>
        <CardContent>
          <div className="mb-2">
            <label>Border Color</label>
            <Input
              className="mb-2"
              type="color"
              value={borderColor}
              onChange={(e) => setBorderColor(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <label>Border Width</label>
            <Slider
              className="mt-2"
              min={0}
              max={size / 4}
              value={[borderWidth]}
              onValueChange={(vs) => setBorderWidth(vs[0])}
            />
          </div>
          <div className="mb-2">
            <label>Background Scale</label>
            <Slider
              className="mt-2"
              min={0}
              max={2}
              step={0.01}
              value={[backgroundScale]}
              onValueChange={(vs) => setBackgroundScale(vs[0])}
            />
          </div>
          <div className="mb-2">
            <label>BG Color</label>
            <Input
              className="mb-2"
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <label>Color 1</label>
            <Input
              className="mb-2"
              type="color"
              value={color1}
              onChange={(e) => setColor1(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <label>Color 2</label>
            <Input
              className="mb-2"
              type="color"
              value={color2}
              onChange={(e) => setColor2(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <Label>Noise Scale</Label>
            <Slider
              className="mt-2"
              min={.1}
              max={40}
              step={0.1}
              value={[noiseScale]}
              onValueChange={(vs) => updateNoiseScale(vs[0])}
            />
          </div>
          <div className="mb-4">
            <Label>Noise Offset X</Label>
            <Slider
              className="mt-2"
              min={0}
              max={100}
              value={[noiseOffsetX]}
              onValueChange={(vs) => setNoiseOffsetX(vs[0])}
            />
          </div>
          <div className="mb-4">
            <Label>Noise Offset Y</Label>
            <Slider
              className="mt-2"
              min={100}
              max={size}
              value={[noiseOffsetY]}
              onValueChange={(vs) => setNoiseOffsetY(vs[0])}
            />
          </div>
          <div className="mb-4">
            <Label>Max Lines</Label>
            <Slider
              className="mt-2"
              min={1}
              max={2000}
              value={[maxLineCount]}
              onValueChange={(vs) => updateMaxLines(vs[0])}
            />
          </div>
          <div className="mb-4">
            <Label>Line Step Length</Label>
            <Slider
              className="mt-2"
              min={1}
              max={40}
              value={[lineStepLength]}
              onValueChange={(vs) => setLineStepLength(vs[0])}
            />
          </div>
          <div className="mb-4">
            <Label>Max Line Length</Label>
            <Slider
              className="mt-2"
              min={0}
              max={1000}
              step={1}
              value={[maxLineLength]}
              onValueChange={(vs) => setMaxLineLength(vs[0])}
            />
          </div>
          <div className="mb-4">
            <Label>Line Width</Label>
            <Slider
              className="mt-2"
              min={1}
              max={100}
              value={[lineWidth]}
              onValueChange={(vs) => updatePointSize(vs[0])}
            />
          </div>
          <div className="mb-4">
            <Label>Line Spacing</Label>
            <Slider
              className="mt-2"
              min={0}
              max={40}
              value={[distanceThreshold]}
              onValueChange={(vs) => updateDistanceThreshold(vs[0])}
            />
          </div>
          <div className="mb-4">
            <Label>Test Distance Multiplier</Label>
            <Slider
              className="mt-2"
              min={0}
              max={2}
              step={0.1}
              value={[testDistanceMultiplier]}
              onValueChange={(vs) => setTestDistanceMultiplier(vs[0])}
            />
          </div>
          <div className="mb-4">
            <Checkbox
              className="mt-2 mr-2"
              checked={debug}
              onCheckedChange={() => setDebug(!debug)}
            />
            <Label>Debug</Label>
          </div>
          <Button
            className="w-full mt-6"
            onClick={draw}
          >
            Draw
          </Button>
        </CardContent>
      </Card>
      <Card className="flex items-center justify-center col-span-3 overflow-hidden">
        <canvas
          className="w-full h-full"
          height={size}
          width={size}
          ref={canvasRef}
        />
      </Card>
    </div>
  )
};
