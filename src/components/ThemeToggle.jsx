import useSettingsStore from '../store/settingsStore';
import { SunIcon, MoonIcon } from './icons/IconTypes';

// Auto icon - half sun/moon
const AutoIcon = ({ size = 20, className = '' }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
    <circle cx="12" cy="12" r="4" />
  </svg>
);

const ThemeToggle = () => {
  const { theme, setTheme } = useSettingsStore();
  
  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('auto');
    else setTheme('dark');
  };
  
  const getIcon = () => {
    if (theme === 'light') return <SunIcon size={18} />;
    if (theme === 'dark') return <MoonIcon size={18} />;
    return <AutoIcon size={18} />;
  };
  
  const getLabel = () => {
    if (theme === 'light') return 'Light';
    if (theme === 'dark') return 'Dark';
    return 'Auto';
  };
  
  return (
    <button
      onClick={cycleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 transition-all duration-200 text-white font-medium text-sm"
      title={`Current theme: ${getLabel()}. Click to cycle through themes.`}
      aria-label={`Toggle theme (current: ${getLabel()})`}
    >
      <span aria-hidden="true">{getIcon()}</span>
      <span className="hidden sm:inline">{getLabel()}</span>
    </button>
  );
};

export default ThemeToggle;












