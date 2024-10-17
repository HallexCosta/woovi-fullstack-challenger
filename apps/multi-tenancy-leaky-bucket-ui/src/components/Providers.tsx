import { environment } from '@/relay/environment'
import { Suspense } from 'react'
import { useCookies } from 'react-cookie'
import { RelayEnvironmentProvider } from 'react-relay'
import { ThemeProvider } from './ThemeProvider'
// import { TransactionConnectionProvider } from './transaction/TransactionConnectionProvider'
import { LoadingSpinner } from './ui/loading-spinner'

type ProvidersProps = {
  children: React.ReactNode
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense
        fallback={
          <div className="absolute left-[45%] top-1/3">
            <LoadingSpinner className="w-32 h-32" />
          </div>
        }
      >
        <ThemeProvider defaultTheme="dark">
          {/* <UserAuthenticatedProvider> */}
          {/* <TransactionConnectionProvider> */}
          {children}
          {/* </TransactionConnectionProvider> */}
          {/* </UserAuthenticatedProvider> */}
        </ThemeProvider>
      </Suspense>
    </RelayEnvironmentProvider>
  )
}
