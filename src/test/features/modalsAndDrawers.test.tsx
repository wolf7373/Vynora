import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SleepTimerModal } from '../../components/modals/SleepTimerModal'
import { PlaybackSettingsModal } from '../../components/modals/PlaybackSettingsModal'
import { QueueDrawer } from '../../components/layout/QueueDrawer'
import { useUIStore } from '../../stores/useUIStore'
import { useQueueStore } from '../../stores/useQueueStore'
import { usePlayerStore } from '../../stores/usePlayerStore'
import { CATALOG_TRACKS } from '../../data/tracksCatalog'

describe('Modals & Queue Drawer Parity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useUIStore.setState({
      isQueueDrawerOpen: true,
      isSleepTimerOpen: true,
      isPlaybackSettingsOpen: true,
    })
    usePlayerStore.setState({
      currentTrack: CATALOG_TRACKS[0],
      isPlaying: true,
      currentTime: 10,
      duration: 200,
    })
    useQueueStore.setState({
      queue: CATALOG_TRACKS.slice(0, 5),
      currentIndex: 0,
    })
  })

  it('renders SleepTimerModal with duration options and touch targets', () => {
    render(<SleepTimerModal isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByRole('dialog', { name: /sleep timer/i })).toBeInTheDocument()
    expect(screen.getByText('5 minutes')).toBeInTheDocument()
    expect(screen.getByText('15 minutes')).toBeInTheDocument()
    expect(screen.getByText('1 hour')).toBeInTheDocument()
    expect(screen.getByText('End of track')).toBeInTheDocument()
  })

  it('renders PlaybackSettingsModal with crossfade slider and presets', () => {
    render(<PlaybackSettingsModal isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByRole('dialog', { name: /playback settings/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/crossfade slider/i)).toBeInTheDocument()
    expect(screen.getByText('Smooth Crossfade')).toBeInTheDocument()
    expect(screen.getByText('Gapless Audio Engine')).toBeInTheDocument()
  })

  it('renders QueueDrawer with Now Playing and upcoming tracks', () => {
    render(<QueueDrawer />)

    expect(screen.getByRole('dialog', { name: /play queue/i })).toBeInTheDocument()
    expect(screen.getByText(/Now Playing/i)).toBeInTheDocument()
    expect(screen.getByText(/Next Up \(Smart Vibe Autoplay\)/i)).toBeInTheDocument()
  })
})

