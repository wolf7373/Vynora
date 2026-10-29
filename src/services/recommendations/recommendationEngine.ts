import type { Track } from '@/types/track'
import { CATALOG_TRACKS } from '@/data/tracksCatalog'

export interface RecommendedTrack extends Track {
  recommendationReason?: string
  vibeTag?: string
}

export type VibeType =
  | 'bollywood_romantic'
  | 'punjabi_banger'
  | 'global_pop'
  | 'peaceful_ambient'
  | 'devotional_spiritual'

export interface VibeDefinition {
  id: VibeType
  label: string
  emoji: string
  description: string
  color: string
  tag: string
}

export const VIBE_DEFINITIONS: Record<VibeType, VibeDefinition> = {
  devotional_spiritual: {
    id: 'devotional_spiritual',
    label: 'Bhakti & Devotional',
    emoji: '🕉️',
    description: 'Spiritual bhajans, aartis, Shiv stuti & divine chants',
    color: '#f97316',
    tag: 'Divine Bhakti',
  },
  bollywood_romantic: {
    id: 'bollywood_romantic',
    label: 'Bollywood Romance & Melody',
    emoji: '💖',
    description: 'Soulful melodies, acoustic romance & Bollywood anthems',
    color: '#e13300',
    tag: 'Soulful Romance',
  },
  punjabi_banger: {
    id: 'punjabi_banger',
    label: 'Punjabi Hits & Bangers',
    emoji: '⚡',
    description: 'High-energy 808 bass, desi hip-hop & chart-toppers',
    color: '#8400e7',
    tag: 'High Energy',
  },
  global_pop: {
    id: 'global_pop',
    label: 'Global Pop & Synthwave',
    emoji: '🔥',
    description: 'Worldwide Billboard hits, modern synthwave & dance',
    color: '#1e3264',
    tag: 'Chartbuster',
  },
  peaceful_ambient: {
    id: 'peaceful_ambient',
    label: 'Peaceful Ambient & Lofi',
    emoji: '🌙',
    description: 'Calm acoustic piano, chill beats & soothing focus',
    color: '#ba5d07',
    tag: 'Chill & Relax',
  },
}

export type TimeOfDayPeriod = 'morning' | 'afternoon' | 'evening' | 'late_night'

export interface TimeOfDayInfo {
  period: TimeOfDayPeriod
  greeting: string
  subtitle: string
  icon: string
  mixTitle: string
  mixDescription: string
  primaryVibes: VibeType[]
  accentColor: string
}

/**
 * Compute the contextual time-of-day greeting and sound profile for Vishal
 */
export function getCurrentTimeOfDay(date: Date = new Date()): TimeOfDayInfo {
  const hour = date.getHours()

  if (hour >= 5 && hour < 12) {
    return {
      period: 'morning',
      greeting: 'Good morning, Vishal',
      subtitle: 'Fresh start with acoustic melodies, morning coffee & uplifting vibes',
      icon: '🌅',
      mixTitle: 'Morning Coffee & Acoustic Flow',
      mixDescription: 'Handpicked fresh tunes to start your day with calm energy.',
      primaryVibes: ['bollywood_romantic', 'peaceful_ambient', 'global_pop'],
      accentColor: '#10b981',
    }
  }

  if (hour >= 12 && hour < 17) {
    return {
      period: 'afternoon',
      greeting: 'Good afternoon, Vishal',
      subtitle: 'Keep your momentum high with energizing Bollywood & chartbusters',
      icon: '☀️',
      mixTitle: 'Afternoon Energy & Focus Hits',
      mixDescription: 'Upbeat tracks to power through your day without looking for songs.',
      primaryVibes: ['punjabi_banger', 'bollywood_romantic', 'global_pop'],
      accentColor: '#f59e0b',
    }
  }

  if (hour >= 17 && hour < 21) {
    return {
      period: 'evening',
      greeting: 'Good evening, Vishal',
      subtitle: 'Golden hour unwind • Soulful melodies, chill Hindi & sunset anthems',
      icon: '🌇',
      mixTitle: 'Sunset Unwind & Melodic Flow',
      mixDescription: 'Relax and recharge with your favorite melodies and easy listening.',
      primaryVibes: ['bollywood_romantic', 'peaceful_ambient', 'punjabi_banger'],
      accentColor: '#f97316',
    }
  }

  // Late Night (21:00 to 04:59)
  return {
    period: 'late_night',
    greeting: 'Late Night, Vishal',
    subtitle: 'Midnight drive & soulful lo-fi • Smooth acoustics with zero distractions',
    icon: '🌙',
    mixTitle: 'Midnight Drive & Soulful Lo-Fi',
    mixDescription: 'Deep, atmospheric beats and acoustic calm for late night hours.',
    primaryVibes: ['peaceful_ambient', 'bollywood_romantic', 'global_pop'],
    accentColor: '#8b5cf6',
  }
}

