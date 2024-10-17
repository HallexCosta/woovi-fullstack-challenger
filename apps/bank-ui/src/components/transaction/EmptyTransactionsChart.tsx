import { PlusCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface EmptyTransactionsProps {
  year: string
}

export const EmptyTransactions = ({ year }: EmptyTransactionsProps) => {
  const navigate = useNavigate()

  return (
    <Card className="w-full h-[400px] flex flex-col justify-center items-center">
      <CardHeader>
        <CardTitle className="text-center">No transactions in {year}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground mb-4">
          It looks like you haven't made any PIX transactions this year.
        </p>
        <p className="text-muted-foreground mb-6">
          How about starting now? It's fast, safe and free of charge!
        </p>
        <Button onClick={() => navigate('?openCreateTransacionModal=true')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Make a PIX transfer
        </Button>
      </CardContent>
    </Card>
  )
}
