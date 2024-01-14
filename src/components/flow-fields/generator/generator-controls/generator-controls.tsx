import { FC } from 'react';

import { Card, CardContent, CardHeader } from '~/components/ui/card';

import {
  RenderingConfig,
  FlowFieldConfig,
  FramingConfig,
  GeneratorConfig,
  GeneratorConfigTab,
  LinesConfig
} from '../types';

import { GeneratorControlsTabBar } from './controls-tab-bar';
import { FramingPanel } from './framing-panel';
import { FlowFieldPanel } from './flow-field-panel';
import { RenderingPanel } from './rendering-panel';
import { LinesPanel } from '~/components/flow-fields/generator/generator-controls/lines-panel';
import { fr } from 'date-fns/locale';

export const GeneratorControls: FC<{
  currentTab: GeneratorConfigTab;
  onTabChange: (tab: GeneratorConfigTab) => void;
  flowFieldConfig: FlowFieldConfig;
  onFlowFieldConfigChange: (flowFieldConfig: FlowFieldConfig) => void;
  linesConfig: LinesConfig;
  onLinesConfigChange: (linesConfig: LinesConfig) => void;
  coloringConfig: RenderingConfig;
  onColoringConfigChange: (coloringConfig: RenderingConfig) => void;
  framingConfig: FramingConfig;
  onFramingConfigChange: (framingConfig: FramingConfig) => void;
}> = ({
  currentTab,
  onTabChange,
  flowFieldConfig,
  onFlowFieldConfigChange,
  linesConfig,
  onLinesConfigChange,
  coloringConfig,
  onColoringConfigChange,
  framingConfig,
  onFramingConfigChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <GeneratorControlsTabBar
          currentTab={currentTab}
          onTabChange={onTabChange}
        />
      </CardHeader>
      <CardContent>
        <CurrentTabControls
          currentTab={currentTab}
          flowFieldConfig={flowFieldConfig}
          onFlowFieldConfigChange={onFlowFieldConfigChange}
          linesConfig={linesConfig}
          onLinesConfigChange={onLinesConfigChange}
          coloringConfig={coloringConfig}
          onColoringConfigChange={onColoringConfigChange}
          framingConfig={framingConfig}
          onFramingConfigChange={onFramingConfigChange}
        />
      </CardContent>
    </Card>
  )
};

const CurrentTabControls: FC<{
  currentTab: GeneratorConfigTab;
  flowFieldConfig: FlowFieldConfig;
  onFlowFieldConfigChange: (flowFieldConfig: FlowFieldConfig) => void;
  linesConfig: LinesConfig;
  onLinesConfigChange: (linesConfig: LinesConfig) => void;
  coloringConfig: RenderingConfig;
  onColoringConfigChange: (coloringConfig: RenderingConfig) => void;
  framingConfig: FramingConfig;
  onFramingConfigChange: (framingConfig: FramingConfig) => void;
}> = ({
  currentTab,
  flowFieldConfig,
  onFlowFieldConfigChange,
  linesConfig,
  onLinesConfigChange,
  coloringConfig,
  onColoringConfigChange,
  framingConfig,
  onFramingConfigChange,
}) => {
  switch (currentTab) {
    case GeneratorConfigTab.flowField:
      return (
        <FlowFieldPanel
          config={flowFieldConfig}
          onConfigChange={onFlowFieldConfigChange}
        />
      );
    case GeneratorConfigTab.lines:
      return (
        <LinesPanel
          config={linesConfig}
          onConfigChange={onLinesConfigChange}
        />
      )
    case GeneratorConfigTab.rendering:
      return (
        <RenderingPanel
          config={coloringConfig}
          onConfigChange={onColoringConfigChange}
        />
      )
    case GeneratorConfigTab.framing:
      return (
        <FramingPanel
          config={framingConfig}
          onConfigChange={onFramingConfigChange}
        />
      );
  }
}
