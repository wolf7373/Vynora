/**
 * Formats seconds into mm:ss or hh:mm:ss format.
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00'
  const totalSeconds = Math.floor(seconds)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const remainingSecs = totalSeconds % 60

  const paddedSecs = remainingSecs < 10 ? `0${remainingSecs}` : `${remainingSecs}`

  if (hours > 0) {
    const paddedMins = minutes < 10 ? `0${minutes}` : `${minutes}`
    return `${hours}:${paddedMins}:${paddedSecs}`
  }

  return `${minutes}:${paddedSecs}`
}

