import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { TabsContent, TabsTrigger } from '@/components/ui/tabs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'
import { useCookies } from 'react-cookie'
import {
  type SubmitErrorHandler,
  type SubmitHandler,
  useForm
} from 'react-hook-form'
import { useMutation } from 'react-relay'
import { redirect, useNavigate, useNavigation } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { SignInMutation as SignInMutationGraphQL } from './mutation/SignInMutation'
import type {
  SignInMutation,
  SignInMutation$data
} from './mutation/__generated__/SignInMutation.graphql'

export const SignInTrigger = () => (
  <TabsTrigger data-testid="signInTrigger" value="signin">
    Sign In
  </TabsTrigger>
)

const SignInFormSchema = z.object({
  email: z
    .string()
    .min(2, {
      message: 'Email must be at least 2 characters.'
    })
    .email('Input a valid email address')
})
export const SignInTab = () => {
  const [commitSignIn, isSignIn] = useMutation<SignInMutation>(
    SignInMutationGraphQL
  )

  const [, setCookie] = useCookies()
  const navigate = useNavigate()

  const signInForm = useForm<z.infer<typeof SignInFormSchema>>({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: {
      email: ''
    }
  })

  const signIn: SubmitHandler<z.infer<typeof SignInFormSchema>> = useCallback(
    ({ email }) => {
      commitSignIn({
        variables: {
          input: { email }
        },
        onCompleted: ({ SignIn }: SignInMutation$data) => {
          console.log('mutation foi resolvida', SignIn)

          if (SignIn?.error) toast.error(SignIn.error)
          if (SignIn?.success) {
            toast.success(SignIn.success)
            setCookie('token', SignIn.token, {
              secure: true
            })
            navigate('/dashboard')
          }
        },
        onError: (error: Error) => {
          if (!error) toast.error('Ops... occurred and error')

          console.log('onError', error)
        }
      })
    },
    [commitSignIn, setCookie, navigate]
  )

  const validationSignIn: SubmitErrorHandler<
    z.infer<typeof SignInFormSchema>
  > = ({ email }) => {
    if (email?.message) toast.warning(email.message)
  }

  return (
    <TabsContent value="signin">
      <Form {...signInForm}>
        <form onSubmit={signInForm.handleSubmit(signIn, validationSignIn)}>
          <div className="grid gap-2">
            <FormField
              control={signInForm.control}
              name="email"
              render={({ field }) => (
                <FormItem className="grid gap-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      placeholder="name@example.com"
                      type="email"
                      value={field.value}
                      onChange={field.onChange}
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={isSignIn}
                    />
                  </FormControl>
                  {/* <FormDescription></FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button name="sign-in" disabled={isSignIn}>
              {isSignIn && (
                <LoadingSpinner
                  type="long"
                  className="mr-2 h-4 w-4 animate-spin"
                />
              )}
              Sign In with Email
            </Button>
          </div>
        </form>
      </Form>
    </TabsContent>
  )
}
