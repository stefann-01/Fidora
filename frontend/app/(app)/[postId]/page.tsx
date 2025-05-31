'use client'

import { transactionsMock } from '@/app/(app)/mocks/transactions-mock'
import { Claim, Evidence } from '@/app/types/db.types'
import { EvidenceColumn } from '@/components/evidence-column'
import { TransactionItem } from '@/components/transaction-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { apiService } from '@/services/api.service'
import { use, useEffect, useState } from 'react'
import { Tweet } from 'react-tweet'

export default function PostPage({ params }: { params: Promise<{ postId: string }> }) {
  
  const { postId } = use(params)
  const [ethAmount, setEthAmount] = useState<string>('')
  const [claimData, setClaimData] = useState<Claim | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isJury = true 
  const isVoting = false 

  // Fetch claim data from backend
  useEffect(() => {
    const fetchClaim = async () => {
      try {
        setLoading(true)
        const claim = await apiService.claims.getOne(postId)
        setClaimData(claim)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch claim')
      } finally {
        setLoading(false)
      }
    }

    fetchClaim()
  }, [postId])

  const handleEvidenceCreated = (newEvidence: Evidence) => {
    if (claimData) {
      setClaimData({
        ...claimData,
        evidence: [...claimData.evidence, newEvidence]
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-lg text-gray-500">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !claimData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-lg text-gray-500">{error || 'Post not found'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  const tweetId = claimData.url.split('/').pop() || ''

  const supportingEvidence = claimData.evidence.filter(item => item.supportsClaim)
  const contradictingEvidence = claimData.evidence.filter(item => !item.supportsClaim)

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
              {/* ETH Amount Input */}
              <div className="col-span-2 mb-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0.0"
                          value={ethAmount}
                          onChange={(e) => setEthAmount(e.target.value)}
                          className="border-0 text-center text-lg pr-12 focus-visible:ring-0 focus-visible:ring-offset-0"
                          step="0.01"
                          min="0"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 font-medium">
                          ETH
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The more you stake the more you win if you are right</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

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
                      AI Confidence: {claimData.evidence.length > 0 
                        ? Math.round(claimData.evidence.reduce((acc, e) => acc + e.wellStructuredPercentage, 0) / claimData.evidence.length)
                        : 0}%
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
          <TabsTrigger value="evidence" className="data-[state=active]:text-newPurple-600">Evidence</TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:text-newPurple-600">Post Tx History</TabsTrigger>
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
              claimStatement={claimData.content}
              onEvidenceCreated={handleEvidenceCreated}
            />

            {/* Contradicting Evidence */}
            <EvidenceColumn
              title="Contradicting Evidence"
              evidence={contradictingEvidence}
              searchPlaceholder="Search contradicting evidence..."
              emptyMessage="No contradicting evidence found"
              claimStatement={claimData.content}
              onEvidenceCreated={handleEvidenceCreated}
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
