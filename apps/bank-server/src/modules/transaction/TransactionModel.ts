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
  originSenderAccountId: mongoose.Types.ObjectId
  destinationReceiverAccountId: mongoose.Types.ObjectId
  status: TransactionStatusEnum
  type: TransactionTypeEnum
  createdAt: Date
  updatedAt: Date | null
  idempotencyKey: string
}

export type TransactionModelDocument = TransactionModel & Document

const transactionSchema = new mongoose.Schema<TransactionModelDocument>(
  {
    publicId: Number,
    amount: Number,
    status: {
      type: String,
      values: [
        TransactionStatusEnum.PENDING,
        TransactionStatusEnum.FAILED,
        TransactionStatusEnum.PAID
      ],
      description: 'Status from transaction: "PENDING", "FAILED" or "SUCCESS"'
    },
    type: {
      type: String,
      values: [
        TransactionTypeEnum.PIX,
        TransactionTypeEnum.CREDIT,
        TransactionTypeEnum.DEBIT
      ],
      description: 'Type of operation "PIX", "CREDIT" or "DEBIT"'
    },
    destinationReceiverAccountId: {
      type: Schema.Types.ObjectId,
      description: 'Destination account that will receive the amount'
    },
    originSenderAccountId: {
      type: Schema.Types.ObjectId,
      description: 'Origin account that will send the amount sent'
    },
    idempotencyKey: {
      type: String,
      description: 'The unique Idempotency key to identify the transaction'
    }
  },
  {
    collection: 'Transaction',
    timestamps: true
  }
)

transactionSchema.index({
  destinationReceiverAccountId: 1,
  originSenderAccountId: 1,
  idempotencyKey: 1,
  amount: 1
})

export const Transaction: Model<TransactionModelDocument> = mongoose.model(
  'Transaction',
  transactionSchema
)
