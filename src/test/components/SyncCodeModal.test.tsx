import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SyncCodeModal } from '../../components/sync/SyncCodeModal'

describe('SyncCodeModal UI Component (Milestone 7)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    })
  })

  it('renders modal dialog when isOpen is true', () => {
    render(<SyncCodeModal isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: /cross-device sync/i })).toBeInTheDocument()
    expect(screen.getByText(/Vynora Sync/i)).toBeInTheDocument()
    expect(screen.getByText(/Share Device/i)).toBeInTheDocument()
    expect(screen.getByText(/Connect Code/i)).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    const { container } = render(<SyncCodeModal isOpen={false} onClose={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('displays a 6-character code formatted as XXX-XXX on share tab', () => {
    render(<SyncCodeModal isOpen={true} onClose={vi.fn()} />)
    const codeDisplay = screen.getByText(/^[A-Z0-9]{3}-[A-Z0-9]{3}$/)
    expect(codeDisplay).toBeInTheDocument()
  })

  it('copies code to clipboard when copy button is clicked', async () => {
    render(<SyncCodeModal isOpen={true} onClose={vi.fn()} />)
    const copyButton = screen.getByRole('button', { name: /copy sync code/i })
    expect(copyButton).toBeInTheDocument()

    fireEvent.click(copyButton)
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1)
  })

  it('switches to Connect Code tab and validates short code input', async () => {
    render(<SyncCodeModal isOpen={true} onClose={vi.fn()} />)
    const connectTabButton = screen.getByRole('button', { name: /connect code/i })
    fireEvent.click(connectTabButton)

    const input = screen.getByPlaceholderText(/VYN-742/i)
    expect(input).toBeInTheDocument()

    const submitBtn = screen.getByRole('button', { name: /pair/i })
    // Type invalid code (too short)
    fireEvent.change(input, { target: { value: '123' } })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid 6-character sync code/i)
      ).toBeInTheDocument()
    })
  })

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = vi.fn()
    render(<SyncCodeModal isOpen={true} onClose={onCloseMock} />)
    const closeBtn = screen.getByRole('button', { name: /close sync modal/i })
    fireEvent.click(closeBtn)
    expect(onCloseMock).toHaveBeenCalledTimes(1)
  })
})

