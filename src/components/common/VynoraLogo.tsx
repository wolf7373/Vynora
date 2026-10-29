import React from 'react'

interface VynoraLogoProps {
  className?: string
  size?: number
}

export const VynoraLogo: React.FC<VynoraLogoProps> = ({ className = 'w-8 h-8', size }) => {
  return (
    <div className={`flex-shrink-0 ${className}`} style={size ? { width: size, height: size } : undefined}>
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="vynoraGradientLogo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F2FE" />
            <stop offset="50%" stopColor="#4FACFE" />
            <stop offset="100%" stopColor="#7F00FF" />
          </linearGradient>
        </defs>
        {/* Stylized Outer Audio Wave Arc */}
        <path
          d="M15 25 C15 65, 50 90, 50 90 C50 90, 85 65, 85 25"
          stroke="url(#vynoraGradientLogo)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Middle Vinyl Groove */}
        <path
          d="M28 32 C28 60, 50 76, 50 76 C50 76, 72 60, 72 32"
          stroke="url(#vynoraGradientLogo)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />
        {/* Center Play/Stylus Glyph */}
        <polygon points="44,38 64,50 44,62" fill="url(#vynoraGradientLogo)" />
      </svg>
    </div>
  )
}

