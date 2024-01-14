import { FC } from 'react';

import { LinesConfig } from '../types';
import { ControlsPanel } from '~/components/flow-fields/generator/generator-controls/controls-panel';
import { SliderControl } from '~/components/flow-fields/generator/generator-controls/controls';
import { ControlsPanelGroup } from '~/components/flow-fields/generator/generator-controls/controls-panel-group';

export const LinesPanel: FC<{
  config: LinesConfig;
  onConfigChange: (config: LinesConfig) => void;
}> = ({
  config,
  onConfigChange,
}) => {
  return (
    <ControlsPanel name="Lines">
      <SliderControl
        label="Max Count"
        min={0}
        max={1500}
        step={1}
        value={config.maxCount}
        onValueChange={(maxCount) => onConfigChange({ ...config, maxCount })}
        valueDisplay={formatIntValue}
      />
      <SliderControl
        label="Max Line Length"
        min={0}
        max={2048}
        step={1}
        value={config.maxLength}
        onValueChange={(maxLength) => onConfigChange({ ...config, maxLength })}
        valueDisplay={formatIntValue}
      />
      <SliderControl
        className="mb-4"
        label="Segment Length"
        min={1}
        max={100}
        step={1}
        value={config.segmentLength}
        onValueChange={segmentLength => onConfigChange({ ...config, segmentLength })}
        valueDisplay={formatIntValue}
      />
      <SliderControl
        className="mb-4"
        label="Distance Factor"
        min={0.1}
        max={2}
        step={0.01}
        value={config.distanceFactor}
        onValueChange={distanceFactor => onConfigChange({ ...config, distanceFactor })}
        valueDisplay={(value) => (value).toFixed(2)}
      />

      <ControlsPanelGroup name="Thickness">
        <SliderControl
          label="Min Thickness"
          min={1}
          max={100}
          step={1}
          value={config.minThickness}
          onValueChange={(minThickness) => {
            onConfigChange({
              ...config,
              minThickness,
              // TODO: Do in sampling function instead?
              maxThickness: Math.max(minThickness, config.maxThickness),
            })
          }}
          valueDisplay={formatIntValue}
        />
        <SliderControl
          label="Max Thickness"
          min={1}
          max={100}
          step={1}
          value={config.maxThickness}
          onValueChange={(maxThickness) => {
            onConfigChange({
              ...config,
              // TODO: Do in sampling function instead?
              minThickness: Math.min(maxThickness, config.minThickness),
              maxThickness,
            })
          }}
          valueDisplay={formatIntValue}
        />
      </ControlsPanelGroup>
    </ControlsPanel>
  )
};

const formatIntValue = (value: number) => (value).toFixed(0);
