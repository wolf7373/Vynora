import React from 'react'
import { VynoraLogo } from './VynoraLogo'
import { useUIStore } from '@/stores'
import type { NavTab } from '@/types'

const NAV_TABS: NavTab[] = ['home', 'search', 'library', 'visualizer']

export const Header: React.FC = () => {
  const { activeTab, setActiveTab } = useUIStore()

  return (
    <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 liquid-glass-pane sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <VynoraLogo className="w-8 h-8" />
        <div>
          <h1 className="text-base font-bold font-display tracking-widest bg-gradient-to-r from-amber-300 via-rose-300 to-cyan-300 bg-clip-text text-transparent">
            VYNORA
          </h1>
          <p className="text-[10px] text-white/60 tracking-wider uppercase">Liquid Glass Studio • M1 Online</p>
        </div>
      </div>

      <nav className="flex items-center gap-1.5 liquid-glass-pane p-1.5 rounded-2xl border border-white/15">
        {NAV_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`min-h-[44px] min-w-[44px] px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 capitalize flex items-center justify-center cursor-pointer ${
              activeTab === tab
                ? 'bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 shadow-md font-bold'
                : 'text-white/60 hover:text-white liquid-glass-pill'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>
    </header>
  )
}

