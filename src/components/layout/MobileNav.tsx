import React from 'react'
import { Home, Search, Library, Disc3, Tv } from 'lucide-react'
import { useUIStore } from '@/stores/useUIStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import type { NavTab } from '@/types'

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, isMobileDrawerOpen, setIsMobileDrawerOpen } = useUIStore()
  const { currentTrack, isPlaying } = usePlayerStore()

  const tabs: { tab: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { tab: 'home', label: 'Home', icon: Home },
    { tab: 'search', label: 'Search', icon: Search },
    { tab: 'library', label: 'Library', icon: Library },
    { tab: 'visualizer', label: 'Studio', icon: Disc3 },
  ]

  const handleOpenNowPlaying = () => {
    setIsMobileDrawerOpen(true)
  }

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden min-h-[4rem] h-auto bg-vyn-surface/95 border-t border-vyn-border flex items-center justify-around px-2 z-50 select-none pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-lg"
    >
      {tabs.map((item) => {
        const Icon = item.icon
        const isActive = activeTab === item.tab
        return (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`min-h-[44px] min-w-[44px] flex-1 py-1 flex flex-col items-center justify-center transition-all ${
              isActive ? 'text-vyn-primary font-semibold' : 'text-vyn-muted hover:text-vyn-high'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] capitalize">{item.label}</span>
          </button>
        )
      })}

      {/* Now Playing / Stream drawer toggle for mobile */}
      <button
        onClick={handleOpenNowPlaying}
        aria-label="Now Playing View"
        className={`min-h-[44px] min-w-[44px] flex-1 py-1 flex flex-col items-center justify-center transition-all ${
          isMobileDrawerOpen ? 'text-vyn-primary font-semibold' : 'text-vyn-muted hover:text-vyn-high'
        }`}
      >
        <div className="relative">
          <Tv className="w-5 h-5 mb-0.5" />
          {isPlaying && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-vyn-primary animate-ping" />
          )}
        </div>
        <span className="text-[10px]">{currentTrack ? 'Playing' : 'Media'}</span>
      </button>
    </nav>
  )
}
