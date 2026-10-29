import React, { useState, useEffect, useMemo } from 'react'
import { Search, Play, Plus, Loader2, Sparkles, Filter, Heart } from 'lucide-react'
import { useUIStore } from '@/stores/useUIStore'
import { useQueueStore } from '@/stores/useQueueStore'
import { usePlaylistStore } from '@/stores/usePlaylistStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { PlaybackAdapterManager } from '@/adapters'
import { useDebounce } from '@/hooks/useDebounce'
import { instanceRacingSearcher, type SearchResultTrack } from '@/services/search'
import { CATALOG_TRACKS } from '@/data/tracksCatalog'
import { getRecommendations } from '@/services/recommendations/recommendationEngine'
import { cleanLyricsTrackTitle } from '@/services/lyrics/cleanerRegex'
import type { Track } from '@/types/track'
import { formatTime } from '@/utils/formatTime'

const POPULAR_SEARCH_TAGS = [
  'Arijit Singh',
  'Karan Aujla',
  'Sidhu Moose Wala',
  'Diljit Dosanjh',
  'Shubh',
  'The Weeknd',
  'Kesariya',
  'Moosetape',
  'Apna Bana Le',
  'Peaceful Piano',
]

export const SearchView: React.FC = () => {
  const { searchQuery, setSearchQuery, setIsDockedPlayerOpen, setRightSidebarView, openAddToPlaylist } = useUIStore()
  const { setQueue } = useQueueStore()
  const { playlists, toggleLikeTrack, isLiked, createPlaylist, addTrackToPlaylist } = usePlaylistStore()
  const { currentTrack, isPlaying } = usePlayerStore()
  const adapterManager = PlaybackAdapterManager.getInstance()

  const [activeCategory, setActiveCategory] = useState<'all' | 'bollywood' | 'punjabi' | 'top-hits' | 'local'>('all')
  const [results, setResults] = useState<SearchResultTrack[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchMeta, setSearchMeta] = useState<{ instance: string; cached: boolean } | null>(null)

  // 200ms debounce as specified in Milestone 4 blueprint
  const debouncedQuery = useDebounce(searchQuery, 200)

  useEffect(() => {
    const trimmed = debouncedQuery.trim()
    if (!trimmed) {
      // Default to the full verified catalog of songs
      setResults(CATALOG_TRACKS.map((t) => ({ ...t, sourceInstance: 'catalog' })))
      setSearchMeta(null)
      setIsLoading(false)
      return
    }

    // Direct YouTube Link Detection: e.g. youtube.com/watch?v=... or youtu.be/...
    const ytUrlMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/)
    if (ytUrlMatch && ytUrlMatch[1]) {
      const videoId = ytUrlMatch[1]
      const directTrack: SearchResultTrack = {
        id: `yt-${videoId}`,
        youtubeId: videoId,
        title: `YouTube Video (${videoId})`,
        artist: 'Pasted YouTube Stream',
        album: 'Direct YouTube Web Stream',
        duration: 180,
        source: 'youtube',
        sourceInstance: 'direct-link',
        coverUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        style: 'acoustic',
        color: '#ff0000',
      }
      setResults([directTrack])
      setSearchMeta({ instance: 'direct-link', cached: false })
      setIsLoading(false)
      return
    }

    const trimmedLower = trimmed.toLowerCase()

    // 1. Instant local catalog matches
    const catalogMatches: SearchResultTrack[] = CATALOG_TRACKS.filter((t) => {
      const matchTitle = t.title.toLowerCase().includes(trimmedLower)
      const matchArtist = t.artist.toLowerCase().includes(trimmedLower)
      const matchAlbum = t.album ? t.album.toLowerCase().includes(trimmedLower) : false
      return matchTitle || matchArtist || matchAlbum
    }).map((t) => ({ ...t, sourceInstance: 'catalog' }))

    // Pre-populate with immediate local results for 0ms lag
    setResults(catalogMatches)

    const abortController = new AbortController()
    setIsLoading(true)

    // 2. Query Piped/Invidious racing engine for extra online songs
    instanceRacingSearcher
      .search(trimmed, abortController.signal)
      .then(({ tracks, instance, cached }) => {
        // Merge without duplicates (catalog takes priority, deduplicating IDs, YouTube IDs, and identical titles)
        const seenIds = new Set(catalogMatches.map((t) => t.id))
        const seenYtIds = new Set(catalogMatches.map((t) => t.youtubeId).filter(Boolean))
        const seenTitles = new Set(
          catalogMatches.map((t) => t.title.toLowerCase().replace(/[^a-z0-9]/g, ''))
        )
        const additional: SearchResultTrack[] = []

        for (const track of tracks) {
          if (seenIds.has(track.id)) continue
          if (track.youtubeId && seenYtIds.has(track.youtubeId)) continue

          const normTitle = track.title.toLowerCase().replace(/[^a-z0-9]/g, '')
          if (normTitle.length > 5 && seenTitles.has(normTitle)) continue

          seenIds.add(track.id)
          if (track.youtubeId) seenYtIds.add(track.youtubeId)
          seenTitles.add(normTitle)
          additional.push(track)
        }

        setResults([...catalogMatches, ...additional])
        setSearchMeta({ instance, cached })
      })
      .catch(() => {
        setResults(catalogMatches)
      })
      .finally(() => {
        setIsLoading(false)
      })

    return () => {
      abortController.abort()
    }
  }, [debouncedQuery])

  // Category filter
  const displayedTracks = useMemo(() => {
    return results.filter((track) => {
      if (activeCategory === 'local') return track.source === 'local' || track.isLocal
      if (activeCategory === 'bollywood') return track.playlistId === 'bollywood-butter' || track.artist.toLowerCase().includes('arijit') || track.artist.toLowerCase().includes('pritam')
      if (activeCategory === 'punjabi') return track.playlistId === 'punjabi-hits' || track.artist.toLowerCase().includes('aujla') || track.artist.toLowerCase().includes('sidhu') || track.artist.toLowerCase().includes('shubh')
      if (activeCategory === 'top-hits') return track.playlistId === 'top-hits' || track.artist.toLowerCase().includes('weeknd')
      return true
    })
  }, [results, activeCategory])

  // Spotify / YouTube Music Style: Build high-variety Song Radio Queue
  // Filters out duplicate versions/covers/reels of the exact same song and fills queue with authentic genre radio tracks
  const buildSmartSearchQueue = (selectedTrack: Track, searchResults: Track[]): Track[] => {
    const stopWords = new Set([
      'the', 'and', 'for', 'with', 'from', 'song', 'video', 'audio',
      'full', 'official', 'remix', 'dance', 'cover', 'status', 'shorts',
      'lyrics', 'trending', 'music', 'version', 'feat', 'ft', 'track'
    ])
    const combined = `${selectedTrack.title} ${searchQuery || ''}`.toLowerCase()
    const salient = combined
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !stopWords.has(w))

    const seenTitles = new Set<string>()
    const selectedBase = cleanLyricsTrackTitle(selectedTrack.title).toLowerCase()
    if (selectedBase.length > 2) {
      seenTitles.add(selectedBase)
    }

    const distinctFromResults: Track[] = []
    for (const t of searchResults) {
      if (t.id === selectedTrack.id) continue
      const titleLower = t.title.toLowerCase()

      // Skip duplicate uploads, remixes, or reels of the clicked track
      const isDuplicateOfSelected = salient.some((kw) => titleLower.includes(kw))
      if (isDuplicateOfSelected) continue

      const base = cleanLyricsTrackTitle(t.title).toLowerCase()
      if (base.length > 2 && seenTitles.has(base)) continue
      if (base.length > 2) {
        seenTitles.add(base)
      }
      distinctFromResults.push(t)
      if (distinctFromResults.length >= 2) break
    }

    // Spotify / YouTube Song Radio: append fresh, distinct recommended songs of the same vibe
    const radioRecommendations = getRecommendations(selectedTrack)
    const freshDiverseTracks = radioRecommendations.filter((t) => {
      if (t.id === selectedTrack.id) return false
      const base = cleanLyricsTrackTitle(t.title).toLowerCase()
      return base.length > 2 ? !seenTitles.has(base) : true
    })

    return [selectedTrack, ...distinctFromResults, ...freshDiverseTracks].slice(0, 30)
  }

  // REG-03: Clicking a song card opens right video dock before calling playTrack
  const handlePlaySong = async (track: Track, _index?: number) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        await adapterManager.pause()
      } else {
        await adapterManager.play()
      }
      return
    }
    setIsDockedPlayerOpen(true)
    setRightSidebarView('video')

    // Set Spotify-style smart diverse queue instead of 15 identical songs
    const smartQueue = buildSmartSearchQueue(track, displayedTracks)
    setQueue(smartQueue, 0)
    await adapterManager.playTrack(track)
  }

  const handleAddToPlaylist = (track: Track) => {
    if (playlists.length === 0) {
      const newPl = createPlaylist('Favorites')
      addTrackToPlaylist(newPl.id, track)
    }
    openAddToPlaylist(track)
  }

  return (
    <div className="p-4 md:p-8 pb-36 md:pb-12 space-y-6 max-w-6xl mx-auto select-none">
      {/* Search Header & Category Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-vyn-primary/10 border border-vyn-primary/20 text-vyn-primary text-[11px] font-medium mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Full Catalog Search & YouTube Streams</span>
          </div>
          <h1 className="text-xl md:text-2xl font-display font-bold text-vyn-high">
            {searchQuery ? `Search results for "${searchQuery}"` : 'Discover Music & Live YouTube Streams'}
          </h1>
          <p className="text-xs text-vyn-muted">
            All songs available • Verified official YouTube streams • Instant synchronized lyrics
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-vyn-elevated p-1 rounded-xl border border-vyn-border overflow-x-auto max-w-full">
          {(
            [
              { id: 'all', label: 'All Songs' },
              { id: 'bollywood', label: 'Bollywood' },
              { id: 'punjabi', label: 'Punjabi' },
              { id: 'top-hits', label: 'Top Hits' },
              { id: 'local', label: 'Local' },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`min-h-[44px] min-w-[44px] px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-vyn-primary text-vyn-canvas font-semibold shadow-glow-cyan'
                  : 'text-vyn-muted hover:text-vyn-high'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Search Chips */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
        <span className="text-xs text-vyn-muted font-medium whitespace-nowrap flex-shrink-0">Trending:</span>
        {POPULAR_SEARCH_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setSearchQuery(tag)}
            className="min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-full text-xs bg-canvas-elevated hover:bg-white/10 text-vyn-high/80 hover:text-vyn-primary border border-vyn-border whitespace-nowrap flex-shrink-0 transition-all active:scale-95"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Meta Bar: Instance Source & Filter Guard */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-vyn-surface/60 border border-vyn-border text-xs text-vyn-muted">
        <div className="flex items-center gap-2">
          {isLoading ? (
            <span className="flex items-center gap-1.5 text-vyn-primary">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Searching music streams...</span>
            </span>
          ) : searchMeta ? (
            <span className="font-mono text-[11px]">
              Engine: <strong className="text-vyn-high">{searchMeta.instance}</strong> {searchMeta.cached && '(cached)'}
            </span>
          ) : (
            <span className="font-mono text-[11px]">
              Showing <strong className="text-vyn-high">{displayedTracks.length} tracks</strong> from catalog
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-vyn-primary/90 font-mono">
          <Filter className="w-3 h-3" />
          <span>Full length tracks • Verified official YouTube streams</span>
        </div>
      </div>

      {/* Track Results List */}
      <div className="glass-panel rounded-2xl border border-vyn-border overflow-hidden">
        <div className="px-5 py-3 border-b border-vyn-border/60 grid grid-cols-12 text-[11px] font-bold uppercase tracking-wider text-vyn-muted">
          <span className="col-span-1">#</span>
          <span className="col-span-6 sm:col-span-5">Title & Artist</span>
          <span className="hidden sm:block sm:col-span-4">Source</span>
          <span className="col-span-5 sm:col-span-2 text-right">Duration & Action</span>
        </div>

        <div className="divide-y divide-vyn-border/30">
          {isLoading && displayedTracks.length === 0 ? (
            // Skeleton Loading State
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-lg bg-white/5" />
                  <div className="flex-1 space-y-2">
                    <div className="w-48 h-3 rounded bg-white/10" />
                    <div className="w-32 h-2 rounded bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedTracks.length === 0 ? (
            <div className="p-12 text-center">
              <Search className="w-10 h-10 text-vyn-muted/50 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-vyn-high mb-1">No songs found matching "{searchQuery}"</h3>
              <p className="text-xs text-vyn-muted max-w-sm mx-auto">
                Try searching by song name or artist. Results are filtered to ensure high-quality audio.
              </p>
            </div>
          ) : (
            displayedTracks.map((track, idx) => {
              const liked = isLiked(track.id)
              const isCurrent = currentTrack?.id === track.id
              const fallbackCover = track.youtubeId
                ? `https://i.ytimg.com/vi/${track.youtubeId}/hqdefault.jpg`
                : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80'

              return (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => handlePlaySong(track, idx)}
                  className={`px-5 py-3 grid grid-cols-12 items-center transition-all group cursor-pointer border-l-4 ${
                    isCurrent
                      ? 'bg-vyn-primary/10 border-vyn-primary shadow-sm'
                      : 'border-transparent hover:bg-white/5'
                  }`}
                >
                  {/* Index / Play hover button (REG-03) */}
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
                        <Play className="w-4 h-4 text-vyn-primary fill-current hidden group-hover:block" />
                      </>
                    )}
                  </div>

                  {/* Title & Artist */}
                  <div
                    className="col-span-6 sm:col-span-5 flex items-center gap-3 pr-2 min-w-0"
                  >
                    <div className="w-10 h-10 rounded-lg bg-vyn-canvas overflow-hidden flex-shrink-0 border border-vyn-border relative">
                      <img
                        src={track.coverUrl || fallbackCover}
                        alt={track.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = fallbackCover
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
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
                  </div>

                  {/* Source Engine */}
                  <div className="hidden sm:block sm:col-span-4 text-xs text-vyn-muted truncate pr-2 font-mono">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-vyn-elevated border border-vyn-border uppercase font-semibold text-vyn-secondary">
                      {track.source === 'youtube' ? 'YouTube Full' : 'Local Audio'}
                    </span>
                  </div>

                  {/* Duration & Playlist Button */}
                  <div className="col-span-5 sm:col-span-2 flex items-center justify-end gap-2">
                    <span className="text-xs text-vyn-muted font-mono tabular-nums">
                      {formatTime(track.duration)}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLikeTrack(track)
                      }}
                      title={liked ? 'Unlike' : 'Like'}
                      aria-label={`Like ${track.title}`}
                      className="min-h-[44px] min-w-[44px] w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center text-vyn-muted hover:text-white transition-all active:scale-95"
                    >
                      <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : 'text-vyn-muted'}`} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddToPlaylist(track)
                      }}
                      title="Add to playlist"
                      aria-label={`Add ${track.title} to playlist`}
                      className="min-h-[44px] min-w-[44px] w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center text-vyn-muted hover:text-vyn-primary transition-all active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
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
