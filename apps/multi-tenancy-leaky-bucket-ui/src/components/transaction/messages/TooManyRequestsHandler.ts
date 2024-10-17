import { toast } from 'sonner'

export const TooManyRequestsHandler = (PixKeyQuery: any) => {
  if (PixKeyQuery.error?.toLowerCase() === 'Too many requests'.toLowerCase()) {
    toast.error(`${PixKeyQuery.error}. Try again at 1 hour`, {
      position: 'top-right'
    })
  }
}
