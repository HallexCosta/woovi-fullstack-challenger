import { mockEnvironment, render } from '@/__tests__/setup/utils/AllProviders'
import { AccountBalanceInformationCard } from '@/components/account/AccountBalanceInformationCard'
import { useLazyLoadQuery } from 'react-relay'
import { graphql } from 'relay-runtime'
import { describe, expect, it, vi } from 'vitest'

import { Dashboard } from '@/pages/app/Dashboard'
import { MockPayloadGenerator } from 'relay-test-utils'
import { MemoryRouterProvider } from '../setup/utils/MemoryRouterProvider'
import DashboardSpecQuery from './__generated__/DashboardSpecQuery.graphql'

const { mockUseUserAuth } = vi.hoisted(() => {
  const mockUseUserAuth = vi.fn().mockReturnValue({
    accountPublicId: 1234567,
    publicId: 1234567,
    isAuthPending: true
  })
  return {
    mockUseUserAuth
  }
})

vi.mock('@/hooks/useUserAuth', async () => {
  const mod = await import('@/hooks/useUserAuth')
  return {
    ...mod,
    useUserAuth: mockUseUserAuth
  }
})

const {
  useNavigate: mockUseNavigate,
  navigate: mockNavigate,
  mockUseSearchParams,
  mockQuery
} = vi.hoisted(() => {
  const navigate = vi.fn().mockReturnThis()
  const mockQuery = vi.fn().mockReturnThis()
  return {
    useNavigate: vi.fn().mockReturnValue(navigate),
    navigate,
    mockUseSearchParams: vi.fn().mockRejectedValue([mockQuery]),
    mockQuery
  }
})

vi.mock('react-router-dom', async () => {
  const mod = await import('react-router-dom')
  return {
    ...mod,
    useNavigate: mockUseNavigate
  }
})

const { useCookies: mockUseCookies, mockSetCookie } = await vi.hoisted(
  async () => {
    vi.resetModules()

    const mockSetCookie = vi.fn().mockReturnThis()
    return {
      useCookies: vi.fn().mockReturnValue([
        {
          token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdWJsaWNJZCI6MTIzNDU2NzgsImFjY291bnRQdWJsaWNJZCI6MTIzNDU2NzgsImlhdCI6MTUxNjIzOTAyMn0.Fbi54oQIQ0r73iDftosn-UT9UZnxgIvwiJVY_uu1A8Q'
        },
        mockSetCookie
      ]),
      mockSetCookie
    }
  }
)
vi.mock('react-cookie', async () => {
  const actual = await import('react-cookie')
  return {
    ...actual,
    useCookies: mockUseCookies
  }
})

describe('Dashboard', () => {
  describe('Ensure view dashboard only user is loggeed to view this page', async () => {
    mockUseUserAuth.mockRejectedValue({
      accountPublicId: null,
      publicId: 1234567,
      isAuthPending: true
    })

    const { findByTestId } = render(<Dashboard />)
    expect(mockUseUserAuth).toHaveBeenCalled()

    expect(await findByTestId('user-not-logged')).toBeInTheDocument()
  })

  describe('AccountBalanceInformationCard', () => {
    it('should display balance account from current user logged', async () => {
      // Mock App component that loads the query using Relay
      const App = () => {
        const appQuery = useLazyLoadQuery(
          graphql`
            query DashboardSpecQuery @relay_test_operation {
              ...AccountBalanceInformationCard_query
            }
          `,
          {},
          { fetchPolicy: 'store-and-network' }
        )
        return <AccountBalanceInformationCard appQuery={appQuery} />
      }

      mockEnvironment.mock.queuePendingOperation(DashboardSpecQuery, {
        input: {
          accountPublicId: 1234568
        }
      })
      const customMockResolvers = {
        Query: () => ({
          accountByPublicId: {
            node: {
              balance: 100 * 1000
            }
          }
        })
      }
      mockEnvironment.mock.queueOperationResolver((operation) =>
        MockPayloadGenerator.generate(operation, customMockResolvers)
      )

      const { debug, findByTestId } = render(
        <MemoryRouterProvider defaultElement={<App />} />
      )
      expect(mockUseUserAuth).toHaveBeenCalled()

      // Test that the balance is correctly displayed
      expect(await findByTestId('balance-amount')).toHaveTextContent(
        'R$ 1.000,00'
      )

      debug()
    })
  })
})
