import { generateUniqueIntId } from '@woovi/server-utils'

// memory db to save bacen transactions
type BacenCollections = 'transactions' | 'accounts'
const accounts = new Map<string, any>([
  [
    'account:1',
    {
      id: 'account:1',
      publicId: generateUniqueIntId(),
      status: 'PAID',
      createdAt: new Date(),
      updatedAt: null
    }
  ]
])
export const bacen = new Map<BacenCollections, Map<string, any>>([
  ['transactions', new Map()],
  ['accounts', accounts]
])
