import { INITIAL_TRACKS, PLAYLISTS } from './resonixTracksData'
import type { ResonixTrack, ResonixPlaylist } from './resonixTracksData'
import type { Track } from '@/types/track'
import type { Playlist } from '@/types/playlist'

/**
 * Converts a Resonix curated track to Vynora standard Track format
 */
export function convertToVynoraTrack(rt: ResonixTrack): Track {
  const lrcFormatted = rt.lyrics && rt.lyrics.length > 0
    ? rt.lyrics
        .map((l) => {
          const m = Math.floor(l.time / 60)
          const s = Math.floor(l.time % 60)
          const ms = Math.floor((l.time % 1) * 100)
          const tag = `[${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}.${ms < 10 ? '0' : ''}${ms}]`
          return `${tag}${l.text}`
        })
        .join('\n')
    : undefined

  // Ensure high quality reliable cover artwork
  const coverUrl =
    rt.cover && !rt.cover.includes('placeholder')
      ? rt.cover
      : rt.youtubeId
      ? `https://i.ytimg.com/vi/${rt.youtubeId}/hqdefault.jpg`
      : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80'

  const hasDirectStream = Boolean(rt.audioUrl && rt.audioUrl.trim().length > 0)

  return {
    id: rt.id,
    title: rt.title,
    artist: rt.artist,
    album: rt.album,
    duration: rt.durationSec || 180,
    coverUrl,
    source: hasDirectStream ? 'stream' : 'youtube',
    audioUrl: rt.audioUrl,
    youtubeId: rt.youtubeId,
    lyrics: lrcFormatted,
    syncedLyrics: rt.lyrics,
    color: rt.color || '#00F2FE',
    playlistId: rt.playlistId,
    bpm: rt.bpm,
    style: rt.style,
  }
}

/**
 * Complete catalog of all 220+ verified real tracks from Resonix
 * with official YouTube video IDs, synced lyrics, and artwork.
 */
export const CATALOG_TRACKS: Track[] = INITIAL_TRACKS.map(convertToVynoraTrack)

/**
 * Curated Pre-Loaded Playlists from Resonix
 */
export const CATALOG_PLAYLISTS: Playlist[] = PLAYLISTS.map((pl: ResonixPlaylist) => {
  const matchingTracks = CATALOG_TRACKS.filter((t) => t.playlistId === pl.id)
  return {
    id: pl.id,
    name: pl.title,
    description: pl.description,
    coverUrl: pl.cover,
    tracks: matchingTracks,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
})

/**
 * Lookup helper
 */
export function getCatalogTrackById(id: string): Track | undefined {
  return CATALOG_TRACKS.find((t) => t.id === id)
}

export function getTracksByPlaylist(playlistId: string): Track[] {
  return CATALOG_TRACKS.filter((t) => t.playlistId === playlistId)
}