/**
 * Curated Spotify-Style Daily Mixes
 */
export interface DailyMixConfig {
  id: string
  title: string
  subtitle: string
  description: string
  cover: string
  color: string
  badge: string
  vibe: VibeType
  featuredArtists: string[]
}

export const DAILY_MIX_CONFIGS: DailyMixConfig[] = [
  {
    id: 'daily-mix-1',
    title: 'Daily Mix 1',
    subtitle: 'Arijit Singh, Shreya Ghoshal, Jasleen Royal',
    description: 'Soulful Bollywood romance, acoustic ballads, and timeless melodies.',
    cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80',
    color: '#e13300',
    badge: 'Romantic',
    vibe: 'bollywood_romantic',
    featuredArtists: ['Arijit Singh', 'Shreya Ghoshal', 'Jasleen Royal', 'Pritam', 'Atif Aslam'],
  },
  {
    id: 'daily-mix-2',
    title: 'Daily Mix 2',
    subtitle: 'Karan Aujla, Diljit Dosanjh, Sidhu Moose Wala',
    description: 'High-energy Punjabi hits, desi hip-hop, 808 bass, and gym fuel.',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    color: '#8400e7',
    badge: 'Punjabi',
    vibe: 'punjabi_banger',
    featuredArtists: ['Karan Aujla', 'Diljit Dosanjh', 'Sidhu Moose Wala', 'AP Dhillon', 'Shubh'],
  },
  {
    id: 'daily-mix-3',
    title: 'Daily Mix 3',
    subtitle: 'The Weeknd, Ed Sheeran, Dua Lipa',
    description: 'Worldwide Billboard chartbusters, synthwave, and upbeat pop anthems.',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
    color: '#1e3264',
    badge: 'Chartbusters',
    vibe: 'global_pop',
    featuredArtists: ['The Weeknd', 'Ed Sheeran', 'Dua Lipa', 'Bruno Mars', 'Post Malone'],
  },
  {
    id: 'daily-mix-4',
    title: 'Daily Mix 4',
    subtitle: 'Peaceful Piano, Lofi Beats, Chillout',
    description: 'Soothing piano melodies, relaxing lo-fi beats, and midnight chill.',
    cover: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=400&auto=format&fit=crop&q=80',
    color: '#0d9488',
    badge: 'Chill Flow',
    vibe: 'peaceful_ambient',
    featuredArtists: ['Ludovico Einaudi', 'Yiruma', 'Lofi Sleep', 'Acoustic Chill'],
  },
]

/**
 * Intelligent Vibe Detection Engine
 */
