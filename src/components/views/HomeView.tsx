import React, { useState, useMemo, useCallback } from 'react'
import {
  Play,
  Shuffle,
  Sparkles,
  Heart,
  ArrowRight,
  Disc3,
  Music,
} from 'lucide-react'
import { CATALOG_TRACKS, CATALOG_PLAYLISTS } from '@/data/tracksCatalog'
import {
  getCurrentTimeOfDay,
  DAILY_MIX_CONFIGS,
  getDailyMixTracks,
  getCuratedTimeMix,
  getPersonalizedRecommendedTracks,
  getSurpriseTrack,
  type TimeOfDayInfo,
  type RecommendedTrack,
} from '@/services/recommendations/recommendationEngine'
import { PlaybackAdapterManager } from '@/adapters'
import { useQueueStore } from '@/stores/useQueueStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { usePlaylistStore } from '@/stores/usePlaylistStore'
import { useUIStore } from '@/stores/useUIStore'
import { formatTime } from '@/utils/formatTime'
import type { Track } from '@/types/track'

export const HomeView: React.FC = () => {
  const [selectedVibeFilter, setSelectedVibeFilter] = useState<string>('all')
  const timeInfo: TimeOfDayInfo = useMemo(() => getCurrentTimeOfDay(), [])

  const { setQueue } = useQueueStore()
  const { currentTrack } = usePlayerStore()
  const { likedTracks, toggleLikeTrack, isLiked, setActivePlaylistId } = usePlaylistStore()
  const { setActiveTab, setIsDockedPlayerOpen } = useUIStore()

  const adapterManager = PlaybackAdapterManager.getInstance()

  // Compute time-of-day instant mix
  const curatedTimeMix = useMemo(() => {
    return getCuratedTimeMix(CATALOG_TRACKS, timeInfo, likedTracks, [])
  }, [timeInfo, likedTracks])

  // Compute personalized recommended tracks
  const recommendedTracks: RecommendedTrack[] = useMemo(() => {
    return getPersonalizedRecommendedTracks(
      CATALOG_TRACKS,
      likedTracks,
      [],
      selectedVibeFilter
    )
  }, [likedTracks, selectedVibeFilter])

  // Active instant mix queue
  const activeInstantMix = useMemo(() => {
    if (selectedVibeFilter === 'time') return curatedTimeMix
    return recommendedTracks.length > 0 ? recommendedTracks : curatedTimeMix
  }, [selectedVibeFilter, curatedTimeMix, recommendedTracks])

  // Active hero banner info based on selected mood chip
  const heroInfo = useMemo(() => {
    switch (selectedVibeFilter) {
      case 'devotional':
        return {
          badge: '🕉️ Bhakti & Devotion',
          title: 'Divine Bhakti & Spiritual Chants',
          description:
            'Soul-cleansing Shiv Stuti, Mahadev Bhajans, Hanuman Chalisa, Krishna Kirtan, and sacred morning mantras.',
        }
      case 'romantic':
        return {
          badge: '💖 Romantic & Soul',
          title: 'Pure Romance & Soulful Melodies',
          description:
            'Heartfelt romantic hits featuring Arijit Singh, Jasleen Royal, B Praak, and soulful acoustic melodies.',
        }
      case 'punjabi':
        return {
          badge: '⚡ Punjabi Hype',
          title: 'Punjabi Energy & Desi Bangers',
          description:
            'High-octane Punjabi chartbusters featuring Karan Aujla, Diljit Dosanjh, AP Dhillon, Sidhu Moose Wala, and Shubh.',
        }
      case 'lofi':
        return {
          badge: '🌙 Late Night Chill',
          title: 'Late Night Lo-Fi & Mellow Beats',
          description:
            'Deep chill vibes, soothing acoustic guitars, lo-fi aesthetics, and midnight relaxation.',
        }
      case 'pop':
        return {
          badge: '🔥 Chartbusters',
          title: 'Trending Chartbusters & Viral Hits',
          description:
            'The biggest global and Indian chartbusters, viral reels anthems, and dance hits.',
        }
      case 'time':
        return {
          badge: `${timeInfo.icon} ${timeInfo.greeting}`,
          title: timeInfo.mixTitle,
          description: `${timeInfo.mixDescription} Curated for your ${timeInfo.period.replace('_', ' ')}.`,
        }
      default:
        return {
          badge: `✨ ${timeInfo.greeting}`,
          title: `${timeInfo.greeting} Smart Blend`,
          description: `${timeInfo.subtitle} 220+ verified official tracks with zero search required.`,
        }
    }
  }, [selectedVibeFilter, timeInfo])

  // Handle Play Song with immediate right docked video (REG-03)
  const handlePlaySong = async (track: Track, tracksPool: Track[] = recommendedTracks) => {
    setIsDockedPlayerOpen(true)
    const idx = tracksPool.findIndex((t) => t.id === track.id)
    setQueue(tracksPool, idx >= 0 ? idx : 0)
    await adapterManager.playTrack(track)
  }

  // Handle Play Instant Mix (Starts with a fresh, exciting track every single time!)
  const handlePlayInstantMix = useCallback(async () => {
    if (activeInstantMix.length > 0) {
      // Pick a random track from the top mix recommendations so you never hear the exact same start
      const randomStart = Math.floor(Math.random() * Math.min(8, activeInstantMix.length))
      const rotated = [
        ...activeInstantMix.slice(randomStart),
        ...activeInstantMix.slice(0, randomStart),
      ]
      setIsDockedPlayerOpen(true)
      setQueue(rotated, 0)
      await adapterManager.playTrack(rotated[0])
    }
  }, [activeInstantMix, adapterManager, setIsDockedPlayerOpen, setQueue])

  // Handle Shuffle Instant Mix
  const handleShuffleInstantMix = useCallback(async () => {
    if (activeInstantMix.length > 0) {
      const shuffled = [...activeInstantMix].sort(() => Math.random() - 0.5)
      setIsDockedPlayerOpen(true)
      setQueue(shuffled, 0)
      await adapterManager.playTrack(shuffled[0])
    }
  }, [activeInstantMix, adapterManager, setIsDockedPlayerOpen, setQueue])

  // Handle Surprise Me Banger Pick
  const handleSurpriseMe = useCallback(async () => {
    const { track } = getSurpriseTrack(CATALOG_TRACKS, [])
    setIsDockedPlayerOpen(true)
    const otherTracks = CATALOG_TRACKS.filter((t) => t.id !== track.id).sort(() => Math.random() - 0.5)
    setQueue([track, ...otherTracks], 0)
    await adapterManager.playTrack(track)
  }, [adapterManager, setIsDockedPlayerOpen, setQueue])

  // Handle Play Daily Mix (Starts with a fresh random track from that genre mix every time!)
  const handlePlayDailyMix = useCallback(async (mixId: string) => {
    const mixTracks = getDailyMixTracks(mixId, CATALOG_TRACKS)
    if (mixTracks.length > 0) {
      const randomStart = Math.floor(Math.random() * mixTracks.length)
      const rotated = [
        ...mixTracks.slice(randomStart),
        ...mixTracks.slice(0, randomStart),
      ]
      setIsDockedPlayerOpen(true)
      setQueue(rotated, 0)
      await adapterManager.playTrack(rotated[0])
    }
  }, [adapterManager, setIsDockedPlayerOpen, setQueue])

  const moodChips = [
    { id: 'all', label: 'All Recommendations' },
    { id: 'time', label: `✨ ${timeInfo.period.replace('_', ' ')} Flow` },
    { id: 'devotional', label: '🕉️ Bhakti & Devotional' },
    { id: 'romantic', label: '💖 Bollywood Romance' },
    { id: 'punjabi', label: '⚡ Punjabi Bangers' },
    { id: 'lofi', label: '🌙 Lofi & Peaceful' },
    { id: 'pop', label: '🔥 Global Hits' },
  ]

  return (
    <div className="p-4 md:p-8 pb-36 md:pb-12 space-y-8 max-w-7xl mx-auto select-none">
      {/* SECTION 1: PERSONALIZED CONTEXTUAL HERO BANNER */}
      <section className="glass-panel-elevated p-6 md:p-8 rounded-3xl relative overflow-hidden border border-vyn-border shadow-2xl">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-vyn-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent-violet/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vyn-primary/10 border border-vyn-primary/20 text-vyn-primary text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{heroInfo.badge}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-display font-extrabold tracking-tight text-vyn-high mb-2">
            {heroInfo.title}
          </h1>
          <p className="text-xs md:text-sm text-vyn-muted max-w-2xl mb-6 leading-relaxed">
            {heroInfo.description}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePlayInstantMix}
              aria-label="Play Instant Mix"
              className="min-h-[44px] px-6 py-2.5 rounded-full bg-gradient-to-r from-accent-cyan to-accent-violet text-canvas-base font-bold text-xs md:text-sm flex items-center gap-2.5 shadow-glow-cyan hover:opacity-95 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Play Instant Mix</span>
            </button>

            <button
              onClick={handleShuffleInstantMix}
              aria-label="Shuffle Instant Mix"
              className="min-h-[44px] px-5 py-2.5 rounded-full bg-canvas-elevated hover:bg-white/10 text-vyn-high font-medium text-xs md:text-sm border border-vyn-border flex items-center gap-2 transition-all active:scale-95"
            >
              <Shuffle className="w-4 h-4" />
              <span>Shuffle</span>
            </button>

            <button
              onClick={handleSurpriseMe}
              aria-label="Surprise Me"
              className="min-h-[44px] px-5 py-2.5 rounded-full bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 font-semibold text-xs md:text-sm border border-amber-400/30 flex items-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Surprise Me!</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 1.5: QUICK STUDIO PLAYLIST TILES (SPOTIFY PATTERN FOR PHONE & DESKTOP) */}
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {/* Liked Songs Tile */}
        <div
          onClick={() => {
            setActivePlaylistId('liked-songs')
            setActiveTab('library')
          }}
          className="glass-panel p-2.5 rounded-xl border border-vyn-border hover:border-vyn-primary/40 flex items-center gap-3 cursor-pointer group hover:bg-white/5 transition-all shadow-sm"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white shadow-md">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs sm:text-sm font-bold text-vyn-high group-hover:text-vyn-primary truncate block transition-colors">
              Liked Songs
            </span>
            <span className="text-[10px] text-vyn-muted font-mono block">
              {likedTracks.length} saved
            </span>
          </div>
        </div>

        {/* Catalog Playlists (Bollywood, Punjabi, Top Hits, Piano) */}
        {CATALOG_PLAYLISTS.slice(0, 5).map((pl) => (
          <div
            key={pl.id}
            onClick={() => {
              setActivePlaylistId(pl.id)
              setActiveTab('library')
            }}
            className="glass-panel p-2.5 rounded-xl border border-vyn-border hover:border-vyn-primary/40 flex items-center gap-3 cursor-pointer group hover:bg-white/5 transition-all shadow-sm"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-vyn-surface overflow-hidden flex-shrink-0 border border-white/5">
              {pl.coverUrl ? (
                <img src={pl.coverUrl} alt={pl.name} className="w-full h-full object-cover" />
              ) : (
                <Disc3 className="w-5 h-5 text-vyn-muted m-auto" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs sm:text-sm font-bold text-vyn-high group-hover:text-vyn-primary truncate block transition-colors">
                {pl.name}
              </span>
              <span className="text-[10px] text-vyn-muted font-mono block">
                {pl.tracks.length} tracks
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* SECTION 2: MOOD & VIBE FILTER CHIPS */}
      <section className="flex items-center gap-2 overflow-x-auto pt-3 pb-3 px-1 -mt-1 scrollbar-none">
        {moodChips.map((chip) => {
          const isSelected = selectedVibeFilter === chip.id
          return (
            <button
              key={chip.id}
              onClick={() => setSelectedVibeFilter(chip.id)}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isSelected
                  ? 'bg-vyn-primary text-vyn-canvas shadow-glow-cyan font-bold ring-2 ring-vyn-primary/30'
                  : 'bg-canvas-elevated text-vyn-muted hover:text-vyn-high hover:bg-white/5 border border-vyn-border'
              }`}
            >
              {chip.label}
            </button>
          )
        })}
      </section>

      {/* SECTION 3: CURATED SPOTIFY-STYLE DAILY MIXES */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-display font-bold text-vyn-high">
              Made For Vishal • Daily Mixes
            </h2>
            <p className="text-[11px] text-vyn-muted">
              Auto-refreshed playlists based on your favorite artists
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DAILY_MIX_CONFIGS.map((mix) => (
            <div
              key={mix.id}
              onClick={() => handlePlayDailyMix(mix.id)}
              className="glass-panel p-4 rounded-2xl border border-vyn-border hover:border-vyn-primary/40 transition-all duration-300 group cursor-pointer relative"
            >
              <div className="w-full aspect-square rounded-xl bg-vyn-canvas overflow-hidden mb-3 relative border border-vyn-border">
                <img
                  src={mix.cover}
                  alt={mix.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-accent-cyan border border-white/10 uppercase">
                  {mix.badge}
                </span>

                <button
                  aria-label={`Play ${mix.title}`}
                  className="min-h-[44px] min-w-[44px] w-12 h-12 rounded-full bg-vyn-primary text-vyn-canvas absolute bottom-2.5 right-2.5 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-glow-cyan"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
              </div>

              <h3 className="text-sm font-bold text-vyn-high truncate mb-0.5">{mix.title}</h3>
              <p className="text-xs text-text-muted truncate mb-1">{mix.subtitle}</p>
              <p className="text-[10px] text-vyn-muted line-clamp-2 leading-relaxed">
                {mix.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: FULL RECOMMENDED TRACKS CATALOG WITH OFFICIAL VIDEOS */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-display font-bold text-vyn-high">
              Recommended Songs (Official Full Streams)
            </h2>
            <p className="text-[11px] text-vyn-muted">
              {recommendedTracks.length} verified songs with synchronized video & LRCLIB lyrics
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {recommendedTracks.map((track) => {
            const isCurrent = currentTrack?.id === track.id
            const liked = isLiked(track.id)

            return (
              <div
                key={track.id}
                onClick={() => handlePlaySong(track, recommendedTracks)}
                className={`glass-panel p-3 rounded-2xl border transition-all duration-300 group cursor-pointer relative flex flex-col justify-between ${
                  isCurrent
                    ? 'border-vyn-primary/60 bg-vyn-primary/5 shadow-glow-cyan'
                    : 'border-vyn-border hover:border-vyn-primary/30'
                }`}
              >
                <div>
                  <div className="w-full aspect-square rounded-xl bg-vyn-canvas overflow-hidden mb-2.5 relative border border-white/5">
                    {track.coverUrl ? (
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Disc3 className="w-8 h-8 text-vyn-muted" />
                      </div>
                    )}

                    {/* Like / Heart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLikeTrack(track)
                      }}
                      aria-label={liked ? 'Unlike song' : 'Like song'}
                      className="min-h-[44px] min-w-[44px] absolute top-1.5 right-1.5 p-2 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-text-muted hover:text-white transition-colors z-20"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          liked ? 'fill-red-500 text-red-500' : 'text-white/70'
                        }`}
                      />
                    </button>

                    {/* Floating Play Button */}
                    <button
                      aria-label={`Play ${track.title}`}
                      className="min-h-[44px] min-w-[44px] w-11 h-11 rounded-full bg-vyn-primary text-vyn-canvas absolute bottom-2 right-2 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-glow-cyan z-20"
                    >
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </button>
                  </div>

                  <h3 className="text-xs md:text-sm font-bold text-vyn-high truncate mb-0.5">
                    {track.title}
                  </h3>
                  <p className="text-[11px] text-text-muted truncate mb-2">{track.artist}</p>
                </div>

                <div className="pt-2 border-t border-vyn-border/40 flex items-center justify-between text-[10px] text-vyn-muted">
                  <span className="font-mono text-accent-cyan font-bold truncate max-w-[100px]">
                    {track.vibeTag || 'Official'}
                  </span>
                  <span className="font-mono tabular-nums">{formatTime(track.duration)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* SECTION 5: CURATED PLAYLISTS QUICK JUMP */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-display font-bold text-vyn-high">
              Curated Studio Playlists
            </h2>
            <p className="text-[11px] text-vyn-muted">
              Pre-loaded with verified official Bollywood, Punjabi, and Top Hits
            </p>
          </div>
          <button
            onClick={() => setActiveTab('library')}
            className="min-h-[44px] min-w-[44px] px-3 py-1.5 text-xs text-accent-cyan font-semibold flex items-center gap-1 hover:underline"
          >
            <span>View All in Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATALOG_PLAYLISTS.map((pl) => (
            <div
              key={pl.id}
              onClick={() => {
                setActivePlaylistId(pl.id)
                setActiveTab('library')
              }}
              className="glass-panel p-4 rounded-2xl border border-vyn-border hover:border-vyn-primary/40 transition-all flex items-center gap-4 cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-xl bg-canvas-base overflow-hidden flex-shrink-0 border border-white/5">
                {pl.coverUrl ? (
                  <img src={pl.coverUrl} alt={pl.name} className="w-full h-full object-cover" />
                ) : (
                  <Music className="w-8 h-8 text-vyn-muted m-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-vyn-high group-hover:text-accent-cyan truncate transition-colors">
                  {pl.name}
                </h3>
                <p className="text-xs text-text-muted truncate mb-1">{pl.description}</p>
                <span className="text-[10px] font-mono text-accent-cyan font-bold">
                  {pl.tracks.length} tracks
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
