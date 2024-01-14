import { FC, PropsWithChildren } from 'react';

export const ControlsPanel: FC<PropsWithChildren<{
  name: string;
}>> = ({
  name,
  children,
}) => {
  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold">
        {name}
      </h2>
      {children}
    </div>
  )
};
