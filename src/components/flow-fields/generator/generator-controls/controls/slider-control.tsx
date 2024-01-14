import { FC } from 'react';
import { Label } from '~/components/ui/label';
import { Slider } from '~/components/ui/slider';

export const SliderControl: FC<{
  className?: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onValueChange: (value: number) => void;
  valueDisplay?: (value: number) => string;
}> = ({
  className,
  label,
  min,
  max,
  step,
  value,
  onValueChange,
  valueDisplay = null,
}) => {
  return (
      <div className={'mb-2 ' + className || ''}>
      <div className="flex items-center justify-between mb-1">
        <Label>{label}</Label>
        {valueDisplay && (
          <span className="text-sm">
            {valueDisplay(value)}
          </span>
        )}
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={vs => onValueChange(vs[0])}
      />
    </div>
  )
};
