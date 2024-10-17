import type { RequestParameters } from 'relay-runtime/lib/util/RelayConcreteNode'
import type { Variables } from 'relay-runtime/lib/util/RelayRuntimeTypes'

import { config } from '@/common/config'
import { getCookiesOutOfReactContext } from '@/common/getCookiesOutOfReactContext'
import { getStaticToken } from '@/common/getStaticToken'
import { useCookies } from 'react-cookie'

export const fetchGraphQL = async (
  request: RequestParameters,
  variables: Variables
) => {
  const headers = {
    Accept: 'application/json',
    'Content-type': 'application/json'
    // 'Idempotency-Key': uuid()
  }

  const token = getStaticToken().user1

  if (token) {
    Object.assign(headers, {
      Authorization: `Bearer ${token}`
    })
  }

  const response = await fetch(config.VITE_GRAPHQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: request.text,
      variables
    })
  }).catch(console.log)

  const data = await response.json()

  return data
}
