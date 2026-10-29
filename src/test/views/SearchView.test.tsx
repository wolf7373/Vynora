import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SearchView } from '@/components/views/SearchView'
import { useUIStore } from '@/stores/useUIStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { usePlaylistStore } from '@/stores/usePlaylistStore'
import { PlaybackAdapterManager } from '@/adapters'

describe('SearchView & REG-03 Search Autoplay Guardrail', () => {
  beforeEach(() => {
    usePlayerStore.getState().resetPlayer()
    usePlaylistStore.setState({ playlists: [], activePlaylistId: null })
    useUIStore.setState({
      activeTab: 'search',
      rightSidebarView: 'closed',
      isDockedPlayerOpen: false,
      isMobileDrawerOpen: false,
      visualizerMode: 'turntable',
      searchQuery: '',
      commandPaletteOpen: false,
      ambientColor: '#00F2FE',
    })
  })

  it('renders search header and catalog items', async () => {
    render(<SearchView />)

    expect(screen.getByText(/discover music & live youtube streams/i)).toBeInTheDocument()
    expect(screen.getByText('295')).toBeInTheDocument()
  })

  it('REG-03: clicking a song card sets isDockedPlayerOpen: true and rightSidebarView: video before playing', async () => {
    const adapterManager = PlaybackAdapterManager.getInstance()
    const playTrackSpy = vi.spyOn(adapterManager, 'playTrack').mockResolvedValue()

    render(<SearchView />)

    expect(useUIStore.getState().isDockedPlayerOpen).toBe(false)
    expect(useUIStore.getState().rightSidebarView).toBe('closed')

    const songTitle = screen.getByText('295')
    fireEvent.click(songTitle)

    // REG-03: Must immediately set dock open to eliminate autoplay blocking
    expect(useUIStore.getState().isDockedPlayerOpen).toBe(true)
    expect(useUIStore.getState().rightSidebarView).toBe('video')
    expect(playTrackSpy).toHaveBeenCalled()
  })

  it('adds a track to playlist when clicking the plus button', async () => {
    render(<SearchView />)

    const addButtons = screen.getAllByTitle(/add to playlist/i)
    expect(addButtons.length).toBeGreaterThan(0)

    fireEvent.click(addButtons[0])

    // Should create Favorites playlist and add track
    const playlists = usePlaylistStore.getState().playlists
    expect(playlists.length).toBe(1)
    expect(playlists[0].tracks.length).toBe(1)
  })
})
