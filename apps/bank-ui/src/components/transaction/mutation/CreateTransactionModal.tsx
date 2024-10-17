import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useQueryParams } from '@/hooks/useQueryParams'
import { Icon } from '@iconify/react/dist/iconify.js'
import { useCallback, useEffect, useState } from 'react'
import { graphql, useFragment } from 'react-relay'
import { useLocation, useNavigate } from 'react-router-dom'
import { PixTransferReceipt } from '../PixTransferReceipt'
import { usePixTransferReceipt } from '../hooks/usePixTransferReceipt'
import { CreateTransactionForm } from './CreateTransactionForm'
import type { CreateTransactionModalListAccounts_accounts$key } from './__generated__/CreateTransactionModalListAccounts_accounts.graphql'
import type { CreateTransactionModal_accounts$key } from './__generated__/CreateTransactionModal_accounts.graphql'
import type { CreateTransactionMutation$data } from './__generated__/CreateTransactionMutation.graphql'

type CreateTransactionModalProps = {
  accountBalanceInformationCardFragment: CreateTransactionModal_accounts$key | null
  accountsQueryFragment: CreateTransactionModalListAccounts_accounts$key | null
  onUpdateBalanceAccount: () => void
}

export const CreateTransactionModal = (props: CreateTransactionModalProps) => {
  const createTransactionModalFragment = useFragment(
    graphql`
			fragment CreateTransactionModal_accounts on Account {
				...CreateTransactionForm_accounts
			}  
		`,
    props.accountBalanceInformationCardFragment
  )

  const listAccountsModalFragment = useFragment(
    graphql`
			fragment CreateTransactionModalListAccounts_accounts on AccountConnection {
        ...CreateTransactionFormListAccounts_accounts
			}
		`,
    props.accountsQueryFragment
  )

  const navigate = useNavigate()

  const { lastCreateTransaction, setLastCreatTransaction } =
    usePixTransferReceipt()

  const { openCreateTransacionModal } = useQueryParams()
  const [dialogOpen, setDialogOpen] = useState(openCreateTransacionModal)

  useEffect(() => {
    console.log({ lastCreateTransaction })
  }, [lastCreateTransaction])

  const closeCreateTransactionDialog = () => {
    setDialogOpen(false)

    return true
  }

  const handleOnOpenChange = (state: boolean) => {
    if (!state) {
      setLastCreatTransaction(null)
    }
    setDialogOpen(state)

    navigate(`?openCreateTransacionModal=${state}`)
    console.log({ openCreateTransacionModal })
  }

  useEffect(() => {
    setDialogOpen(openCreateTransacionModal)
  }, [openCreateTransacionModal])

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOnOpenChange}>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="gap-1">
          <Icon width={16} height={16} icon="mingcute:move-line" />
          Transfer
        </Button>
      </DialogTrigger>
      <DialogContent>
        {lastCreateTransaction ? (
          <PixTransferReceipt
            className="border-none"
            amount={lastCreateTransaction?.transactionEdge?.node?.amount ?? 0}
            date={
              lastCreateTransaction?.transactionEdge?.node?.createdAt.slice(
                0,
                10
              ) ?? ''
            }
            time={
              lastCreateTransaction?.transactionEdge?.node?.createdAt.slice(
                11,
                19
              ) ?? ''
            }
            transactionId={
              lastCreateTransaction?.transactionEdge?.node?.publicId ?? ''
            }
            userDestination={{
              name:
                lastCreateTransaction?.transactionEdge?.node
                  ?.destinationReceiverAccount?.user?.fullName ?? '',
              pixKey:
                lastCreateTransaction?.transactionEdge?.node
                  ?.destinationReceiverAccount?.user?.pixKey ?? '',
              photo:
                lastCreateTransaction?.transactionEdge?.node
                  ?.destinationReceiverAccount?.user?.profileImage ?? ''
            }}
            userOrigin={{
              name:
                lastCreateTransaction?.transactionEdge?.node
                  ?.originSenderAccount?.user?.fullName ?? '',
              pixKey:
                lastCreateTransaction?.transactionEdge?.node
                  ?.originSenderAccount?.user?.pixKey ?? '',
              photo:
                lastCreateTransaction?.transactionEdge?.node
                  ?.originSenderAccount?.user?.profileImage ?? ''
            }}
            showConfirmationIcon={true}
          />
        ) : (
          <div data-testid="createTransferDialog">
            <DialogHeader>
              <DialogTitle>Create transfer</DialogTitle>
              <DialogDescription>
                Make transfer to another accounts here. Click send when you're
                done.
              </DialogDescription>
            </DialogHeader>

            <CreateTransactionForm
              createTransactionModalFragment={createTransactionModalFragment}
              createTransactionModalListAccountsFragment={
                listAccountsModalFragment
              }
              onUpdateBalanceAccount={props.onUpdateBalanceAccount}
              closeCreateTransactionDialog={closeCreateTransactionDialog}
              onTransactionCreated={(transaction) => {
                setLastCreatTransaction(transaction)
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
