'use client'

import { transactionsMock } from '@/app/(app)/mocks/transactions-mock'
import { tweetEvidenceMock } from '@/app/(app)/mocks/tweet-evidence-mock'
import { EvidenceColumn } from '@/components/evidence-column'
import { TransactionItem } from '@/components/transaction-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Ban, CircleCheckBig } from 'lucide-react'
import { use } from 'react'
import { Tweet } from 'react-tweet'

export default function ClaimPage({ params }: { params: Promise<{ claimId: string }> }) {
  // Unwrap the params Promise using React.use()
  const { claimId } = use(params)
  
  // Find the tweet evidence data for this claim
  const tweetData = tweetEvidenceMock.find(item => item.claimId === claimId)
  
  if (!tweetData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-lg text-gray-500">Claim not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Extract tweet ID from URL
  const tweetId = tweetData.tweetUrl.split('/').pop() || ''

  // Separate evidence by AI metric (threshold of 70 for true/false)
  const supportingEvidence = tweetData.evidence.filter(item => item.aiMetric >= 70)
  const contradictingEvidence = tweetData.evidence.filter(item => item.aiMetric < 70)

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Tweet Section with Voting Buttons */}
      <div className="mb-6">
        <div className="w-full flex items-center justify-between gap-8">
          {/* Agree Button */}
          <Button
            variant="outline"
            size="lg"
            className="h-64 w-48 flex-col gap-6 transition-all duration-300 ease-out
                     hover:scale-105 hover:text-green-600 hover:border-green-600
                     active:scale-95 flex-shrink-0 relative overflow-hidden group"
          >
            {/* Sea of ticks on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
              {Array.from({ length: 200 }).map((_, i) => (
                <CircleCheckBig
                  key={i}
                  className="absolute h-3 w-3 text-green-600"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                  }}
                />
              ))}
            </div>
            <span className="text-2xl font-semibold relative z-10">
              Agree
            </span>
          </Button>

          {/* Tweet */}
          <div className="flex-1 flex justify-center mx-1">
            <div className="w-full max-w-xl">
              <Tweet id={tweetId} />
            </div>
          </div>

          {/* Deny Button */}
          <Button
            variant="outline"
            size="lg"
            className="h-64 w-48 flex-col gap-6 transition-all duration-300 ease-out
                     hover:scale-105 hover:text-red-600 hover:border-red-600
                     active:scale-95 flex-shrink-0 relative overflow-hidden group"
          >
            {/* Sea of Ban's on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
              {Array.from({ length: 200 }).map((_, i) => (
                <Ban
                  key={i}
                  className="absolute h-3 w-3 text-red-600"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                  }}
                />
              ))}
            </div>
            <span className="text-2xl font-semibold relative z-10">
              Deny
            </span>
          </Button>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="evidence" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="transactions">Claim Tx History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="evidence" className="mt-6">
          {/* Evidence Analysis Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Supporting Evidence */}
            <EvidenceColumn
              title="Supporting Evidence"
              evidence={supportingEvidence}
              searchPlaceholder="Search supporting evidence..."
              emptyMessage="No supporting evidence found"
            />

            {/* Contradicting Evidence */}
            <EvidenceColumn
              title="Contradicting Evidence"
              evidence={contradictingEvidence}
              searchPlaceholder="Search contradicting evidence..."
              emptyMessage="No contradicting evidence found"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="transactions" className="mt-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
            <div className="space-y-4">
              {transactionsMock.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
