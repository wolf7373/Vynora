import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DownloadedView } from '@/components/views/DownloadedView'
import { offlineStorage } from '@/services/storage'
import { PlaybackAdapterManager } from '@/adapters'
import { usePlayerStore } from '@/stores/usePlayerStore'

describe('DownloadedView (Milestone 6 Offline Engine)', () => {
  beforeEach(async () => {
    usePlayerStore.getState().resetPlayer()
    await offlineStorage.clearAllStoredTracks()
  })

  it('renders storage meter and empty state when no files are imported', async () => {
    render(<DownloadedView />)

    expect(screen.getByText(/storage meter/i)).toBeInTheDocument()
    expect(screen.getByText(/sandboxed indexeddb/i)).toBeInTheDocument()
    expect(await screen.findByText(/no offline audio files found/i)).toBeInTheDocument()
  })

  it('displays saved offline tracks and plays track on click with REAL FFT', async () => {
    const adapterManager = PlaybackAdapterManager.getInstance()
    const playTrackSpy = vi.spyOn(adapterManager, 'playTrack').mockResolvedValue()

    // Seed offline track
    const blob = new Blob([new Uint8Array(200)], { type: 'audio/mpeg' })
    await offlineStorage.saveTrackBlob(blob, {
      id: 'local-test-track',
      title: 'Neon Skyline',
      artist: 'Studio Master',
      duration: 190,
    })

    render(<DownloadedView />)

    const songTitle = await screen.findByText('Neon Skyline')
    expect(songTitle).toBeInTheDocument()

    // Click track to play
    fireEvent.click(songTitle)

    await waitFor(() => {
      expect(playTrackSpy).toHaveBeenCalled()
      const playedTrack = playTrackSpy.mock.calls[0][0]
      expect(playedTrack.source).toBe('local')
      expect(playedTrack.isLocal).toBe(true)
    })
  })

  it('deletes an offline track when clicking the delete button', async () => {
    const blob = new Blob([new Uint8Array(200)], { type: 'audio/mpeg' })
    await offlineStorage.saveTrackBlob(blob, {
      id: 'track-to-remove',
      title: 'Delete Me Track',
      artist: 'Artist',
    })

    render(<DownloadedView />)

    const song = await screen.findByText('Delete Me Track')
    expect(song).toBeInTheDocument()

    const deleteBtn = screen.getByLabelText(/delete delete me track/i)
    fireEvent.click(deleteBtn)

    await waitFor(async () => {
      expect(screen.queryByText('Delete Me Track')).toBeNull()
      const stored = await offlineStorage.getAllStoredTracks()
      expect(stored).toHaveLength(0)
    })
  })
})
