import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from '@/stores/useUIStore'

describe('useUIStore', () => {
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
  })

  it('switches navigation activeTab', () => {
    const { setActiveTab } = useUIStore.getState()
    setActiveTab('search')
    expect(useUIStore.getState().activeTab).toBe('search')
    setActiveTab('visualizer')
    expect(useUIStore.getState().activeTab).toBe('visualizer')
  })

  it('manages rightSidebarView toggling', () => {
    const { toggleRightSidebarView, setRightSidebarView } = useUIStore.getState()

    // Toggle video open
    toggleRightSidebarView('video')
    expect(useUIStore.getState().rightSidebarView).toBe('video')

    // Toggle same view closes it
    toggleRightSidebarView('video')
    expect(useUIStore.getState().rightSidebarView).toBe('closed')

    // Switch to lyrics
    toggleRightSidebarView('lyrics')
    expect(useUIStore.getState().rightSidebarView).toBe('lyrics')

    // Explicit set
    setRightSidebarView('closed')
    expect(useUIStore.getState().rightSidebarView).toBe('closed')
  })

  it('controls isDockedPlayerOpen for REG-03 search auto-play support', () => {
    const { setIsDockedPlayerOpen } = useUIStore.getState()
    expect(useUIStore.getState().isDockedPlayerOpen).toBe(false)

    setIsDockedPlayerOpen(true)
    expect(useUIStore.getState().isDockedPlayerOpen).toBe(true)
  })

  it('controls mobile drawer and visualizer modes', () => {
    const { setIsMobileDrawerOpen, setVisualizerMode, setAmbientColor, setSearchQuery, setCommandPaletteOpen } =
      useUIStore.getState()

    setIsMobileDrawerOpen(true)
    expect(useUIStore.getState().isMobileDrawerOpen).toBe(true)

    setVisualizerMode('waves')
    expect(useUIStore.getState().visualizerMode).toBe('waves')

    setAmbientColor('#7F00FF')
    expect(useUIStore.getState().ambientColor).toBe('#7F00FF')

    setSearchQuery('Sidhu Moose Wala')
    expect(useUIStore.getState().searchQuery).toBe('Sidhu Moose Wala')

    setCommandPaletteOpen(true)
    expect(useUIStore.getState().commandPaletteOpen).toBe(true)
  })
})

