import { mongooseUtils } from '@woovi/server-utils'
import type mongoose from 'mongoose'
import { Account } from './AccountModel'

type LoadFilters = {
  publicId?: number
  userId?: string
  id?: string
}

export const AccountLoader = {
  withSession: (session) => {}, // should be inject in loadByIdAndLock
  loadByPublicId: async (
    publicId: number,
    session?: mongoose.mongo.ClientSession
  ) => {
    const query = Account.findOne({
      publicId
    })

    if (session) {
      query.session(session)
    }

    return await query
  },
  loadByPublicIdAndLock: async (
    publicId: number,
    session?: mongoose.mongo.ClientSession
  ) => {
    return await Account.findOneAndUpdate(
      {
        publicId
      },
      {
        $set: {
          locked: true,
          lockTimestamp: +new Date(),
          lockDuration: 60 * 1000
        }
      },
      {
        new: false
      }
    )
  },
  loadByPublicIdAndUnlock: async (publicId: number) => {
    return await Account.findOneAndUpdate(
      {
        publicId
      },
      {
        $set: {
          locked: false,
          lockTimestamp: +new Date(),
          lockDuration: 60 * 1000
        }
      },
      {
        new: true
      }
    )
  },
  loadById: async (id: string) => await Account.findById(id),
  load: async (props: LoadFilters) =>
    await Account.findOne(mongooseUtils.toLoadFilters(props)),
  loadAll: async () => {
    const accounts = await Account.find()

    return accounts
  }
}
