import { toast } from 'sonner'
import { afterEach, expect, test, vi } from 'vitest'

var hoisteds = {}
export const createMock = (path: string) => async (hoisted: any) => {
  hoisteds[path] = hoisted
  const mockHoisted = await vi.hoisted(() => {
    vi.resetModules()
    return hoisteds[path]
  })

  const actual = await import(path)

  return {
    ...actual,
    ...mockHoisted
  }
}
