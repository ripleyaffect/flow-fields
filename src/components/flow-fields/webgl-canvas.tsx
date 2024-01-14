'use client';

import { FC, ForwardedRef, forwardRef } from 'react';

type WebglCanvasProps = {
  width: number;
  height: number;
};

export const WebglCanvas = forwardRef(InnerWebglCanvas);

function InnerWebglCanvas({
  width,
  height,
}: WebglCanvasProps, canvasRef: ForwardedRef<HTMLCanvasElement>) {
  return (
    <canvas
      className="w-full h-full"
      width={width}
      height={height}
      ref={canvasRef}
    />
  );
}
