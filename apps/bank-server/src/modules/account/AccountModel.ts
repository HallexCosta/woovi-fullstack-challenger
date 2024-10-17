import mongoose, { type Document } from 'mongoose'

enum AccountStatus {
  PENDING = 'PENDING',
  ACTIVED = 'ACTIVED'
}

export type AccountModel = {
  publicId: number
  userId: string
  balance: number
  status: string
  createdAt: Date
  updatedAt?: Date | null
}
export type AccountModelDocument = AccountModel & Document

export const Schema = new mongoose.Schema<AccountModelDocument>(
  {
    publicId: {
      type: Number,
      description: 'Public id from account'
    },
    userId: {
      type: String,
      description: 'User id from account'
    },
    balance: {
      type: Number,
      description: 'Balance amount from account'
    },
    status: {
      type: String,
      values: [AccountStatus.ACTIVED, AccountStatus.PENDING],
      description: 'Status from account'
    }
  },
  {
    collection: 'Account',
    timestamps: true
  }
)

export const Account = mongoose.model<AccountModel & Document>(
  'Account',
  Schema
)
