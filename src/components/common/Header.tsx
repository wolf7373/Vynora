import React from 'react'
import { VynoraLogo } from './VynoraLogo'
import { useUIStore } from '@/stores'
import type { NavTab } from '@/types'

const NAV_TABS: NavTab[] = ['home', 'search', 'library', 'visualizer']

export const Header: React.FC = () => {
  const { activeTab, setActiveTab } = useUIStore()

  return (
    <header className="h-16 border-b border-vyn-border flex items-center justify-between px-6 bg-vyn-surface/60 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <VynoraLogo className="w-8 h-8" />
        <div>
          <h1 className="text-base font-bold font-display tracking-widest bg-gradient-to-r from-vyn-primary via-vyn-secondary to-vyn-accent bg-clip-text text-transparent">
            VYNORA
          </h1>
          <p className="text-[10px] text-vyn-muted tracking-wider uppercase">3D Audio Studio • M1 Online</p>
        </div>
      </div>

      <nav className="flex items-center gap-1 bg-vyn-elevated/70 p-1 rounded-lg border border-vyn-border">
        {NAV_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`min-h-[44px] min-w-[44px] px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 capitalize flex items-center justify-center ${
              activeTab === tab
                ? 'bg-vyn-primary text-vyn-canvas shadow-glow-cyan font-semibold'
                : 'text-vyn-muted hover:text-vyn-high hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>
    </header>
  )
}

