import { GeneratorConfigTab } from '~/components/flow-fields/generator/types';
import { Button } from '~/components/ui/button';

export const GeneratorControlsTabBar: React.FC<{
  currentTab: GeneratorConfigTab;
  onTabChange: (tab: GeneratorConfigTab) => void;
}> = ({
  currentTab,
  onTabChange,
}) => {
  return (
    <div className="flex items-center justify-between">
      <Button
        className={currentTab === GeneratorConfigTab.flowField ? 'bg-secondary' : ''}
        variant="ghost"
        size="icon"
        onClick={() => onTabChange(GeneratorConfigTab.flowField)}
      >
        🔀
      </Button>
      <Button
        className={currentTab === GeneratorConfigTab.lines ? 'bg-secondary' : ''}
        variant="ghost"
        size="icon"
        onClick={() => onTabChange(GeneratorConfigTab.lines)}
      >
        〰️
      </Button>
      <Button
        className={currentTab === GeneratorConfigTab.rendering ? 'bg-secondary' : ''}
        variant="ghost"
        size="icon"
        onClick={() => onTabChange(GeneratorConfigTab.rendering)}
      >
        🎨
      </Button>
      <Button
        className={currentTab === GeneratorConfigTab.framing ? 'bg-secondary' : ''}
        variant="ghost"
        size="icon"
        onClick={() => onTabChange(GeneratorConfigTab.framing)}
      >
        🖼️
      </Button>
    </div>
  )
};
