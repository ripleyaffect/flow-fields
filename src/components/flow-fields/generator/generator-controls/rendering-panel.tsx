import { FC } from 'react';

import { RenderingConfig, GeneratorConfig, FlowType, flowTypes, LineStyle, lineStyles } from '../types';
import { ControlsPanel } from '~/components/flow-fields/generator/generator-controls/controls-panel';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger } from '~/components/ui/select';
import { SliderControl } from '~/components/flow-fields/generator/generator-controls/controls';

export const RenderingPanel: FC<{
  config: RenderingConfig;
  onConfigChange: (config: RenderingConfig) => void;
}> = ({
  config,
  onConfigChange,
}) => {
  return (
    <ControlsPanel name="Rendering">
      <div>
        <Label>Type</Label>
        <Select
          value={config.lineStyle}
          onValueChange={(lineStyle: LineStyle) => {
            onConfigChange({ ...config, lineStyle })
          }}
        >
          <SelectTrigger className="mb-4">
            {config.lineStyle}
          </SelectTrigger>
          <SelectContent>
            {Object.values(lineStyles).map(lineStyle => (
              <SelectItem value={lineStyle} key={lineStyle}>
                {lineStyle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ColorControl
        label="Border"
        value={config.borderColor}
        onValueChange={(borderColor) => onConfigChange({ ...config, borderColor })}
      />
      <ColorControl
        label="Background"
        value={config.backgroundColor}
        onValueChange={(backgroundColor) => onConfigChange({ ...config, backgroundColor })}
      />
      <SliderControl
        label="Segmented Color Ratio"
        min={0}
        max={1}
        step={0.01}
        value={config.segmentedRatio}
        onValueChange={(segmentedRatio) => onConfigChange({ ...config, segmentedRatio })}
        valueDisplay={(value) => (value).toFixed(2)}
      />
      {config.palette.map((color, index) => (
        <ColorControl
          key={index}
          label={`Color ${index + 1}`}
          value={color}
          onValueChange={(color) => {
            const palette = [...config.palette];
            palette[index] = color;
            onConfigChange({ ...config, palette });
          }}
        />
      ))}
    </ControlsPanel>
  )
};

const ColorControl: FC<{
  label: string;
  value: string;
  onValueChange: (value: string) => void;
}> = ({
  label,
  value,
  onValueChange,
}) => {
  return (
    <div className="mb-2">
      <Label>
        {label}
      </Label>
      <Input
        type="color"
        value={value}
        onChange={e => onValueChange(e.target.value)}
      />
    </div>
  )
};
