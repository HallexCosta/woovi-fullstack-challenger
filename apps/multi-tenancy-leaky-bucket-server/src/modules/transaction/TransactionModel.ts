import mongoose, { Schema, type Document, type Model } from 'mongoose'

export enum TransactionStatusEnum {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED'
}

export enum TransactionTypeEnum {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  PIX = 'PIX'
}

export type TransactionModel = {
  publicId: number
  amount: number
  originUserId: string
  destinationUserId: string
  tenantId: string
  createdAt: Date
  updatedAt: Date | null
  idempotencyKey: string
}

export type TransactionModelDocument = TransactionModel & Document

const transactionSchema = new mongoose.Schema<TransactionModelDocument>(
  {
    publicId: Number,
    originUserId: String,
    destinationUserId: String,
    tenantId: String,
    amount: Number
  },
  {
    collection: 'Transaction',
    timestamps: true
  }
)

export const Transaction: Model<TransactionModelDocument> = mongoose.model(
  'Transaction',
  transactionSchema
)
