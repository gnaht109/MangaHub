import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.resetAllMocks()   // clears calls and per-test implementations of vi.fn / vi.mock functions
  vi.restoreAllMocks() // puts spied globals such as fetch back
})
