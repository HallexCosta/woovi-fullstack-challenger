import { type ReactNode, createContext, useContext, useState } from 'react'

const TransactionConnectionContext = createContext<{
  connectionIDs: string[]
  setConnectionIDs: (ids: string[]) => void
  connectionName: string
  setConnectionName: (key: string) => void
} | null>(null)

export const useTransactionConnection = () => {
  const context = useContext(TransactionConnectionContext)
  if (!context) {
    throw new Error(
      'useTransactionConnection must be used within a TransactionConnectionProvider'
    )
  }
  return context
}

export const TransactionConnectionProvider = ({
  children
}: { children: ReactNode }) => {
  const [connectionIDs, setConnectionIDs] = useState<string[]>([])
  const [connectionName, setConnectionName] = useState<string>(
    'TableListTransactions_transactions'
  )

  return (
    <TransactionConnectionContext.Provider
      value={{
        connectionIDs,
        setConnectionIDs,
        connectionName,
        setConnectionName
      }}
    >
      {children}
    </TransactionConnectionContext.Provider>
  )
}
