import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Settings store with persistence
const useSettingsStore = create(
  persist(
    (set) => ({
      // Theme settings
      theme: 'dark', // 'light', 'dark', 'auto'
      
      // Display settings
      reducedMotion: false,
      fontSize: 'medium', // 'small', 'medium', 'large'
      
      // Audio settings
      soundEnabled: true,
      musicEnabled: false,
      notificationSounds: true,
      volume: 70, // 0-100
      
      // Notification settings
      desktopNotifications: true,
      emailNotifications: true,
      pushNotifications: false,
      
      // Privacy settings
      showOnlineStatus: true,
      showReadReceipts: true,
      allowAnalytics: true,
      
      // Language & locale
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h', // '12h' or '24h'
      currency: 'INR',
      
      // Actions
      setTheme: (theme) => set({ theme }),
      toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),
      setFontSize: (fontSize) => set({ fontSize }),
      
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleMusic: () => set((state) => ({ musicEnabled: !state.musicEnabled })),
      toggleNotificationSounds: () => set((state) => ({ notificationSounds: !state.notificationSounds })),
      setVolume: (volume) => set({ volume }),
      
      toggleDesktopNotifications: () => set((state) => ({ desktopNotifications: !state.desktopNotifications })),
      toggleEmailNotifications: () => set((state) => ({ emailNotifications: !state.emailNotifications })),
      togglePushNotifications: () => set((state) => ({ pushNotifications: !state.pushNotifications })),
      
      toggleOnlineStatus: () => set((state) => ({ showOnlineStatus: !state.showOnlineStatus })),
      toggleReadReceipts: () => set((state) => ({ showReadReceipts: !state.showReadReceipts })),
      toggleAnalytics: () => set((state) => ({ allowAnalytics: !state.allowAnalytics })),
      
      setLanguage: (language) => set({ language }),
      setDateFormat: (dateFormat) => set({ dateFormat }),
      setTimeFormat: (timeFormat) => set({ timeFormat }),
      setCurrency: (currency) => set({ currency }),
      
      // Reset to defaults
      resetSettings: () => set({
        theme: 'dark',
        reducedMotion: false,
        fontSize: 'medium',
        soundEnabled: true,
        musicEnabled: false,
        notificationSounds: true,
        volume: 70,
        desktopNotifications: true,
        emailNotifications: true,
        pushNotifications: false,
        showOnlineStatus: true,
        showReadReceipts: true,
        allowAnalytics: true,
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        currency: 'INR',
      }),
    }),
    {
      name: 'app-settings', // localStorage key
    }
  )
);

export default useSettingsStore;
