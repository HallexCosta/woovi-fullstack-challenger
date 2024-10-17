import React, { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

export const useIdempotencyKey = () => {
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null)

  const generateNewIdempotencyKey = () => uuidv4()

  return {
    idempotencyKey,
    setIdempotencyKey,
    generateNewIdempotencyKey
  }
}

// export const useIdempotency = (action, ttl = 60000) => {
// 	const [idempotencyKey, setIdempotencyKey] = useState(null)
// 	const [pending, setPending] = useState(false)

// 	const createRequest = async (variables) => {
// 		// if (pending) {
// 		// 	console.warn('Request already in progress with the same idempotency key')
// 		// 	return
// 		// }

// 		const key = uuidv4()
// 		setIdempotencyKey(key)
// 		setPending(true)

// 		try {
// 			await action({ ...variables, idempotencyKey: key })
// 		} catch (error) {
// 			console.error('Error in request', error)
// 		} finally {
// 			setTimeout(() => {
// 				setPending(false)
// 				setIdempotencyKey(null)
// 			}, ttl)
// 		}
// 	}

// 	return { createRequest, idempotencyKey, pending }
// }
