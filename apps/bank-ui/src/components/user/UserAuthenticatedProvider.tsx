import { type ReactNode, createContext, useContext, useState } from 'react'

const UserAuthenticatedContext = createContext<{
  balance: number
  setBalance: (balance: number) => void
} | null>(null)

export const useUserAuthenticated = () => {
  const context = useContext(UserAuthenticatedContext)
  if (!context) {
    throw new Error(
      'useUserAuthenticated must be used within a UserAuthenticatedProvider'
    )
  }
  return context
}

export const UserAuthenticatedProvider = ({
  children
}: { children: ReactNode }) => {
  const [balance, setBalance] = useState<number>(0)

  return (
    <UserAuthenticatedContext.Provider
      value={{
        balance,
        setBalance
      }}
    >
      {children}
    </UserAuthenticatedContext.Provider>
  )
}
