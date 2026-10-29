import { useEffect } from 'react'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { PlaybackAdapterManager } from '@/adapters'

/**
 * REG-06: Global Keyboard Shortcuts with strict input typing collision suppression.
 * Space: Play/Pause, ArrowRight: +5s, ArrowLeft: -5s, M: Toggle Mute
 */
export function useGlobalShortcuts(): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // REG-06: Check target element to prevent collision with input and textarea
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }

      const adapterManager = PlaybackAdapterManager.getInstance()
      const { isPlaying, currentTime, toggleMute } = usePlayerStore.getState()

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          if (isPlaying) {
            adapterManager.pause()
          } else {
            adapterManager.play()
          }
          break

        case 'ArrowRight':
          e.preventDefault()
          adapterManager.seek(currentTime + 5)
          break

        case 'ArrowLeft':
          e.preventDefault()
          adapterManager.seek(Math.max(0, currentTime - 5))
          break

        case 'KeyM':
          e.preventDefault()
          toggleMute()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
}

