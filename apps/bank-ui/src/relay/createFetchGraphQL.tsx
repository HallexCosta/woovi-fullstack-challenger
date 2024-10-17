import type { RequestParameters } from 'relay-runtime/lib/util/RelayConcreteNode'
import type {
  CacheConfig,
  Variables
} from 'relay-runtime/lib/util/RelayRuntimeTypes'

import { config } from '@/common/config'

import { createPromiseWithResolvers } from '@woovi/utils'
import type {
  FetchFunction,
  GraphQLResponse,
  UploadableMap
} from 'relay-runtime'

export const fetchGraphQL: FetchFunction = async (
  request: RequestParameters,
  variables: Variables,
  cacheConfig: CacheConfig,
  uploadables?: UploadableMap | null
) => {
  const cookies = { token: null }
  const headers = {
    Accept: 'application/json',
    'Content-type': 'application/json'
    // 'Idempotency-Key': uuid()
  }

  if (cookies.token) {
    Object.assign(headers, {
      Authorization: `Bearer ${cookies.token}`
    })
  }

  const {
    promise: data,
    reject,
    resolve
  } = createPromiseWithResolvers<GraphQLResponse>()

  await fetch(config.VITE_GRAPHQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: request.text,
      variables
    })
  })
    .then((response) => response.json())
    .then((data) => resolve(data))
    .catch((err) => {
      console.log({ err })
      window.location.href = '/'
      resolve(err)
    })

  return data
}
