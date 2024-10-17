import { getCounter } from '@/__tests__/setup/utils/counters/getCounter'
import { type User, UserModel } from '@/modules/user/UserModel'
import { generateUniqueIntId } from '@woovi/server-utils'
import { createTenant } from './createTenant'

export const createUser = async (args: Partial<User> = {}) => {
  const i = getCounter('user')

  // if (args.tenantId) {
  // 	const tenant = await createTenant()
  // 	Object.assign(args, { tenantId: tenant.id })
  // }

  return new UserModel({
    name: `user#${i}`,
    email: `user${i}@example.com`,
    publicId: generateUniqueIntId(),
    ...args
  }).save()
}
