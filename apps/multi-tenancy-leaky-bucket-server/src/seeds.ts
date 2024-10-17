import { generateUniqueIntId } from '@woovi/server-utils'
import { connectDatabase } from './database'
import { Account } from './modules/account/AccountModel'
import { TenantLoader } from './modules/tenant/TenantLoader'
import { TenantModel, TenantStatus } from './modules/tenant/TenantModel'
import { UserLoader } from './modules/user/UserLoader'
import { UserModel } from './modules/user/UserModel'

// recommends dont changes this ids because the function getStaticToken from multi-tenancy-leaky-bucket-ui
// use a static JWT token with the sames values
const tenant1PublicId = 131132202
const tenant2PublicId = 200175107

const user1PublicId = 637280184
const user2PublicId = 163218124

const verificationUsersAlreadyExists = async (
  tenantPublicIds: number[],
  userPublicIds: number[]
) => {
  const tenantPromises = tenantPublicIds.map((tenantPublicId) =>
    TenantLoader.load({
      publicId: tenantPublicId
    })
  )
  const tenants = await Promise.all(tenantPromises)

  const userPromises = userPublicIds.map((userPublicId) =>
    UserLoader.load({
      publicId: userPublicId
    })
  )
  const users = await Promise.all(userPromises)

  return (
    tenants.every((tenant) => tenant !== null) &&
    users.every((user) => user !== null)
  )
}

export const runSeeds = async () => {
  await connectDatabase()
  // create tenant1 with publicId
  // create tenant2 with publicId
  // create user1 with publicId belongs tenant1
  // create user2 with publicId belongs tenant1

  if (
    await verificationUsersAlreadyExists(
      [tenant1PublicId, tenant2PublicId],
      [user1PublicId, user2PublicId]
    )
  ) {
    console.log('tenants and users already exists')
    return true
  }

  const tenant1 = new TenantModel({
    publicId: tenant1PublicId,
    status: TenantStatus.ACTIVED
  })
  const tenant2 = new TenantModel({
    publicId: tenant2PublicId,
    status: TenantStatus.ACTIVED
  })
  await Promise.allSettled([tenant1.save(), tenant2.save()])

  const user1 = new UserModel({
    publicId: user1PublicId,
    tenantId: tenant1.id,
    pixKey: 'hallex.costa@hotmail.com',
    email: 'hallex.costa@hotmail.com',
    fullName: 'Hallex Costa 1',
    createdAt: new Date(),
    updatedAt: null
  })
  const user2 = new UserModel({
    publicId: user2PublicId,
    tenantId: tenant1.id,
    pixKey: 'hallex.costa1@hotmail.com',
    email: 'hallex.costa1@hotmail.com',
    fullName: 'Hallex Costa 2',
    createdAt: new Date(),
    updatedAt: null
  })
  // await user.save()

  await Promise.allSettled([user1.save(), user2.save()])

  const account1 = new Account({
    publicId: generateUniqueIntId(),
    userId: user1._id,
    balance: 100 * 1000,
    tenantId: tenant1.id,
    status: 'ACTIVE'
  })

  const account2 = new Account({
    publicId: generateUniqueIntId(),
    userId: user2._id,
    balance: 100 * 1000,
    tenantId: tenant1.id,
    status: 'ACTIVE'
  })

  await Promise.allSettled([account1.save(), account2.save()])
}

if (Number(process.env.CLI)) {
  runSeeds()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}
