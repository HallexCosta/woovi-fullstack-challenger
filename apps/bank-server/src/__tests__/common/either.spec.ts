import { left, right } from '@/common/either'
import { describe, expect, it } from 'vitest'

describe('either data type', () => {
  describe('left', () => {
    it('Should be return success null and error with message if use left function', () => {
      expect(left('Error Message')).toMatchObject({
        error: 'Error Message',
        success: null
      })
    })

    it('Should be add more data to return from output', () => {
      expect(left('Error Message', { token: 'some-token' })).toMatchObject({
        error: 'Error Message',
        success: null,
        token: 'some-token'
      })
    })

    it('Should be return null if left define a value to success property', () => {
      expect(left('Error Message', { success: 'some-value' })).toBeNull()
    })
  })
  describe('right', () => {
    it('Should be return error null and success with message if use right function', () => {
      expect(right('Success Message')).toMatchObject({
        success: 'Success Message',
        error: null
      })
    })
    it('Should be add more data to return from output', () => {
      expect(right('Success Message', { token: 'some-token' })).toMatchObject({
        success: 'Success Message',
        error: null,
        token: 'some-token'
      })
    })

    it('Should be return null if right define a value to success property', () => {
      expect(right('Success Message', { error: 'some-value' })).toBeNull()
    })
  })
})