export function detectTrackVibe(track: Track | null): VibeType {
  if (!track) return 'global_pop'

  if (track.playlistId === 'devotional-spiritual') return 'devotional_spiritual'
  if (track.playlistId === 'bollywood-butter') return 'bollywood_romantic'
  if (track.playlistId === 'punjabi-hits') return 'punjabi_banger'
  if (track.playlistId === 'peaceful-piano' || track.style === 'lofi') return 'peaceful_ambient'
  if (track.playlistId === 'top-hits' || track.style === 'synthwave') return 'global_pop'

  const query = `${track.title} ${track.artist} ${track.album || ''}`.toLowerCase()

  // 1. Devotional / Bhakti / Spiritual detection (highest priority so Parvati/Bholenath never become Global Pop!)
  const devotionalKeywords = [
    'parvati', 'shiv', 'shiva', 'mahadev', 'bholenath', 'shankar', 'hanuman',
    'bhakti', 'bhajan', 'aarti', 'chalisa', 'stuti', 'krishna', 'ram', 'radha',
    'sai', 'ganesh', 'ganpati', 'mantra', 'devotional', 'spiritual', 'khatu',
    'shyam', 'kailash', 'om namah', 'jaap', 'anuradha paudwal', 'gulshan kumar',
    'lakhbir', 'hansraj raghuwanshi', 'sadhu tiwari', 'divine', 'har har'
  ]
  if (devotionalKeywords.some((kw) => query.includes(kw))) {
    return 'devotional_spiritual'
  }

  // 2. Punjabi detection
  const punjabiKeywords = [
    'karan aujla', 'sidhu', 'moose', 'shubh', 'diljit', 'ap dhillon',
    'punjabi', 'bhangra', 'ikky', 'mxrci', 'gurdas', 'bohemia',
    'honey singh', 'badshah', 'amrinder', 'parmish', 'jassie',
    'b praak', 'hustinder', 'cheques', '295', 'winning speech',
    'softly', 'mi amor', 'same beef', 'so high', 'elevated',
    'baller', 'lover', 'brown munde', 'excuses', 'g.o.a.t.', 'sharn', 'byg byrd',
    'paradox', 'millionaire', 'payal', 'naina', 'arjan vailly', 'white brown black',
    'antidote', 'jee ni lagda', 'check it out', 'still rollin', 'king shit',
    'you and me', 'with you', 'true stories',
  ]
  if (punjabiKeywords.some((kw) => query.includes(kw))) {
    return 'punjabi_banger'
  }

  // Bollywood Romantic detection
  const bollywoodKeywords = [
    'arijit', 'pritam', 'mithoon', 'jubin', 'shreya', 'atif',
    'bollywood', 'hindi', 'kesariya', 'apna bana le', 'tum hi ho',
    'o maahi', 'pehle bhi main', 'tauba tauba', 'chaleya', 'heeriye',
    'channa mereya', 'raataan lambiyan', 'agar tum saath ho', 've kamleya',
    'satranga', 'kabira', 'shayad', 'vishal mishra', 'sachin-jigar',
    'darshan raval', 'kumar sanu', 'sonu nigam', 'mohit chauhan',
    'anirudh', 'jasleen royal', 'shilpa rao', 'asees kaur',
    'soulmate', 'anuv jain', 'husn', 'jo tum mere ho', 'aaj ki raat',
    'aayi nai', 'khoobsurat', 'madhubanti', 'pawan singh',
    'majboor', 'sheheryar', 'zoha',
  ]
  if (bollywoodKeywords.some((kw) => query.includes(kw))) {
    return 'bollywood_romantic'
  }

  // Peaceful / Ambient / Piano / Lofi / Atmospheric Pop detection
  const peacefulKeywords = [
    'piano', 'lofi', 'ambient', 'sleep', 'relax', 'yiruma',
    'ludovico', 'einaudi', 'river flows', 'nuvole bianche', 'meditation',
    'calm', 'study', 'chilledcow', 'peaceful', 'lana del rey',
    'billie eilish', 'cigarettes after sex', 'sombr',
  ]
  if (peacefulKeywords.some((kw) => query.includes(kw)) || track.style === 'ambient' || track.style === 'lofi') {
    return 'peaceful_ambient'
  }

  // Indian music fallback (prevents Indian tracks with unknown artists from becoming Western global pop)
  if (
    query.includes('hindi') ||
    query.includes('t-series') ||
    query.includes('zee music') ||
    query.includes('times music') ||
    query.includes('desi') ||
    query.includes('spiritual')
  ) {
    return 'bollywood_romantic'
  }

  return 'global_pop'
}

export function getTracksByVibe(vibe: VibeType, tracks: Track[] = CATALOG_TRACKS): Track[] {
  return tracks.filter((t) => detectTrackVibe(t) === vibe)
}

export function getDailyMixTracks(mixId: string, allTracks: Track[] = CATALOG_TRACKS): Track[] {
  const config = DAILY_MIX_CONFIGS.find((m) => m.id === mixId)
  if (!config) return allTracks.slice(0, 15)

  const matching = getTracksByVibe(config.vibe, allTracks)
  if (matching.length >= 6) return matching

  const others = allTracks.filter((t) => detectTrackVibe(t) !== config.vibe)
  return [...matching, ...others.slice(0, 12 - matching.length)]
}

