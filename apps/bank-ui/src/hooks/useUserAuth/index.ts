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
  userCreatedAt: string
  publicId: number
  accountPublicId: number
}

const verifyExpirationToken = (token: string) => {
  const decodedUser = decodeJWTToken<UserToken>(token)

  if (!decodedUser) return false

  const { exp } = decodedUser

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

  const decodedUser = Object.values(cookies).length
    ? decodeJWTToken<UserToken>(cookies.token)
    : {
        userCreatedAt: null,
        publicId: null,
        accountPublicId: null
      }

  if (!decodedUser) {
    return {
      userCreatedAt: null,
      publicId: null,
      accountPublicId: null
    }
  }

  const { userCreatedAt, publicId, accountPublicId } = decodedUser
  // console.log(decodedUser.publicId, decodedUser.accountPublicId)

  return {
    userCreatedAt,
    accountPublicId,
    publicId,
    isAuthPending
  }
}
