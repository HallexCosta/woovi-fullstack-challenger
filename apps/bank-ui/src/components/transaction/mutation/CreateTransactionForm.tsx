import { Avatar, AvatarImage } from '@/components/ui/avatar'
import React, { useEffect, useState, useRef, startTransition } from 'react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useIdempotencyKey } from '@/hooks/useIdempotencyKey'
import { integerValueToBRL } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  type FieldErrors,
  type SubmitErrorHandler,
  useForm
} from 'react-hook-form'
import { graphql, useFragment, useMutation } from 'react-relay'
import { useRifm } from 'rifm'
import { toast } from 'sonner'
import { z } from 'zod'
import { useTransactionConnection } from '../TransactionConnectionProvider'
import { CreateTransactionMutation as CreateTransactionMutationGraphQL } from './CreateTransactionMutation'
import type { CreateTransactionModal_accounts$data } from './__generated__/CreateTransactionModal_accounts.graphql'

import { useUserAuth } from '@/hooks/useUserAuth'
import { useNavigate } from 'react-router-dom'
import type { PayloadError } from 'relay-runtime'
import { PixTransferReceipt } from '../PixTransferReceipt'
import { SelectAccountItem } from './SelectAccountItem'
import type { CreateTransactionFormListAccounts_accounts$key } from './__generated__/CreateTransactionFormListAccounts_accounts.graphql'
import type { CreateTransactionForm_accounts$key } from './__generated__/CreateTransactionForm_accounts.graphql'
import type { CreateTransactionModalListAccounts_accounts$data } from './__generated__/CreateTransactionModalListAccounts_accounts.graphql'
import type {
  CreateTransactionMutation,
  CreateTransactionMutation$data
} from './__generated__/CreateTransactionMutation.graphql'

const numberFormatBR = (str: string) => {
  // const r = Number.parseInt(str.replace(/[^\d]+/gi, ''), 10)
  return str ? integerValueToBRL(numberUnFormatBR(str)) : ''
}

const numberUnFormatBR = (str: string) => {
  let result = str.replace('R$', '').trim()
  result = result.replace(/\./g, '')
  result = result.replace(',', '')
  return Number(result)
}

const limitInInteger = 100000 * 100
const reachedLimitTransfer = (value: number) => {
  if (value > limitInInteger) return true

  return false
}

const transferAmountIsGreatherThanBalanceAmount = (
  amountInteger: number,
  balance: number
) => {
  console.log({ amountInteger, balance })
  return amountInteger > balance
}

const FormSchema = z.object({
  destinationReceiverAccountPublicId: z
    .string({
      message: 'Please select an account'
    })
    .transform((value) => Number(value)),
  amount: z.number().refine(
    (val) => {
      return val > 0
    },
    { message: 'Can´t possible transfer R$ 0,00' }
  )
})

type CreateTransactionFormProps = {
  createTransactionModalFragment: CreateTransactionModal_accounts$data | null
  createTransactionModalListAccountsFragment: CreateTransactionModalListAccounts_accounts$data | null
  onUpdateBalanceAccount: () => void
  closeCreateTransactionDialog: () => boolean
  onTransactionCreated: (transaction: any) => void
}

