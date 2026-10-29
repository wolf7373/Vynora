import React, { useState } from 'react'
import { Home, Search, Library, Download, Disc3, Plus, Music2, Radio, Heart } from 'lucide-react'
import { VynoraLogo } from '@/components/common/VynoraLogo'
import { useUIStore } from '@/stores/useUIStore'
import { usePlaylistStore } from '@/stores/usePlaylistStore'
import { SyncCodeModal } from '@/components/sync/SyncCodeModal'
import { PWAInstallModal } from '@/components/modals/PWAInstallModal'
import type { NavTab } from '@/types'

export const LeftSidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useUIStore()
  const { playlists, activePlaylistId, likedTracks, createPlaylist, setActivePlaylistId } = usePlaylistStore()
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false)
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false)

  const navItems: { tab: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { tab: 'home', label: 'Home', icon: Home },
    { tab: 'search', label: 'Search', icon: Search },
    { tab: 'library', label: 'Your Library', icon: Library },
    { tab: 'downloaded', label: 'Downloaded', icon: Download },
    { tab: 'visualizer', label: '3D Studio', icon: Disc3 },
  ]

  const handleCreatePlaylist = () => {
    const pl = createPlaylist(`My Playlist #${playlists.length + 1}`)
    setActivePlaylistId(pl.id)
    setActiveTab('library')
  }

  return (
    <aside className="w-64 bg-vyn-surface/90 border-r border-vyn-border flex flex-col h-full flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-vyn-border flex items-center gap-3">
        <VynoraLogo className="w-8 h-8" />
        <div>
          <span className="font-display font-bold text-sm tracking-widest bg-gradient-to-r from-vyn-primary via-vyn-secondary to-vyn-accent bg-clip-text text-transparent">
            VYNORA
          </span>
          <span className="block text-[10px] text-vyn-muted font-mono tracking-wider">3D AUDIO STUDIO</span>
        </div>
      </div>

      {/* Main Navigation Items */}
      <div className="p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.tab
          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3.5 transition-all duration-200 active:scale-[0.98] ${
                isActive
                  ? 'bg-vyn-primary/10 text-vyn-primary border border-vyn-primary/20 shadow-glow-cyan'
                  : 'text-vyn-muted hover:text-vyn-high hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-vyn-primary' : 'text-vyn-muted'}`} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Playlists Section Divider */}
      <div className="px-5 py-3 border-t border-vyn-border/60 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-vyn-muted">Playlists</span>
        <button
          onClick={handleCreatePlaylist}
          title="Create New Playlist"
          aria-label="Create New Playlist"
          className="min-h-[44px] min-w-[44px] w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-vyn-muted hover:text-vyn-primary transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Pinned Liked Songs Button */}
      <div className="px-3 pb-2">
        <button
          onClick={() => {
            setActivePlaylistId('liked-songs')
            setActiveTab('library')
          }}
          className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
            activePlaylistId === 'liked-songs' && activeTab === 'library'
              ? 'bg-gradient-to-r from-accent-cyan/15 to-accent-violet/15 text-accent-cyan border border-accent-cyan/30 shadow-sm'
              : 'text-vyn-muted hover:text-vyn-high hover:bg-white/5'
          }`}
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <Heart className="w-3.5 h-3.5 fill-current" />
          </div>
          <div className="min-w-0 text-left">
            <span className="block truncate font-bold text-vyn-high">Liked Songs</span>
            <span className="text-[10px] text-vyn-muted block">
              {likedTracks.length} song{likedTracks.length === 1 ? '' : 's'}
            </span>
          </div>
        </button>
      </div>

      {/* Scrollable Playlist List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {playlists.length === 0 ? (
          <div className="p-4 text-center rounded-xl bg-vyn-canvas/40 border border-vyn-border/40 my-2">
            <Music2 className="w-6 h-6 text-vyn-muted/60 mx-auto mb-1.5" />
            <p className="text-xs text-vyn-muted mb-2">No playlists yet</p>
            <button
              onClick={handleCreatePlaylist}
              className="min-h-[44px] min-w-[44px] text-[11px] px-3 py-2 rounded-md bg-vyn-primary/10 text-vyn-primary border border-vyn-primary/20 hover:bg-vyn-primary/20 transition-all font-medium inline-flex items-center justify-center"
            >
              + Create First
            </button>
          </div>
        ) : (
          playlists.map((pl) => {
            const isSelected = activePlaylistId === pl.id && activeTab === 'library'
            return (
              <button
                key={pl.id}
                onClick={() => {
                  setActivePlaylistId(pl.id)
                  setActiveTab('library')
                }}
                className={`w-full min-h-[44px] px-3 py-2 rounded-lg text-left transition-all flex items-center justify-between group ${
                  isSelected
                    ? 'bg-vyn-elevated text-vyn-primary border border-vyn-primary/20 font-medium'
                    : 'text-vyn-muted hover:text-vyn-high hover:bg-white/5'
                }`}
              >
                <div className="truncate pr-2">
                  <span className="text-xs truncate block font-medium group-hover:text-vyn-high">{pl.name}</span>
                  <span className="text-[10px] text-vyn-muted block">
                    {pl.tracks.length} track{pl.tracks.length === 1 ? '' : 's'}
                  </span>
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* Install App & Cross-Device Sync Footer */}
      <div className="p-3 border-t border-vyn-border/60 space-y-1">
        <button
          onClick={() => setIsInstallModalOpen(true)}
          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between text-vyn-muted hover:text-vyn-primary hover:bg-vyn-primary/10 border border-transparent hover:border-vyn-primary/20 transition-all duration-200 group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Download className="w-4 h-4 text-vyn-primary group-hover:scale-110 transition-transform" />
            <span>Install App</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-vyn-primary/15 text-vyn-primary border border-vyn-primary/30">
            PWA
          </span>
        </button>

        <button
          onClick={() => setIsSyncModalOpen(true)}
          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between text-vyn-muted hover:text-vyn-primary hover:bg-vyn-primary/10 border border-transparent hover:border-vyn-primary/20 transition-all duration-200 group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-accent-cyan group-hover:animate-pulse" />
            <span>Sync Devices</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-accent-cyan">
            VYN
          </span>
        </button>
      </div>

      <SyncCodeModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} />
      <PWAInstallModal isOpen={isInstallModalOpen} onClose={() => setIsInstallModalOpen(false)} />
    </aside>
  )
}
