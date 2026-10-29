import React, { useEffect, useState, useRef } from 'react'
import { Mic2, Loader2, Sparkles, Music } from 'lucide-react'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { PlaybackAdapterManager } from '@/adapters'
import { lrcLibClient, findActiveLyricIndex, type ParsedLyrics } from '@/services/lyrics'

export const SyncedLyricsViewer: React.FC = () => {
  const { currentTrack, currentTime } = usePlayerStore()
  const [lyrics, setLyrics] = useState<ParsedLyrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const activeLineRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const adapterManager = PlaybackAdapterManager.getInstance()

  // Fetch lyrics whenever current track changes
  useEffect(() => {
    if (!currentTrack) {
      setLyrics(null)
      return
    }

    setIsLoading(true)
    lrcLibClient
      .getLyrics(
        currentTrack.title,
        currentTrack.artist,
        currentTrack.duration,
        currentTrack.id,
        currentTrack.lyrics
      )
      .then((data) => {
        setLyrics(data)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [currentTrack])

  const activeIndex = lyrics?.lines ? findActiveLyricIndex(lyrics.lines, currentTime) : -1

  // Smooth auto-scroll active lyric into vertical center
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [activeIndex])

  const handleLineClick = (rawTime: number) => {
    adapterManager.seek(rawTime)
  }

  if (!currentTrack) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-vyn-muted select-none">
        <Music className="w-10 h-10 text-vyn-muted/40 mb-2" />
        <h3 className="text-xs font-semibold text-vyn-high">No Track Loaded</h3>
        <p className="text-[11px] text-vyn-muted">Play a song to view real-time synchronized lyrics.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-vyn-muted select-none">
        <Loader2 className="w-8 h-8 text-vyn-primary animate-spin mb-2" />
        <p className="text-xs font-mono">Fetching synced lyrics from LRCLIB...</p>
      </div>
    )
  }

  if (!lyrics || (!lyrics.isSynced && !lyrics.plainText)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-vyn-muted select-none">
        <Mic2 className="w-10 h-10 text-vyn-muted/40 mb-2" />
        <h3 className="text-xs font-semibold text-vyn-high">No Synced Lyrics Found</h3>
        <p className="text-[11px] text-vyn-muted max-w-xs mt-1">
          Lyrics not yet available in open LRCLIB database for this track.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none">
      {/* Lead Sync Status Badge */}
      <div className="px-4 py-2 border-b border-vyn-border/40 flex items-center justify-between text-[10px] text-vyn-muted font-mono">
        <span className="flex items-center gap-1.5 text-vyn-primary">
          <Sparkles className="w-3 h-3" />
          <span>LRCLIB SYNCHRONIZED</span>
        </span>
        <span className="px-1.5 py-0.5 rounded bg-vyn-primary/10 border border-vyn-primary/30 text-vyn-primary font-bold">
          +180MS LEAD SYNC
        </span>
      </div>

      {/* Lyrics Scrollable Body */}
      <div
        ref={scrollContainerRef}
        aria-label="Synchronized Lyrics List"
        className="flex-1 overflow-y-auto px-4 py-8 space-y-4 text-left"
      >
        {lyrics.isSynced ? (
          lyrics.lines.map((line, idx) => {
            const isActive = idx === activeIndex
            const isPast = idx < activeIndex

            return (
              <div
                key={`${line.rawTime}-${idx}`}
                ref={isActive ? activeLineRef : null}
                onClick={() => handleLineClick(line.rawTime)}
                className={`cursor-pointer transition-all duration-300 py-2.5 px-3 rounded-xl select-none group ${
                  isActive
                    ? 'text-lg md:text-xl font-extrabold text-vyn-primary scale-105 origin-left bg-vyn-primary/15 border-l-4 border-vyn-primary shadow-[0_0_20px_rgba(0,242,254,0.3)]'
                    : isPast
                    ? 'text-sm md:text-base font-medium text-vyn-high/70 hover:text-vyn-high hover:bg-white/5'
                    : 'text-sm md:text-base font-normal text-vyn-muted/40 hover:text-vyn-muted hover:bg-white/5'
                }`}
              >
                <span className="transition-colors group-hover:underline underline-offset-4 decoration-vyn-primary/40">
                  {line.text}
                </span>
              </div>
            )
          })
        ) : (
          <div className="whitespace-pre-line text-sm text-vyn-muted/80 leading-relaxed">
            {lyrics.plainText}
          </div>
        )}
      </div>
    </div>
  )
}