export function getCuratedTimeMix(
  allTracks: Track[] = CATALOG_TRACKS,
  timeInfo: TimeOfDayInfo = getCurrentTimeOfDay(),
  likedTracks: Track[] = [],
  recentlyPlayed: Track[] = []
): Track[] {
  const pool = allTracks.length > 0 ? allTracks : CATALOG_TRACKS
  const primaryVibes = new Set(timeInfo.primaryVibes)

  const priorityTracks: Track[] = []
  const secondaryTracks: Track[] = []

  const likedTrackIds = new Set(likedTracks.map((t) => t.id))
  const recentIds = new Set(recentlyPlayed.map((t) => t.id))

  pool.forEach((t) => {
    const vibe = detectTrackVibe(t)
    if (primaryVibes.has(vibe)) {
      if (likedTrackIds.has(t.id)) {
        priorityTracks.unshift(t)
      } else {
        priorityTracks.push(t)
      }
    } else {
      secondaryTracks.push(t)
    }
  })

  const shuffledPriority = [...priorityTracks].sort((a, b) => {
    const aRecent = recentIds.has(a.id) ? 1 : 0
    const bRecent = recentIds.has(b.id) ? 1 : 0
    if (aRecent !== bRecent) return aRecent - bRecent
    return Math.random() - 0.5
  })

  return [...shuffledPriority, ...secondaryTracks].slice(0, 20)
}

