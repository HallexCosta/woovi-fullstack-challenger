import { useUserAuth } from '@/hooks/useUserAuth'
import { getTransactionStatusColor, integerValueToBRL } from '@/lib/utils'
import type { DashboardQuery$data } from '@/pages/app/__generated__/DashboardQuery.graphql'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { CheckIcon, CopyIcon } from 'lucide-react'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { ConnectionHandler, graphql, usePaginationFragment } from 'react-relay'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog'
import { Label } from '../ui/label'
import { Separator } from '../ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table'
import PixProofOfTransfer from './PixProofOfTransfer'
import { PixTransferReceipt } from './PixTransferReceipt'
import { useTransactionConnection } from './TransactionConnectionProvider'
import type { TableListTransactionsPaginationQuery } from './__generated__/TableListTransactionsPaginationQuery.graphql'
import type { TableListTransactions_transactions$key } from './__generated__/TableListTransactions_transactions.graphql'

type TableListTransactionsProps = {
  appQuery: DashboardQuery$data
  queryReference?: unknown
  filters: {
    accountPublicId: number
  }
}

export const TableListTransactions = ({
  appQuery,
  filters
}: TableListTransactionsProps) => {
  const [startTransaction] = useTransition()

  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const { setConnectionIDs, connectionIDs } = useTransactionConnection()
  const {
    data: { transactions },
    hasNext,
    isLoadingNext,
    loadNext
  } = usePaginationFragment<
    TableListTransactionsPaginationQuery,
    TableListTransactions_transactions$key
  >(
    graphql`
			fragment TableListTransactions_transactions on Query 
        @refetchable(queryName: "TableListTransactionsPaginationQuery") 
        @argumentDefinitions(first: { type: Int, defaultValue: 10 }, previousCursor: { type: String }, cursor: { type: String }, accountPublicId: { type: Int }) {
        transactions(first: $first, before: $previousCursor, after: $cursor,  accountPublicId: $accountPublicId) @connection(key: "TableListTransactions_transactions") {
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          totalCount
          edges {
            cursor
            node {
              id
              publicId
              amount
              type
              status
              createdAt
              originSenderAccount {
                publicId
                createdAt
                user {
                  fullName
                  pixKey
                  email
                  profileImage
                  createdAt
                }
              }
              destinationReceiverAccount {
                publicId
                createdAt
                user {
                  fullName
                  pixKey
                  email
                  profileImage
                  createdAt
                }
              }
            }
          }
        }
			}
		`,
    appQuery
  )

  // console.log('pageInfo', transactions?.pageInfo)
  // console.log(
  //   'startCursor',
  //   atob(transactions?.pageInfo?.startCursor as string)
  // )
  // console.log('endCursor', atob(transactions?.pageInfo?.endCursor as string))

  const tableListTransactionsID = ConnectionHandler.getConnectionID(
    appQuery.__id,
    'TableListTransactions_transactions',
    filters
  )

  useEffect(() => {
    if (!connectionIDs.includes(tableListTransactionsID)) {
      setConnectionIDs([...connectionIDs, tableListTransactionsID])
    }
  }, [connectionIDs, setConnectionIDs, tableListTransactionsID])

  const loadMoreTransactions = useCallback(() => {
    if (isLoadingNext || !hasNext) return

    startTransaction(() => {
      loadNext(10)
    })
  }, [isLoadingNext, hasNext, loadNext])

  if (!transactions) return <h1>None transactions</h1>

  const { edges } = transactions

  if (!edges || edges.length <= 0) {
    return
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-['Inter']">Date</TableHead>
            <TableHead className="font-['Inter']">Transaction Id</TableHead>
            <TableHead className="font-['Inter']">Origin Account Id</TableHead>
            <TableHead className="font-['Inter']">
              Destination Account Id
            </TableHead>
            <TableHead className="font-['Inter']">Amount</TableHead>
            <TableHead className="font-['Inter']">Type</TableHead>
            <TableHead className="font-['Inter']">Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {edges?.map((edge) => {
            if (!edge || !edge.node) return

            const {
              node: {
                amount,
                createdAt,
                publicId,
                id,
                originSenderAccount,
                destinationReceiverAccount,
                status,
                type
              }
            } = edge

            const postiveValue = amount > 0

            return (
              <TableRow key={`transaction-${id}`}>
                <TableCell className="font-['Inter']">
                  {createdAt.slice(0, 10)}
                </TableCell>
                <TableCell className="font-['Inter']">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant={'link'}
                        className="flex flex-col items-start"
                      >
                        {publicId}
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[425px]">
                      <PixTransferReceipt
                        className="border-none"
                        amount={amount}
                        date={createdAt.slice(0, 10) ?? ''}
                        time={createdAt.slice(11, 19) ?? ''}
                        userOrigin={{
                          pixKey: originSenderAccount?.user?.pixKey ?? '',
                          name: originSenderAccount?.user?.fullName ?? '',
                          photo: originSenderAccount?.user?.profileImage ?? ''
                        }}
                        userDestination={{
                          pixKey:
                            destinationReceiverAccount?.user?.pixKey ?? '',
                          name:
                            destinationReceiverAccount?.user?.fullName ?? '',
                          photo:
                            destinationReceiverAccount?.user?.profileImage ?? ''
                        }}
                        transactionId={publicId ?? ''}
                      />
                    </DialogContent>
                  </Dialog>
                </TableCell>
                <TableCell className="font-['Inter']">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="link"
                        className="p-0 flex flex-col items-start"
                      >
                        <p>
                          <strong>AccountId:</strong>{' '}
                          {originSenderAccount?.publicId}
                        </p>
                        <p>
                          <strong>PIXKey: </strong>
                          {originSenderAccount?.user?.pixKey}
                        </p>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogTitle>Account Details</DialogTitle>
                      <DialogDescription>
                        View the account details here. Click in close when
                        finish
                      </DialogDescription>
                      <div className="flex flex-col items-center justify-center mt-5">
                        <Avatar className="w-20 h-20">
                          <AvatarImage
                            className="rounded-full"
                            src={
                              originSenderAccount?.user?.profileImage ??
                              undefined
                            }
                          />
                          <AvatarFallback>HX</AvatarFallback>
                        </Avatar>

                        <h2 className="mt-2 text-xl font-semibold">
                          {originSenderAccount?.user?.fullName}
                        </h2>
                        <Badge variant="secondary" className="mt-1">
                          Account Owner
                        </Badge>

                        <Separator className="my-4" />

                        <Card className="w-full">
                          <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                          </CardHeader>

                          <CardContent className="grid grid-4">
                            <div className="flex flex-row w-full items-center justify-between">
                              <Label>Public Id: </Label>

                              <div className="flex items-center gap-2">
                                <span>{originSenderAccount?.publicId}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    copyToClipboard(
                                      String(originSenderAccount?.publicId) ??
                                        '',
                                      'accountPublicId'
                                    )
                                  }
                                >
                                  {copied === 'accountPublicId' ? (
                                    <CheckIcon className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <CopyIcon className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            <div className="flex flex-row gap-6 items-center justify-between">
                              <Label>Email: </Label>
                              <div className="flex items-center gap-2">
                                <span>{originSenderAccount?.user?.email}</span>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    copyToClipboard(
                                      originSenderAccount?.user?.email ?? '',
                                      'email'
                                    )
                                  }
                                >
                                  {copied === 'email' ? (
                                    <CheckIcon className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <CopyIcon className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="flex flex-row gap-6 items-center justify-between">
                              <Label>Pix key: </Label>
                              <div className="flex items-center gap-2">
                                <span>{originSenderAccount?.user?.pixKey}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    copyToClipboard(
                                      originSenderAccount?.user?.pixKey ?? '',
                                      'pixKey'
                                    )
                                  }
                                >
                                  {copied === 'pixKey' ? (
                                    <CheckIcon className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <CopyIcon className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            <div className="flex flex-row gap-6 items-center justify-between">
                              <Label>Joined On: </Label>
                              <div className="flex items-center gap-2">
                                <span>
                                  {originSenderAccount?.createdAt
                                    ?.slice(0, -5)
                                    .split('T')
                                    .join(' ')}
                                </span>
                                <Button size={'icon'} variant={'ghost'} />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>

                <TableCell className="font-['Inter']">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="link"
                        className="p-0 flex flex-col items-start"
                      >
                        <p>
                          <strong>Account Id:</strong>{' '}
                          {destinationReceiverAccount?.publicId}
                        </p>
                        <p>
                          <strong>PIX Key: </strong>
                          {destinationReceiverAccount?.user?.pixKey}
                        </p>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogTitle>Account Details</DialogTitle>
                      <DialogDescription>
                        View the account details here. Click in close when
                        finish
                      </DialogDescription>
                      <div className="flex flex-col items-center justify-center mt-5">
                        <Avatar className="w-20 h-20">
                          <AvatarImage
                            className="rounded-full"
                            src={
                              destinationReceiverAccount?.user?.profileImage ??
                              undefined
                            }
                          />
                          <AvatarFallback>HX</AvatarFallback>
                        </Avatar>

                        <h2 className="mt-2 text-xl font-semibold">
                          {destinationReceiverAccount?.user?.fullName}
                        </h2>
                        <Badge variant="secondary" className="mt-1">
                          Account Owner
                        </Badge>

                        <Separator className="my-4" />

                        <Card className="w-full">
                          <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                          </CardHeader>

                          <CardContent className="grid grid-4">
                            <div className="flex flex-row w-full items-center justify-between">
                              <Label>Public Id: </Label>

                              <div className="flex items-center gap-2">
                                <span>
                                  {destinationReceiverAccount?.publicId}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    copyToClipboard(
                                      String(
                                        destinationReceiverAccount?.publicId
                                      ) ?? '',
                                      'accountPublicId'
                                    )
                                  }
                                >
                                  {copied === 'accountPublicId' ? (
                                    <CheckIcon className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <CopyIcon className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            <div className="flex flex-row gap-6 items-center justify-between">
                              <Label>Email: </Label>
                              <div className="flex items-center gap-2">
                                <span>
                                  {destinationReceiverAccount?.user?.email}
                                </span>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    copyToClipboard(
                                      destinationReceiverAccount?.user?.email ??
                                        '',
                                      'email'
                                    )
                                  }
                                >
                                  {copied === 'email' ? (
                                    <CheckIcon className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <CopyIcon className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="flex flex-row gap-6 items-center justify-between">
                              <Label>Pix key: </Label>
                              <div className="flex items-center gap-2">
                                <span>
                                  {destinationReceiverAccount?.user?.pixKey}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    copyToClipboard(
                                      destinationReceiverAccount?.user
                                        ?.pixKey ?? '',
                                      'pixKey'
                                    )
                                  }
                                >
                                  {copied === 'pixKey' ? (
                                    <CheckIcon className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <CopyIcon className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            <div className="flex flex-row gap-6 items-center justify-between">
                              <Label>Joined On: </Label>
                              <div className="flex items-center gap-2">
                                <span>
                                  {originSenderAccount?.createdAt
                                    ?.slice(0, -5)
                                    .split('T')
                                    .join(' ')}
                                </span>
                                <Button size={'icon'} variant={'ghost'} />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
                {/* <TableCell className="font-['Inter']">
									<p>
										<strong>AccountId:</strong>{' '}
										{destinationReceiverAccount?.publicId}
									</p>
									<p>
										<strong>PIXKey: </strong>
										{destinationReceiverAccount?.user?.pixKey}
									</p> */}
                {/* </TableCell> */}
                <TableCell className="font-['Inter']">
                  {postiveValue ? (
                    <span className="text-green-500">
                      {integerValueToBRL(amount)}
                    </span>
                  ) : (
                    <span className="text-red-500">
                      {integerValueToBRL(amount)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="font-['Inter']">
                  <span className="text-white">{type?.toUpperCase()}</span>
                </TableCell>
                <TableCell className="font-['Inter']">
                  <span className={getTransactionStatusColor(status)}>
                    {status?.toUpperCase()}
                  </span>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {/* <Pagination>
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							className={clsx(hasNext ? 'text-muted pointer-events-none' : '')}
							onClick={loadPreviousTransactions}
						/>
					</PaginationItem>
					<PaginationItem>
						<PaginationLink href="#">1</PaginationLink>
					</PaginationItem>
					<PaginationItem>
						<PaginationEllipsis />
					</PaginationItem>
					<PaginationItem>
						<PaginationNext
							className={clsx(!hasNext ? 'text-muted pointer-events-none' : '')}
							// href={`?page=${transactions.pageInfo.endCursor}`}
							onClick={loadMoreTransactions}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination> */}
      <Button
        className="mt-4"
        disabled={!hasNext}
        onClick={loadMoreTransactions}
      >
        Load transactions
      </Button>
    </>
  )
}
