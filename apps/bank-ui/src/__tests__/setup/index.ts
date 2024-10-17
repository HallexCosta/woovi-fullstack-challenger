import '@testing-library/jest-dom/vitest'
import '@testing-library/user-event'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

var global = global ?? window

global.IS_REACT_ACT_ENVIRONMENT = true
// replace jest api to vitest api
global.jest = vi
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})
afterEach(() => {
  cleanup()
})