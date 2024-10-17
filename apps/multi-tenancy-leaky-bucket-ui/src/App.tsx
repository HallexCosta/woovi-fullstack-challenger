import {
  graphql,
  useClientQuery,
  useLazyLoadQuery,
  useMutation
} from 'react-relay'
import { CreatePixTransactionForm } from './components/transaction/CreatePixTransactionForm'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
// import { CreateTransactionForm } from './components/transaction/mutation/CreateTransactionForm'

import { zodResolver } from '@hookform/resolvers/zod'
import { memo, useEffect, useRef, useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { useRifm } from 'rifm'
import { toast } from 'sonner'
import { z } from 'zod'
import { messages } from './components/transaction/messages'
import { CreatePixTransactionMutation } from './components/transaction/mutation/CreatePixTransactionMutation'
import { PixKeyQueryMutation } from './components/transaction/mutation/PixKeyQueryMutation'
import {
  formatPixKey,
  validationPixKey
} from './components/transaction/validation'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from './components/ui/form'
import { Label } from './components/ui/label'
import { Toaster } from './components/ui/sonner'
import { getIntegerNumberByString, numberFormatBR } from './lib/utils'

const FormSchema = z.object({
  pixKey: z
    .string({
      message: 'Please enter a valid pix key'
    })
    .refine((data) => validationPixKey(data), {
      message: 'Pix key is invalid'
    }),
  amount: z
    .number()
    .refine((val) => val > 0, { message: 'Can´t possible transfer R$ 0,00' })
})

const inMemoryAlreadyCheckedValidPixKeys = new Map()
const inMemoryAlreadyCheckedInvalidPixKeys = new Map()

function App() {
  const [allowRepeatPixKeyQuery, setAllowRepeatPixKeyQuery] = useState(true)

  const myPixKey = 'hallex.costa@hotmail.com'
  const [enableBtnPixKeyQuery, setEnableBtnPixKeyQuery] = useState(false)

  const appQuery = useLazyLoadQuery(
    graphql`
	      query AppQuery {
	        users {
	          error
	          edges {
	            node {
	              publicId
	              tenant {
	                publicId
	              }
	            }
	          }
	        }
	      }
	    `,
    { input: {} },
    {}
  )

  const [makeTransactionCommit, isMakingTransaction] = useMutation(
    CreatePixTransactionMutation
  )
  const [makePixKeyQueryCommit, isMakingPixKeyQuery] =
    useMutation(PixKeyQueryMutation)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pixKey: '',
      amount: 0
    }
  })

  const inputPixKeyRef = useRef(null)
  const pixKeyRifm = useRifm({
    value: form.getValues('pixKey'),
    onChange: (text: string) => {
      if (text.length > 0) {
        setEnableBtnPixKeyQuery(true)
      } else {
        setEnableBtnPixKeyQuery(false)
      }

      const value = text.replace(/[^\d\w+@.-]/g, '')
      form.setValue('pixKey', formatPixKey(value))
    },
    format: formatPixKey
  })

  const [textAmount, setTextAmount] = useState('')
  const inputAmountRef = useRef(null)

  const inputAmountRifm = useRifm({
    value: textAmount,
    onChange: (text: string) => {
      const amountInteger = getIntegerNumberByString(text)

      setTextAmount(text)
      form.setValue('amount', amountInteger)
    },
    format: numberFormatBR
  })

  useEffect(() => {
    // need time out for that setSelectionRange will be triggered after the cycle render end
    if (inputAmountRef.current) {
      const cursorPosition = textAmount.length
      inputAmountRef.current.setSelectionRange(cursorPosition, cursorPosition)
    }
  }, [textAmount])

  const makeTransaction = ({ amount, pixKey }: z.infer<typeof FormSchema>) => {
    console.log({ amount, pixKey })

    // if (!inMemoryAlreadyCheckedValidPixKeys.has(pixKey)) {
    // 	return toast.error('This pix key dont was checked yet', {
    // 		position: 'top-right'
    // 	})
    // }

    if (inMemoryAlreadyCheckedInvalidPixKeys.has(pixKey)) {
      return toast.error(
        `The pix key "${pixKey}" was cataloged as invalid key`,
        {
          position: 'top-right'
        }
      )
    }

    makeTransactionCommit({
      variables: {
        input: {
          amount,
          pixKey,
          pixKeyQueryRequestId:
            inMemoryAlreadyCheckedValidPixKeys.get(pixKey) ?? null
        }
      },
      onCompleted: ({ CreatePixTransaction }) => {
        // here can implement idempotency, but the ideia is testing the bucket
        // if want a idempotency implementaion access ./apps/bank-ui and find by file CreateTransactionForm.tsx

        if (CreatePixTransaction.error) {
          toast.error(CreatePixTransaction.error, {
            position: 'top-right'
          })
        }

        if (CreatePixTransaction.success) {
          inMemoryAlreadyCheckedValidPixKeys.delete(pixKey)
          toast.success(CreatePixTransaction.success, {
            position: 'top-right'
          })
        }
      },
      onError: (error) => console.log('onError', error)
    })
  }

  const makePixKeyQuery = () => {
    const pixKey = pixKeyRifm.value

    if (pixKey === myPixKey) {
      return toast.error(
        'You cannot spend your tokens by checking your own pix key',
        {
          position: 'top-right'
        }
      )
    }

    if (!validationPixKey(pixKey)) {
      return toast.error('Pix key have invalid format', {
        position: 'top-right'
      })
    }

    if (!allowRepeatPixKeyQuery) {
      if (
        inMemoryAlreadyCheckedInvalidPixKeys.has(pixKey) ||
        inMemoryAlreadyCheckedValidPixKeys.has(pixKey)
      ) {
        return toast.error('Pix key already checked', {
          position: 'top-right'
        })
      }
    }

    makePixKeyQueryCommit({
      variables: {
        input: {
          pixKey
        }
      },
      onCompleted: ({ PixKeyQuery }) => {
        messages.TooManyRequestsHandler(PixKeyQuery)
        messages.InvalidPixKeyHandler(
          PixKeyQuery,
          pixKey,
          inMemoryAlreadyCheckedInvalidPixKeys
        )
        messages.SuccessPixKeyQueryHandler(
          PixKeyQuery,
          pixKey,
          inMemoryAlreadyCheckedValidPixKeys
        )
        console.log(inMemoryAlreadyCheckedValidPixKeys)
      },
      onError: (error) => console.log('onError', error)
    })
  }

  return (
    <>
      <h1>Hállex Costa</h1>

      <div className="my-0 mx-auto max-w-2xl border rounded p-12">
        <h1 className="text-3xl font-bold mb-4">Make Transaction</h1>
        <div className="flex gap-4 flex-col">
          {/* <Input placeholder="CPF/CNPJ/EMAIL/Telefone" value="" />
					<Input placeholder="R$ 0,00" value="" /> */}
          {/* <CreatePixTransactionForm /> */}

          <Label>You pix key: {myPixKey}</Label>

          <div className="flex gap-2">
            <Input
              className="w-4 h-4"
              type="checkbox"
              onChange={(e) => {
                setAllowRepeatPixKeyQuery(!allowRepeatPixKeyQuery)
              }}
              checked={allowRepeatPixKeyQuery}
            />
            <Label>Allow repeat pix key query?</Label>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(makeTransaction)}
              className="space-y-8"
            >
              <FormField
                control={form.control}
                name="pixKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pix Key</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        ref={inputPixKeyRef}
                        value={form.getValues('pixKey')}
                        onChange={pixKeyRifm.onChange}
                        placeholder="CPF/CNPJ/Email/Phone"
                      />
                    </FormControl>
                    <FormDescription>
                      <Button
                        disabled={!enableBtnPixKeyQuery || isMakingPixKeyQuery}
                        type="button"
                        onClick={makePixKeyQuery}
                      >
                        Check pix key
                      </Button>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <InputAmountFormField form={form} /> */}

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount BRL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        ref={inputAmountRef} // Adiciona a ref ao input
                        value={textAmount} // Usa o valor controlado
                        onChange={inputAmountRifm.onChange} // Usa o onChange do Rifm
                        placeholder="R$ 0,00"
                      />
                    </FormControl>
                    <FormDescription>
                      This is your public display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </div>
        {/* <Button className="mt-4">Send</Button> */}
      </div>

      <Toaster />
    </>
  )
}

export default App
