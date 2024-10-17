import { type User, UserModel } from './UserModel'

type LoadProps = {
  email?: string
  publicId?: number
  id?: string
  pixKey?: string
  tenantId?: string
}

export const UserLoader = {
  loadAll: async () => {
    return await UserModel.find()
  },
  load: async (props: LoadProps) => {
    const filters: Record<string, string | number> = {}

    for (const [key, value] of Object.entries(props)) {
      if (key === 'id') {
        Object.assign(filters, { ['_id']: value })
        continue
      }

      if (value) {
        Object.assign(filters, { [key]: value })
      }
    }

    return await UserModel.findOne(filters)
  }
}
