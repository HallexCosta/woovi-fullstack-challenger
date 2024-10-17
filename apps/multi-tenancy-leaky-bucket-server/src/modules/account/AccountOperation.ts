import type { AccountModelDocument } from './AccountModel'

type AccountOperationDebitProps = {
  originAccount: AccountModelDocument
  destinationAccount: AccountModelDocument
  transferAmount: number
}

export const AccountOperation = {
  debit: ({
    originAccount,
    destinationAccount,
    transferAmount
  }: AccountOperationDebitProps) => {
    const date = new Date()
    originAccount.balance -= transferAmount
    destinationAccount.balance += transferAmount

    originAccount.updatedAt = date
    destinationAccount.updatedAt = date

    return true
  }
}
