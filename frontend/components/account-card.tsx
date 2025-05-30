import { AccountData } from "@/app/(app)/mocks/accounts-mock"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface AccountCardProps {
  account: AccountData
}

export function AccountCard({ account }: AccountCardProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Image
              src={account.photo}
              alt={`${account.accountName} profile`}
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-medium text-sm">{account.accountName}</span>
          </div>
          <div className="text-lg font-semibold">
            {account.rating}%
          </div>
        </div>
        
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-1">Latest Tweet</p>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {account.latestTweetContent}
          </p>
        </div>
        
        <div className="flex justify-start">
          <Badge variant={account.votedTrue ? "default" : "destructive"}>
            {account.votedTrue ? "True" : "False"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
} 