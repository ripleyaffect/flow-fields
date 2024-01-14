'use client';

import React, { useRef } from 'react';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Checkbox } from '~/components/ui/checkbox';
import { GridField } from '~/lib/flow-fields/grid-field';
import { BlobCurve, Vec2 } from '~/lib/geometry';
import { Noise } from '~/lib/noise';
import { Range } from '@radix-ui/react-slider';
import { Slider } from '~/components/ui/slider';
import { Label } from '~/components/ui/label';

const size = 600;
const count = 50;

export const FlowFieldsEdtior = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [bgColor, setBgColor] = React.useState('#FFFFFF');
  const [color, setColor] = React.useState('#000000');
  const [clear, setClear] = React.useState(false);
  const [drawGrid, setDrawGrid] = React.useState(false);
  const [drawBlobs, setDrawBlobs] = React.useState(true);
  const [drawLines, setDrawLines] = React.useState(false);
  const [strokeSize, setStrokeSize] = React.useState(2);
  const [blobSize, setBlobSize] = React.useState(20);

  const onClick = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('no canvas');
      return;
    }

    for (const contextType of ['webgl2', '2d', 'webgl', 'experimental-webgl', 'webgpu']) {
      const context = canvas.getContext(contextType as any);
      console.log(context);
      console.log(contextType, context !== null);
    }


    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('no context');
      return;
    }

    if (clear) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);
    }

    const gridField = new GridField(size, size, size / count);
    for (let i = 0; i < gridField.nx; i++) {
      for (let j = 0; j < gridField.ny; j++) {
        let angle = Noise.perlin2(i / gridField.nx * 2, j / gridField.ny * 2) * Math.PI * 2;
        gridField.setCell(i, j, angle);
      }
    }

    if (drawGrid) gridField.draw(ctx, color);

    if (drawLines) {
      for (let i = 0; i < 100; i++) {
        gridField.getCurve(
          Vec2(Math.random() * size, Math.random() * size),
          10,
          10
        ).draw(ctx, color, strokeSize)
      }
    }

    if (drawBlobs) {
      for (let i = 0; i < 20; i++) {
        const blob = new BlobCurve(Vec2(Math.random() * size, Math.random() * size), blobSize, Math.max(10, blobSize));

        gridField.adjustBlobCurve(blob, 1, 20)

        blob.draw(ctx, color);
      }
    }
  }

  return (
    <div className="grid grid-cols-4 gap-2 aspect-[4/3]">
      <Card>
        <CardHeader>
          Controls
        </CardHeader>
        <CardContent>
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
            <label>Color</label>
            <Input
              className="mb-2"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <Checkbox checked={clear} onCheckedChange={() => setClear(!clear)}/> Clear
          </div>
          <div className="mb-2">
            <Checkbox checked={drawGrid} onCheckedChange={() => setDrawGrid(!drawGrid)}/> Draw Grid
          </div>
          <div className="mb-2">
            <Checkbox checked={drawLines} onCheckedChange={() => setDrawLines(!drawLines)}/> Draw Lines
          </div>
          <div className="mb-2">
            <Checkbox checked={drawBlobs} onCheckedChange={() => setDrawBlobs(!drawBlobs)}/> Draw Blob
          </div>
          <div className="mb-4">
            <Label >Stroke Size</Label>
            <Slider className="mt-2" min={1} max={40} value={[strokeSize]} onValueChange={(vs) => setStrokeSize(vs[0])}/>
          </div>
          <div className="mb-2">
            <Label>Blob Size</Label>
            <Slider className="mt-2" min={10} max={200} value={[blobSize]} onValueChange={(vs) => setBlobSize(vs[0])}/>
          </div>
          <Button
            className="w-full mt-6"
            onClick={onClick}
          >
            Draw
          </Button>
        </CardContent>
      </Card>
      <Card className="flex items-center justify-center col-span-3">
        <Card className="w-[600px] aspect-square overflow-hidden">
        <canvas height={600} width={600} ref={canvasRef}></canvas>
        </Card>
      </Card>
    </div>
  )
};
