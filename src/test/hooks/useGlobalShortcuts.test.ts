import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { PlaybackAdapterManager } from '@/adapters'

describe('REG-06: Global Keyboard Shortcuts & Input Collision Suppression', () => {
  beforeEach(() => {
    usePlayerStore.getState().resetPlayer()
  })

  it('triggers Space for play/pause when typing outside input fields', () => {
    renderHook(() => useGlobalShortcuts())
    const adapterManager = PlaybackAdapterManager.getInstance()
    const playSpy = vi.spyOn(adapterManager, 'play').mockResolvedValue()

    // Dispatch Space keydown on window
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', bubbles: true }))

    expect(playSpy).toHaveBeenCalled()
  })

  it('REG-06: SUPPRESSES shortcuts when user is typing inside an HTML input element', () => {
    renderHook(() => useGlobalShortcuts())
    const adapterManager = PlaybackAdapterManager.getInstance()
    const playSpy = vi.spyOn(adapterManager, 'play')

    const input = document.createElement('input')
    document.body.appendChild(input)

    // Dispatch Space keydown targeting the input element
    const event = new KeyboardEvent('keydown', { code: 'Space', bubbles: true })
    Object.defineProperty(event, 'target', { value: input, enumerable: true })
    window.dispatchEvent(event)

    expect(playSpy).not.toHaveBeenCalled()
    document.body.removeChild(input)
  })

  it('REG-06: SUPPRESSES shortcuts when user is typing inside a textarea element', () => {
    renderHook(() => useGlobalShortcuts())
    const adapterManager = PlaybackAdapterManager.getInstance()
    const seekSpy = vi.spyOn(adapterManager, 'seek')

    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)

    const event = new KeyboardEvent('keydown', { code: 'ArrowRight', bubbles: true })
    Object.defineProperty(event, 'target', { value: textarea, enumerable: true })
    window.dispatchEvent(event)

    expect(seekSpy).not.toHaveBeenCalled()
    document.body.removeChild(textarea)
  })

  it('triggers ArrowRight and ArrowLeft for +/-5s seeking', () => {
    renderHook(() => useGlobalShortcuts())
    const adapterManager = PlaybackAdapterManager.getInstance()
    const seekSpy = vi.spyOn(adapterManager, 'seek')

    usePlayerStore.getState().setCurrentTime(20)

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight', bubbles: true }))
    expect(seekSpy).toHaveBeenCalledWith(25)

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft', bubbles: true }))
    expect(seekSpy).toHaveBeenCalledWith(15)
  })

  it('triggers KeyM to toggle mute', () => {
    renderHook(() => useGlobalShortcuts())
    expect(usePlayerStore.getState().isMuted).toBe(false)

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyM', bubbles: true }))
    expect(usePlayerStore.getState().isMuted).toBe(true)

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyM', bubbles: true }))
    expect(usePlayerStore.getState().isMuted).toBe(false)
  })
})

