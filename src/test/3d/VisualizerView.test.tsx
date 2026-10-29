import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VisualizerView } from '../../components/views/VisualizerView'

describe('VisualizerView UI Component (Milestone 8)', () => {
  it('renders mode selectors for Turntable, Waves, and Tunnel', () => {
    render(<VisualizerView />)

    expect(screen.getByText(/Audio Reactive Visualizer/i)).toBeInTheDocument()
    expect(screen.getByText(/33 RPM Turntable/i)).toBeInTheDocument()
    expect(screen.getByText(/Particle Waves/i)).toBeInTheDocument()
    expect(screen.getByText(/Cyber Tunnel/i)).toBeInTheDocument()
  })

  it('displays REG-08 compliance badge (REAL FFT or BEAT SIM)', () => {
    render(<VisualizerView />)
    const badge = screen.getByText(/(REAL FFT|BEAT SIM) \(64-BIN\)/i)
    expect(badge).toBeInTheDocument()
  })

  it('switches visualizer modes smoothly on button click', () => {
    render(<VisualizerView />)
    const wavesButton = screen.getByRole('button', { name: /particle waves/i })
    fireEvent.click(wavesButton)
    expect(wavesButton).toHaveClass('bg-vyn-primary')
  })

  it('switches quality presets between High, Balanced, and Low', () => {
    render(<VisualizerView />)
    const balancedBtn = screen.getByRole('button', { name: /balanced/i })
    fireEvent.click(balancedBtn)
    expect(balancedBtn).toHaveClass('bg-white/10')
  })
})

