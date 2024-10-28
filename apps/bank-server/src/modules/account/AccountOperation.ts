import type mongoose from 'mongoose'
import { Account, type AccountModelDocument } from './AccountModel'

type AccountOperationDebitProps = {
  originAccount: AccountModelDocument
  destinationAccount: AccountModelDocument
  transferAmount: number
}

export const AccountOperation = {
  debit: async (
    {
      originAccount,
      destinationAccount,
      transferAmount
    }: AccountOperationDebitProps,
    session?: mongoose.mongo.ClientSession
  ) => {
    const date = new Date()
    originAccount.balance -= transferAmount
    destinationAccount.balance += transferAmount

    originAccount.updatedAt = date
    destinationAccount.updatedAt = date

    const lockTimestamp = +new Date()

    // const acc1 = await Account.updateOne(
    //   {
    //     _id: originAccount._id
    //   },
    //   {
    //     $set: {
    //       balance: originAccount.balance,
    //       locked: false,
    //       lockTimestamp
    //     }
    //   }
    //   // { session }
    // )
    // const acc2 = await Account.updateOne(
    //   {
    //     _id: destinationAccount._id
    //   },
    //   {
    //     $set: {
    //       balance: destinationAccount.balance,
    //       locked: false,
    //       lockTimestamp
    //     }
    //   }
    //   // { session }
    // )

    const acc1 = await Account.findByIdAndUpdate(originAccount._id, {
      $set: {
        balance: originAccount.balance,
        locked: false,
        lockTimestamp
      }
    })
    // .session(session)
    const acc2 = await Account.findByIdAndUpdate(destinationAccount._id, {
      $set: {
        balance: destinationAccount.balance,
        locked: false,
        lockTimestamp
      }
    })
    // .session(session)

    console.log({ acc1, acc2 })

    return true
  }
}
