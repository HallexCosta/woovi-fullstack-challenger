import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { cn, integerValueToBRL } from '@/lib/utils'
import { ArrowRight, CheckCircle2, Download, Share2 } from 'lucide-react'
import { useId, useRef } from 'react'
import { toast } from 'sonner'
import { Badge } from '../ui/badge'

interface PixTransferReceiptProps {
  className?: string
  transactionId: string | number
  amount: number
  userDestination: User
  userOrigin: User
  date: string
  time: string
  showConfirmationIcon?: boolean
}

type User = {
  name: string
  photo?: string
  pixKey: string
}

const SeparatorDots = ({ repeat }: { repeat: number }) => {
  return (
    <div className="flex items-center space-x-2">
      {Array.from({ length: repeat }).map(() => (
        <div key={useId()} className="w-2 h-2 bg-gray-300 rounded-full" />
      ))}
    </div>
  )
}

export const PixTransferReceipt = ({
  className,
  transactionId,
  amount,
  userDestination,
  userOrigin,
  date,
  time,
  showConfirmationIcon
}: PixTransferReceiptProps) => {
  const rootElementRef = useRef(null)
  //   const downloadPdfDocument = () => {
  // }
  const handleDownload = () => {
    // Implement download functionality
    console.log('Downloading proof of payment...')

    toast.info('Cooming soon feature')
  }

  const handleShare = () => {
    // Implement share functionality
    console.log('Sharing proof of payment...')

    toast.info('Cooming soon feature')
  }

  return (
    <Card
      ref={rootElementRef}
      className={cn('w-full max-w-md mx-auto', className)}
      data-testid="pixTransferReceipt"
    >
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          PIX Transfer Receipt
        </CardTitle>
        {showConfirmationIcon && (
          <CheckCircle2 className="w-16 h-16 mx-auto mt-4 text-green-500" />
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center space-x-4">
          <div className="flex flex-col gap-2 items-center">
            <Avatar className="w-16 h-16">
              <AvatarImage src={userOrigin.photo} alt={userOrigin.name} />
              <AvatarFallback>
                {userOrigin.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Badge className="text-center">{userOrigin.name}</Badge>
          </div>

          <SeparatorDots repeat={3} />

          <div className="flex flex-col gap-2 items-center">
            <Avatar className="w-16 h-16">
              <AvatarImage
                src={userDestination.photo}
                alt={userDestination.name}
              />
              <AvatarFallback>
                {userDestination.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Badge className="text-center">{userDestination.name}</Badge>
          </div>
        </div>

        <div className="text-center">
          <p className="text-3xl font-bold">{integerValueToBRL(amount)}</p>
          <p className="text-sm text-muted-foreground">
            {amount > 0 ? 'Amount Received' : 'Amount Transferred'}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <p className="text-sm font-medium">From:</p>
              <p className="text-sm font-medium">PIX Key:</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{userOrigin.name}</p>
              <p className="text-xs text-muted-foreground">
                {userOrigin.pixKey}
              </p>
            </div>
          </div>
          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <p className="text-sm font-medium">To:</p>
              <p className="text-sm font-medium">PIX Key:</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{userDestination.name}</p>
              <p className="text-xs text-muted-foreground">
                {userDestination.pixKey}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between">
            <p className="text-sm font-medium">Date:</p>
            <p className="text-sm">{date}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm font-medium">Time:</p>
            <p className="text-sm">{time}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm font-medium">Transaction ID:</p>
            <p className="text-sm">{transactionId}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          className="flex items-center justify-center"
          variant="outline"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button
          className="flex items-center justify-center"
          variant="outline"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </CardFooter>
    </Card>
  )
}
