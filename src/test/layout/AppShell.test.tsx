import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AppShell } from '@/components/layout/AppShell'
import { useUIStore } from '@/stores/useUIStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { CATALOG_TRACKS } from '@/data/tracksCatalog'

describe('Spotify 3-Column UI Shell & Navigation (Milestone 3)', () => {
  beforeEach(() => {
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
    usePlayerStore.getState().resetPlayer()
  })

  it('renders 3-column layout components: LeftSidebar, CenterViewport, and PlayerBar when track loaded', () => {
    usePlayerStore.setState({ currentTrack: CATALOG_TRACKS[0] })
    const { container } = render(<AppShell />)

    // Left Sidebar navigation items
    expect(screen.getByText('Your Library')).toBeInTheDocument()

    // Center Viewport
    const centerViewport = container.querySelector('#vynora-center-viewport')
    expect(centerViewport).not.toBeNull()

    // Player Bar
    expect(screen.getByLabelText(/toggle shuffle/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/seek playback position/i)).toBeInTheDocument()
  })

  it('hides PlayerBar on initial launch when no track is loaded', () => {
    usePlayerStore.getState().resetPlayer()
    render(<AppShell />)
    expect(screen.queryByLabelText(/seek playback position/i)).toBeNull()
  })

  it('REG-04: Docks Right Sidebar dedicated column on desktop without floating over main table rows', () => {
    usePlayerStore.setState({ currentTrack: CATALOG_TRACKS[0] })
    const { container } = render(<AppShell />)

    // Initially closed
    expect(container.querySelector('#vynora-right-dock')).toBeNull()

    // Open video dock
    const videoToggleBtn = screen.getByLabelText(/toggle video dock/i)
    fireEvent.click(videoToggleBtn)

    // Right dock mounts inside the 3-column flex container
    const rightDock = container.querySelector('#vynora-right-dock')
    expect(rightDock).not.toBeNull()
    expect(rightDock?.getAttribute('aria-label')).toBe('Right Media Dock')

    // Contains dedicated singleton YouTube mount
    const ytSingleton = rightDock?.querySelector('#vynora-yt-singleton')
    expect(ytSingleton).not.toBeNull()

    // Toggle closed
    fireEvent.click(screen.getByLabelText(/close media dock/i))
    expect(container.querySelector('#vynora-right-dock')).toBeNull()
  })

  it('switches views smoothly via LeftSidebar tabs', async () => {
    render(<AppShell />)

    const searchTabs = screen.getAllByRole('button', { name: /search/i })
    fireEvent.click(searchTabs[0])
    expect(useUIStore.getState().activeTab).toBe('search')
    expect(await screen.findByText(/discover music/i)).toBeInTheDocument()

    const visualizerTab = screen.getByRole('button', { name: /3d studio/i })
    fireEvent.click(visualizerTab)
    expect(useUIStore.getState().activeTab).toBe('visualizer')
    expect(screen.getByText(/audio reactive visualizer/i)).toBeInTheDocument()
  })

  it('REG-07: Verifies all interactive buttons and tabs meet WCAG 2.5.5 minimum 44px touch targets', () => {
    const { container } = render(<AppShell />)
    const buttons = container.querySelectorAll('button')

    expect(buttons.length).toBeGreaterThan(10)

    buttons.forEach((btn) => {
      const classes = btn.className
      const meetsTouchTarget =
        classes.includes('min-h-[44px]') ||
        classes.includes('min-w-[44px]') ||
        classes.includes('w-11') ||
        classes.includes('h-11') ||
        classes.includes('w-12') ||
        classes.includes('h-12')
      if (!meetsTouchTarget) {
        console.log('Button missing 44px touch target class:', btn.outerHTML)
      }
      expect(meetsTouchTarget).toBe(true)
    })
  })
})
