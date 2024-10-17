interface Result extends Array<any | Error | null> {}

export const left = <T = any>(error: Error | string): T | null => {
  const response = []

  response[0] = null
  if (error instanceof Error) {
    response[1] = error
  } else {
    response[1] = new Error(error)
  }

  return <T>response
}

export const right = <T = Result>(data?: any): T | null => {
  const response = []

  response[0] = data
  response[1] = null

  return <T>response
}

export const isLeft: (result: Result) => boolean = (result: Result) => {
  if (!result[0]) return true

  return false
}
export const isRight: (result: Result) => boolean = (result: Result) => {
  if (result[0]) return true

  return false
}
