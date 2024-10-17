import {
  act,
  findByTestId,
  mockEnvironment,
  render,
  screen,
  userEvent,
  waitFor
} from '@/__tests__/setup/utils/AllProviders'
import { CreateTransactionModal } from '@/components/transaction/mutation/CreateTransactionModal'
import { CreateTransactionMutation } from '@/components/transaction/mutation/CreateTransactionMutation'
import type { CreateTransactionMutation$data } from '@/components/transaction/mutation/__generated__/CreateTransactionMutation.graphql'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { MockPayloadGenerator } from 'relay-test-utils'
import { describe, expect, it, vi } from 'vitest'
import {
  type CreateTransactionFormSpecQuery,
  CreateTransactionFormSpecQuery$data
} from './__generated__/CreateTransactionFormSpecQuery.graphql'

const {
  mockOnUpdateBalanceAccount,
  mockUsePixTransferReceiptHookResponse,
  mockUsePixTransferReceipt
} = vi.hoisted(() => {
  let lastCreateTransactionCached: CreateTransactionMutation$data['CreateTransaction'] =
    null
  const mockUsePixTransferReceiptHookResponse = {
    setLastCreatTransaction: vi.fn(
      (
        createTransaction: CreateTransactionMutation$data['CreateTransaction']
      ) => {
        lastCreateTransactionCached = createTransaction
      }
    ),
    get lastCreateTransaction() {
      return lastCreateTransactionCached
    }
  }

  const mockUsePixTransferReceipt = vi.fn(
    () => mockUsePixTransferReceiptHookResponse
  )

  return {
    mockOnUpdateBalanceAccount: vi.fn(),
    mockUsePixTransferReceipt,
    mockUsePixTransferReceiptHookResponse
  }
})

vi.mock('@/components/transaction/hooks/usePixTransferReceipt', async () => {
  const mod = await import(
    '@/components/transaction/hooks/usePixTransferReceipt'
  )
  return {
    ...mod,
    usePixTransferReceipt: mockUsePixTransferReceipt
  }
})

const { mockUseUserAuth } = vi.hoisted(() => {
  const mockUseUserAuth = vi.fn().mockReturnValue({
    accountPublicId: 1234567,
    publicId: 1234567,
    isAuthPending: false
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

const { toast: mockToast } = vi.hoisted(() => {
  vi.resetModules()

  return {
    toast: {
      success: vi.fn(),
      warning: vi.fn(),
      error: vi.fn()
    },
    Toaster: vi.fn()
  }
})

vi.mock('sonner', async () => {
  const actual = await import('sonner')
  return {
    ...actual,
    ...mockToast
  }
})

const App = ({
  onUpdateBalanceAccount,
  onTransactionCreated
}: {
  onUpdateBalanceAccount?: () => void
  onTransactionCreated?: () => void
}) => {
  if (!onUpdateBalanceAccount) onUpdateBalanceAccount = vi.fn()

  if (!onTransactionCreated) onTransactionCreated = vi.fn()

  const data = useLazyLoadQuery<CreateTransactionFormSpecQuery>(
    graphql`
      query CreateTransactionModalSpecQuery($accountPublicId: Int!) @relay_test_operation {
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
    {
      accountPublicId: 12345678
    }
  )

  return (
    <CreateTransactionModal
      accountBalanceInformationCardFragment={data?.accountByPublicId?.node!}
      accountsQueryFragment={data?.accounts}
      // createTransactionModalFragment={data.accountByPublicId.node!}
      // createTransactionModalListAccountsFragment={data.accounts!}
      onUpdateBalanceAccount={onUpdateBalanceAccount}
      // onTransactionCreated={onTransactionCreated}
    />
  )
}

describe('CreateTransactionModal', () => {
  it.todo('should be view create transaction form', async () => {
    const customMockResolvers = {
      Query: () => ({
        accountByPublicId: {
          node: {
            publicId: 12345678,
            balance: 100 * 1000
          }
        },
        accounts: {
          edges: [
            {
              node: {
                id: 'account-mock-id-2',
                publicId: 87654321,
                user: {
                  id: 'user-mock-id-2',
                  publicId: 87654321,
                  profileImage: 'https://github.com/woovi.png'
                }
              }
            }
          ]
        }
      })
    }

    mockEnvironment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, customMockResolvers)
    )

    const CreateTransaction = {
      success: 'Transfer completed successfully',
      error: null,
      transactionEdge: {
        node: {
          id: 'mock-id',
          publicId: 12345678,
          amount: 100,
          originSenderAccount: {
            publicId: 12345678
          },
          destinationReceiverAccount: {
            publicId: 87654321
          },
          createdAt: new Date().toISOString(),
          status: 'PAID',
          type: 'PIX'
        }
      }
    }
    // mock mutation
    const createTransactionCustomMockResolvers = {
      Mutation: () => ({
        CreateTransaction
      })
    }

    mockEnvironment.mock.queuePendingOperation(CreateTransactionMutation, {
      input: {
        amount: 100,
        destinationReceiverAccountPublicId: 87654321,
        originSenderAccountPublicId: 12345678
      }
    })
    mockEnvironment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(
        operation,
        createTransactionCustomMockResolvers
      )
    )

    // act(() => {
    // 	mockUsePixTransferReceiptHookResponse.setLastCreatTransaction({
    // 		success: '',
    // 		error: '',
    // 		transactionEdge: {
    // 			node: {
    // 				publicId: 123,
    // 				id: 'trx-id-123',
    // 				status: 'PAID',
    // 				type: 'PIX',
    // 				amount: 0,
    // 				createdAt: new Date().toISOString(),
    // 				destinationReceiverAccount: {
    // 					publicId: 1,
    // 					user: {
    // 						createdAt: +new Date(),
    // 						email: '',
    // 						fullName: 'user1@email.com',
    // 						pixKey: 'user1-pixkey',
    // 						profileImage: 'user1',
    // 						publicId: 1
    // 					}
    // 				},
    // 				originSenderAccount: {
    // 					publicId: 2,
    // 					user: {
    // 						createdAt: +new Date(),
    // 						email: 'user2@email.com',
    // 						fullName: 'User 2',
    // 						pixKey: 'user2-pixkey',
    // 						profileImage: 'user2',
    // 						publicId: 2
    // 					}
    // 				}
    // 			}
    // 		}
    // 	})
    // })
    const { findByTestId, container } = render(
      <App onUpdateBalanceAccount={vi.fn()} />
    )

    expect(await findByTestId('createTransferDialog')).toBeInTheDocument()
    await userEvent.type(await findByTestId('createTransferAmountInput'), '100')

    // expect(getByPlaceholderText('R$ 0,00').value.replace(/\u00A0/g, ' ')).toBe(
    // 	'R$ 1,00'
    // )

    // const element = await findByQuerySelector(
    // 	container,
    // 	'select[name="destinationReceiverAccountPublicId"]'
    // )
    await userEvent.selectOptions(
      await findByTestId('select-destinationReceiverAccountPublicId')!,
      '87654321'
    )

    await act(async () => {
      await userEvent.click(await findByTestId('createTransaction'))
      expect(mockToast.success).toHaveBeenCalledWith(
        CreateTransaction.success,
        {
          description: 'Your balance has been updated'
        }
      )
    })

    expect(await findByTestId('pixTransferReceipt')).toBeInTheDocument()
  })
  it.todo('should be view pix transfer receipt', () => {})
})
