import { FC } from 'react';

import { Vec2, Vector2 } from '~/lib/geometry';

import { SliderControl } from './slider-control';

export const Vector2SliderControl: FC<{
  label: string;
  min: Vector2;
  max: Vector2;
  step: Vector2;
  value: Vector2;
  onValueChange: (value: Vector2) => void;
  displayDigits?: number;
}> = ({
  label,
  min,
  max,
  step,
  value,
  onValueChange,
  displayDigits = 1,
}) => {
  const valueDisplay = formatValue(displayDigits);

  return (
    <>
      <SliderControl
        label={`${label} X`}
        min={min.x}
        max={max.x}
        step={step.x}
        value={value.x}
        onValueChange={x => onValueChange(Vec2(x, value.y))}
        valueDisplay={valueDisplay}
      />
      <SliderControl
        label={`${label} Y`}
        min={min.y}
        max={max.y}
        step={step.y}
        value={value.y}
        onValueChange={y => onValueChange(Vec2(value.x, y))}
        valueDisplay={valueDisplay}
      />
    </>
  )
};

const formatValue = (displayDigits: number) => (value: number) => `${(value).toFixed(displayDigits)}`;
