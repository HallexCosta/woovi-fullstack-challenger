import { useLocation, useSearchParams } from 'react-router-dom'

export const useQueryParams = () => {
  const [params] = useSearchParams()
  console.log(params.get('openCreateTransacionModal'))
  return {
    openCreateTransacionModal:
      params.get('openCreateTransacionModal') === 'true',
    year:
      Number(params.get('openCreateTransacionModal')) !== 0
        ? Number(params.get('openCreateTransacionModal'))
        : new Date().getFullYear()
  }
}
