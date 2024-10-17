export const generateUTCHashId = () => {
  const now = new Date()

  const year = now.getUTCFullYear()
  const month = now.getUTCMonth() + 1
  const day = now.getUTCDate()
  const hour = now.getUTCHours()
  const minutes = now.getUTCMinutes()

  const formattedMonth = month.toString().padStart(2, '0')
  const formattedDay = day.toString().padStart(2, '0')
  const formattedHour = hour.toString().padStart(2, '0')
  const formattedMinutes = minutes.toString().padStart(2, '0')

  return `${year}${formattedMonth}${formattedDay}${formattedHour}${formattedMinutes}`
}
