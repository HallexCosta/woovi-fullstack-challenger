import { outputFields } from '@/modules/graphql/outputFields'
import { left, right } from '@woovi/server-utils'
import { GraphQLBoolean } from 'graphql'
import { mutationWithClientMutationId } from 'graphql-relay'
import { createOrGetBacenPixQueryBucket } from '../bucket/createOrGetBacenPixQueryBucket'

// beta - rollback the token to the bucket
export const BacenRollbackToken = mutationWithClientMutationId({
  name: 'BacenRollbackToken',
  description: 'Bacen Rollback token from PixKeyQuery',
  inputFields: {},
  mutateAndGetPayload: async (context, info) => {
    const bucket = createOrGetBacenPixQueryBucket()

    if (!bucket) {
      return left('Impossible rollback token in bucket that not exists', {
        rollbacked: false
      })
    }

    bucket.rollbackToken(1)
    return right(
      'The rollback work successfully, the bucket was refill bucket because the Dict Key Check generate a PixOut',
      {
        rollbacked: true
      }
    )
  },
  outputFields: outputFields({
    rollbacked: {
      type: GraphQLBoolean,
      resolve: ({ rollbacked }) => rollbacked
    }
  })
})
