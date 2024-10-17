import { TransactionConnectionProvider } from '@/components/transaction/TransactionConnectionProvider'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { UserAuthenticatedProvider } from '@/components/user/UserAuthenticatedProvider'
import { type RenderOptions, render } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'
import { type ReactElement, Suspense } from 'react'
import { RelayEnvironmentProvider } from 'react-relay'
import { createMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment'

type AllProvidersProps = {
  children: React.ReactNode
}

export const mockEnvironment = createMockEnvironment()
export const AllProviders = ({ children }: AllProvidersProps) => {
  return (
    <RelayEnvironmentProvider environment={mockEnvironment}>
      <Suspense fallback={<LoadingSpinner />}>
        <ThemeProvider defaultTheme="dark">
          {/* <UserAuthenticatedProvider> */}
          <TransactionConnectionProvider>
            {children}
          </TransactionConnectionProvider>
          {/* </UserAuthenticatedProvider> */}
        </ThemeProvider>
      </Suspense>
    </RelayEnvironmentProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options })

export * from '@testing-library/react'
export * from '@testing-library/user-event'
// export * from '@vitest/browser/context'

export { customRender as render }
