import React from 'react'
import { Plus, Play, Trash2, ListMusic, Music2, Heart } from 'lucide-react'
import { usePlaylistStore } from '@/stores/usePlaylistStore'
import { useQueueStore } from '@/stores/useQueueStore'
import { useUIStore } from '@/stores/useUIStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { PlaybackAdapterManager } from '@/adapters'
import { CATALOG_TRACKS } from '@/data/tracksCatalog'
import { formatTime } from '@/utils/formatTime'

export const LibraryView: React.FC = () => {
  const {
    playlists,
    activePlaylistId,
    setActivePlaylistId,
    likedTracks,
    createPlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
  } = usePlaylistStore()

  const { setQueue } = useQueueStore()
  const { setIsDockedPlayerOpen, setRightSidebarView } = useUIStore()
  const { currentTrack, isPlaying } = usePlayerStore()
  const adapterManager = PlaybackAdapterManager.getInstance()

  const isLikedView = activePlaylistId === 'liked-songs'
  const currentPlaylist = isLikedView
    ? {
        id: 'liked-songs',
        name: 'Liked Songs',
        description: 'Your favorite tracks in one place',
        tracks: likedTracks,
        createdAt: 0,
        updatedAt: 0,
      }
    : playlists.find((p) => p.id === activePlaylistId) || playlists[0]

  const handleCreateNew = () => {
    createPlaylist(`New Mix #${playlists.length + 1}`, 'Curated collection')
  }

  const handlePlayPlaylist = async (startIndex = 0) => {
    if (!currentPlaylist || currentPlaylist.tracks.length === 0) return
    setIsDockedPlayerOpen(true)
    setRightSidebarView('video')
    setQueue(currentPlaylist.tracks, startIndex)
    await adapterManager.playTrack(currentPlaylist.tracks[startIndex])
  }

  return (
    <div className="p-4 md:p-8 pb-36 md:pb-12 space-y-6 max-w-6xl mx-auto select-none">
      {/* Library Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-bold text-vyn-high">Your Music Library</h1>
          <p className="text-xs text-vyn-muted">
            {playlists.length} custom playlist{playlists.length === 1 ? '' : 's'} created
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="min-h-[44px] min-w-[44px] px-5 py-2.5 rounded-full liquid-glass-pill bg-gradient-to-b from-white/95 to-white/75 text-black text-xs font-extrabold flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border-white/60"
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Mobile & Desktop Playlist Switcher Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
        <button
          onClick={() => setActivePlaylistId('liked-songs')}
          className={`min-h-[44px] px-4 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
            isLikedView
              ? 'liquid-glass-pill text-white shadow-md font-bold bg-gradient-to-r from-indigo-500/80 to-pink-500/80 border-white/30'
              : 'liquid-glass-pill text-vyn-muted hover:text-vyn-high border-white/10'
          }`}
        >
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>Liked Songs ({likedTracks.length})</span>
        </button>

        {playlists.map((pl) => {
          const isSelected = !isLikedView && currentPlaylist?.id === pl.id
          return (
            <button
              key={pl.id}
              onClick={() => setActivePlaylistId(pl.id)}
              className={`min-h-[44px] px-4 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'liquid-glass-pill bg-white text-black font-extrabold shadow-md border-white/60'
                  : 'liquid-glass-pill text-vyn-muted hover:text-vyn-high border-white/10'
              }`}
            >
              {pl.name}
            </button>
          )
        })}
      </div>

      {playlists.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-vyn-border text-center max-w-md mx-auto my-8">
          <ListMusic className="w-12 h-12 text-vyn-muted/50 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-vyn-high mb-1">Create your first playlist</h3>
          <p className="text-xs text-vyn-muted mb-4">Organize your favorite YouTube streams and local audio files.</p>
          <button
            onClick={handleCreateNew}
            className="min-h-[44px] min-w-[44px] px-4 py-2 rounded-xl bg-vyn-primary text-vyn-canvas text-xs font-semibold shadow-glow-cyan"
          >
            Create Playlist
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Playlist Detail Card */}
          {currentPlaylist && (
            <div className="liquid-glass-card p-6 md:p-8 rounded-3xl border border-white/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/15 flex items-center justify-center flex-shrink-0 text-vyn-primary overflow-hidden shadow-md">
                  {isLikedView ? (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white">
                      <Heart className="w-8 h-8 fill-current" />
                    </div>
                  ) : (
                    <ListMusic className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-vyn-high">{currentPlaylist.name}</h2>
                  <p className="text-xs text-vyn-muted mb-1">{currentPlaylist.description || 'Personal Mix'}</p>
                  <span className="text-[10px] text-vyn-muted font-mono">
                    {currentPlaylist.tracks.length} track{currentPlaylist.tracks.length === 1 ? '' : 's'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  onClick={() => handlePlayPlaylist(0)}
                  disabled={currentPlaylist.tracks.length === 0}
                  className="min-h-[44px] min-w-[44px] px-5 py-2.5 rounded-full liquid-glass-pill bg-gradient-to-b from-white/95 to-white/75 text-black text-xs font-extrabold flex items-center gap-2 shadow-xl disabled:opacity-40 hover:scale-105 active:scale-95 transition-all cursor-pointer border-white/60"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Play All</span>
                </button>

                {!isLikedView && (
                  <button
                    onClick={() => deletePlaylist(currentPlaylist.id)}
                    title="Delete playlist"
                    aria-label="Delete playlist"
                    className="min-h-[44px] min-w-[44px] p-2.5 rounded-full liquid-glass-pill text-vyn-muted hover:text-red-400 hover:border-red-400/40 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick Add Samples bar */}
          <div className="liquid-glass-card p-4 rounded-2xl border border-white/15 flex items-center justify-between gap-2 overflow-x-auto shadow-md">
            <span className="text-xs text-vyn-muted font-medium whitespace-nowrap">Quick Add:</span>
            <div className="flex items-center gap-2">
              {CATALOG_TRACKS.slice(0, 4).map((track) => (
                <button
                  key={track.id}
                  onClick={() => addTrackToPlaylist(currentPlaylist.id, track)}
                  className="min-h-[44px] min-w-[44px] text-[11px] px-3.5 py-1.5 rounded-xl liquid-glass-pill text-vyn-high font-medium whitespace-nowrap transition-all border-white/10 hover:border-vyn-primary/40 cursor-pointer"
                >
                  + {track.title}
                </button>
              ))}
            </div>
          </div>

          {/* Playlist Tracks List */}
          <div className="liquid-glass-card rounded-3xl border border-white/15 overflow-hidden shadow-xl">
            {currentPlaylist?.tracks.length === 0 ? (
              <div className="p-8 text-center text-vyn-muted">
                <Music2 className="w-8 h-8 text-vyn-muted/50 mx-auto mb-2" />
                <p className="text-xs">This playlist is empty. Add tracks above or from Search.</p>
              </div>
            ) : (
              <div className="divide-y divide-vyn-border/30">
                {currentPlaylist?.tracks.map((track, idx) => {
                  const isCurrent = currentTrack?.id === track.id
                  return (
                    <div
                      key={`${track.id}-${idx}`}
                      onClick={() => handlePlayPlaylist(idx)}
                      className={`px-5 py-3 grid grid-cols-12 items-center transition-all group cursor-pointer border-l-4 ${
                        isCurrent
                          ? 'bg-vyn-primary/10 border-vyn-primary shadow-sm'
                          : 'border-transparent hover:bg-white/5'
                      }`}
                    >
                      <div
                        className="col-span-1 text-xs text-vyn-muted font-mono flex items-center min-h-[24px]"
                      >
                        {isCurrent ? (
                          isPlaying ? (
                            <div className="flex items-center gap-0.5 h-4" title="Playing">
                              <span className="w-1 h-3 bg-vyn-primary animate-pulse rounded-full" />
                              <span className="w-1 h-4 bg-vyn-primary animate-pulse delay-75 rounded-full" />
                              <span className="w-1 h-2 bg-vyn-primary animate-pulse delay-150 rounded-full" />
                            </div>
                          ) : (
                            <Play className="w-4 h-4 text-vyn-primary fill-current" />
                          )
                        ) : (
                          <>
                            <span className="group-hover:hidden">{idx + 1}</span>
                            <Play className="w-3.5 h-3.5 text-vyn-primary fill-current hidden group-hover:block" />
                          </>
                        )}
                      </div>

                      <div
                        className="col-span-8 sm:col-span-6 min-w-0 pr-2"
                      >
                        <span
                          className={`text-xs font-semibold truncate block transition-colors ${
                            isCurrent
                              ? 'text-vyn-primary font-bold'
                              : 'text-vyn-high group-hover:text-vyn-primary'
                          }`}
                        >
                          {track.title}
                        </span>
                        <span className="text-[11px] text-vyn-muted truncate block">{track.artist}</span>
                      </div>

                      <div className="hidden sm:block sm:col-span-3 text-xs text-vyn-muted font-mono tabular-nums">
                        {formatTime(track.duration)}
                      </div>

                      <div className="col-span-3 sm:col-span-2 text-right">
                        <button
                          onClick={() => removeTrackFromPlaylist(currentPlaylist.id, track.id)}
                          title="Remove track"
                          aria-label="Remove track"
                          className="min-h-[44px] min-w-[44px] w-9 h-9 p-1.5 rounded-lg text-vyn-muted hover:text-red-400 hover:bg-white/5 inline-flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

