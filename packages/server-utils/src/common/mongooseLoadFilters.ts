export const mongooseLoadFilters = <T>(props: {
  [s: string]: unknown
}): T => {
  const filters = {}

  for (const [key, value] of Object.entries(props)) {
    if (key === 'id') {
      Object.assign(filters, { _id: value })
      continue
    }

    if (value) {
      Object.assign(filters, { [key]: value })
    }
  }

  return <T>filters
}
