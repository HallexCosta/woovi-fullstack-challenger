type PromiseWithResolvers = {
  promise: Promise<unknown>
  resolve: (value: unknown) => void
  reject: (value?: unknown) => void
}

export const createPromiseWithResolvers: () => PromiseWithResolvers = () => {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })

  return {
    promise,
    resolve,
    reject
  } as unknown as PromiseWithResolvers
}
