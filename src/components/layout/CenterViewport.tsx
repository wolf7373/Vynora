import React from 'react'
import { TopBar } from './TopBar'
import { HomeView } from '../views/HomeView'
import { SearchView } from '../views/SearchView'
import { LibraryView } from '../views/LibraryView'
import { DownloadedView } from '../views/DownloadedView'
import { VisualizerView } from '../views/VisualizerView'
import { useUIStore } from '@/stores/useUIStore'

export const CenterViewport: React.FC = () => {
  const { activeTab } = useUIStore()

  const renderView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView />
      case 'search':
        return <SearchView />
      case 'library':
        return <LibraryView />
      case 'downloaded':
        return <DownloadedView />
      case 'visualizer':
        return <VisualizerView />
      default:
        return <HomeView />
    }
  }

  return (
    <main
      id="vynora-center-viewport"
      className="flex-1 flex flex-col h-full bg-vyn-canvas overflow-y-auto overflow-x-hidden select-none"
    >
      <TopBar />
      <div className="flex-1 pb-36 md:pb-12">
        {renderView()}
      </div>
    </main>
  )
}

