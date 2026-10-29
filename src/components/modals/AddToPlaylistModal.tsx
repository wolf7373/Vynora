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
      className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity select-none"
      onClick={closeAddToPlaylist}
    >
      <div
        className="w-full max-w-md bg-vyn-surface border border-vyn-border rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4 text-vyn-high"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow orb */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-vyn-primary/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-vyn-border/50 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-vyn-primary/20 text-vyn-primary flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-vyn-high">Add to Playlist</h2>
              <p className="text-[11px] text-vyn-muted">Choose where to save this track</p>
            </div>
          </div>

          <button
            onClick={closeAddToPlaylist}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-white/10 text-vyn-muted hover:text-white transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Track Banner */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-vyn-elevated border border-vyn-border">
          <div className="w-12 h-12 rounded-xl bg-vyn-canvas overflow-hidden flex-shrink-0 border border-vyn-border">
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
            <span className="text-sm font-bold text-vyn-high truncate block">{trackForPlaylist.title}</span>
            <span className="text-xs text-vyn-muted truncate block">{trackForPlaylist.artist}</span>
          </div>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="px-3 py-1.5 rounded-xl bg-vyn-primary/20 border border-vyn-primary/40 text-vyn-primary text-xs font-semibold text-center flex items-center justify-center gap-1.5 animate-pulse">
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
              className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-vyn-canvas border border-vyn-border text-xs text-white focus:outline-none focus:border-vyn-primary"
            />
            <button
              type="submit"
              disabled={!newPlaylistName.trim()}
              className="min-h-[44px] px-4 rounded-xl bg-vyn-primary text-black font-bold text-xs hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all cursor-pointer whitespace-nowrap"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="min-h-[44px] px-3 rounded-xl hover:bg-white/10 text-xs text-vyn-muted hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="min-h-[44px] w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border border-dashed border-white/20 hover:border-vyn-primary bg-white/[0.02] hover:bg-white/[0.06] text-white/80 hover:text-white transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-vyn-primary/10 group-hover:bg-vyn-primary/20 text-vyn-primary flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white">Create New Playlist</span>
          </button>
        )}

        {/* Existing Playlists Scrollable List */}
        <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-none custom-scrollbar">
          {playlists.length === 0 ? (
            <div className="text-center py-6 text-vyn-muted text-xs">
              No playlists found. Create one above to get started!
            </div>
          ) : (
            playlists.map((pl) => {
              const isPresent = pl.tracks.some((t) => t.id === trackForPlaylist.id)

              return (
                <div
                  key={pl.id}
                  onClick={() => handleTogglePlaylist(pl.id, pl.name)}
                  className={`min-h-[44px] flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group ${
                    isPresent
                      ? 'bg-vyn-primary/15 border-vyn-primary/50 text-white shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 border-white/5 text-vyn-muted hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-lg bg-vyn-canvas overflow-hidden flex items-center justify-center border border-vyn-border flex-shrink-0">
                      {pl.coverUrl ? (
                        <img src={pl.coverUrl} alt={pl.name} className="w-full h-full object-cover" />
                      ) : (
                        <Music className="w-4 h-4 text-vyn-muted" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold truncate block group-hover:text-vyn-primary transition-colors">
                        {pl.name}
                      </span>
                      <span className="text-[10px] text-vyn-muted truncate block">
                        {pl.tracks.length} {pl.tracks.length === 1 ? 'track' : 'tracks'}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform ${
                      isPresent
                        ? 'bg-vyn-primary text-black'
                        : 'bg-white/10 text-white/50 group-hover:text-white group-hover:scale-110'
                    }`}
                  >
                    {isPresent ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
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

