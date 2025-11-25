import { Settings, Layout, Image as ImageIcon } from 'lucide-react';

interface SettingsPanelProps {
  layoutMode: 'standard' | 'polaroid';
  setLayoutMode: (mode: 'standard' | 'polaroid') => void;
}

export function SettingsPanel({ layoutMode, setLayoutMode }: SettingsPanelProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-2 mb-6 text-zinc-800 dark:text-zinc-200">
        <Settings size={20} />
        <h2 className="font-semibold">版式设置</h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setLayoutMode('standard')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
              layoutMode === 'standard'
                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-500'
            }`}
          >
            <Layout size={24} className="mb-2" />
            <span className="text-sm font-medium">标准模式</span>
          </button>

          <button
            onClick={() => setLayoutMode('polaroid')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
              layoutMode === 'polaroid'
                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-500'
            }`}
          >
            <ImageIcon size={24} className="mb-2" />
            <span className="text-sm font-medium">拍立得</span>
          </button>
        </div>
        
        <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed px-1">
          * 智能算法将自动优化边距、圆角和阴影，为您呈现最佳视觉效果。
        </p>
      </div>
    </div>
  );
}
