import type { Track } from '@/types/track'

export interface RawSearchItem {
  id?: string
  videoId?: string
  url?: string
  title: string
  uploaderName?: string
  author?: string
  duration?: number // in seconds
  lengthSeconds?: number
  thumbnail?: string
  thumbnails?: Array<{ url: string; width?: number; height?: number }>
  type?: string
  isShort?: boolean
  isLive?: boolean
}

export interface SearchResultTrack extends Track {
  sourceInstance?: string
}

export interface SearchConfig {
  instances: string[]
  timeoutMs: number
  minDurationSeconds: number // 75s
  maxDurationSeconds: number // 540s
}

export const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  instances: [
    'https://api.piped.private.coffee',
    'https://pipedapi.ducks.party',
    'https://cf.piped.video',
    'https://invidious.jing.rocks',
    'https://invidious.flokinet.to',
  ],
  timeoutMs: 3500,
  minDurationSeconds: 75,
  maxDurationSeconds: 540,
}

