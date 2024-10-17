interface Result extends Record<string, any> {
  success?: string | null
  error?: string | null
}

export const left = <T extends Result>(
  message: string,
  outputData?: T
): T | null => {
  const response = {
    success: null,
    error: message
  }

  Object.assign(response, outputData)

  if (outputData) {
    if (outputData.success) {
      console.log('success property should not have a value')
      return null
    }
  }

  return <T>response
}

export const right = <T extends Result>(
  message: string,
  outputData?: T
): T | null => {
  const response = {
    success: message,
    error: null
  }

  Object.assign(response, outputData)

  if (outputData) {
    if (outputData.error) {
      console.log('error  property should not have a value')
      return null
    }
  }

  return <T>response
}
