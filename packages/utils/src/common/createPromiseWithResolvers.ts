export type PromiseWithResolvers<T> = {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (value?: Error) => void
}

export const createPromiseWithResolvers: <
  T extends Record<string, any>
>() => PromiseWithResolvers<T> = <T extends Record<string, any>>() => {
  let resolve = null
  let reject = null
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })

  return {
    promise,
    resolve,
    reject
  } as unknown as PromiseWithResolvers<T>
}
