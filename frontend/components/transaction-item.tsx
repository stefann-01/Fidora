import { TransactionData } from '@/app/(app)/mocks/transactions-mock'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Clock, ExternalLink, XCircle } from 'lucide-react'

interface TransactionItemProps {
  transaction: TransactionData
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`
  }

  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant="secondary" className={getStatusColor()}>
              {transaction.type}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {transaction.status}
            </Badge>
          </div>
          <div className="text-sm text-gray-500">
            {formatTimestamp(transaction.timestamp)}
          </div>
        </div>
        
        <div className="mb-3">
          <p className="text-sm font-medium mb-1">{transaction.description}</p>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span>Hash:</span>
            <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">
              {truncateHash(transaction.hash)}
            </code>
            <ExternalLink className="h-3 w-3 ml-1 cursor-pointer hover:text-blue-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">From:</span>
            <div className="font-mono text-xs">{transaction.from}</div>
          </div>
          <div>
            <span className="text-gray-500">To:</span>
            <div className="font-mono text-xs">{transaction.to}</div>
          </div>
          <div>
            <span className="text-gray-500">Value:</span>
            <div className="font-medium">{transaction.value}</div>
          </div>
          <div>
            <span className="text-gray-500">Gas Used:</span>
            <div>{transaction.gasUsed}</div>
          </div>
        </div>

        {transaction.blockNumber && (
          <div className="mt-2 text-sm">
            <span className="text-gray-500">Block:</span>
            <span className="ml-1 font-medium">#{transaction.blockNumber}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 