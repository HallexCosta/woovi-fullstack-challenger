import { TenantLoader } from '@/modules/tenant/TenantLoader'
import { TenantModel } from '@/modules/tenant/TenantModel'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/modules/tenant/TenantModel') // Mock the TenantModel to avoid actual DB calls

describe('TenantLoader', () => {
  afterEach(() => {
    vi.clearAllMocks() // Clear mocks after each test
  })

  describe('loadAll', () => {
    it('should return all tenants by calling TenantModel.find', async () => {
      // Arrange
      const mockTenants = [
        { _id: '1', name: 'Tenant1' },
        { _id: '2', name: 'Tenant2' }
      ]
      TenantModel.find.mockResolvedValue(mockTenants)

      // Act
      const result = await TenantLoader.loadAll()

      // Assert
      expect(TenantModel.find).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockTenants)
    })
  })

  describe('load', () => {
    it('should filter by id when provided', async () => {
      // Arrange
      const props = { id: '123' }
      const mockTenant = { _id: '123', name: 'Tenant123' }
      TenantModel.findOne.mockResolvedValue(mockTenant)

      // Act
      const result = await TenantLoader.load(props)

      // Assert
      expect(TenantModel.findOne).toHaveBeenCalledWith({ _id: '123' })
      expect(result).toEqual(mockTenant)
    })

    it('should filter by publicId when provided', async () => {
      // Arrange
      const props = { publicId: 456 }
      const mockTenant = { publicId: 456, name: 'Tenant456' }
      TenantModel.findOne.mockResolvedValue(mockTenant)

      // Act
      const result = await TenantLoader.load(props)

      // Assert
      expect(TenantModel.findOne).toHaveBeenCalledWith({ publicId: 456 })
      expect(result).toEqual(mockTenant)
    })

    it('should apply no filters when no props are provided', async () => {
      // Arrange
      const props = {}
      const mockTenant = { name: 'DefaultTenant' }
      TenantModel.findOne.mockResolvedValue(mockTenant)

      // Act
      const result = await TenantLoader.load(props)

      // Assert
      expect(TenantModel.findOne).toHaveBeenCalledWith({})
      expect(result).toEqual(mockTenant)
    })

    it('should skip undefined filters', async () => {
      // Arrange
      const props = { id: undefined, publicId: 789 }
      const mockTenant = { publicId: 789, name: 'Tenant789' }
      TenantModel.findOne.mockResolvedValue(mockTenant)

      // Act
      const result = await TenantLoader.load(props)

      // Assert
      expect(TenantModel.findOne).toHaveBeenCalledWith({ publicId: 789 })
      expect(result).toEqual(mockTenant)
    })
  })
})
