import { getCounter } from '@/__tests__/setup/utils/counters/getCounter'
import { generateUniqueIntId } from '@/common/generateUniqueIntId'
import { type User, UserModel } from '@/modules/user/UserModel'

export const createUser = (args: Partial<User> = {}) => {
  const i = getCounter('user')

  return new UserModel(
    Object.assign(
      {
        name: `user#${i}`,
        email: `user${i}@example.com`,
        publicId: generateUniqueIntId()
      },
      args
    )
  ).save()
}
