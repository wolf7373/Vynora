import { create } from 'zustand'
import type { UIState, UIActions, NavTab, RightSidebarView, VisualizerMode, Track } from '@/types'

export type UIStore = UIState & UIActions

const INITIAL_STATE: UIState = {
  activeTab: 'home',
  navHistory: ['home'],
  navHistoryIndex: 0,
  rightSidebarView: 'closed',
  isDockedPlayerOpen: false,
  isMobileDrawerOpen: false,
  mobileDrawerTab: 'visualizer',
  visualizerMode: 'turntable',
  searchQuery: '',
  commandPaletteOpen: false,
  ambientColor: '#00F2FE',
  isSleepTimerOpen: false,
  isPlaybackSettingsOpen: false,
  isQueueDrawerOpen: false,
  isAddToPlaylistOpen: false,
  trackForPlaylist: null,
}

export const useUIStore = create<UIStore>((set, get) => ({
  ...INITIAL_STATE,

  setActiveTab: (tab: NavTab) => {
    const { activeTab, navHistory, navHistoryIndex } = get()
    if (activeTab === tab) return

    const newHistory = [...navHistory.slice(0, navHistoryIndex + 1), tab]
    set({
      activeTab: tab,
      navHistory: newHistory,
      navHistoryIndex: newHistory.length - 1,
    })
  },

  goBack: () => {
    const { navHistory, navHistoryIndex } = get()
    if (navHistoryIndex > 0) {
      const prevIndex = navHistoryIndex - 1
      set({
        activeTab: navHistory[prevIndex],
        navHistoryIndex: prevIndex,
      })
    }
  },

  goForward: () => {
    const { navHistory, navHistoryIndex } = get()
    if (navHistoryIndex < navHistory.length - 1) {
      const nextIndex = navHistoryIndex + 1
      set({
        activeTab: navHistory[nextIndex],
        navHistoryIndex: nextIndex,
      })
    }
  },

  setRightSidebarView: (view: RightSidebarView) => {
    set({ rightSidebarView: view })
  },

  toggleRightSidebarView: (view: Exclude<RightSidebarView, 'closed'>) => {
    const current = get().rightSidebarView
    set({ rightSidebarView: current === view ? 'closed' : view })
  },

  setIsDockedPlayerOpen: (isOpen: boolean) => {
    set({ isDockedPlayerOpen: isOpen })
  },

  setIsMobileDrawerOpen: (isOpen: boolean) => {
    set({ isMobileDrawerOpen: isOpen })
  },

  setMobileDrawerTab: (tab: 'visualizer' | 'lyrics' | 'video') => {
    set({ mobileDrawerTab: tab })
  },

  setVisualizerMode: (mode: VisualizerMode) => {
    set({ visualizerMode: mode })
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
  },

  setCommandPaletteOpen: (isOpen: boolean) => {
    set({ commandPaletteOpen: isOpen })
  },

  setAmbientColor: (color: string) => {
    set({ ambientColor: color })
  },

  setIsSleepTimerOpen: (isOpen: boolean) => {
    set({ isSleepTimerOpen: isOpen })
  },

  setIsPlaybackSettingsOpen: (isOpen: boolean) => {
    set({ isPlaybackSettingsOpen: isOpen })
  },

  setIsQueueDrawerOpen: (isOpen: boolean) => {
    set({ isQueueDrawerOpen: isOpen })
  },

  openAddToPlaylist: (track: Track) => {
    set({ isAddToPlaylistOpen: true, trackForPlaylist: track })
  },

  closeAddToPlaylist: () => {
    set({ isAddToPlaylistOpen: false, trackForPlaylist: null })
  },
}))

