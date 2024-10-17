// {
//   pixKey: "+5518997887240",
//   amount: 100
// }

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Form } from 'react-router-dom'
import { useRifm } from 'rifm'
import { z } from 'zod'
import { Button } from '../ui/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../ui/form'
import { Input } from '../ui/input'
import { formatPixKey, validationPixKey } from './validation'

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

export const CreatePixTransactionForm = () => {
  const inputPixKeyRef = useRef(null)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      amount: 0,
      pixKey: ''
      // destinationReceiverAccountPublicId: 0
    }
  })

  const pixKeyRifm = useRifm({
    value: form.getValues('pixKey'),
    onChange: (text: string) => {
      const value = text.replace(/[^\d\w+@.-]/g, '')
      form.setValue('pixKey', formatPixKey(value))
    },
    format: formatPixKey
  })

  useEffect(() => {
    if (inputPixKeyRef.current)
      inputPixKeyRef.current?.setSelectionRange(
        form.getValues('pixKey').length,
        form.getValues('pixKey').length
      )
  }, [form.getValues])

  const validationMakeTransaction = () =>
    console.log('validationMakeTransaction')
  const makeTransaction = () => console.log('MakeTransactionw')

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(makeTransaction, validationMakeTransaction)}
        id="send-transaction"
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          // name="amount"
          name="amount"
          render={({ field }) => (
            <FormItem>
              {/* <FormLabel htmlFor="amount">Amount</FormLabel> */}

              <FormControl>
                <Input
                  // ref={inputAmountRef}
                  id="amount"
                  placeholder="R$ 0,00"
                  type="tel"
                  // value={textAmount}
                  // onChange={rifm.onChange}
                />
              </FormControl>
            </FormItem>
            // <></>
          )}
        />

        {/* <FormField
					name="pixKey"
					control={form.control}
					render={({ field }) => {
						return (
							<FormItem>
								<FormLabel>Pix Key</FormLabel>
								<FormControl>
									<Input
										ref={inputPixKeyRef}
										value={form.getValues('pixKey')}
										onChange={pixKeyRifm.onChange}
										placeholder="CPF/CNPJ/Email/Telefone"
										autoComplete="pix"
										autoCorrect="off"
									/>

									<FormMessage />
								</FormControl>
							</FormItem>
						)
					}}
				/> */}

        <Button
          className="w-fit self-end"
          type="submit"
          data-testid="createTransaction"
          // disabled={isMakingTransaction}
        >
          {false ? 'Sending...' : 'Send'}
        </Button>
      </form>
    </Form>
  )
}
