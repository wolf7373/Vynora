import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CATALOG_TRACKS, CATALOG_PLAYLISTS, getCatalogTrackById } from '../../data/tracksCatalog'
import {
  getCurrentTimeOfDay,
  DAILY_MIX_CONFIGS,
  detectTrackVibe,
  getDailyMixTracks,
  getCuratedTimeMix,
  getPersonalizedRecommendedTracks,
  getSurpriseTrack,
  getSmartAutoplayNextTrack,
} from '../../services/recommendations/recommendationEngine'
import { SleepTimerManager } from '../../services/playback/sleepTimerManager'
import { usePlaylistStore } from '../../stores/usePlaylistStore'

describe('Resonix Feature Parity in Vynora 3.0', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('contains the full real track catalog with official YouTube IDs', () => {
    expect(CATALOG_TRACKS.length).toBeGreaterThanOrEqual(60)

    // Check specific iconic tracks from Bollywood, Punjabi, and International Hits
    const kesariya = getCatalogTrackById('bolly-kesariya')
    expect(kesariya).toBeDefined()
    expect(kesariya?.title).toBe('Kesariya')
    expect(kesariya?.youtubeId).toBe('BddP6PYo2gs')

    const apnaBanaLe = getCatalogTrackById('bolly-apna-bana-le')
    expect(apnaBanaLe).toBeDefined()
    expect(apnaBanaLe?.youtubeId).toBe('ElZfdU54Cp8')

    // Every single track must have an official youtubeId and valid duration
    for (const track of CATALOG_TRACKS) {
      expect(track.youtubeId).toBeDefined()
      expect(track.youtubeId?.length).toBeGreaterThan(5)
      expect(track.duration).toBeGreaterThan(0)
    }
  })

  it('contains all curated playlists from Resonix preloaded with tracks', () => {
    expect(CATALOG_PLAYLISTS.length).toBeGreaterThanOrEqual(4)

    const bollywood = CATALOG_PLAYLISTS.find((p) => p.id === 'bollywood-butter')
    expect(bollywood).toBeDefined()
    expect(bollywood?.tracks.length).toBeGreaterThanOrEqual(14)

    const punjabi = CATALOG_PLAYLISTS.find((p) => p.id === 'punjabi-hits')
    expect(punjabi).toBeDefined()
    expect(punjabi?.tracks.length).toBeGreaterThanOrEqual(10)
  })

  it('generates personalized time-of-day greeting for Vishal', () => {
    const morning = getCurrentTimeOfDay(new Date(2026, 0, 1, 9, 0))
    expect(morning.greeting).toBe('Good morning, Vishal')
    expect(morning.period).toBe('morning')

    const afternoon = getCurrentTimeOfDay(new Date(2026, 0, 1, 14, 0))
    expect(afternoon.greeting).toBe('Good afternoon, Vishal')

    const evening = getCurrentTimeOfDay(new Date(2026, 0, 1, 19, 0))
    expect(evening.greeting).toBe('Good evening, Vishal')

    const lateNight = getCurrentTimeOfDay(new Date(2026, 0, 1, 23, 0))
    expect(lateNight.greeting).toBe('Late Night, Vishal')

    const curatedMix = getCuratedTimeMix(CATALOG_TRACKS, evening, [], [])
    expect(curatedMix.length).toBeGreaterThanOrEqual(1)

    const recs = getPersonalizedRecommendedTracks(CATALOG_TRACKS, [], [], 'all')
    expect(recs.length).toBeGreaterThanOrEqual(1)
  })

  it('configures 4 curated Daily Mixes with distinct vibes', () => {
    expect(DAILY_MIX_CONFIGS).toHaveLength(4)
    expect(DAILY_MIX_CONFIGS[0].vibe).toBe('bollywood_romantic')
    expect(DAILY_MIX_CONFIGS[1].vibe).toBe('punjabi_banger')
    expect(DAILY_MIX_CONFIGS[2].vibe).toBe('global_pop')
    expect(DAILY_MIX_CONFIGS[3].vibe).toBe('peaceful_ambient')

    const mix1Tracks = getDailyMixTracks('daily-mix-1', CATALOG_TRACKS)
    expect(mix1Tracks.length).toBeGreaterThanOrEqual(6)
  })

  it('detects track vibe accurately across Indian and International music', () => {
    const kesariya = getCatalogTrackById('bolly-kesariya')!
    expect(detectTrackVibe(kesariya)).toBe('bollywood_romantic')

    const punjabi = CATALOG_TRACKS.find((t) => t.id.includes('punj') || t.title.toLowerCase().includes('295'))
    if (punjabi) {
      expect(detectTrackVibe(punjabi)).toBe('punjabi_banger')
    }

    const parvati = CATALOG_TRACKS.find((t) => t.id === 'bhakti-parvati-song')!
    expect(detectTrackVibe(parvati)).toBe('devotional_spiritual')
  })

  it('smart autoplay selects the next track matching the exact vibe of the current track', () => {
    const kesariya = getCatalogTrackById('bolly-kesariya')!
    const { nextTrack, vibe } = getSmartAutoplayNextTrack(kesariya, CATALOG_TRACKS)

    expect(nextTrack.id).not.toBe(kesariya.id)
    expect(vibe.id).toBe('bollywood_romantic')

    const parvati = CATALOG_TRACKS.find((t) => t.id === 'bhakti-parvati-song')!
    const { nextTrack: devNext, vibe: devVibe } = getSmartAutoplayNextTrack(parvati, CATALOG_TRACKS)
    expect(devVibe.id).toBe('devotional_spiritual')
    expect(devNext.id).not.toBe(parvati.id)
  })

  it('surprise track generator returns a fresh banger with a reason', () => {
    const { track, reason } = getSurpriseTrack(CATALOG_TRACKS, [])
    expect(track).toBeDefined()
    expect(reason).toContain('Surprise Pick')
  })

  it('manages sleep timer countdown and modes cleanly', () => {
    const timerManager = SleepTimerManager.getInstance()

    timerManager.setTimer(15) // 15 mins
    expect(timerManager.getStatus().mode).toBe('time')
    expect(timerManager.getStatus().remainingSec).toBe(15 * 60)

    timerManager.setTimer('end_of_track')
    expect(timerManager.getStatus().mode).toBe('end_of_track')

    timerManager.setTimer(null)
    expect(timerManager.getStatus().mode).toBeNull()
  })

  it('manages liked songs favorites toggle in usePlaylistStore', () => {
    const store = usePlaylistStore.getState()
    const testTrack = CATALOG_TRACKS[0]

    // Initially not liked
    const initialLiked = store.isLiked(testTrack.id)

    // Toggle like
    store.toggleLikeTrack(testTrack)
    expect(usePlaylistStore.getState().isLiked(testTrack.id)).toBe(!initialLiked)

    // Toggle back
    store.toggleLikeTrack(testTrack)
    expect(usePlaylistStore.getState().isLiked(testTrack.id)).toBe(initialLiked)
  })
})
