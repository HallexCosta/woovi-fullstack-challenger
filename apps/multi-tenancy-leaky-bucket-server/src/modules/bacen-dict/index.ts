import { BacenCreatePixTransaction } from './mutation/BacenCreatePixTransaction'
import { BacenPixKeyQuery } from './mutation/BacenPixKeyQuery'
import { BacenRollbackToken } from './mutation/BacenRollbackToken'

export const exportBacenDictMutation = () => ({
  BacenCreatePixTransaction,
  BacenPixKeyQuery,
  BacenRollbackToken
})
