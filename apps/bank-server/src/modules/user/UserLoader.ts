import { mongooseUtils } from '@woovi/server-utils'
import { UserModel } from './UserModel'

type LoadProps = {
  email?: string
  publicId?: number
  id?: string
  pixKey?: string
  tenantId?: string
}

export const UserLoader = {
  all: async () => {
    return await UserModel.find()
  },
  load: async (props: LoadProps) => {
    return await UserModel.findOne(
      mongooseUtils.toLoadFilters<LoadProps>(props)
    )
  },
  findByPublicId: async () => {}
}
