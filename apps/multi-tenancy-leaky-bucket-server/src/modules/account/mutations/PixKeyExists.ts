import { outputFields } from '@/modules/graphql/outputFields'
import { UserLoader } from '@/modules/user/UserLoader'
import { left, right } from '@woovi/server-utils'
import { GraphQLList, GraphQLString } from 'graphql'
import { mutationWithClientMutationId } from 'graphql-relay'

export const PixKeyExists = mutationWithClientMutationId({
  name: 'PixKeyExists',
  description:
    'Check if pix key exists, you can check only 10 keys in the same time and the resolver filters the repeated keys',
  inputFields: {
    keys: {
      type: new GraphQLList(GraphQLString)
    }
  },
  mutateAndGetPayload: async ({ keys }, context, info) => {
    const removedRepeatKeys = keys.reduce((previous: string[], key: string) => {
      if (!previous.includes(key)) previous.push(key)

      return previous
    }, [])

    if (removedRepeatKeys.length >= 10) {
      return left(
        'You can check only 10 pix keys already exists in the same time'
      )
    }

    const checkedKeys: string[] = []
    for (const key of removedRepeatKeys) {
      console.log({ key })
      const user = await UserLoader.load({
        pixKey: key
      })

      if (user?.pixKey) {
        checkedKeys.push(user.pixKey)
      }
    }

    return right('Pix keys checked', {
      keys: checkedKeys,
      nonExistsKeys: removedRepeatKeys.filter(
        (key: string) => !checkedKeys.includes(key)
      )
    })
  },
  outputFields: outputFields({
    keys: {
      type: new GraphQLList(GraphQLString),
      resolve: ({ keys }) => keys
    },
    nonExistsKeys: {
      type: new GraphQLList(GraphQLString),
      resolve: ({ nonExistsKeys }) => nonExistsKeys
    }
  })
})
