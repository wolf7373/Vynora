import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { SingletonYouTubePlayer } from '@/components/player/SingletonYouTubePlayer'
import { detectTrackVibe, getRecommendations } from '@/services/recommendations/recommendationEngine'
import { findPreloadedLrc } from '@/services/lyrics/preloadedLyrics'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useUIStore } from '@/stores/useUIStore'
import type { Track } from '@/types/track'

describe('Singleton YouTube Player & Spotify Song Radio Engine', () => {
  beforeEach(() => {
    usePlayerStore.setState({
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      duration: 180,
    })
    useUIStore.setState({
      rightSidebarView: 'closed',
      isMobileDrawerOpen: false,
      mobileDrawerTab: 'visualizer',
    })
  })

  it('renders singleton iframe with youtube-player-iframe id when track has youtubeId', () => {
    usePlayerStore.setState({
      currentTrack: {
        id: 'parvati-test',
        youtubeId: 'xPqG3yVfS2o',
        title: 'Parvati Song',
        artist: 'Sadhu Tiwari',
        duration: 280,
        source: 'youtube',
      },
    })

    const { container } = render(<SingletonYouTubePlayer />)
    const iframe = container.querySelector('#youtube-player-iframe')
    expect(iframe).toBeInTheDocument()
    expect(iframe?.getAttribute('src')).toContain('xPqG3yVfS2o')
  })

  it('styles singleton player offscreen when dock is closed to maintain background audio', () => {
    usePlayerStore.setState({
      currentTrack: {
        id: 'test-yt-1',
        youtubeId: 'xPqG3yVfS2o',
        title: 'Parvati Song',
        artist: 'Sadhu Tiwari',
        duration: 280,
        source: 'youtube',
      },
    })
    useUIStore.setState({ rightSidebarView: 'closed', isMobileDrawerOpen: false })

    const { container } = render(<SingletonYouTubePlayer />)
    const host = container.querySelector('#vynora-singleton-yt-host') as HTMLElement
    expect(host.style.top).toBe('-9999px')
    expect(host.style.left).toBe('-9999px')
  })

  it('accurately detects devotional_spiritual vibe for Bhakti tracks', () => {
    const parvatiTrack: Track = {
      id: 'p1',
      title: 'Parvati Song | Jab Zid Pe Aa Gayi Parvati',
      artist: 'Sadhu Tiwari, Hanuman Ansh',
      duration: 280,
      source: 'youtube',
    }
    expect(detectTrackVibe(parvatiTrack)).toBe('devotional_spiritual')

    const shivTrack: Track = {
      id: 's1',
      title: 'Shiv Tandav Stotram',
      artist: 'Shankar Mahadevan',
      duration: 552,
      source: 'youtube',
    }
    expect(detectTrackVibe(shivTrack)).toBe('devotional_spiritual')
  })

  it('anti-Western-Pop guardrail: devotional track recommendations NEVER contain Western Pop', () => {
    const parvatiTrack: Track = {
      id: 'p1',
      title: 'Parvati Song | Jab Zid Pe Aa Gayi Parvati',
      artist: 'Sadhu Tiwari, Hanuman Ansh',
      duration: 280,
      source: 'youtube',
    }

    const recommendations = getRecommendations(parvatiTrack)
    expect(recommendations.length).toBeGreaterThan(0)

    // Verify all recommended tracks strictly maintain the spiritual / devotional vibe
    recommendations.forEach((rec) => {
      expect(detectTrackVibe(rec)).toBe('devotional_spiritual')
      expect(rec.artist).not.toContain('The Weeknd')
      expect(rec.artist).not.toContain('Dua Lipa')
      expect(rec.artist).not.toContain('Sabrina Carpenter')
    })
  })

  it('provides 0ms instant synchronized lyrics for parvati and majboor', () => {
    const parvatiLrc = findPreloadedLrc('Parvati Song')
    expect(parvatiLrc).not.toBeNull()
    expect(parvatiLrc).toContain('जब ज़िद पे आ गई पार्वती')

    const majboorLrc = findPreloadedLrc('Majboor | Sheheryar Rehan')
    expect(majboorLrc).not.toBeNull()
    expect(majboorLrc).toContain('Dil se jo baatein thi kehni')
  })
})