export const CreateTransactionForm = ({
  createTransactionModalFragment,
  createTransactionModalListAccountsFragment,
  onUpdateBalanceAccount,
  closeCreateTransactionDialog,
  onTransactionCreated
}: CreateTransactionFormProps) => {
  const { accountPublicId } = useUserAuth()
  const account = useFragment<CreateTransactionForm_accounts$key>(
    graphql`
			fragment CreateTransactionForm_accounts on Account {
				balance
			}
		`,
    createTransactionModalFragment
  )

  const listAccounts =
    useFragment<CreateTransactionFormListAccounts_accounts$key>(
      graphql`
			fragment CreateTransactionFormListAccounts_accounts on AccountConnection {
				edges {
          node {
            publicId
            ...SelectAccountItem_accounts
          }
        }
			}
		`,
      createTransactionModalListAccountsFragment
    )

  const navigate = useNavigate()

  const { connectionIDs } = useTransactionConnection()

  const [newBalance, setNewBalance] = useState(account?.balance ?? 0)

  const [textAmount, setTextAmount] = useState('')

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      amount: 0
      // destinationReceiverAccountPublicId: 0
    }
  })
  const inputAmountRef = useRef<HTMLInputElement>(null)

  const [makeTransactionCommit, isMakingTransaction] =
    useMutation<CreateTransactionMutation>(CreateTransactionMutationGraphQL)
  const { idempotencyKey, setIdempotencyKey, generateNewIdempotencyKey } =
    useIdempotencyKey()

  const rifm = useRifm({
    value: textAmount,
    onChange: (text: string) => {
      const amountInteger = numberUnFormatBR(text)
      const realAccountBalance = account?.balance!

      if (amountInteger < 0) return console.log('is zero')

      if (
        reachedLimitTransfer(amountInteger) ||
        transferAmountIsGreatherThanBalanceAmount(
          amountInteger,
          realAccountBalance
        )
      ) {
        return console.log('Limit for transfer was reached')
      }

      setTextAmount(text)
      setNewBalance(realAccountBalance - amountInteger)
      form.setValue('amount', amountInteger)
    },
    format: numberFormatBR
  })

  useEffect(() => {
    // move cursor to last position from input
    inputAmountRef.current?.setSelectionRange(
      textAmount.length,
      textAmount.length
    )
  }, [textAmount])

  const [showPixReceiptTransfer, setShowPixReceiptTransfer] = useState(false)
  const [lastCreateTransaction, setLastCreatTransaction] = useState<any>(null)

  const makeTransaction = ({
    amount,
    destinationReceiverAccountPublicId
  }: z.infer<typeof FormSchema>) => {
    const newIdempotencyKey = idempotencyKey ?? generateNewIdempotencyKey()

    setIdempotencyKey(newIdempotencyKey)

    if (!destinationReceiverAccountPublicId)
      return alert('Please select a destination account')

    const input = {
      originSenderAccountPublicId: accountPublicId as number,
      amount,
      destinationReceiverAccountPublicId,
      idempotencyKey: newIdempotencyKey
    }

    makeTransactionCommit({
      variables: {
        input,
        connections: connectionIDs
      },
      onCompleted: (
        response: CreateTransactionMutation$data,
        errors: PayloadError[] | null
      ) => {
        const { CreateTransaction } = response as CreateTransactionMutation$data

        if (!CreateTransaction) {
          toast.error('Ops... Ocurred an error')
          return
        }

        if (CreateTransaction.success) {
          setIdempotencyKey(null)
          onUpdateBalanceAccount() // external refech
          toast.success(CreateTransaction.success, {
            description: 'Your balance has been updated'
          })

          startTransition(() => {
            setLastCreatTransaction(CreateTransaction)
            onTransactionCreated(CreateTransaction)
            setShowPixReceiptTransfer(true)
          })
        }

        if (CreateTransaction.error) {
          toast.error(CreateTransaction.error)
        }
      },
      onError: (error: Error) => {
        console.log('error', error)
      }
    })
  }

  const validationMakeTransaction: SubmitErrorHandler<
    z.infer<typeof FormSchema>
  > = (errors: FieldErrors<z.infer<typeof FormSchema>>) => {
    console.log('validation', { errors })

    if (errors.destinationReceiverAccountPublicId?.message) {
      toast.warning(errors.destinationReceiverAccountPublicId.message)
    }

    if (errors.amount?.message) {
      toast.warning(errors.amount?.message)
    }
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            makeTransaction,
            validationMakeTransaction
          )}
          id="send-transaction"
          className="flex flex-col gap-4"
        >
          <div>
            <Label htmlFor="amount">
              New balance: {integerValueToBRL(newBalance)}
            </Label>
          </div>

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="amount">Amount</FormLabel>
                <FormControl>
                  <Input
                    {...form.register('amount')}
                    {...field}
                    ref={inputAmountRef}
                    id="amount"
                    data-testid="createTransferAmountInput"
                    placeholder="R$ 0,00"
                    type="tel"
                    value={textAmount}
                    onChange={rifm.onChange}
                  />
                </FormControl>
                <FormDescription>
                  Amount in BRL that will be transfer to destination account
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            name="destinationReceiverAccountPublicId"
            data-testid="select-destinationReceiverAccountPublicId"
            control={form.control}
            render={({ field }) => {
              console.log(field.value)

              const valuesControl = field.value
                ? { value: Number(field.value) as unknown as string }
                : {}

              return (
                <FormItem>
                  <FormLabel>Account</FormLabel>
                  <Select
                    {...form.register('destinationReceiverAccountPublicId')}
                    // defaultValue={field.value}
                    value={field.value as unknown as string}
                    // {...valuesControl}
                    data-testid="select-accounts"
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger
                        className="h-12"
                        data-testid="select-trigger"
                      >
                        <SelectValue
                          className="border border-red-600"
                          placeholder="Select to send account"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup
                        data-testid="select-accounts"
                        className="gap-4"
                      >
                        {listAccounts?.edges
                          ?.filter(
                            (edge) => edge?.node?.publicId !== accountPublicId
                          )
                          .map((edge) => {
                            return (
                              <SelectAccountItem
                                key={edge?.node?.publicId}
                                listAccountFragment={edge?.node ?? null}
                              />
                            )
                          })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Destination account that will receives the amount from
                    transfer
                  </FormDescription>
                </FormItem>
              )
            }}
          />

          <Button
            className="w-fit self-end"
            type="submit"
            data-testid="createTransaction"
          >
            {isMakingTransaction ? 'Sending...' : 'Send'}
          </Button>
        </form>
      </Form>
    </>
  )
}
