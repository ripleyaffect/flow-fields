import { FC } from 'react';


import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger } from '~/components/ui/select';
import { ControlsPanel } from '~/components/flow-fields/generator/generator-controls/controls-panel';
import { ControlsPanelGroup } from '~/components/flow-fields/generator/generator-controls/controls-panel-group';
import { SliderControl, Vector2SliderControl } from '~/components/flow-fields/generator/generator-controls/controls';

import { FrameShape, frameShapes, GeneratorConfig } from '../types';
import { Vec2 } from '~/lib/geometry';

const SCALE_MIN = Vec2(0, 0);
const SCALE_MAX = Vec2(1, 1);
const SCALE_STEP = Vec2(0.001, 0.001);

export const FramingPanel: FC<{
  config: GeneratorConfig['framing'];
  onConfigChange: (config: GeneratorConfig['framing']) => void;
}> = ({
  config,
  onConfigChange,
}) => {
  return (
    <ControlsPanel name={'Framing'}>
      <ControlsPanelGroup name={'Border'}>
        <div className="mb-2">
          <Label>Shape</Label>
          <Select
            value={config.border.shape}
            onValueChange={v => {
              onConfigChange({
                ...config,
                border: {
                  ...config.border,
                  shape: v as FrameShape,
                }
              })
            }}
          >
            <SelectTrigger>{config.border.shape}</SelectTrigger>
            <SelectContent>
              {Object.keys(frameShapes).map(shape => (
                <SelectItem key={shape} value={shape}>{shape}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Vector2SliderControl
          label="Scale"
          min={SCALE_MIN}
          max={SCALE_MAX}
          step={SCALE_STEP}
          value={config.border.scale}
          onValueChange={scale => {
            onConfigChange({
              ...config,
              border: {
                ...config.border,
                scale,
              },
            });
          }}
          displayDigits={3}
        />
      </ControlsPanelGroup>

      <ControlsPanelGroup name={'Background'}>
        <div className="mb-2">
          <Label>Shape</Label>
          <Select
            value={config.background.shape}
            onValueChange={v => {
              onConfigChange({
                ...config,
                background: {
                  ...config.background,
                  shape: v as FrameShape,
                }
              })
            }}
          >
            <SelectTrigger>{config.background.shape}</SelectTrigger>
            <SelectContent>
              {Object.keys(frameShapes).map(shape => (
                <SelectItem key={shape} value={shape}>{shape}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Vector2SliderControl
          label="Scale"
          min={SCALE_MIN}
          max={SCALE_MAX}
          step={SCALE_STEP}
          value={config.background.scale}
          onValueChange={scale => {
            onConfigChange({
              ...config,
              background: {
                ...config.background,
                scale,
              },
            });
          }}
          displayDigits={3}
        />
      </ControlsPanelGroup>
    </ControlsPanel>
  )
};
