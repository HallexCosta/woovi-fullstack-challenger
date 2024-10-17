import {
  act,
  fireEvent,
  getByText,
  mockEnvironment,
  render,
  userEvent,
  waitFor
} from '@/__tests__/setup/utils/AllProviders'

import { Routes } from '@/__tests__/setup/routes'
import { SignInMutation } from '@/pages/auth/tabs/mutation/SignInMutation'
import { SignUpMutation } from '@/pages/auth/tabs/mutation/SignUpMutation'
import { MockPayloadGenerator } from 'relay-test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import * as useTabs from '@/pages/auth/hooks/useTabs.tsx'

const useTabsSpy = vi.spyOn(useTabs, 'useTabs')

const {
  useTabs: mockUseTabs,
  tab: mockTab,
  changeTab: mockChangeTab
} = await vi.hoisted(async () => {
  vi.resetModules()
  const tab = 'signin'

  const changeTabSpy = vi.fn().mockReturnThis()

  return {
    useTabs: vi.fn().mockReturnValue({ tab, changeTab: changeTabSpy }),
    tab,
    changeTab: changeTabSpy
  }
})

// vi.mock('../../pages/auth/hooks/useTabs.tsx', async () => {
// 	console.log({ actual: 'FOI' })

// 	return {
// 		// ...actual,
// 		useTabs: mockUseTabs
// 	}
// })

const toast = vi.hoisted(() => {
  vi.resetModules()

  return {
    toast: {
      success: vi.fn(),
      warning: vi.fn(),
      error: vi.fn()
    },
    Toaster: vi.fn()
  }
})

const { toast: mockToast } = toast

vi.mock('sonner', async () => {
  const actual = await import('sonner')
  return {
    ...actual,
    ...toast
  }
})

const { useCookies: mockUseCookies, mockSetCookie } = await vi.hoisted(
  async () => {
    vi.resetModules()

    const mockSetCookie = vi.fn().mockReturnThis()
    return {
      useCookies: vi
        .fn()
        .mockReturnValue([{ token: 'some-token' }, mockSetCookie]),
      mockSetCookie
    }
  }
)
vi.mock('react-cookie', async () => {
  const actual = await import('react-cookie')
  return {
    ...actual,
    useCookies: mockUseCookies
  }
})

