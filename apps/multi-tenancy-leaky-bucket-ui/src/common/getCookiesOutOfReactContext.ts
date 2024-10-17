export const getCookiesOutOfReactContext = () => {
  const parts = document.cookie.split('=')

  const allKeys = []
  // par values
  for (let count = 0; count < parts.length; count = count + 2) {
    allKeys.push(parts[count])
  }

  // impar values
  const allValues = []
  for (let count = 1; count < parts.length; count = count + 2) {
    allValues.push(parts[count])
  }

  // intersect
  return allKeys.reduce((prev, curr, currIndex) => {
    prev[curr] = allValues[currIndex]
    return prev
  }, {}) as Record<string, any>
}
