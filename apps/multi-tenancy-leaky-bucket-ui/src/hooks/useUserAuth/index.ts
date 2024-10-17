// import {} from ''
import { decodeJWTToken } from '@/common/decodeTokenJWT'
import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { useNavigate } from 'react-router-dom'

const refreshToken = () => {
  // const {} = useMutation(RefreshTokenMutation)
}

type UserToken = {
  exp: number
  iat: number
  publicId: number
  accountPublicId: number
}

const verifyExpirationToken = (token: string) => {
  const { exp } = decodeJWTToken<UserToken>(token)

  const expirationDateInMilliseconds = exp * 1000

  console.log(new Date(), new Date(expirationDateInMilliseconds))

  return Date.now() > expirationDateInMilliseconds
}

export const useUserAuth = () => {
  const [cookies] = useCookies()
  const [isAuthPending, setIsAuthPending] = useState(true)
  const [isExpirated, setIsExpirated] = useState<boolean | null>(null)

  const navigate = useNavigate()

  useEffect(() => {
    console.log(Object.values(cookies).length)
    if (!Object.values(cookies).length) return navigate('/')

    setIsExpirated(verifyExpirationToken(cookies.token))

    if (isExpirated) return navigate('/')

    setIsAuthPending(false)
  }, [])

  const { publicId, accountPublicId } = Object.values(cookies).length
    ? decodeJWTToken<UserToken>(cookies.token)
    : {
        publicId: null,
        accountPublicId: null
      }

  console.log(publicId, accountPublicId)

  return {
    accountPublicId,
    publicId,
    isAuthPending
  }
}
