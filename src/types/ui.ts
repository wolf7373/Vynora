import type { VisualizerMode } from './player'
import type { Track } from './track'

export type NavTab = 'home' | 'search' | 'library' | 'visualizer' | 'downloaded'

export type RightSidebarView = 'video' | 'lyrics' | 'closed'

export interface UIState {
  activeTab: NavTab
  navHistory: NavTab[]
  navHistoryIndex: number
  rightSidebarView: RightSidebarView
  isDockedPlayerOpen: boolean
  isMobileDrawerOpen: boolean
  mobileDrawerTab?: 'visualizer' | 'lyrics' | 'video'
  visualizerMode: VisualizerMode
  searchQuery: string
  commandPaletteOpen: boolean
  ambientColor: string
  isSleepTimerOpen: boolean
  isPlaybackSettingsOpen: boolean
  isQueueDrawerOpen: boolean
  isAddToPlaylistOpen: boolean
  trackForPlaylist: Track | null
}

export interface UIActions {
  setActiveTab: (tab: NavTab) => void
  goBack: () => void
  goForward: () => void
  setRightSidebarView: (view: RightSidebarView) => void
  toggleRightSidebarView: (view: Exclude<RightSidebarView, 'closed'>) => void
  setIsDockedPlayerOpen: (isOpen: boolean) => void
  setIsMobileDrawerOpen: (isOpen: boolean) => void
  setMobileDrawerTab: (tab: 'visualizer' | 'lyrics' | 'video') => void
  setVisualizerMode: (mode: VisualizerMode) => void
  setSearchQuery: (query: string) => void
  setCommandPaletteOpen: (isOpen: boolean) => void
  setAmbientColor: (color: string) => void
  setIsSleepTimerOpen: (isOpen: boolean) => void
  setIsPlaybackSettingsOpen: (isOpen: boolean) => void
  setIsQueueDrawerOpen: (isOpen: boolean) => void
  openAddToPlaylist: (track: Track) => void
  closeAddToPlaylist: () => void
}

