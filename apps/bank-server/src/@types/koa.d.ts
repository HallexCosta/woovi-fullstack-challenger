import type { AccountModel } from '@/modules/account/AccountModel'
import type { Document } from 'mongoose'

declare module 'koa' {
  interface Request {
    user?: AccountModel & Document
  }
}
