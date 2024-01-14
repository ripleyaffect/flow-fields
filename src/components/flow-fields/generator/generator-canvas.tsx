'use client';

import { ForwardedRef, forwardRef } from 'react';

type GeneratorCanvasProps = {
  width: number;
  height: number;
};

export const GeneratorCanvas = forwardRef(InnerGeneratorCanvas);

function InnerGeneratorCanvas({
  width,
  height,
}: GeneratorCanvasProps, canvasRef: ForwardedRef<HTMLCanvasElement>) {
  return (
    <canvas
      className="w-full h-full"
      width={width}
      height={height}
      ref={canvasRef}
    />
  );
}
