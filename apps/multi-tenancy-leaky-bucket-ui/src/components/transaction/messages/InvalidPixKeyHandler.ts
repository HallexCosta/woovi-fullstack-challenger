import { toast } from 'sonner'

export const InvalidPixKeyHandler = (
  PixKeyQuery: any,
  alreadyCheckedPixKey: string,
  inMemoryAlreadyCheckedInvalidPixKeys: Map<string, string>
) => {
  if (PixKeyQuery.error?.toLowerCase() === 'Invalid pix key'.toLowerCase()) {
    const attempts = PixKeyQuery.bucketCurrentCapacity
    inMemoryAlreadyCheckedInvalidPixKeys.set(
      alreadyCheckedPixKey,
      PixKeyQuery.requestId
    )
    toast.error(PixKeyQuery.error, {
      position: 'top-right',
      description: `You have ${attempts} attemps to check`
    })
  }
}
