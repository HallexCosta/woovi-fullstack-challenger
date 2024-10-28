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
  locked: boolean
  lockTimestamp: number
  lockDuration: number
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
    locked: {
      type: Boolean,
      default: false,
      description: 'Pessimistic lock for document'
    },
    lockTimestamp: {
      type: Number
    },
    lockDuration: {
      type: Number, // in milisseconds
      default: 60 * 1000 // 1 minute
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
