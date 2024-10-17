import { TenantModel } from './TenantModel'

type LoadProps = {
  id?: string
  publicId?: number
}

const loadAll = async () => {
  return await TenantModel.find()
}

const load = async (props: LoadProps) => {
  const filters = {}

  for (const [key, value] of Object.entries(props)) {
    if (value) {
      if (key === 'id') {
        Object.assign(filters, { [`_${key}`]: value })
      } else {
        Object.assign(filters, { [key]: value })
      }
    }
  }

  return await TenantModel.findOne(filters)
}

export const TenantLoader = {
  loadAll,
  load
}
