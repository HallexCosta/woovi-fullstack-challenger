import {
  type GraphQLFieldConfig,
  GraphQLString,
  type ThunkObjMap
} from './index'

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const outputFields = (
  fields: ThunkObjMap<GraphQLFieldConfig<any, any, any>>
) => {
  return {
    ...fields,
    error: {
      type: GraphQLString,
      resolve: ({ error }) => error
    },
    success: {
      type: GraphQLString,
      resolve: ({ success }) => success
    }
  }
}
