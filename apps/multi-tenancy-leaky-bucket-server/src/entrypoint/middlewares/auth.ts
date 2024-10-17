import { left, right } from '@/common/either'
import { TenantLoader } from '@/modules/tenant/TenantLoader'
import { UserLoader } from '@/modules/user/UserLoader'
import { type JwtPayload, decode } from 'jsonwebtoken'

export const decryptBearerToken = async (authorization: string | null) => {
  try {
    if (!authorization) return left('Authorization token not found')

    const token = authorization.split(' ')[1]
    const decoded = decode(token) as JwtPayload

    if (!decoded) return left('Failed while decode token')

    const userPublicId = decoded.userPublicId
    const tenantPublicId = decoded.tenantPublicId

    if (!userPublicId || !tenantPublicId) {
      return left('Authorization token is invalid')
    }

    const tenant = await TenantLoader.load({
      publicId: decoded.tenantPublicId
    })

    if (!tenant) return left('Tenant not found')

    const user = await UserLoader.load({
      publicId: Number(userPublicId),
      tenantId: tenant.id
    })

    if (!user) {
      return left('User not found')
    }

    return right({ user, tenant })
  } catch (e) {
    console.log(e.message)
    return left(e.message)
  }
}
