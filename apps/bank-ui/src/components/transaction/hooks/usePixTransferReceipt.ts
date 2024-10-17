import { useState } from 'react'
import type { CreateTransactionMutation$data } from '../mutation/__generated__/CreateTransactionMutation.graphql'

export const usePixTransferReceipt = () => {
  const [lastCreateTransaction, setLastCreatTransaction] =
    useState<CreateTransactionMutation$data['CreateTransaction']>(null)
  return { lastCreateTransaction, setLastCreatTransaction }
}
