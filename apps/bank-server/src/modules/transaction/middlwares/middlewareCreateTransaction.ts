import { connectDatabase } from '@/database'
import {
  type PromiseWithResolvers,
  createPromiseWithResolvers
} from '@woovi/utils'
import type { GraphQLResolveInfo } from 'graphql'

type QueueOperationResolver = () => Promise<any>
type QueueItem = PromiseWithResolvers<Record<string, any>> & {
  operation: QueueOperationResolver
}
const queue: QueueItem[] = []

type MutationFn = (
  input: any,
  ctx: any,
  info: GraphQLResolveInfo
) => Promise<unknown>

let queueRunning = false

const processQueue = async (queue: QueueItem[]) => {
  queueRunning = true
  console.log('processing, queue size', queue.length)

  // // ensure the connection
  // await connectDatabase()

  while (queue.length > 0) {
    const { operation, resolve } = queue.shift()!

    const result = await operation()
    console.log({ result })
    console.log('one item finished')
    resolve(result)
    console.log('remain', queue.length)
  }
  console.log('stop queue file')
  queueRunning = false
}

export const middlewareCreateTransaction: (fn: MutationFn) => MutationFn = (
  fn
) => {
  return async (input, context, info) => {
    const operation = async () => await fn(input, context, info)
    const { promise, resolve, reject } = createPromiseWithResolvers()

    queue.push({ promise, resolve, reject, operation })

    if (queueRunning) return console.log('queue already running', { queue })

    processQueue(queue)

    return promise
  }
}
