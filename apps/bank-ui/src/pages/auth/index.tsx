import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Tabs, TabsList } from '@/components/ui/tabs'
import { QrCode } from 'lucide-react'
import { useEffect, useState } from 'react'

import WooviLogo from '@/assets/woovi-logo.svg?react'
import { Toaster } from '@/components/ui/sonner'
import { useTabs } from './hooks/useTabs'
import { SignInTab, SignInTrigger } from './tabs/SignIn'
import { SignUpTab, SignUpTrigger } from './tabs/SignUp'

export const AuthTabs = () => {
  const { tab, changeTab } = useTabs('signin')
  console.log({ tab, changeTab })
  // const [tab, changeTab] = useState<'signin' | 'signup' | string>('signin')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            <WooviLogo className="w-32 h-32 mx-auto mb-2" />
            Woovi Bank
          </CardTitle>
          <CardDescription className="text-center">
            Sign in or create an account to use Woovi Bank
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            // defaultValue="signin"
            value={tab}
            onValueChange={(value) => {
              changeTab(value)
              console.log({ tab })
              console.log({ value })
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <SignInTrigger />
              <SignUpTrigger />
            </TabsList>

            <SignInTab />
            <SignUpTab onChangeTab={() => changeTab('signin')} />
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button className="w-full" variant="outline" disabled={isLoading}>
            {isLoading ? (
              <LoadingSpinner className="mr-2" type="long" />
            ) : (
              <QrCode className="mr-2 h-4 w-4" />
            )}
            Continue with PIX QR Code
          </Button>
        </CardFooter>
      </Card>

      <Toaster position="top-right" />
    </div>
  )
}
