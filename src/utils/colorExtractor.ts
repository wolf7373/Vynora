// Intelligent Canvas Color Thief for Dynamic Background Gradients & Ambient Glow

export interface ExtractedPalette {
  primary: string
  secondary: string
  darkAccent: string
  gradient: string
  glowColor: string
}

const colorCache = new Map<string, ExtractedPalette>()

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = Math.max(0, Math.min(255, x)).toString(16)
        return hex.length === 1 ? '0' + hex : hex
      })
      .join('')
  )
}

export function createPaletteFromHex(hex: string): ExtractedPalette {
  const clean = hex.replace('#', '')
  const num = parseInt(clean, 16) || 0x00f2fe

  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255

  const primary = rgbToHex(r, g, b)
  const secondary = rgbToHex(Math.round(r * 0.45), Math.round(g * 0.45), Math.round(b * 0.45))
  const darkAccent = rgbToHex(Math.round(r * 0.15), Math.round(g * 0.15), Math.round(b * 0.15))

  return {
    primary,
    secondary,
    darkAccent,
    gradient: `radial-gradient(circle at 50% 28%, rgba(${r},${g},${b},0.35) 0%, rgba(13,17,23,0.92) 65%, #05070a 100%)`,
    glowColor: `rgba(${r},${g},${b},0.5)`,
  }
}

export function extractColorFromImage(
  imageUrl?: string,
  fallbackHex: string = '#00F2FE'
): Promise<ExtractedPalette> {
  if (!imageUrl) {
    return Promise.resolve(createPaletteFromHex(fallbackHex))
  }

  if (colorCache.has(imageUrl)) {
    return Promise.resolve(colorCache.get(imageUrl)!)
  }

  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof Image === 'undefined') {
      resolve(createPaletteFromHex(fallbackHex))
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = imageUrl

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = 64
        canvas.height = 64
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(createPaletteFromHex(fallbackHex))
          return
        }

        ctx.drawImage(img, 0, 0, 64, 64)
        const data = ctx.getImageData(0, 0, 64, 64).data

        let r = 0
        let g = 0
        let b = 0
        let count = 0

        for (let i = 0; i < data.length; i += 16) {
          const pr = data[i]
          const pg = data[i + 1]
          const pb = data[i + 2]
          const brightness = (pr * 299 + pg * 587 + pb * 114) / 1000

          if (brightness > 25 && brightness < 235) {
            r += pr
            g += pg
            b += pb
            count++
          }
        }

        if (count === 0) {
          resolve(createPaletteFromHex(fallbackHex))
          return
        }

        const avgR = Math.round(r / count)
        const avgG = Math.round(g / count)
        const avgB = Math.round(b / count)

        const primaryHex = rgbToHex(avgR, avgG, avgB)
        const palette: ExtractedPalette = {
          primary: primaryHex,
          secondary: rgbToHex(Math.round(avgR * 0.45), Math.round(avgG * 0.45), Math.round(avgB * 0.45)),
          darkAccent: rgbToHex(Math.round(avgR * 0.15), Math.round(avgG * 0.15), Math.round(avgB * 0.15)),
          gradient: `radial-gradient(circle at 50% 28%, rgba(${avgR},${avgG},${avgB},0.42) 0%, rgba(13,17,23,0.92) 65%, #05070a 100%)`,
          glowColor: `rgba(${avgR},${avgG},${avgB},0.55)`,
        }

        colorCache.set(imageUrl, palette)
        resolve(palette)
      } catch {
        resolve(createPaletteFromHex(fallbackHex))
      }
    }

    img.onerror = () => {
      resolve(createPaletteFromHex(fallbackHex))
    }
  })
}

