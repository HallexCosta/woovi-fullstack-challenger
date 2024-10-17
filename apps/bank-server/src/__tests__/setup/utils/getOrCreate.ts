import type { Document, Model } from 'mongoose'

export const getOrCreate = async <T extends Document>(
  model: Model<T>,
  createFn: () => void,
  forceCreate = false
) => {
  const data = await model.findOne()

  if (data && !forceCreate) {
    return data
  }

  return createFn()
}
