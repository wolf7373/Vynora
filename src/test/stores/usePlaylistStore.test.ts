import { describe, it, expect, beforeEach } from 'vitest'
import { usePlaylistStore } from '@/stores/usePlaylistStore'
import type { Track } from '@/types/track'

const sampleTrackA: Track = {
  id: 'tr-a',
  title: 'Midnight City',
  artist: 'M83',
  duration: 243,
  source: 'youtube',
  youtubeId: 'dX3k_QDnzHE',
}

const sampleTrackB: Track = {
  id: 'tr-b',
  title: 'Resonance',
  artist: 'HOME',
  duration: 212,
  source: 'youtube',
  youtubeId: '8GW6sLrK40k',
}

describe('usePlaylistStore', () => {
  beforeEach(() => {
    usePlaylistStore.setState({ playlists: [], activePlaylistId: null })
  })

  it('creates a new playlist and sets it active', () => {
    const { createPlaylist } = usePlaylistStore.getState()
    const pl = createPlaylist('Chill Beats', 'Late night study session')

    expect(pl.name).toBe('Chill Beats')
    expect(pl.description).toBe('Late night study session')
    expect(pl.tracks).toEqual([])

    const state = usePlaylistStore.getState()
    expect(state.playlists).toHaveLength(1)
    expect(state.activePlaylistId).toBe(pl.id)
  })

  it('updates an existing playlist', () => {
    const { createPlaylist, updatePlaylist } = usePlaylistStore.getState()
    const pl = createPlaylist('Original Title')

    updatePlaylist(pl.id, { name: 'Renamed Title', description: 'New description' })

    const updated = usePlaylistStore.getState().playlists.find((p) => p.id === pl.id)
    expect(updated?.name).toBe('Renamed Title')
    expect(updated?.description).toBe('New description')
  })

  it('deletes a playlist and resets activePlaylistId if active', () => {
    const { createPlaylist, deletePlaylist } = usePlaylistStore.getState()
    const pl1 = createPlaylist('PL 1')
    const pl2 = createPlaylist('PL 2')

    deletePlaylist(pl2.id)
    expect(usePlaylistStore.getState().playlists.map((p) => p.id)).toEqual([pl1.id])
    expect(usePlaylistStore.getState().activePlaylistId).toBeNull()
  })

  it('adds and removes tracks without allowing duplicates', () => {
    const { createPlaylist, addTrackToPlaylist, removeTrackFromPlaylist } = usePlaylistStore.getState()
    const pl = createPlaylist('Synthwave')

    addTrackToPlaylist(pl.id, sampleTrackA)
    addTrackToPlaylist(pl.id, sampleTrackB)

    let current = usePlaylistStore.getState().playlists.find((p) => p.id === pl.id)!
    expect(current.tracks).toHaveLength(2)

    // Attempt duplicate addition
    addTrackToPlaylist(pl.id, sampleTrackA)
    current = usePlaylistStore.getState().playlists.find((p) => p.id === pl.id)!
    expect(current.tracks).toHaveLength(2) // Still 2, no duplicate

    // Remove track A
    removeTrackFromPlaylist(pl.id, sampleTrackA.id)
    current = usePlaylistStore.getState().playlists.find((p) => p.id === pl.id)!
    expect(current.tracks.map((t) => t.id)).toEqual([sampleTrackB.id])
  })

  it('reorders tracks inside a playlist', () => {
    const { createPlaylist, addTrackToPlaylist, reorderPlaylistTracks } = usePlaylistStore.getState()
    const pl = createPlaylist('Order Test')

    addTrackToPlaylist(pl.id, sampleTrackA)
    addTrackToPlaylist(pl.id, sampleTrackB)

    reorderPlaylistTracks(pl.id, 0, 1)
    const current = usePlaylistStore.getState().playlists.find((p) => p.id === pl.id)!
    expect(current.tracks.map((t) => t.id)).toEqual([sampleTrackB.id, sampleTrackA.id])
  })
})

