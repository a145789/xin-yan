import { Sliders } from 'lucide-react';

interface Settings {
  padding: number;
  borderRadius: number;
  blurAmount: number;
}

interface SettingsPanelProps {
  settings: Settings;
  setSettings: (settings: Settings) => void;
}

export function SettingsPanel({ settings, setSettings }: SettingsPanelProps) {
  const handleChange = (key: keyof Settings, value: number) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-2 mb-4 text-zinc-900 dark:text-zinc-100 font-semibold">
        <Sliders size={18} />
        <span>参数设置</span>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <label>边距</label>
            <span>{settings.padding}%</span>
          </div>
          <input 
            type="range" min="0" max="40" 
            value={settings.padding} 
            onChange={e => handleChange('padding', Number(e.target.value))}
            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-100"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <label>圆角</label>
            <span>{settings.borderRadius}px</span>
          </div>
          <input 
            type="range" min="0" max="100" 
            value={settings.borderRadius} 
            onChange={e => handleChange('borderRadius', Number(e.target.value))}
            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-100"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <label>模糊</label>
            <span>{settings.blurAmount}px</span>
          </div>
          <input 
            type="range" min="0" max="100" 
            value={settings.blurAmount} 
            onChange={e => handleChange('blurAmount', Number(e.target.value))}
            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-100"
          />
        </div>
      </div>
    </div>
  );
}
