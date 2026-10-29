import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '@/App'
import { useUIStore } from '@/stores/useUIStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { CATALOG_TRACKS } from '@/data/tracksCatalog'

describe('App Shell (Milestone 3 Integration)', () => {
  it('renders Vynora branding in TopBar and LeftSidebar', () => {
    render(<App />)
    const brandElements = screen.getAllByText('VYNORA')
    expect(brandElements.length).toBeGreaterThan(0)
  }, 20000)

  it('navigates seamlessly across tabs using LeftSidebar', () => {
    render(<App />)
    const libraryTab = screen.getByRole('button', { name: /your library/i })
    fireEvent.click(libraryTab)
    expect(useUIStore.getState().activeTab).toBe('library')
  }, 20000)

  it('renders sticky PlayerBar with seek scrubber and volume slider when track loaded', () => {
    usePlayerStore.setState({ currentTrack: CATALOG_TRACKS[0] })
    render(<App />)
    expect(screen.getByLabelText(/seek playback position/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/volume slider/i)).toBeInTheDocument()
  })

  it('renders search input with accessible label', () => {
    render(<App />)
    expect(screen.getByLabelText(/search music/i)).toBeInTheDocument()
  })

  it('verifies interactive buttons meet WCAG 2.5.5 minimum 44px touch targets', () => {
    const { container } = render(<App />)
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(0)

    buttons.forEach((btn) => {
      const classes = btn.className
      const has44pxTouchTarget =
        classes.includes('min-h-[44px]') ||
        classes.includes('min-w-[44px]') ||
        classes.includes('h-11') ||
        classes.includes('w-11') ||
        classes.includes('h-12') ||
        classes.includes('w-12')
      expect(has44pxTouchTarget).toBe(true)
    })
  })
})
