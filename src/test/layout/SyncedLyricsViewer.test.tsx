import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SyncedLyricsViewer } from '@/components/layout/SyncedLyricsViewer'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { PlaybackAdapterManager } from '@/adapters'
import { SAMPLE_TRACKS } from '@/data/sampleTracks'

describe('SyncedLyricsViewer (Milestone 5)', () => {
  beforeEach(() => {
    usePlayerStore.getState().resetPlayer()
  })

  it('renders empty state when no track is loaded', () => {
    render(<SyncedLyricsViewer />)
    expect(screen.getByText(/no track loaded/i)).toBeInTheDocument()
  })

  it('loads synchronized lyrics and displays +180ms lead sync badge', async () => {
    usePlayerStore.getState().setCurrentTrack(SAMPLE_TRACKS[0]) // punj-295
    render(<SyncedLyricsViewer />)

    expect(await screen.findByText(/\+180MS LEAD SYNC/i)).toBeInTheDocument()
    expect(screen.getByText(/Dash maheene vich/i)).toBeInTheDocument()
  })

  it('highlights the active lyric line according to playback currentTime', async () => {
    usePlayerStore.getState().setCurrentTrack(SAMPLE_TRACKS[0])
    // Line 1 is at ~15s (14.82s lead). Set currentTime to 16s.
    usePlayerStore.getState().setCurrentTime(16)

    render(<SyncedLyricsViewer />)

    const firstLine = await screen.findByText(/Dash maheene vich/i)
    const lineWrapper = firstLine.closest('div')
    expect(lineWrapper?.className).toContain('text-vyn-primary')
    expect(lineWrapper?.className).toContain('border-vyn-primary')
  })

  it('Click-to-seek: clicking on a lyric line seeks player to line rawTime', async () => {
    const adapterManager = PlaybackAdapterManager.getInstance()
    const seekSpy = vi.spyOn(adapterManager, 'seek').mockResolvedValue()

    usePlayerStore.getState().setCurrentTrack(SAMPLE_TRACKS[0])
    render(<SyncedLyricsViewer />)

    const lyricLine = await screen.findByText(/295 laga ditti mere te/i)
    fireEvent.click(lyricLine)

    // Should seek to rawTime (approx 22.0 seconds)
    expect(seekSpy).toHaveBeenCalledWith(22.0)
  })
})
