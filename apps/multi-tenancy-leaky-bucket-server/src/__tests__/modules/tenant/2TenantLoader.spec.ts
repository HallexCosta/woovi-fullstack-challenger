import { TenantLoader } from '@/modules/tenant/TenantLoader'
import { describe, expect, it } from 'vitest'

import { createTenant } from '@/__tests__/setup/fixtures/createTenant'

describe('TenantLoader', () => {
  it('should be list all tenant', async () => {
    const newTenants = [
      await createTenant(),
      await createTenant(),
      await createTenant()
    ]

    const tenants = await TenantLoader.loadAll()

    expect(tenants.length).toBe(newTenants.length)
  })

  it('should be list empty tenants array', async () => {
    const tenants = await TenantLoader.loadAll()

    expect(tenants).toStrictEqual([])
  })
  it('should be list one tenant', async () => {
    const newTenant = await createTenant()

    const tenant = await TenantLoader.load({
      publicId: newTenant.publicId
    })

    expect(tenant).toMatchObject(newTenant.toObject({ getters: true }))
  })
})
