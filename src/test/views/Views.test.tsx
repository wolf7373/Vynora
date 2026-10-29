import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HomeView } from '@/components/views/HomeView'
import { SearchView } from '@/components/views/SearchView'
import { LibraryView } from '@/components/views/LibraryView'
import { DownloadedView } from '@/components/views/DownloadedView'
import { VisualizerView } from '@/components/views/VisualizerView'
import { usePlaylistStore } from '@/stores/usePlaylistStore'
import { useUIStore } from '@/stores/useUIStore'
import { usePlayerStore } from '@/stores/usePlayerStore'

describe('Vynora Studio Views', () => {
  beforeEach(() => {
    usePlayerStore.getState().resetPlayer()
    useUIStore.setState({
      activeTab: 'home',
      rightSidebarView: 'closed',
      isDockedPlayerOpen: false,
      isMobileDrawerOpen: false,
      visualizerMode: 'turntable',
      searchQuery: '',
      commandPaletteOpen: false,
      ambientColor: '#00F2FE',
    })
  })

  describe('HomeView', () => {
    it('renders hero title and canonical trending tracks', () => {
      render(<HomeView />)
      expect(screen.getAllByText(/Vishal/i).length).toBeGreaterThan(0)
      expect(screen.getByText(/Play Instant Mix/i)).toBeInTheDocument()
      expect(screen.getByText('Kesariya')).toBeInTheDocument()
    })
  })

  describe('SearchView', () => {
    it('filters tracks based on search query', async () => {
      useUIStore.getState().setSearchQuery('Cheques')
      render(<SearchView />)

      expect(await screen.findByText('Cheques')).toBeInTheDocument()
      expect(screen.queryByText('Midnight City')).toBeNull()
    })
  })

  describe('LibraryView', () => {
    it('creates new playlist and allows adding tracks', () => {
      usePlaylistStore.setState({ playlists: [], activePlaylistId: null })
      render(<LibraryView />)

      const createBtn = screen.getByRole('button', { name: /create playlist/i })
      fireEvent.click(createBtn)

      expect(screen.getByText('Play All')).toBeInTheDocument()
    })
  })

  describe('DownloadedView', () => {
    it('displays IndexedDB storage engine status (Decision D4)', async () => {
      render(<DownloadedView />)
      expect(screen.getByText(/sandboxed indexeddb/i)).toBeInTheDocument()
      expect(await screen.findByText(/storage meter/i)).toBeInTheDocument()
    })
  })

  describe('VisualizerView', () => {
    it('renders 3D Studio scene switcher and 64-bin FFT spectrum canvas', () => {
      const { container } = render(<VisualizerView />)
      expect(screen.getByText(/audio reactive visualizer/i)).toBeInTheDocument()
      expect(container.querySelector('canvas')).not.toBeNull()

      // Switch to Particle Waves mode
      const wavesBtn = screen.getByRole('button', { name: /particle waves/i })
      fireEvent.click(wavesBtn)
      expect(useUIStore.getState().visualizerMode).toBe('waves')
    })
  })
})

