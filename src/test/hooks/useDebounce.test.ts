import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/useDebounce'

describe('useDebounce (200ms Search Throttle)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('delays updating value until debounce delay has elapsed', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 200), {
      initialProps: { val: 'initial' },
    })

    expect(result.current).toBe('initial')

    // Rerender with new value
    rerender({ val: 'updated query' })
    // Before timer fires, value is still 'initial'
    expect(result.current).toBe('initial')

    // Fast-forward 100ms (not yet 200ms)
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current).toBe('initial')

    // Fast-forward another 100ms (total 200ms)
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current).toBe('updated query')
  })
})