describe('page "/"', async () => {
  afterEach(() => {
    mockEnvironment.mockClear()
    vi.clearAllMocks()
  })

  describe('tab sign-in', () => {
    // Example test may be written like so
    it('should should be sign in', async () => {
      const token = 'some-token'

      const Root = () => {
        return <Routes />
      }

      const { getByPlaceholderText, getByText } = render(<Root />)

      const customMockResolvers = {
        Mutation: () => ({
          SignIn: {
            token,
            error: null,
            success: 'User authenticated with successfully'
          }
        })
      }
      mockEnvironment.mock.queuePendingOperation(SignInMutation, {
        input: {
          email: 'hallex.costa@hotmail.com'
        }
      })

      mockEnvironment.mock.queueOperationResolver((operation) =>
        MockPayloadGenerator.generate(operation, customMockResolvers)
      ) // don´t this together
      // environment.mock.resolve(
      // 		operation,
      // 		MockPayloadGenerator.generate(operation, customMockResolvers)
      // )

      await waitFor(async () => {
        fireEvent.change(getByPlaceholderText('name@example.com'), {
          target: { value: 'hallex.costa@hotmail.com' }
        })
        fireEvent.click(getByText(/sign in with email/i))

        // const operation = await waitFor(() => {
        // 	const operation = environment.mock.getMostRecentOperation()
        // 	expect(operation).toBeDefined()
        // 	return operation
        // })

        // act(() => {
        // 	environment.mock.resolve(
        // 		operation,
        // 		MockPayloadGenerator.generate(operation, customMockResolvers)
        // 	)
        // })
      })

      expect(mockToast.success).toBeCalledTimes(1)
      expect(mockToast.success).toBeCalledWith(
        'User authenticated with successfully'
      )

      expect(mockSetCookie).toHaveBeenCalledTimes(1)
      expect(mockSetCookie).toHaveBeenCalledWith('token', 'some-token', {
        secure: true
      })
    })

    it('should show toast error if sign in return message error', async () => {
      const token = 'some-token'

      const Root = () => {
        return <Routes />
      }

      const { getByPlaceholderText, getByText } = render(<Root />)

      const customMockResolvers = {
        Mutation: () => ({
          SignIn: {
            token,
            error: 'Pix key or email already in use',
            success: null
          }
        })
      }
      mockEnvironment.mock.queuePendingOperation(SignInMutation, {
        input: {
          email: 'hallex.costa@hotmail.com'
        }
      })

      mockEnvironment.mock.queueOperationResolver((operation) =>
        MockPayloadGenerator.generate(operation, customMockResolvers)
      )

      // await waitFor(async () => {
      // 	fireEvent.change(getByPlaceholderText('name@example.com'), {
      // 		target: { value: 'hallex.costa@hotmail.com' }
      // 	})
      // 	fireEvent.click(getByText(/sign in with email/i))
      // })

      await userEvent.type(
        getByPlaceholderText('name@example.com'),
        'hallex.costa@hotmail.com'
      )
      await userEvent.click(getByText(/sign in with email/i))

      expect(mockToast.error).toBeCalledTimes(1)
      expect(mockToast.error).toBeCalledWith('Pix key or email already in use')

      expect(mockSetCookie).not.toHaveBeenCalled()
    })
  })

  describe('tab sign-up', () => {
    it('should be sign-up ', async () => {
      const tabContext = {
        tab: 'signin'
      }

      const tabSpy = vi.spyOn(tabContext, 'tab', 'get')
      const changeTabSpy = vi.fn()
      useTabsSpy.mockReturnValue({
        tab: tabContext.tab,
        changeTab: changeTabSpy
      })

      const { getByPlaceholderText, getByTestId, getByText } = render(
        <Routes />
      )

      expect(useTabsSpy).toHaveBeenCalled()

      // change to tab sign-
      await userEvent.click(getByTestId('signUpTrigger'))
      expect(changeTabSpy).toHaveBeenCalled()
      expect(tabSpy).toHaveBeenCalled()

      const payload = {
        variables: {
          input: {
            email: 'hallex.costa@hotmail.com',
            pixKey: 'hallex.costa@hotmail.com',
            fullName: 'hallexcosta'
          }
        }
      }

      const emailInput = getByPlaceholderText('name@example.com')
      const fullNameInput = getByTestId('fullName')
      const pixKeyInput = getByPlaceholderText('CPF/CNPJ/Email/Telefone')

      expect(emailInput).toBeDefined()
      expect(fullNameInput).toBeDefined()
      expect(pixKeyInput).toBeDefined()

      await userEvent.type(emailInput, 'hallex.costa@hotmail.com')
      await userEvent.type(fullNameInput, 'Hállex da Silva Costa')
      await userEvent.type(pixKeyInput, '+5500000000000')

      mockEnvironment.mock.queuePendingOperation(
        SignUpMutation,
        payload.variables
      )

      const customMockResolvers = {
        Mutation: () => ({
          SignUp: {
            userEdge: {
              node: {
                id: '1234',
                email: 'hallex.costa@hotmail.com',
                pixKey: '+5500000000000'
              }
            },
            success: 'User created with successfully',
            error: null
          }
        })
      }
      mockEnvironment.mock.queueOperationResolver((operation) =>
        MockPayloadGenerator.generate(operation, customMockResolvers)
      )

      await userEvent.click(getByTestId('submitSignUp'))

      expect(mockToast.success).toBeCalledWith('User created with successfully')
      // debug()
    })
    it('should be show toast error if pix key or email already in use', async () => {
      const tabContext = {
        tab: 'signin'
      }

      const tabSpy = vi.spyOn(tabContext, 'tab', 'get')
      const changeTabSpy = vi.fn()
      useTabsSpy.mockReturnValue({
        tab: tabContext.tab,
        changeTab: changeTabSpy
      })

      const { getByPlaceholderText, getByTestId, getByText } = render(
        <Routes />
      )

      expect(useTabsSpy).toHaveBeenCalled()

      // change to tab sign-up
      await userEvent.click(getByTestId('signUpTrigger'))
      expect(changeTabSpy).toHaveBeenCalled()
      expect(tabSpy).toHaveBeenCalled()

      const payload = {
        variables: {
          input: {
            email: 'hallex.costa@hotmail.com',
            pixKey: 'hallex.costa@hotmail.com',
            fullName: 'hallexcosta'
          }
        }
      }
      mockEnvironment.mock.queuePendingOperation(
        SignUpMutation,
        payload.variables
      )

      const customMockResolvers = {
        Mutation: () => ({
          SignUp: {
            userEdge: {
              node: {
                id: '1234',
                email: 'hallex.costa@hotmail.com',
                pixKey: '+5500000000000'
              }
            },
            error: 'Pix key or email already in use',
            success: null
          }
        })
      }
      mockEnvironment.mock.queueOperationResolver((operation) =>
        MockPayloadGenerator.generate(operation, customMockResolvers)
      )

      // change to tab sign-up
      await userEvent.click(getByTestId('signUpTrigger'))
      const emailInput = getByPlaceholderText('name@example.com')
      const fullNameInput = getByTestId('fullName')
      const pixKeyInput = getByPlaceholderText('CPF/CNPJ/Email/Telefone')

      expect(emailInput).toBeDefined()
      expect(fullNameInput).toBeDefined()
      expect(pixKeyInput).toBeDefined()

      await userEvent.type(emailInput, 'hallex.costa@hotmail.com')
      await userEvent.type(fullNameInput, 'Hállex da Silva Costa')
      await userEvent.type(pixKeyInput, '+5500000000000')

      await userEvent.click(getByTestId('submitSignUp'))

      expect(mockToast.error).toBeCalledWith('Pix key or email already in use')
    })

    it('should be show toast error if pix key is invalid', async () => {
      const tabContext = {
        tab: 'signin'
      }

      const tabSpy = vi.spyOn(tabContext, 'tab', 'get')
      const changeTabSpy = vi.fn()
      useTabsSpy.mockReturnValue({
        tab: tabContext.tab,
        changeTab: changeTabSpy
      })

      const { getByPlaceholderText, getByTestId, getByText } = render(
        <Routes />
      )

      expect(useTabsSpy).toHaveBeenCalled()

      // change to tab sign-up
      await userEvent.click(getByTestId('signUpTrigger'))
      expect(changeTabSpy).toHaveBeenCalled()
      expect(tabSpy).toHaveBeenCalled()

      const emailInput = getByPlaceholderText('name@example.com')
      const fullNameInput = getByPlaceholderText('Full name')
      const pixKeyInput = getByPlaceholderText('CPF/CNPJ/Email/Telefone')

      expect(emailInput).toBeDefined()
      expect(fullNameInput).toBeDefined()
      expect(pixKeyInput).toBeDefined()

      await userEvent.type(emailInput, 'hallex.costa@hotmail.com')
      await userEvent.type(fullNameInput, 'Hállex da Silva Costa')
      await userEvent.type(pixKeyInput, 'teste')

      await userEvent.click(getByTestId('submitSignUp'))

      expect(mockToast.error).toBeCalledWith('Pix key is invalid')
    })
  })
})
