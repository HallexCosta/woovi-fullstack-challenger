import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUserAuth } from '@/hooks/useUserAuth'
import { cn, integerValueToBRL } from '@/lib/utils'
import type { DashboardQuery$data } from '@/pages/app/__generated__/DashboardQuery.graphql'
import { ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { ConnectionHandler, graphql, useRefetchableFragment } from 'react-relay'
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { useQueryParams } from '@/hooks/useQueryParams'
import { useNavigate } from 'react-router-dom'
import { EmptyTransactions } from './EmptyTransactionsChart'
import { useTransactionConnection } from './TransactionConnectionProvider'

// Convert the object to an array and sort by month order
const monthOrder = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro'
]

export function PixTransactionsChart({
  className,
  dashboardQuery
}: { className?: string; dashboardQuery: DashboardQuery$data }) {
  const [data, refetch] = useRefetchableFragment(
    graphql`
      fragment PixTransactionsChart_query on Query
        @refetchable(queryName: "PixTransactionsChartRefetchableQuery") 
        @argumentDefinitions(
          accountPublicId: { type: "Int!" },
          first: { type: "Int" },
          after: { type: "String" }
          year: { type: "Int" }
        ) {
        transactionsOfYear(first: $first, after: $after, accountPublicId: $accountPublicId, year: $year) @connection(key: "PixTransactionsChart_transactionsOfYear") {
          totalPixIn
          totalPixOut
          netFlow
          averageTransaction
          edges {
            node {
              originSenderAccount {
                publicId
              }
              destinationReceiverAccount {
                publicId
              }
              publicId
              amount
              createdAt
            }
            
          }
        }
      }
    `,
    dashboardQuery
  )

  const { connectionIDs, setConnectionIDs } = useTransactionConnection()

  const { year } = useQueryParams()
  const navigate = useNavigate()
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(String(year))

  const { userCreatedAt, accountPublicId } = useUserAuth()
  const pixTransactionsChartConnectionID = ConnectionHandler.getConnectionID(
    dashboardQuery.__id,
    'PixTransactionsChart_transactionsOfYear',
    { accountPublicId, year: currentYear }
  )

  useEffect(() => {
    if (!connectionIDs.includes(pixTransactionsChartConnectionID)) {
      setConnectionIDs([...connectionIDs, pixTransactionsChartConnectionID])
    }
    console.log({ connectionIDs })
  })

  const transactionData = useMemo(() => {
    const parsedTransactions = data.transactionsOfYear.edges.reduce(
      (acc, prev) => {
        const month = new Date(prev.node.createdAt).toLocaleDateString(
          'pt-BR',
          {
            month: 'long'
          }
        )

        if (!(month in acc)) {
          acc[month] = {
            pixIn: 0,
            pixOut: 0,
            month
          }
        }

        if (prev.node.originSenderAccount.publicId === accountPublicId) {
          acc[month].pixOut += Math.abs(prev.node.amount)
        } else {
          acc[month].pixIn += Math.abs(prev.node.amount)
        }

        acc[month].month =
          month.slice(0, 1).toUpperCase() + month.slice(1, month.length)
        return acc
      },
      {}
    )

    return Object.values(parsedTransactions).sort((a, b) => {
      return (
        monthOrder.indexOf(a.month.toLowerCase()) -
        monthOrder.indexOf(b.month.toLowerCase())
      )
    })

    // return Object.values(parsedTransactions)
  }, [data.transactionsOfYear.edges, accountPublicId])
  const totalPixIn = data.transactionsOfYear.totalPixIn
  const totalPixOut = data.transactionsOfYear.totalPixOut
  const netFlow = totalPixIn - totalPixOut
  const averageTransactionValue = data.transactionsOfYear.averageTransaction

  const onSelectYear = (year: string) => {
    refetch(
      {
        accountPublicId,
        year: Number(year)
      },
      {
        fetchPolicy: 'network-only',
        onComplete: (data) => {
          setSelectedYear(year)
        }
      }
    )
    navigate(`?year=${year}`)
  }

  const joinedYear = new Date(userCreatedAt!).getFullYear() - 2

  return (
    <Card className={cn('w-full mx-auto col-span-2', className)}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>PIX Transactions Overview</CardTitle>

          <div className="flex gap-2">
            {Number(selectedYear) === new Date().getFullYear() && (
              <Button onClick={() => onSelectYear(selectedYear)}>
                Refresh
              </Button>
            )}

            <Select value={selectedYear} onValueChange={onSelectYear}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: currentYear - joinedYear + 1 }).map(
                  (_, index: number) => {
                    const year = new Date(userCreatedAt!).getFullYear() - index
                    return (
                      <SelectItem key={useId()} value={year.toString()}>
                        {year}
                      </SelectItem>
                    )
                  }
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <CardDescription>
          Monthly breakdown of PIX transactions for {selectedYear}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart" className="space-y-4">
          <TabsList>
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
          <TabsContent value="chart" className="space-y-4">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                {transactionData.length > 0 ? (
                  <BarChart data={transactionData}>
                    <XAxis dataKey="month" />
                    <YAxis
                      tickFormatter={(value) =>
                        `${integerValueToBRL(value).slice(3, -3)}`
                      }
                    />
                    <Tooltip
                      formatter={(value) =>
                        integerValueToBRL(value as unknown as number)
                      }
                    />
                    <Legend />
                    <Bar dataKey="pixIn" name="PIX In" fill="#10B981" />
                    <Bar dataKey="pixOut" name="PIX Out" fill="#EF4444" />
                  </BarChart>
                ) : (
                  <EmptyTransactions year={selectedYear} />
                )}
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="summary">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total PIX In
                  </CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {integerValueToBRL(totalPixIn)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total PIX Out
                  </CardTitle>
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {integerValueToBRL(totalPixOut)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Net Flow
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {integerValueToBRL(netFlow)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg. Transaction
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {integerValueToBRL(averageTransactionValue)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
