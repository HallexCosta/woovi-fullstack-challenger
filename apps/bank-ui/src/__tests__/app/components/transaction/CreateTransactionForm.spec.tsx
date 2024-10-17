import {
  act,
  findByTestId,
  findByText,
  getByPlaceholderText,
  getByTestId,
  getByText,
  mockEnvironment,
  render,
  userEvent,
  waitFor,
  waitForElementToBeRemoved
} from '@/__tests__/setup/utils/AllProviders'
import { MemoryRouterProvider } from '@/__tests__/setup/utils/MemoryRouterProvider'
import { CreateTransactionForm } from '@/components/transaction/mutation/CreateTransactionForm'
import { CreateTransactionMutation } from '@/components/transaction/mutation/CreateTransactionMutation'
import type { CreateTransactionMutation$data } from '@/components/transaction/mutation/__generated__/CreateTransactionMutation.graphql'
import React from 'react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { MockPayloadGenerator } from 'relay-test-utils'
import { v4 as uuidv4 } from 'uuid'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CreateTransactionFormSpecQuery,
  CreateTransactionFormSpecQuery$data
} from './__generated__/CreateTransactionFormSpecQuery.graphql'

const {
  hookResponse: mockHookResponse,
  useIdempotencyKey: mockUseIdempotencyKey
} = vi.hoisted(() => {
  let idempotencyKeyCached = null
  const hookResponse = {
    generateNewIdempotencyKey: vi.fn(() => uuidv4()),
    setIdempotencyKey: vi.fn((newKey: string | null) => {
      idempotencyKeyCached = newKey
    }),
    get idempotencyKey() {
      return idempotencyKeyCached
    }
  }

  const useIdempotencyKey = vi.fn(() => hookResponse)

  return {
    useIdempotencyKey,
    hookResponse
  }
})

vi.mock('@/hooks/useIdempotencyKey', async () => {
  const mod = await import('@/hooks/useIdempotencyKey')
  return {
    ...mod,
    useIdempotencyKey: mockUseIdempotencyKey
  }
})

