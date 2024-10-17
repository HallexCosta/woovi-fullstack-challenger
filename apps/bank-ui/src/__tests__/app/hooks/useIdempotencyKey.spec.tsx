import { render, userEvent } from '@/__tests__/setup/utils/AllProviders'
import { useIdempotencyKey } from '@/hooks/useIdempotencyKey'
import { describe, expect, it, vi } from 'vitest'

const { v4: mockV4 } = vi.hoisted(() => {
  return {
    v4: vi.fn(() => 'random-uuid-v4')
  }
})

vi.mock('uuid', async () => {
  const mod = await import('uuid')
  return {
    ...mod,
    v4: mockV4
  }
})

const App = () => {
  const { idempotencyKey, setIdempotencyKey, generateNewIdempotencyKey } =
    useIdempotencyKey()

  const changeIdempotencyKey = () =>
    setIdempotencyKey(generateNewIdempotencyKey())

  return (
    <div>
      {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
      <button
        onClick={changeIdempotencyKey}
        data-testid="generate-new-idempotency-key"
      >
        Generate new idempotency key
      </button>
      <p data-testid="idempotency-key">{idempotencyKey ?? ''}</p>
    </div>
  )
}
describe('useIdempotencyKey', () => {
  it('setIdempotencyKey change the value from idempotencyKey', async () => {
    const { findByTestId, debug } = render(<App />)

    expect((await findByTestId('idempotency-key')).innerHTML).toBe('')

    await userEvent.click(await findByTestId('generate-new-idempotency-key'))

    expect((await findByTestId('idempotency-key')).innerHTML).toBe(
      'random-uuid-v4'
    )

    debug()
  })
})
