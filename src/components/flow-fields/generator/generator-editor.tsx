'use client';

import { FC, useEffect, useRef, useState } from 'react';

import { Card } from '~/components/ui/card';

import { defaultGeneratorConfig } from './default-generator-config';
import { GeneratorCanvas } from './generator-canvas';
import { GeneratorControls } from './generator-controls';
import { useGeneratorConfig, useFlowField } from './hooks';
import { render } from './renderering';
import { GeneratorConfigTab } from './types';

export const GeneratorEditor: FC<{

}> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [currentConfigTab, setCurrentConfigTab] = useState<GeneratorConfigTab>(GeneratorConfigTab.flowField);
  const {
    canvasConfig,
    flowFieldConfig,
    setFlowFieldConfig,
    linesConfig,
    setLinesConfig,
    coloringConfig,
    setColoringConfig,
    framingConfig,
    setFramingConfig,
  } = useGeneratorConfig(defaultGeneratorConfig);

  const {
    flowField,
    isGeneratingSamples,
  } = useFlowField(
    canvasConfig,
    flowFieldConfig,
    linesConfig,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    render(ctx, flowField, canvasConfig, coloringConfig, framingConfig);
  }, [flowField, canvasConfig, coloringConfig, framingConfig]);

  return (
    <div className="grid grid-cols-4 gap-2 aspect-[4/3]">
      <GeneratorControls
        currentTab={currentConfigTab}
        onTabChange={setCurrentConfigTab}
        flowFieldConfig={flowFieldConfig}
        onFlowFieldConfigChange={setFlowFieldConfig}
        linesConfig={linesConfig}
        onLinesConfigChange={setLinesConfig}
        coloringConfig={coloringConfig}
        onColoringConfigChange={setColoringConfig}
        framingConfig={framingConfig}
        onFramingConfigChange={setFramingConfig}
      />
      <Card className="flex col-span-3 overflow-hidden">
        <GeneratorCanvas
          ref={canvasRef}
          width={canvasConfig.width}
          height={canvasConfig.height}
        />
      </Card>
    </div>
  );
};
