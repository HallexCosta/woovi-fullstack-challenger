import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { useUserAuth } from '@/hooks/useUserAuth'
import { cn, integerValueToBRL } from '@/lib/utils'
import { Icon } from '@iconify/react/dist/iconify.js'
import { graphql, useRefetchableFragment } from 'react-relay'
import { CreateTransactionModal } from '../transaction/mutation/CreateTransactionModal'
import { Button } from '../ui/button'
import type { AccountBalanceInformationCard_query$key } from './__generated__/AccountBalanceInformationCard_query.graphql'

type AccountBalanceInformationCardProps = {
  appQuery: AccountBalanceInformationCard_query$key | null
  className?: string
}
export const AccountBalanceInformationCard = (
  props: AccountBalanceInformationCardProps
) => {
  const { accountPublicId } = useUserAuth()
  const [accountQuery, refetchBalanceAccount] = useRefetchableFragment(
    graphql`
    fragment AccountBalanceInformationCard_query on Query 
    @argumentDefinitions(accountPublicId: { type: Int })
    @refetchable(queryName: "CreateTransactionRefechQuery") {
      accountByPublicId(publicId: $accountPublicId) {
        node {
          balance
          ...CreateTransactionModal_accounts
        }
      }
      accounts {
        pageInfo {
          hasNextPage
        }
        ...CreateTransactionModalListAccounts_accounts
      }
    }  
  `,
    props.appQuery
  )

  console.log({ myBalance: accountQuery?.accountByPublicId?.node?.balance })

  return (
    <Card className={cn('border', props.className)}>
      <CardHeader className="flex">
        <CardTitle className="font-['Inter'] text-3xl font-semibold">
          Balance Account
        </CardTitle>
        <CardDescription className="flex flex-col">
          <span
            data-testid="balance-amount"
            className="font-['Inter'] text-3xl md:text-5xl font-semibold"
          >
            {integerValueToBRL(
              accountQuery?.accountByPublicId?.node?.balance ?? 0
            )}
          </span>
          <span className="font-['Inter'] text-base font-normal">
            Avaible Balance
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-row justify-between">
        <div className="flex flex-row gap-1 items-center justify-center">
          <CreateTransactionModal
            accountBalanceInformationCardFragment={
              accountQuery?.accountByPublicId?.node ?? null
            }
            accountsQueryFragment={accountQuery?.accounts ?? null}
            onUpdateBalanceAccount={() => {
              console.log('refech balance account')
              refetchBalanceAccount(
                { publicId: accountPublicId },
                { fetchPolicy: 'store-and-network' }
              )
            }}
          />
        </div>

        <div className="flex flex-row gap-1 items-center justify-center">
          <Button variant="link" size="sm" className="gap-1 font-['Inter']">
            <Icon width={16} height={16} icon="mdi:bell-outline" />
            Pay bills
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
