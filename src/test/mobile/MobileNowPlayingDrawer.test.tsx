import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MobileNowPlayingDrawer } from '../../components/layout/MobileNowPlayingDrawer'
import { useUIStore } from '../../stores/useUIStore'
import { usePlayerStore } from '../../stores/usePlayerStore'
import { PlaybackAdapterManager } from '../../adapters'

describe('MobileNowPlayingDrawer (Milestone 9)', () => {
  beforeEach(() => {
    useUIStore.setState({ isMobileDrawerOpen: true })
    usePlayerStore.setState({
      currentTrack: {
        id: 'test-track-1',
        title: 'Starboy',
        artist: 'The Weeknd',
        duration: 230,
        source: 'youtube',
        youtubeId: 'dqt8Z1k0oWQ',
      },
      isPlaying: false,
      currentTime: 45,
      duration: 230,
    })
  })

  it('renders drawer with track title, artist, and progress slider', () => {
    render(<MobileNowPlayingDrawer />)

    expect(screen.getAllByText('Starboy')[0]).toBeInTheDocument()
    expect(screen.getAllByText('The Weeknd')[0]).toBeInTheDocument()
    expect(screen.getByLabelText(/seek track position/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /play track/i })).toBeInTheDocument()
  })

  it('triggers play/pause on adapter when button clicked', async () => {
    const adapterManager = PlaybackAdapterManager.getInstance()
    const playSpy = vi.spyOn(adapterManager, 'play').mockResolvedValue()

    render(<MobileNowPlayingDrawer />)
    const playBtn = screen.getByRole('button', { name: /play track/i })
    fireEvent.click(playBtn)

    expect(playSpy).toHaveBeenCalled()
  })

  it('seeks track position on input change', () => {
    const adapterManager = PlaybackAdapterManager.getInstance()
    const seekSpy = vi.spyOn(adapterManager, 'seek').mockResolvedValue()

    render(<MobileNowPlayingDrawer />)
    const slider = screen.getByLabelText(/seek track position/i)
    fireEvent.change(slider, { target: { value: '90' } })

    expect(seekSpy).toHaveBeenCalledWith(90)
  })

  it('ensures touch targets meet minimum 44x44px requirements (REG-07)', () => {
    render(<MobileNowPlayingDrawer />)
    const playBtn = screen.getByRole('button', { name: /play track/i })
    expect(playBtn).toHaveClass('min-h-[56px]') // >= 44px

    const shuffleBtn = screen.getByLabelText(/toggle shuffle/i)
    expect(shuffleBtn).toHaveClass('min-h-[44px]')
    expect(shuffleBtn).toHaveClass('min-w-[44px]')
  })
})