const { mockUsePixTransferReceiptHookResponse, mockUsePixTransferReceipt } =
  vi.hoisted(() => {
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

// vi.spyOn(AccountItem, 'SelectAccountItem').mockReturnValue(<div />)

vi.mock('@/hooks/useUserAuth', async () => {
  const mod = await import('@/hooks/useUserAuth')
  return {
    ...mod,
    useUserAuth: mockUseUserAuth
  }
})

const toast = vi.hoisted(() => {
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

const { toast: mockToast } = toast

vi.mock('sonner', async () => {
  const actual = await import('sonner')
  return {
    ...actual,
    ...toast
  }
})

vi.spyOn(console, 'warn').mockImplementation(() => {})

const App = ({
  onUpdateBalanceAccount,
  onTransactionCreated
}: {
  onUpdateBalanceAccount?: () => void
  onTransactionCreated?: () => void
}) => {
  if (!onUpdateBalanceAccount) onUpdateBalanceAccount = vi.fn()

  if (!onTransactionCreated) onTransactionCreated = vi.fn()

  const data = useLazyLoadQuery(
    graphql`
      query CreateTransactionFormSpecQuery($accountPublicId: Int!) @relay_test_operation {
        accountByPublicId(publicId: $accountPublicId) {
          node {
            ...CreateTransactionForm_accounts
          }
        }
        accounts {
          ...CreateTransactionFormListAccounts_accounts
        }
      }  
    `,
    {
      accountPublicId: 12345678
    }
  )

  return (
    <CreateTransactionForm
      createTransactionModalFragment={data.accountByPublicId.node!}
      createTransactionModalListAccountsFragment={data.accounts!}
      onUpdateBalanceAccount={onUpdateBalanceAccount}
      onTransactionCreated={onTransactionCreated}
    />
  )
}

describe('CreateTransactionForm', () => {
  beforeEach(() => {
    mockEnvironment.mockClear()
    vi.clearAllMocks()
    mockHookResponse.setIdempotencyKey(null)
  })

  it('should be create a new transaction', async () => {
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

    const {
      findByTestId,
      getByText,
      queryByText,
      getByTestId,
      findByText,
      container,
      getByPlaceholderText
    } = render(
      <MemoryRouterProvider
        defaultElement={
          <App
            onUpdateBalanceAccount={vi.fn()}
            onTransactionCreated={vi.fn((createTransaction) => {
              mockUsePixTransferReceiptHookResponse.setLastCreatTransaction(
                createTransaction
              )
            })}
          />
        }
      />
    )

    expect(await findByText('New balance: R$ 1.000,00')).toBeInTheDocument()

    await userEvent.type(
      container.querySelector('input[name="amount"]')!,
      '100'
    )

    expect(getByPlaceholderText('R$ 0,00').value.replace(/\u00A0/g, ' ')).toBe(
      'R$ 1,00'
    )

    await userEvent.selectOptions(
      container.querySelector(
        'select[name="destinationReceiverAccountPublicId"]'
      )!,
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

    expect(
      mockUsePixTransferReceiptHookResponse.setLastCreatTransaction
    ).toBeCalled()
    expect(
      mockUsePixTransferReceiptHookResponse.lastCreateTransaction
    ).not.toBeNull()
  })

  it('should be show message error if transaction failed when create transaction', async () => {
    mockEnvironment.mock.queuePendingOperation(CreateTransactionMutation, {
      input: {
        accountPublicId: 12345678
      }
    })

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
      success: null,
      error:
        'Amount cannot be transferred because it had a zero in the balance account',
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

    const { findByTestId, findByText, container, getByPlaceholderText } =
      render(<MemoryRouterProvider defaultElement={<App />} />)

    expect(await findByText('New balance: R$ 1.000,00')).toBeInTheDocument()

    await userEvent.type(
      container.querySelector('input[name="amount"]')!,
      '100'
    )

    expect(getByPlaceholderText('R$ 0,00').value.replace(/\u00A0/g, ' ')).toBe(
      'R$ 1,00'
    )

    await userEvent.selectOptions(
      container.querySelector(
        'select[name="destinationReceiverAccountPublicId"]'
      )!,
      '87654321'
    )
    await userEvent.click(await findByTestId('createTransaction'))
    expect(mockToast.error).toHaveBeenCalledWith(CreateTransaction.error)
  })

  it('should be use the same idempotency-key if send twice requests', async () => {
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
        originSenderAccountPublicId: 12345678,
        idempotencyKey: 'some-key'
      }
    })

    const { findByTestId, findByText, container, getByPlaceholderText } =
      render(<MemoryRouterProvider defaultElement={<App />} />)

    expect(await findByText('New balance: R$ 1.000,00')).toBeInTheDocument()

    await userEvent.type(
      container.querySelector('input[name="amount"]')!,
      '100'
    )

    expect(getByPlaceholderText('R$ 0,00').value.replace(/\u00A0/g, ' ')).toBe(
      'R$ 1,00'
    )

    await userEvent.selectOptions(
      container.querySelector(
        'select[name="destinationReceiverAccountPublicId"]'
      )!,
      '87654321'
    )

    expect(mockHookResponse.idempotencyKey).toBe(null)
    await userEvent.click(await findByTestId('createTransaction'))
    expect(mockHookResponse.idempotencyKey).not.toBe(null)
    expect(mockHookResponse.generateNewIdempotencyKey).toHaveBeenCalledTimes(1)

    await userEvent.click(await findByTestId('createTransaction'))
    expect(mockHookResponse.generateNewIdempotencyKey).toHaveBeenCalledTimes(1)

    await userEvent.click(await findByTestId('createTransaction'))
    expect(mockHookResponse.generateNewIdempotencyKey).toHaveBeenCalledTimes(1)

    act(() => {
      const operation = mockEnvironment.mock.getMostRecentOperation()
      mockEnvironment.mock.resolve(
        operation,
        MockPayloadGenerator.generate(
          operation,
          createTransactionCustomMockResolvers
        )
      )
    })

    await userEvent.click(await findByTestId('createTransaction'))
    expect(mockHookResponse.generateNewIdempotencyKey).toHaveBeenCalledTimes(2)

    expect(mockToast.success).toHaveBeenCalledWith(CreateTransaction.success, {
      description: 'Your balance has been updated'
    })
  })
})
