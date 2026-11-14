import React, { useState } from 'react'
import { FolderPlus, Plus, Check, X, Music, Sparkles } from 'lucide-react'
import { useUIStore } from '@/stores/useUIStore'
import { usePlaylistStore } from '@/stores/usePlaylistStore'

export const AddToPlaylistModal: React.FC = () => {
  const { isAddToPlaylistOpen, trackForPlaylist, closeAddToPlaylist } = useUIStore()
  const { playlists, addTrackToPlaylist, removeTrackFromPlaylist, createPlaylist } = usePlaylistStore()

  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  if (!isAddToPlaylistOpen || !trackForPlaylist) return null

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2000)
  }

  const handleTogglePlaylist = (playlistId: string, playlistName: string) => {
    const playlist = playlists.find((pl) => pl.id === playlistId)
    if (!playlist) return

    const isPresent = playlist.tracks.some((t) => t.id === trackForPlaylist.id)
    if (isPresent) {
      removeTrackFromPlaylist(playlistId, trackForPlaylist.id)
      showToast(`Removed from "${playlistName}"`)
    } else {
      addTrackToPlaylist(playlistId, trackForPlaylist)
      showToast(`Added to "${playlistName}"!`)
    }
  }

  const handleCreateAndAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newPlaylistName.trim()
    if (!trimmed) return

    const newPl = createPlaylist(trimmed)
    addTrackToPlaylist(newPl.id, trackForPlaylist)
    setNewPlaylistName('')
    setIsCreating(false)
    showToast(`Created "${newPl.name}" & added track!`)
  }

  const fallbackCover = trackForPlaylist.youtubeId
    ? `https://i.ytimg.com/vi/${trackForPlaylist.youtubeId}/hqdefault.jpg`
    : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add to Playlist"
      className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl transition-opacity select-none"
      onClick={closeAddToPlaylist}
    >
      <div
        className="w-full max-w-md liquid-glass-card rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4 text-white border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="liquid-specular-edge pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Add to Playlist</h2>
              <p className="text-[11px] text-white/60">Choose where to save this track</p>
            </div>
          </div>

          <button
            onClick={closeAddToPlaylist}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full liquid-glass-pill text-white/70 hover:text-white transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Track Banner */}
        <div className="flex items-center gap-3 p-3 rounded-2xl liquid-glass-pane border border-white/15">
          <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden flex-shrink-0 border border-white/20">
            <img
              src={trackForPlaylist.coverUrl || fallbackCover}
              alt={trackForPlaylist.title}
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = fallbackCover
              }}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-sm font-bold text-white truncate block">{trackForPlaylist.title}</span>
            <span className="text-xs text-white/65 truncate block">{trackForPlaylist.artist}</span>
          </div>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="px-3 py-1.5 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-semibold text-center flex items-center justify-center gap-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Create New Playlist Section */}
        {isCreating ? (
          <form onSubmit={handleCreateAndAdd} className="flex items-center gap-2">
            <input
              type="text"
              autoFocus
              placeholder="Enter playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl liquid-glass-input text-xs text-white focus:outline-none focus:border-amber-400/60"
            />
            <button
              type="submit"
              disabled={!newPlaylistName.trim()}
              className="min-h-[44px] px-4 rounded-xl bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 font-bold text-xs hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all cursor-pointer whitespace-nowrap shadow-sm"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="min-h-[44px] px-3 rounded-xl liquid-glass-pill text-xs text-white/70 hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="min-h-[44px] w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border border-dashed border-white/20 hover:border-amber-400/50 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 group-hover:bg-amber-400/20 text-amber-300 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 border border-white/10">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white">Create New Playlist</span>
          </button>
        )}

        {/* Existing Playlists Scrollable List */}
        <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-none custom-scrollbar">
          {playlists.length === 0 ? (
            <div className="text-center py-6 text-white/50 text-xs">
              No playlists found. Create one above to get started!
            </div>
          ) : (
            playlists.map((pl) => {
              const isPresent = pl.tracks.some((t) => t.id === trackForPlaylist.id)

              return (
                <div
                  key={pl.id}
                  onClick={() => handleTogglePlaylist(pl.id, pl.name)}
                  className={`min-h-[44px] flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer group ${
                    isPresent
                      ? 'bg-amber-400/20 border-amber-400/50 text-white shadow-sm'
                      : 'liquid-glass-pill border-white/10 hover:border-white/25 text-white/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-lg bg-white/5 overflow-hidden flex items-center justify-center border border-white/15 flex-shrink-0">
                      {pl.coverUrl ? (
                        <img src={pl.coverUrl} alt={pl.name} className="w-full h-full object-cover" />
                      ) : (
                        <Music className="w-4 h-4 text-white/60" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold truncate block group-hover:text-amber-300 transition-colors">
                        {pl.name}
                      </span>
                      <span className="text-[10px] text-white/60 truncate block">
                        {pl.tracks.length} {pl.tracks.length === 1 ? 'track' : 'tracks'}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform ${
                      isPresent
                        ? 'bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 font-bold'
                        : 'bg-white/10 text-white/60 group-hover:text-white group-hover:scale-110'
                    }`}
                  >
                    {isPresent ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