export function getPersonalizedRecommendedTracks(
  allTracks: Track[] = CATALOG_TRACKS,
  likedTracks: Track[] = [],
  recentlyPlayed: Track[] = [],
  vibeFilter: string = 'all'
): RecommendedTrack[] {
  const pool = allTracks.length > 0 ? allTracks : CATALOG_TRACKS
  const timeInfo = getCurrentTimeOfDay()
  const primaryTimeVibes = new Set(timeInfo.primaryVibes)
  const likedTrackIds = new Set(likedTracks.map((t) => t.id))

  const vibeCount: Record<VibeType, number> = {
    bollywood_romantic: 0,
    punjabi_banger: 0,
    global_pop: 0,
    peaceful_ambient: 0,
    devotional_spiritual: 0,
  }

  ;[...likedTracks, ...recentlyPlayed.slice(0, 8)].forEach((t) => {
    const v = detectTrackVibe(t)
    vibeCount[v] = (vibeCount[v] || 0) + 1
  })

  let candidates = pool
  if (vibeFilter === 'devotional' || vibeFilter === 'bhakti') {
    candidates = pool.filter((t) => detectTrackVibe(t) === 'devotional_spiritual')
  } else if (vibeFilter === 'romantic') {
    candidates = pool.filter((t) => detectTrackVibe(t) === 'bollywood_romantic')
  } else if (vibeFilter === 'punjabi') {
    candidates = pool.filter((t) => detectTrackVibe(t) === 'punjabi_banger')
  } else if (vibeFilter === 'lofi') {
    candidates = pool.filter((t) => detectTrackVibe(t) === 'peaceful_ambient')
  } else if (vibeFilter === 'pop') {
    candidates = pool.filter((t) => detectTrackVibe(t) === 'global_pop')
  } else if (vibeFilter === 'time') {
    candidates = pool.filter((t) => primaryTimeVibes.has(detectTrackVibe(t)))
  }

  const scored = candidates.map((track) => {
    const vibe = detectTrackVibe(track)
    const vibeDef = VIBE_DEFINITIONS[vibe]
    let score = 50

    if (primaryTimeVibes.has(vibe)) score += 25
    score += Math.min(30, (vibeCount[vibe] || 0) * 8)
    if (likedTrackIds.has(track.id)) score += 15

    let recommendationReason = `${vibeDef.label} Hit`
    if (primaryTimeVibes.has(vibe)) {
      recommendationReason = `Perfect for your ${timeInfo.period.replace('_', ' ')}`
    } else if (vibeCount[vibe] > 2) {
      recommendationReason = `Because you like ${vibeDef.tag}`
    }

    const recTrack: RecommendedTrack = {
      ...track,
      recommendationReason,
      vibeTag: vibeDef.tag,
    }

    return { track: recTrack, score }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .map((item) => item.track)
    .slice(0, 20)
}

export function getSurpriseTrack(
  allTracks: Track[] = CATALOG_TRACKS,
  recentlyPlayed: Track[] = []
): { track: Track; reason: string } {
  const pool = allTracks.length > 0 ? allTracks : CATALOG_TRACKS
  const recentIds = new Set(recentlyPlayed.map((t) => t.id))
  const unplayed = pool.filter((t) => !recentIds.has(t.id))

  const selectionPool = unplayed.length > 3 ? unplayed : pool
  const randIdx = Math.floor(Math.random() * selectionPool.length)
  const picked = selectionPool[randIdx] || pool[0]
  const vibe = detectTrackVibe(picked)
  const vibeDef = VIBE_DEFINITIONS[vibe]

  return {
    track: picked,
    reason: `Surprise Pick • ${vibeDef.label}`,
  }
}

/**
 * Spotify-Grade Smart Autoplay Recommendation Engine
 */
export function getSmartAutoplayNextTrack(
  currentTrack: Track,
  allAvailableTracks: Track[] = CATALOG_TRACKS,
  playedTrackIds?: Set<string>
): { nextTrack: Track; vibe: VibeDefinition; reason: string } {
  const vibeType = detectTrackVibe(currentTrack)
  const vibeDef = VIBE_DEFINITIONS[vibeType]

  const poolMap = new Map<string, Track>()
  ;[...CATALOG_TRACKS, ...allAvailableTracks].forEach((t) => {
    if (t.id && !poolMap.has(t.id)) {
      poolMap.set(t.id, t)
    }
  })

  const candidatePool = Array.from(poolMap.values()).filter(
    (t) =>
      t.id !== currentTrack.id &&
      (!currentTrack.youtubeId || t.youtubeId !== currentTrack.youtubeId) &&
      detectTrackVibe(t) === vibeType
  )

  let unplayedCandidates = candidatePool
  if (playedTrackIds && playedTrackIds.size > 0) {
    unplayedCandidates = candidatePool.filter(
      (t) => !playedTrackIds.has(t.id) && (!t.youtubeId || !playedTrackIds.has(t.youtubeId))
    )
  }

  const finalCandidates = unplayedCandidates.length > 0 ? unplayedCandidates : candidatePool

  let nextTrack: Track
  if (finalCandidates.length > 0) {
    const randIdx = Math.floor(Math.random() * finalCandidates.length)
    nextTrack = finalCandidates[randIdx]
  } else if (vibeType === 'devotional_spiritual') {
    // Never jump from Bhakti / Devotional to Western Pop! Fallback to peaceful acoustic Indian
    const spiritualAcoustic = Array.from(poolMap.values()).filter(
      (t) =>
        t.id !== currentTrack.id &&
        (detectTrackVibe(t) === 'devotional_spiritual' ||
          detectTrackVibe(t) === 'peaceful_ambient' ||
          detectTrackVibe(t) === 'bollywood_romantic')
    )
    nextTrack =
      spiritualAcoustic.length > 0
        ? spiritualAcoustic[Math.floor(Math.random() * spiritualAcoustic.length)]
        : CATALOG_TRACKS[0]
  } else {
    const genericFallback = CATALOG_TRACKS.filter((t) => t.id !== currentTrack.id)
    nextTrack = genericFallback.length > 0 ? genericFallback[0] : CATALOG_TRACKS[0]
  }

  return {
    nextTrack,
    vibe: vibeDef,
    reason: `Based on your vibe with "${currentTrack.title}" (${vibeDef.label})`,
  }
}

export function getRecommendations(currentTrack: Track | null): RecommendedTrack[] {
  const vibe = detectTrackVibe(currentTrack)
  const vibeDef = VIBE_DEFINITIONS[vibe]
  const matchingTracks = getTracksByVibe(vibe, CATALOG_TRACKS)

  const filtered = currentTrack
    ? matchingTracks.filter(
        (t) => t.id !== currentTrack.id && (!currentTrack.youtubeId || t.youtubeId !== currentTrack.youtubeId)
      )
    : matchingTracks

  const primary = filtered.map((t) => ({
    ...t,
    recommendationReason: currentTrack
      ? `Matches ${vibeDef.label} vibe of "${currentTrack.title}"`
      : `${vibeDef.label} Trending Hit`,
  }))

  // Strict genre affinity: devotional tracks must ONLY queue other devotional/spiritual tracks!
  if (vibe === 'devotional_spiritual') {
    return primary.slice(0, 25)
  }

  const remaining = CATALOG_TRACKS.filter((t) => {
    if (!currentTrack) return true
    if (t.id === currentTrack.id || (currentTrack.youtubeId && t.youtubeId === currentTrack.youtubeId)) return false
    if (primary.some((p) => p.id === t.id)) return false
    const tVibe = detectTrackVibe(t)
    // Never mix Western Pop into Punjabi or Indian Romantic
    if (vibe === 'punjabi_banger') return tVibe === 'punjabi_banger'
    if (vibe === 'bollywood_romantic') return tVibe === 'bollywood_romantic'
    return true
  }).map((t) => {
    const tVibe = detectTrackVibe(t)
    const tDef = VIBE_DEFINITIONS[tVibe]
    return {
      ...t,
      recommendationReason: `Trending ${tDef.label} Hit`,
    }
  })

  return [...primary, ...remaining].slice(0, 25)
}

