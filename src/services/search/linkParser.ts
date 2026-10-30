import type { Track } from '@/types/track'
import { parseArtistAndTitle } from './filterUtils'

export interface ParsedLinkResult {
  type: 'youtube-track' | 'youtube-playlist' | 'spotify-track' | 'spotify-playlist'
  rawUrl: string
  videoId?: string
  playlistId?: string
  spotifyId?: string
}

/**
 * Checks if a search query is a Spotify or YouTube URL
 */
export function parseMusicLink(query: string): ParsedLinkResult | null {
  const trimmed = query.trim()
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return null
  }

  // 1. YouTube Link Detection
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    // Exclude YouTube Shorts - user strictly requested no shorts
    if (trimmed.includes('/shorts/')) {
      return null
    }

    const listMatch = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/)
    const vidMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|embed\/))([a-zA-Z0-9_-]{11})/)

    // If it's a playlist URL or a video inside a playlist
    if (listMatch && listMatch[1]) {
      return {
        type: 'youtube-playlist',
        rawUrl: trimmed,
        playlistId: listMatch[1],
        videoId: vidMatch ? vidMatch[1] : undefined,
      }
    }

    if (vidMatch && vidMatch[1]) {
      return {
        type: 'youtube-track',
        rawUrl: trimmed,
        videoId: vidMatch[1],
      }
    }
  }

  // 2. Spotify Link Detection
  if (trimmed.includes('open.spotify.com')) {
    const trackMatch = trimmed.match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/)
    if (trackMatch && trackMatch[1]) {
      return {
        type: 'spotify-track',
        rawUrl: trimmed,
        spotifyId: trackMatch[1],
      }
    }

    const playlistMatch = trimmed.match(/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/)
    if (playlistMatch && playlistMatch[1]) {
      return {
        type: 'spotify-playlist',
        rawUrl: trimmed,
        playlistId: playlistMatch[1],
      }
    }
  }

  return null
}

/**
 * Fetches track metadata for a YouTube video URL using fast noembed / oEmbed fallback
 */
export async function resolveYouTubeTrack(videoId: string, _rawUrl?: string): Promise<Track> {
  const fallbackCover = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  let title = `YouTube Track (${videoId})`
  let artist = 'YouTube Stream'

  try {
    const oembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`
    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(3500) })
    if (res.ok) {
      const data = await res.json()
      if (data.title) {
        const parsed = parseArtistAndTitle(data.title, data.author_name || 'YouTube')
        title = parsed.title
        artist = parsed.artist
      }
    }
  } catch {
    // Fallback gracefully to default title
  }

  return {
    id: `yt-${videoId}`,
    title,
    artist,
    album: 'Imported YouTube Stream',
    duration: 210,
    source: 'youtube',
    youtubeId: videoId,
    coverUrl: fallbackCover,
    color: '#00F2FE',
    style: 'acoustic',
  }
}

/**
 * Fetches Spotify track metadata via oEmbed
 */
export async function resolveSpotifyTrack(rawUrl: string): Promise<{ title: string; artist: string; coverUrl?: string }> {
  const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(rawUrl)}`
  const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(4000) })
  if (!res.ok) {
    throw new Error('Failed to resolve Spotify track info')
  }
  const data = await res.json()
  const rawTitle = data.title || 'Unknown Track'
  // Spotify oEmbed title is often "Song Name" or "Song Name - Artist"
  const parsed = parseArtistAndTitle(rawTitle, 'Spotify')
  return {
    title: parsed.title,
    artist: parsed.artist,
    coverUrl: data.thumbnail_url,
  }
}

/**
 * Fetches Spotify playlist title via oEmbed
 */
export async function resolveSpotifyPlaylist(rawUrl: string): Promise<{ title: string; coverUrl?: string }> {
  const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(rawUrl)}`
  const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(4000) })
  if (!res.ok) {
    throw new Error('Failed to resolve Spotify playlist info')
  }
  const data = await res.json()
  return {
    title: data.title || 'Spotify Playlist',
    coverUrl: data.thumbnail_url,
  }
}

