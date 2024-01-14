import { FC } from 'react';

import {
  FlowFieldConfig,
  FlowType,
  flowTypes,
  PerlinFlowFieldConfig,
  RadialFlowFieldConfig
} from '../types';

import { ControlsPanel } from './controls-panel';
import { Vec2 } from '~/lib/geometry';
import { SliderControl, Vector2SliderControl } from '~/components/flow-fields/generator/generator-controls/controls';
import { Select, SelectContent, SelectItem, SelectTrigger } from '~/components/ui/select';
import { Label } from '~/components/ui/label';

export const FlowFieldPanel: FC<{
  config: FlowFieldConfig;
  onConfigChange: (config: FlowFieldConfig) => void;
}> = ({
  config,
  onConfigChange,
}) => {
  return (
    <ControlsPanel name="Flow Field">
      <div>
        <Label>Type</Label>
        <Select
          value={config.selectedType}
          onValueChange={(selectedType: FlowType) => {
            onConfigChange({ ...config, selectedType })
          }}
        >
          <SelectTrigger className="mb-4">
            {config.selectedType}
          </SelectTrigger>
          <SelectContent>
            {Object.values(flowTypes).map(type => (
              <SelectItem value={type} key={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {config.selectedType === flowTypes.Perlin && (
        <PerlinFlowFieldControls
          config={config.perlin}
          onConfigChange={(perlin) => onConfigChange({ ...config, perlin })}
        />
      )}
      {config.selectedType === flowTypes.Radial && (
        <RadialFlowFieldControls
          config={config.radial}
          onConfigChange={(radial) => onConfigChange({ ...config, radial })}
        />
      )}
    </ControlsPanel>
  )
};

const OFFSET_MIN = Vec2(-100, -100);
const OFFSET_MAX = Vec2(100, 100);
const OFFSET_STEP = Vec2(0.1, 0.1);

const CENTER_MIN = Vec2(-1, -1);
const CENTER_MAX = Vec2(2, 2);
const CENTER_STEP = Vec2(0.01, 0.01);

const PerlinFlowFieldControls: FC<{
  config: PerlinFlowFieldConfig;
  onConfigChange: (config: PerlinFlowFieldConfig) => void;
}> = ({
  config,
  onConfigChange,
}) => {
  return (
    <>
      <SliderControl
        label="Scale"
        min={0.1}
        max={30}
        step={0.1}
        value={config.scale}
        onValueChange={value => {
          onConfigChange({ ...config, scale: value })
        }}
        valueDisplay={value => `${(value).toFixed(1)}`}
      />
      <Vector2SliderControl
        label="Offset"
        min={OFFSET_MIN}
        max={OFFSET_MAX}
        step={OFFSET_STEP}
        value={config.offset}
        onValueChange={offset => onConfigChange({ ...config, offset })}
        displayDigits={1}
      />
    </>
  );
};

const RadialFlowFieldControls: FC<{
  config: RadialFlowFieldConfig;
  onConfigChange: (config: RadialFlowFieldConfig) => void;
}> = ({
  config,
  onConfigChange,
}) => {
  return (
    <>
      <SliderControl
        label="Curve Factor"
        min={0.1}
        max={3}
        step={0.1}
        value={config.curveFactor}
        onValueChange={value => {
          onConfigChange({ ...config, curveFactor: value })
        }}
        valueDisplay={value => `${(value).toFixed(2)}`}
      />
      <Vector2SliderControl
        label="Center"
        min={CENTER_MIN}
        max={CENTER_MAX}
        step={CENTER_STEP}
        value={config.centerOffset}
        onValueChange={centerOffset => {
          onConfigChange({ ...config, centerOffset })
        }}
        displayDigits={2}
      />
    </>
  );
};
