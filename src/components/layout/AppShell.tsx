import React from 'react'
import { LeftSidebar } from './LeftSidebar'
import { CenterViewport } from './CenterViewport'
import { RightSidebarDock } from './RightSidebarDock'
import { PlayerBar } from './PlayerBar'
import { MobileNav } from './MobileNav'
import { MobileNowPlayingDrawer } from './MobileNowPlayingDrawer'
import { QueueDrawer } from './QueueDrawer'
import { AmbientBackground } from './AmbientBackground'
import { SleepTimerModal } from '@/components/modals/SleepTimerModal'
import { PlaybackSettingsModal } from '@/components/modals/PlaybackSettingsModal'
import { AddToPlaylistModal } from '@/components/modals/AddToPlaylistModal'
import { SingletonYouTubePlayer } from '@/components/player/SingletonYouTubePlayer'
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts'
import { useUIStore } from '@/stores/useUIStore'

export const AppShell: React.FC = () => {
  // REG-06: Enable global keyboard shortcuts with input collision suppression
  useGlobalShortcuts()

  const {
    isSleepTimerOpen,
    setIsSleepTimerOpen,
    isPlaybackSettingsOpen,
    setIsPlaybackSettingsOpen,
  } = useUIStore()

  return (
    <div className="fixed inset-0 w-full flex flex-col bg-vyn-canvas text-vyn-high overflow-hidden font-sans selection:bg-vyn-primary/20 selection:text-vyn-primary overscroll-none">
      {/* Dynamic Animated Ambient Aurora Motion Background */}
      <AmbientBackground />

      {/* 3-Column Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Column: Navigation & Playlists (Hidden on mobile <768px) */}
        <div className="hidden md:flex flex-shrink-0">
          <LeftSidebar />
        </div>

        {/* Center Column: Main Views Viewport */}
        <CenterViewport />

        {/* Right Column: Docked Video & Synced Lyrics (REG-04) (Desktop only) */}
        <RightSidebarDock />
      </div>

      {/* Sticky Bottom Player Bar (Appears when track is loaded) */}
      <PlayerBar />

      {/* Mobile Bottom Navigation (Hidden on desktop md:hidden) */}
      <MobileNav />

      {/* Full Responsive Now Playing Drawer (Desktop & Mobile) */}
      <MobileNowPlayingDrawer />

      {/* Play Queue Drawer */}
      <QueueDrawer />

      {/* Sleep Timer Modal */}
      <SleepTimerModal
        isOpen={isSleepTimerOpen}
        onClose={() => setIsSleepTimerOpen(false)}
      />

      {/* Playback & Crossfade Settings Modal */}
      <PlaybackSettingsModal
        isOpen={isPlaybackSettingsOpen}
        onClose={() => setIsPlaybackSettingsOpen(false)}
      />

      {/* Add To Playlist Modal */}
      <AddToPlaylistModal />

      {/* Singleton YouTube Video & Audio Player Host (Zero Audio Overlap & Lockstep Sync) */}
      <SingletonYouTubePlayer />
    </div>
  )
}
