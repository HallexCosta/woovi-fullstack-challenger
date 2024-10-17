import secureRandom from 'secure-random'

export const generateUniqueIntId = (): number => {
  const randomNumbers = secureRandom.randomArray(10)

  const idString = randomNumbers.reduce((prev, curr) => {
    return `${prev}${curr}`
  }, '')

  return Number(idString.slice(0, 9))
}
