import mongoose, { type Document } from 'mongoose'

export enum TenantStatus {
  PENDING = 'PENDING',
  ACTIVED = 'ACTIVED'
}

export type Tenant = {
  publicId: number
  status: string
  createdAt: Date
  updatedAt: Date | null
}
export type TenantModelDocument = Tenant & Document

export const Schema = new mongoose.Schema<TenantModelDocument>(
  {
    publicId: {
      type: Number,
      description: 'Public id from tenant'
    },
    status: {
      type: String,
      values: [TenantStatus.ACTIVED, TenantStatus.PENDING],
      description: 'Status from tenant'
    }
  },
  {
    collection: 'Tenant',
    timestamps: true
  }
)

export const TenantModel = mongoose.model<TenantModelDocument>('Tenant', Schema)
