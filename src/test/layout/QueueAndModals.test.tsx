import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { QueueDrawer } from '@/components/layout/QueueDrawer'
import { PlaybackSettingsModal } from '@/components/modals/PlaybackSettingsModal'
import { SleepTimerModal } from '@/components/modals/SleepTimerModal'
import { useUIStore } from '@/stores/useUIStore'
import { useQueueStore } from '@/stores/useQueueStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { SAMPLE_TRACKS } from '@/data/sampleTracks'
import { detectTrackVibe, getSmartAutoplayNextTrack } from '@/services/recommendations/recommendationEngine'
import { CATALOG_TRACKS } from '@/data/tracksCatalog'

describe('QueueDrawer, Modals & Recommendation Parity Fixes', () => {
  beforeEach(() => {
    useUIStore.getState().setIsQueueDrawerOpen(false)
    useQueueStore.getState().clearQueue()
    usePlayerStore.getState().resetPlayer()
  })

  it('QueueDrawer renders with z-[70] so it appears on top of NowPlayingDrawer', () => {
    useUIStore.getState().setIsQueueDrawerOpen(true)
    const { container } = render(<QueueDrawer />)
    const dialog = container.querySelector('[role="dialog"]')
    expect(dialog).toBeInTheDocument()
    expect(dialog?.className).toContain('z-[70]')
  })

  it('PlaybackSettingsModal renders with z-[75] on top of drawer', () => {
    const { container } = render(
      <PlaybackSettingsModal isOpen={true} onClose={() => {}} />
    )
    const dialog = container.querySelector('[role="dialog"]')
    expect(dialog).toBeInTheDocument()
    expect(dialog?.className).toContain('z-[75]')
  })

  it('SleepTimerModal renders with z-[75] on top of drawer', () => {
    const { container } = render(
      <SleepTimerModal isOpen={true} onClose={() => {}} />
    )
    const dialog = container.querySelector('[role="dialog"]')
    expect(dialog).toBeInTheDocument()
    expect(dialog?.className).toContain('z-[75]')
  })

  it('Devotional and Bhakti tracks are strictly categorized under devotional_spiritual', () => {
    const parvatiTrack = {
      ...SAMPLE_TRACKS[0],
      id: 'test-parvati',
      title: 'Parvati Song (8K Video) | Jab Zid Pe Aa Gay...',
      artist: 'Sadhu Tiwari, Hanuman Ansh',
    }
    expect(detectTrackVibe(parvatiTrack)).toBe('devotional_spiritual')

    const shivTrack = {
      ...SAMPLE_TRACKS[0],
      id: 'test-bholenath',
      title: 'O Bholenath Ji | Hansraj Raghuwanshi',
      artist: 'Hansraj Raghuwanshi',
    }
    expect(detectTrackVibe(shivTrack)).toBe('devotional_spiritual')
  })

  it('Smart autoplay after a devotional track never recommends Western Pop', () => {
    const parvatiTrack = {
      ...SAMPLE_TRACKS[0],
      id: 'test-parvati',
      title: 'Parvati Song (8K Video) | Jab Zid Pe Aa Gay...',
      artist: 'Sadhu Tiwari, Hanuman Ansh',
    }
    const { nextTrack, vibe } = getSmartAutoplayNextTrack(parvatiTrack, CATALOG_TRACKS)
    expect(vibe.id).toBe('devotional_spiritual')
    const nextVibe = detectTrackVibe(nextTrack)
    expect(nextVibe).not.toBe('global_pop')
  })
})

