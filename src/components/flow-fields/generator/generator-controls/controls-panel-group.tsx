import { FC, PropsWithChildren } from 'react';

export const ControlsPanelGroup: FC<PropsWithChildren<{
  name: string;
}>> = ({
  name,
  children,
}) => {
  return (
    <div className="mb-4">
      <h3 className="mb-2 font-semibold">
        {name}
      </h3>
      {children}
    </div>
  )
};
