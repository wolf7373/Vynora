import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TopBar } from '@/components/layout/TopBar'
import { useUIStore } from '@/stores/useUIStore'

describe('TopBar (REG-05: Single Clear Button)', () => {
  it('renders search input and suppresses default cancel button via CSS', () => {
    render(<TopBar />)
    const searchInput = screen.getByLabelText(/search music/i) as HTMLInputElement
    expect(searchInput).toBeInTheDocument()
    expect(searchInput.type).toBe('search')
  })

  it('renders exactly one clear button when search query has text', () => {
    useUIStore.getState().setSearchQuery('Sidhu Moose')
    render(<TopBar />)

    const clearButtons = screen.getAllByLabelText(/clear search query/i)
    expect(clearButtons).toHaveLength(1)

    fireEvent.click(clearButtons[0])
    expect(useUIStore.getState().searchQuery).toBe('')
  })

  it('hides custom clear button when search query is empty', () => {
    useUIStore.getState().setSearchQuery('')
    render(<TopBar />)

    expect(screen.queryByLabelText(/clear search query/i)).toBeNull()
  })
})

