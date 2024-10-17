/// <reference types="vite-plugin-svgr/client" />
// import WooviLogo from '@/components/logos/woovi-logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icon } from '@iconify/react'
import { Loader2, QrCode, Smartphone } from 'lucide-react'
import { useState } from 'react'

import { Form } from '@/components/ui/form'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useForm } from 'react-hook-form'
import WooviLogo from '../assets/woovi-logo.svg?react'

export default function SignIn() {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm()

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
    }, 3000)
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <WooviLogo />

          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to sign in to your account
          </p>
        </div>
        <div className="grid gap-6">
          <Form {...form}></Form>

          <form onSubmit={onSubmit}>
            <div className="grid gap-2">
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="email">
                  Email
                </Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                />
              </div>
              <Button disabled={isLoading}>
                {isLoading && (
                  <LoadingSpinner className="h-4 w-4 mr-2" type="bars" />
                )}
                Sign In with Email
              </Button>
            </div>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          {/* <Button variant="outline" type="button" disabled={isLoading}>
						{isLoading ? (
							<LucideIcons.spinner className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<LucideIcons.qrCode className="mr-2 h-4 w-4" />
						)}{' '}
						PIX QR Code
					</Button> */}

          <Button variant="outline" type="button" disabled={true}>
            {isLoading ? (
              <LoadingSpinner className="h-4 w-4 mr-2" type="long" />
            ) : (
              <Icon icon="mdi:github" className="mr-2 h-5 w-5" />
            )}
            Github
          </Button>
        </div>
        <p className="px-8 text-center text-sm text-muted-foreground">
          <a
            href="/sign-up"
            className="hover:text-brand underline underline-offset-4"
          >
            Don&apos;t have an account? Sign Up
          </a>
        </p>
      </div>
    </div>
  )
}
