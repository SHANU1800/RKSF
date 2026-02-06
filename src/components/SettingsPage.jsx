import React from 'react';
import useSettingsStore from '../store/settingsStore';
import { SettingsIcon, SunIcon, MoonIcon, RefreshIcon, BellIcon, LockIcon, GridIcon } from './icons/IconTypes';

// Custom icons for settings sections
const PaletteIcon = ({ size = 20, className = '' }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="8" r="1.5" fill="currentColor" />
    <circle cx="8" cy="12" r="1.5" fill="currentColor" />
    <circle cx="16" cy="12" r="1.5" fill="currentColor" />
    <circle cx="12" cy="16" r="1.5" fill="currentColor" />
  </svg>
);

const VolumeIcon = ({ size = 20, className = '' }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const GlobeIcon = ({ size = 20, className = '' }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const ZapIcon = ({ size = 20, className = '' }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const DatabaseIcon = ({ size = 20, className = '' }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const TrashIcon = ({ size = 20, className = '' }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

// Helper components moved outside to prevent recreation on each render
const SettingSection = ({ title, icon, children }) => (
  <div className="glass-panel rounded-2xl border border-white/10 p-4 md:p-6 space-y-4">
    <div className="flex items-center gap-3 pb-2 border-b border-white/10">
      <span className="text-primary-400">{icon}</span>
      <h4 className="text-lg font-bold text-white">{title}</h4>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const Toggle = ({ label, checked, onChange, description }) => (
  <div className="flex items-start md:items-center justify-between gap-4 p-3 md:p-2 rounded-xl hover:bg-white/5 transition-all -mx-2 px-4 active:bg-white/10">
    <div className="flex-1 min-w-0">
      <p className="text-white font-medium text-sm md:text-base">{label}</p>
      {description && <p className="text-gray-400 text-xs md:text-sm mt-0.5 leading-relaxed">{description}</p>}
    </div>
    <button
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 md:h-6 md:w-11 items-center rounded-full transition-all shrink-0 ${
        checked ? 'bg-[#F7D047] shadow-lg shadow-black/30' : 'bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 md:h-4 md:w-4 transform rounded-full bg-white shadow-md transition-transform ${
          checked ? 'translate-x-6 md:translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 p-3 md:p-2 rounded-xl hover:bg-white/5 transition-all -mx-2 px-4">
    <label className="text-white font-medium text-sm md:text-base">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full md:w-auto px-4 py-3 md:py-2 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-[#0a0a0a] focus:ring-2 focus:ring-[#0a0a0a]/20 focus:outline-none text-sm appearance-none cursor-pointer"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const Slider = ({ label, value, onChange, min = 0, max = 100 }) => (
  <div className="space-y-3 p-3 sm:p-2 rounded-xl hover:bg-white/5 transition-all -mx-2 px-4">
    <div className="flex justify-between items-center">
      <label className="text-white font-medium text-sm sm:text-base">{label}</label>
      <span className="text-[#F7D047] font-bold text-sm bg-[#0a0a0a]/10 px-2.5 py-1 rounded-lg">{value}%</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider touch-pan-y"
    />
  </div>
);

const SettingsPage = () => {
  const {
    theme,
    setTheme,
    reducedMotion,
    toggleReducedMotion,
    fontSize,
    setFontSize,
    soundEnabled,
    toggleSound,
    musicEnabled,
    toggleMusic,
    notificationSounds,
    toggleNotificationSounds,
    volume,
    setVolume,
    desktopNotifications,
    toggleDesktopNotifications,
    emailNotifications,
    toggleEmailNotifications,
    showOnlineStatus,
    toggleOnlineStatus,
    showReadReceipts,
    toggleReadReceipts,
    language,
    setLanguage,
    timeFormat,
    setTimeFormat,
    resetSettings,
  } = useSettingsStore();

  const [activeTab, setActiveTab] = React.useState('appearance');

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-0 -mx-4 md:mx-0 bg-slate-900/30 md:bg-transparent animate-slide-down">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-600 flex items-center justify-center shadow-lg animate-float">
            <SettingsIcon size={28} className="text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Settings</h3>
            <p className="text-gray-400 text-sm">Customize your experience</p>
          </div>
        </div>
        <button
          onClick={resetSettings}
          className="w-full md:w-auto px-4 py-3 md:py-2 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-bold border border-white/10 transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2 hover:shadow-lg"
        >
          <RefreshIcon size={16} />
          <span>Reset to Defaults</span>
        </button>
      </div>

      {/* Settings Tabs - Mobile Nav Style */}
      <div className="glass-panel rounded-2xl border border-white/10 p-2">
        <div className="flex justify-around items-stretch gap-1">
          {[
            { id: 'appearance', label: 'Appearance', icon: <PaletteIcon size={24} /> },
            { id: 'audio', label: 'Audio', icon: <VolumeIcon size={24} /> },
            { id: 'notifications', label: 'Notifications', icon: <BellIcon size={24} /> },
            { id: 'privacy', label: 'Privacy', icon: <LockIcon size={24} /> },
            { id: 'regional', label: 'Regional', icon: <GlobeIcon size={24} /> },
            { id: 'advanced', label: 'Advanced', icon: <ZapIcon size={24} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl font-semibold text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-[#F7D047]/20 text-[#F7D047] shadow-lg border border-[#0a0a0a]/40'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="w-6 h-6 flex items-center justify-center">{tab.icon}</span>
              <span className="text-[10px] md:text-xs uppercase tracking-wide font-bold">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Appearance Section */}
      {activeTab === 'appearance' && (
        <div className="space-y-6 animate-fade-in">
          <SettingSection title="Appearance" icon={<PaletteIcon size={24} />}>
            <Select
              label="Theme"
              value={theme}
              onChange={setTheme}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'auto', label: 'Auto (System)' },
              ]}
            />
            <Select
              label="Font Size"
              value={fontSize}
              onChange={setFontSize}
              options={[
                { value: 'small', label: 'Small (12px)' },
                { value: 'medium', label: 'Medium (14px)' },
                { value: 'large', label: 'Large (16px)' },
              ]}
            />
            <Toggle
              label="Reduce Motion"
              checked={reducedMotion}
              onChange={toggleReducedMotion}
              description="Minimize animations for better accessibility"
            />
          </SettingSection>

          <SettingSection title="Visual Effects" icon="✨">
            <Toggle
              label="Enable Animations"
              checked={!reducedMotion}
              onChange={() => toggleReducedMotion()}
              description="Smooth transitions and effects throughout the app"
            />
            <Toggle
              label="Show Glowing Effects"
              checked={true}
              onChange={() => {}}
              description="Glow effects on interactive elements"
            />
          </SettingSection>
        </div>
      )}

      {/* Audio Section */}
      {activeTab === 'audio' && (
        <div className="space-y-6 animate-fade-in">
          <SettingSection title="Audio" icon={<VolumeIcon size={24} />}>
            <Toggle
              label="Sound Effects"
              checked={soundEnabled}
              onChange={toggleSound}
              description="UI interaction sounds"
            />
            <Toggle
              label="Background Music"
              checked={musicEnabled}
              onChange={toggleMusic}
              description="Play ambient background music"
            />
            <Toggle
              label="Notification Sounds"
              checked={notificationSounds}
              onChange={toggleNotificationSounds}
              description="Play sound for new notifications"
            />
            <Slider
              label="Master Volume"
              value={volume}
              onChange={setVolume}
            />
          </SettingSection>

          <SettingSection title="Sound Categories" icon="🎵">
            <Slider
              label="UI Sounds Volume"
              value={Math.floor(volume * 0.8)}
              onChange={() => {}}
            />
            <Slider
              label="Notification Volume"
              value={Math.floor(volume * 0.6)}
              onChange={() => {}}
            />
            <Slider
              label="Music Volume"
              value={Math.floor(volume * 0.4)}
              onChange={() => {}}
            />
          </SettingSection>
        </div>
      )}

      {/* Notifications Section */}
      {activeTab === 'notifications' && (
        <div className="space-y-6 animate-fade-in">
          <SettingSection title="Notifications" icon={<BellIcon size={24} />}>
            <Toggle
              label="Desktop Notifications"
              checked={desktopNotifications}
              onChange={toggleDesktopNotifications}
              description="Show browser notifications"
            />
            <Toggle
              label="Email Notifications"
              checked={emailNotifications}
              onChange={toggleEmailNotifications}
              description="Receive updates via email"
            />
          </SettingSection>

          <SettingSection title="Notification Preferences" icon="📬">
            <Toggle
              label="Order Updates"
              checked={true}
              onChange={() => {}}
              description="Get notified about order status changes"
            />
            <Toggle
              label="Promotions & Deals"
              checked={false}
              onChange={() => {}}
              description="Special offers and promotions"
            />
            <Toggle
              label="Chat Messages"
              checked={true}
              onChange={() => {}}
              description="New messages from providers"
            />
            <Toggle
              label="Review Reminders"
              checked={true}
              onChange={() => {}}
              description="Remind to leave reviews"
            />
          </SettingSection>
        </div>
      )}

      {/* Privacy Section */}
      {activeTab === 'privacy' && (
        <div className="space-y-6 animate-fade-in">
          <SettingSection title="Privacy" icon={<LockIcon size={24} />}>
            <Toggle
              label="Show Online Status"
              checked={showOnlineStatus}
              onChange={toggleOnlineStatus}
              description="Let others see when you're online"
            />
            <Toggle
              label="Read Receipts"
              checked={showReadReceipts}
              onChange={toggleReadReceipts}
              description="Show when you've read messages"
            />
          </SettingSection>

          <SettingSection title="Data & Privacy" icon="🔐">
            <Toggle
              label="Allow Analytics"
              checked={false}
              onChange={() => {}}
              description="Help us improve by sharing usage data"
            />
            <Toggle
              label="Personalized Recommendations"
              checked={true}
              onChange={() => {}}
              description="Show suggestions based on activity"
            />
            <div className="p-3 md:p-2 rounded-xl hover:bg-white/5 transition-all -mx-2 px-4">
              <button className="text-sm text-[#F7D047] hover:text-blue-300 font-semibold">
                📥 Download My Data
              </button>
            </div>
            <div className="p-3 md:p-2 rounded-xl hover:bg-white/5 transition-all -mx-2 px-4">
              <button className="text-sm text-red-400 hover:text-red-300 font-semibold">
                🗑️ Delete My Account
              </button>
            </div>
          </SettingSection>
        </div>
      )}

      {/* Regional Section */}
      {activeTab === 'regional' && (
        <div className="space-y-6 animate-fade-in">
          <SettingSection title="Language & Region" icon={<GlobeIcon size={24} />}>
            <Select
              label="Language"
              value={language}
              onChange={setLanguage}
              options={[
                { value: 'en', label: '🇺🇸 English' },
                { value: 'es', label: '🇪🇸 Español' },
                { value: 'fr', label: '🇫🇷 Français' },
                { value: 'hi', label: '🇮🇳 हिन्दी' },
                { value: 'de', label: '🇩🇪 Deutsch' },
                { value: 'ja', label: '🇯🇵 日本語' },
              ]}
            />
            <Select
              label="Time Format"
              value={timeFormat}
              onChange={setTimeFormat}
              options={[
                { value: '12h', label: '12-hour (AM/PM)' },
                { value: '24h', label: '24-hour' },
              ]}
            />
            <Select
              label="Currency"
              value="inr"
              onChange={() => {}}
              options={[
                { value: 'inr', label: 'Indian Rupee (₹)' },
                { value: 'usd', label: 'US Dollar ($)' },
                { value: 'eur', label: 'Euro (€)' },
              ]}
            />
          </SettingSection>
        </div>
      )}

      {/* Advanced Section */}
      {activeTab === 'advanced' && (
        <div className="space-y-6 animate-fade-in">
          <SettingSection title="Advanced Settings" icon={<SettingsIcon size={20} />}>
            <Toggle
              label="Developer Mode"
              checked={false}
              onChange={() => {}}
              description="Show detailed logs and debug information"
            />
            <Toggle
              label="Experimental Features"
              checked={false}
              onChange={() => {}}
              description="Try new features before official release"
            />
            <Toggle
              label="Cache Management"
              checked={true}
              onChange={() => {}}
              description="Cache data for faster loading"
            />
          </SettingSection>

          <SettingSection title="Storage & Cache" icon={<DatabaseIcon size={20} />}>
            <div className="p-3 md:p-2 rounded-xl hover:bg-white/5 transition-all -mx-2 px-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">Cache Usage</span>
                <span className="text-[#F7D047] font-bold">128 MB</span>
              </div>
              <button className="text-sm text-[#F7D047] hover:text-blue-300 font-semibold flex items-center gap-2">
                <TrashIcon size={16} /> Clear Cache
              </button>
            </div>
          </SettingSection>
        </div>
      )}

      {/* App Info */}
      <div className="glass-panel rounded-2xl border border-white/10 p-4 md:p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F7D047] flex items-center justify-center shadow-lg">
            <GridIcon size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-bold">RKserve</p>
            <p className="text-gray-400 text-xs">Version 1.0.0</p>
          </div>
        </div>
      </div>

      <style>{`
        .slider {
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          border-radius: 8px;
          background: linear-gradient(to right, #3b82f6 0%, #3b82f6 var(--value, 50%), #4b5563 var(--value, 50%), #4b5563 100%);
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          border: 3px solid white;
          transition: transform 0.15s ease;
        }
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        .slider::-webkit-slider-thumb:active {
          transform: scale(0.95);
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          border: 3px solid white;
        }
        .slider::-moz-range-track {
          height: 8px;
          border-radius: 8px;
          background: #4b5563;
        }
        
        @media (max-width: 640px) {
          .slider::-webkit-slider-thumb {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;












