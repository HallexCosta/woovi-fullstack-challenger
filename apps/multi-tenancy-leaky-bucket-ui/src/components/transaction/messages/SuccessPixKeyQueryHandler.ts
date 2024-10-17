import { toast } from 'sonner'

export const SuccessPixKeyQueryHandler = (
  PixKeyQuery: any,
  checkedPixKey: string,
  inMemoryAlreadyCheckedValidPixKeys: Map<string, string>
) => {
  if (
    PixKeyQuery.success?.toLowerCase() ===
    'Pix key query successfully'.toLowerCase()
  ) {
    const attempts = PixKeyQuery.bucketCurrentCapacity
    console.log(checkedPixKey, PixKeyQuery.requestId)
    inMemoryAlreadyCheckedValidPixKeys.set(checkedPixKey, PixKeyQuery.requestId)

    toast.success(PixKeyQuery.success, {
      position: 'top-right',
      description: `You have ${attempts} attemps to check`
    })
  }
}
