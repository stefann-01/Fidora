'use client'

import { transactionsMock } from '@/app/(app)/mocks/transactions-mock'
import { tweetEvidenceMock } from '@/app/(app)/mocks/tweet-evidence-mock'
import { EvidenceColumn } from '@/components/evidence-column'
import { TransactionItem } from '@/components/transaction-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { use } from 'react'
import { Tweet } from 'react-tweet'

export default function PostPage({ params }: { params: Promise<{ postId: string }> }) {
  
  const { postId } = use(params)
  
  // Mock variables for jury functionality
  const isJury = true // Mock variable to determine if user is a jury member
  const isVoting = false // Mock variable to determine if voting is active
  
  const tweetData = tweetEvidenceMock.find(item => item.postId === postId)
  
  if (!tweetData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-lg text-gray-500">Post not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  
  const tweetId = tweetData.tweetUrl.split('/').pop() || ''

  
  const supportingEvidence = tweetData.evidence.filter(item => item.aiMetric >= 70)
  const contradictingEvidence = tweetData.evidence.filter(item => item.aiMetric < 70)

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Tweet and Voting Section */}
      <div className="mb-6">
        <div className="flex gap-8 items-center">
          {/* Tweet Section - Left Side */}
          <div className="flex-1">
            <div className="w-full max-w-xl">
              <Tweet id={tweetId} />
            </div>
          </div>

          {/* Voting Buttons - Right Side */}
          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              {/* Regular Voting Buttons */}
              <Button
                variant="outline"
                size="lg"
                className="h-20 flex-col gap-2 transition-all duration-300 ease-out
                         hover:scale-105 hover:text-green-600 hover:border-green-600 hover:bg-green-50
                         active:scale-95"
              >
                <span className="text-xl font-semibold">
                  Agree
                </span>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-20 flex-col gap-2 transition-all duration-300 ease-out
                         hover:scale-105 hover:text-red-600 hover:border-red-600 hover:bg-red-50
                         active:scale-95"
              >
                <span className="text-xl font-semibold">
                  Deny
                </span>
              </Button>

              {/* Jury Buttons - Only show if user is jury */}
              {isJury && (
                <>
                  <div className="col-span-2 border-t pt-2 mt-2">
                    <p className="text-sm text-gray-600 font-medium text-center">Jury Actions</p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    disabled={!isVoting}
                    className="h-20 flex-col gap-2 transition-all duration-300 ease-out
                             hover:scale-105 hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50
                             active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                             disabled:hover:scale-100 disabled:hover:text-current disabled:hover:border-current"
                  >
                    <span className="text-lg font-semibold">
                      Approve
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    disabled={!isVoting}
                    className="h-20 flex-col gap-2 transition-all duration-300 ease-out
                             hover:scale-105 hover:text-orange-600 hover:border-orange-600 hover:bg-orange-50
                             active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                             disabled:hover:scale-100 disabled:hover:text-current disabled:hover:border-current"
                  >
                    <span className="text-lg font-semibold">
                      Reject
                    </span>
                  </Button>
                </>
              )}

              {!isJury && (
                <div className="col-span-2 mt-4 pt-4 border-t">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600">Evidence Summary</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-green-600">Supporting: {supportingEvidence.length}</span>
                      <span className="text-red-600">Contradicting: {contradictingEvidence.length}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      AI Confidence: {Math.round(tweetData.evidence.reduce((acc, e) => acc + e.aiMetric, 0) / tweetData.evidence.length)}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="evidence" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="transactions">Post Tx History</TabsTrigger>
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
          <div className="max-w-7xl mx-auto">
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
