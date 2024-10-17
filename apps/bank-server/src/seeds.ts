import { generateUniqueIntId } from '@woovi/server-utils'
import { connectDatabase } from './database'
import { AccountLoader } from './modules/account/AccountLoader'
import { Account } from './modules/account/AccountModel'
import { UserLoader } from './modules/user/UserLoader'
import { UserModel } from './modules/user/UserModel'

const user1PublicId = 155188153
const user2PublicId = 761985722

const account1PublicId = 12345678
const account2PublicId = 87654321

const verificationUsersAlreadyExists = async (
  userPublicIds: number[],
  accountPublicIds: number[]
) => {
  const userPromises = userPublicIds.map((userPublicId) =>
    UserLoader.load({
      publicId: userPublicId
    })
  )
  const accountPromises = accountPublicIds.map((accountPublicId) =>
    AccountLoader.load({
      publicId: accountPublicId
    })
  )
  const usersAndAccounts = await Promise.all([
    ...userPromises,
    ...accountPromises
  ])

  return (
    // users.every((user) => user !== null) &&
    usersAndAccounts.every((userAndAccount) => userAndAccount)
  )
}

export const runSeeds = async () => {
  await connectDatabase()

  if (
    await verificationUsersAlreadyExists(
      [user1PublicId, user2PublicId],
      [account1PublicId, account2PublicId]
    )
  ) {
    console.log('users already exists')
    return true
  }

  const user1 = new UserModel({
    publicId: user1PublicId,
    pixKey: 'hallex.costa@hotmail.com',
    profileImage: 'https://github.com/hallexcosta.png',
    email: 'hallex.costa@hotmail.com',
    fullName: 'Hallex Costa 1',
    createdAt: new Date(),
    updatedAt: null
  })
  const user2 = new UserModel({
    publicId: user2PublicId,
    pixKey: 'hallex.costa1@hotmail.com',
    profileImage: 'https://github.com/woovibr.png',
    email: 'hallex.costa1@hotmail.com',
    fullName: 'Hallex Costa 2',
    createdAt: new Date(),
    updatedAt: null
  })

  await Promise.allSettled([user1.save(), user2.save()])

  const account1 = new Account({
    publicId: generateUniqueIntId(),
    userId: user1._id,
    balance: 100 * (1000 * 100),
    status: 'ACTIVE'
  })

  const account2 = new Account({
    publicId: generateUniqueIntId(),
    userId: user2._id,
    balance: 100 * (1000 * 100),
    status: 'ACTIVE'
  })

  await Promise.allSettled([account1.save(), account2.save()])
}

if (Number(process.env.CLI)) {
  runSeeds()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}
