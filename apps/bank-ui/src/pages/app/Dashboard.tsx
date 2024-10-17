/// <reference types="vite-plugin-svgr/client" />
import { Container } from '@/components/Container'
import { TableListTransactions } from '@/components/transaction/TableListTransactions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToggleTheme } from '@/hooks/useToggleTheme'
import { Icon } from '@iconify/react'
import { graphql, useLazyLoadQuery } from 'react-relay'

import { AccountBalanceInformationCard } from '@/components/account/AccountBalanceInformationCard'
import { PixTransactionsChart } from '@/components/transaction/PixTransactionsChart'
import { PixTransactionSkeleton } from '@/components/transaction/PixTransactionsSkeleton'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Toaster } from '@/components/ui/sonner'
import { UserMenuProfile } from '@/components/user/UserMenuProfile'
import { useUserAuth } from '@/hooks/useUserAuth/index.ts'
import { Suspense } from 'react'
import type { DashboardQuery } from './__generated__/DashboardQuery.graphql'

export const Dashboard = () => {
  const { toggleTheme } = useToggleTheme()
  const { accountPublicId, isAuthPending } = useUserAuth()

  if (!accountPublicId) {
    return <div data-testid="user-not-logged">User not logged</div>
  }

  const dashboardQuery = useLazyLoadQuery<DashboardQuery>(
    graphql`
	    query DashboardQuery($accountPublicId: Int!) {
	      __id
	      ...AccountBalanceInformationCard_query @arguments(accountPublicId: $accountPublicId)
        # ...AccountBalanceInformationCardAccounts_query
        ...UserMenuProfile_query @arguments(accountPublicId: $accountPublicId)
	      # accountByPublicId(publicId: $accountPublicId) {
	      #   ...UserMenuProfile_accounts
	      #   ...CreateTransactionModal_accounts
	      # }
	      ...TableListTransactions_transactions @arguments(accountPublicId: $accountPublicId)
        ...PixTransactionsChart_query @arguments(accountPublicId: $accountPublicId)
	    }
	  `,
    {
      accountPublicId
    },
    { fetchPolicy: 'network-only' }
  )

  return (
    <>
      <header className="border bottom-1">
        <Container className="my-4">
          <div className="flex flex-row justify-between  p-4 gap-8">
            <div className="flex flex-row gap-2 items-center justify-center">
              <Icon
                className="hidden md:block"
                width={24}
                height={24}
                icon="mdi:cash"
                color="#03d69d"
              />
              <h2 className="text-xl  md:text-2xl font-['Inter'] text-[#03d69d] font-bold">
                Woovi Bank
              </h2>
            </div>

            <div className="flex flex-row gap-2 items-center justify-center">
              {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
              <div
                onClick={toggleTheme}
                className="rounded p-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <Icon width={24} height={24} icon="ph:moon" />
              </div>

              <div className="rounded p-3 hover:bg-zinc-100 dark:hover:bg-zinc-900">
                <Icon width={24} height={24} icon="lucide:signal" />
              </div>

              <UserMenuProfile dashboardQuery={dashboardQuery} />
            </div>
          </div>
        </Container>
      </header>

      <Container className="md:mt-5">
        <main className="flex flex-col p-4 gap-8">
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {/* <div className="grid lg:grid-row-2 gap-2"> */}
            <AccountBalanceInformationCard
              className="row-span-1 h-fit"
              appQuery={dashboardQuery}
            />

            <Card className="p-6 w-full border border-dashed flex items-center justify-center">
              <h1 className="font-['Inter'] text-3xl md:text-5xl font-semibold text-muted">
                Soon coming
              </h1>
            </Card>

            <Card className="p-6 w-full border border-dashed flex items-center justify-center">
              <h1 className="font-['Inter'] text-3xl md:text-5xl font-semibold text-muted">
                Soon coming
              </h1>
            </Card>

            {/* <div className="row-span-1" /> */}
            {/* </div> */}
          </section>

          <Suspense fallback={<PixTransactionSkeleton />}>
            <PixTransactionsChart dashboardQuery={dashboardQuery} />
          </Suspense>

          {/* <section className="grid grid-cols-1">
						<PixTransactionChart />
					</section> */}

          <section className="mb-14">
            <Card>
              <CardHeader>
                <CardTitle className="font-['Inter']">
                  Recent Transactions
                </CardTitle>
              </CardHeader>

              <CardContent>
                <TableListTransactions
                  appQuery={dashboardQuery}
                  filters={{
                    accountPublicId
                  }}
                />
              </CardContent>
            </Card>
          </section>
        </main>
      </Container>

      <Toaster position="top-right" />
    </>
  )
}
