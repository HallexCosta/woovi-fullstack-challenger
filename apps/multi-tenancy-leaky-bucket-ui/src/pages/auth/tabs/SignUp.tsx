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
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-relay'
import { useRifm } from 'rifm'
import { toast } from 'sonner'
import { z } from 'zod'
import { useTabs } from '../hooks/useTabs'
import { formatPixKey, validationPixKey } from '../validation'
import { SignUpMutation } from './mutation/SignUpMutation'
import type { SignUpMutation$data } from './mutation/__generated__/SignUpMutation.graphql'

const SignUpFormSchema = z.object({
  fullName: z.string(),
  email: z
    .string()
    .min(2, {
      message: 'Email must be at least 2 characters.'
    })
    .email('Input a valid email address'),
  pixKey: z.string().refine((data) => validationPixKey(data), {
    message: 'Pix key is invalid'
  })
})

export const SignUpTrigger = () => (
  <TabsTrigger data-testid="signUpTrigger" value="signup">
    Sign Up
  </TabsTrigger>
)

type SignUpTabProps = {
  onChangeTab: () => void
}

export const SignUpTab = ({ onChangeTab }: SignUpTabProps) => {
  const [commitSignUp, isSignUp] = useMutation(SignUpMutation)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const inputPixKeyRef = useRef(null)

  const { tab } = useTabs()

  const signUpForm = useForm<z.infer<typeof SignUpFormSchema>>({
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: {
      email: '',
      pixKey: '',
      fullName: ''
    }
  })

  const pixKeyRifm = useRifm({
    value: signUpForm.getValues('pixKey'),
    onChange: (text: string) => {
      const value = text.replace(/[^\d\w+@.-]/g, '') // Remove caracteres inválidos
      signUpForm.setValue('pixKey', formatPixKey(value))
    },
    format: formatPixKey
  })

  useEffect(() => {
    if (inputPixKeyRef.current)
      inputPixKeyRef.current?.setSelectionRange(
        signUpForm.getValues('pixKey').length,
        signUpForm.getValues('pixKey').length
      )
  }, [signUpForm.getValues])

  async function signUp({
    fullName,
    pixKey,
    email
  }: z.infer<typeof SignUpFormSchema>) {
    commitSignUp({
      onCompleted: (response: SignUpMutation$data) => {
        const { SignUp } = response
        console.log('onCompleted', SignUp)

        if (!SignUp) return

        if (SignUp.error) {
          toast.error(SignUp.error)
        }
        if (SignUp.success) {
          toast.success(SignUp.success)
          onChangeTab()
        }

        // changeTab('signin')
        console.log({ tab })
      },
      onError: (data) => console.log('onError', data),
      variables: {
        input: {
          fullName,
          pixKey,
          email
        }
      }
    })

    setTimeout(() => {
      setIsLoading(false)
    }, 3000)
  }
  const validationSignUp = ({
    email,
    pixKey
  }: z.infer<typeof SignUpFormSchema>) => {
    console.log({ email, pixKey })

    if (pixKey) toast.error(pixKey.message)
  }

  return (
    <TabsContent value="signup">
      <Form {...signUpForm}>
        <form onSubmit={signUpForm.handleSubmit(signUp, validationSignUp)}>
          <div className="grid gap-2">
            <FormField
              control={signUpForm.control}
              name="fullName"
              render={({ field }) => (
                <div className="grid gap-2">
                  <FormItem className="grid gap-1">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        id="name"
                        data-testid="fullName"
                        placeholder="Full name"
                        type="text"
                        autoCapitalize="words"
                        autoComplete="name"
                        autoCorrect="off"
                        disabled={isSignUp}
                        onChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                </div>
              )}
            />

            <FormField
              control={signUpForm.control}
              name="email"
              render={({ field }) => (
                <div className="grid gap-2">
                  <FormItem className="grid gap-1">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        data-testid="email"
                        placeholder="name@example.com"
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                        disabled={isSignUp}
                        onChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                </div>
              )}
            />

            <FormField
              control={signUpForm.control}
              name="pixKey"
              render={({ field }) => (
                <div className="grid gap-2">
                  <FormItem className="grid gap-1">
                    <FormLabel>Pix key</FormLabel>
                    <FormControl>
                      <Input
                        ref={inputPixKeyRef}
                        id="pixKey"
                        placeholder="CPF/CNPJ/Email/Telefone"
                        type="text"
                        autoCapitalize="none"
                        autoComplete="pix"
                        autoCorrect="off"
                        onChange={pixKeyRifm.onChange}
                        value={signUpForm.getValues('pixKey')}
                        disabled={isSignUp}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                </div>
              )}
            />

            <Button data-testid="submitSignUp" disabled={isSignUp}>
              {isSignUp && <LoadingSpinner type="long" className="mr-2" />}
              Sign Up
            </Button>
          </div>
        </form>
      </Form>
    </TabsContent>
  )
}
