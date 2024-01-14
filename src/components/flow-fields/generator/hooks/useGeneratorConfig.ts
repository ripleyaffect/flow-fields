import { useState } from 'react';

import { GeneratorConfig } from "../types";

export const useGeneratorConfig = (defaultConfig: GeneratorConfig) => {
  const [canvasConfig, setCanvasConfig] = useState(defaultConfig.canvas);
  const [framingConfig, setFramingConfig] = useState(defaultConfig.framing);
  const [flowFieldConfig, setFlowFieldConfig] = useState(defaultConfig.flowField);
  const [linesConfig, setLinesConfig] = useState(defaultConfig.lines);
  const [coloringConfig, setColoringConfig] = useState(defaultConfig.rendering);

  return {
    canvasConfig,
    setCanvasConfig,

    framingConfig,
    setFramingConfig,

    flowFieldConfig,
    setFlowFieldConfig,

    linesConfig,
    setLinesConfig,

    coloringConfig,
    setColoringConfig,
  };
};
