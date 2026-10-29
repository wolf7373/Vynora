/**
 * Inspects a local audio file and extracts its duration using an offscreen HTML5 Audio element.
 */
export function extractAudioFileDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    let resolved = false
    const safeResolve = (dur: number) => {
      if (resolved) return
      resolved = true
      clearTimeout(timer)
      cleanup()
      resolve(dur)
    }

    const timer = setTimeout(() => {
      safeResolve(180)
    }, 100)

    if (typeof window === 'undefined' || !window.URL) {
      safeResolve(180)
      return
    }

    let objectUrl = ''
    try {
      objectUrl = URL.createObjectURL(file)
    } catch {
      safeResolve(180)
      return
    }

    const audio = new Audio()
    audio.preload = 'metadata'

    const cleanup = () => {
      try {
        if (objectUrl) URL.revokeObjectURL(objectUrl)
      } catch {
        // ignore
      }
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('error', onError)
    }

    const onLoaded = () => {
      const dur = !isNaN(audio.duration) && audio.duration > 0 ? audio.duration : 180
      safeResolve(dur)
    }

    const onError = () => {
      safeResolve(180)
    }

    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('error', onError)
    audio.src = objectUrl
  })
}
