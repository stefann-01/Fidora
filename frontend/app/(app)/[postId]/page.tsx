'use client'

import { Claim, Evidence } from '@/app/types/db.types'
import { EvidenceColumn } from '@/components/evidence-column'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useWeb3 } from '@/contexts/Web3Context'
import { apiService } from '@/services/api.service'
import { Vote, useTxService } from '@/services/tx.service'
import {
  useNotification,
  useTransactionPopup
} from "@blockscout/app-sdk"
import { use, useEffect, useState } from 'react'
import { Tweet } from 'react-tweet'
import { toast } from 'sonner'

export default function PostPage({ params }: { params: Promise<{ postId: string }> }) {
  
  const { postId } = use(params)
  const [ethAmount, setEthAmount] = useState<string>('')
  const [claimData, setClaimData] = useState<Claim | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTransacting, setIsTransacting] = useState(false)

  // Web3 integration
  const { signer, account } = useWeb3()
  const txService = useTxService(signer)

  // Add BlockScout hooks
  const { openTxToast } = useNotification()
  const { openPopup } = useTransactionPopup()

  // Contract and chain configuration
  const CHAIN_ID = "14" // Arbitrum One (mainnet)
  const FIDORA_ADDRESS = "0x2D6DE95113EC58999ce9fc36130c530B1B73Ea02"

  const isJury = false 
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

  // New function to handle betting (agreeing/disagreeing)
  const handleMakeBet = async (option: 1 | 2) => { // 1 = agree, 2 = disagree
    if (!signer || !account) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      toast.error('Please enter a valid ETH amount')
      return
    }

    try {
      setIsTransacting(true)
      console.log(`Placing bet on post ${postId} with option ${option} and amount ${ethAmount} ETH`)
      const result = await txService.makeBet(
        BigInt(postId), 
        option, 
        ethAmount
      )

      console.log('Bet transaction result:', result)
      
      // Use BlockScout toast for Arbitrum Sepolia
      await openTxToast(CHAIN_ID, result.hash)
      
      // Optionally refresh claim data
      const updatedClaim = await apiService.claims.getOne(postId)
      setClaimData(updatedClaim)
      
    } catch (error) {
      console.error('Error making bet:', error)
      toast.error('Failed to place bet. Please try again.')
    } finally {
      setIsTransacting(false)
    }
  }

  // New function to handle jury voting
  const handleCastVote = async (vote: Vote) => {
    if (!signer || !account) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      setIsTransacting(true)
      const result = await txService.castVote(parseInt(postId), vote)
      
      // Use BlockScout toast for Arbitrum Sepolia
      await openTxToast(CHAIN_ID, result.hash)
      
      // Optionally refresh claim data
      const updatedClaim = await apiService.claims.getOne(postId)
      setClaimData(updatedClaim)
      
    } catch (error) {
      console.error('Error casting vote:', error)
      toast.error('Failed to cast vote. Please try again.')
    } finally {
      setIsTransacting(false)
    }
  }

  // Function to open BlockScout transaction history for Fidora contract
  const openFidoraTransactionHistory = () => {
    if (!FIDORA_ADDRESS) {
      toast.error('Fidora contract address not configured')
      return
    }
    
    openPopup({
      chainId: CHAIN_ID,
      address: FIDORA_ADDRESS // Show transactions for the Fidora contract
    })
  }

  // Function to open user's transaction history
  const openUserTransactionHistory = () => {
    openPopup({
      chainId: CHAIN_ID,
      address: account || undefined // Show transactions for connected wallet
    })
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

              {/* Betting section - available to everyone during betting phase */}
              {!isVoting && (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleMakeBet(1)}
                    disabled={isTransacting || !ethAmount || parseFloat(ethAmount) <= 0}
                    className="h-20 flex-col gap-2 transition-all duration-300 ease-out
                             hover:scale-105 hover:text-green-600 hover:border-green-600 hover:bg-green-50
                             active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                             disabled:hover:scale-100 disabled:hover:text-current disabled:hover:border-current"
                  >
                    <span className="text-lg font-semibold">
                      {isTransacting ? 'Processing...' : 'True'}
                    </span>
                    <span className="text-xs text-gray-500">Bet that claim is true</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleMakeBet(2)}
                    disabled={isTransacting || !ethAmount || parseFloat(ethAmount) <= 0}
                    className="h-20 flex-col gap-2 transition-all duration-300 ease-out
                             hover:scale-105 hover:text-red-600 hover:border-red-600 hover:bg-red-50
                             active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                             disabled:hover:scale-100 disabled:hover:text-current disabled:hover:border-current"
                  >
                    <span className="text-lg font-semibold">
                      {isTransacting ? 'Processing...' : 'False'}
                    </span>
                    <span className="text-xs text-gray-500">Bet that claim is false</span>
                  </Button>
                </>
              )}

              {/* Jury voting section - only available to jury members during voting phase */}
              {isJury && isVoting && (
                <>
                  <div className="col-span-2 border-t pt-2 mt-2">
                    <p className="text-sm text-gray-600 font-medium text-center">Jury Voting</p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleCastVote(Vote.Agree)}
                    disabled={isTransacting}
                    className="h-20 flex-col gap-2 transition-all duration-300 ease-out
                             hover:scale-105 hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50
                             active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                             disabled:hover:scale-100 disabled:hover:text-current disabled:hover:border-current"
                  >
                    <span className="text-lg font-semibold">
                      {isTransacting ? 'Processing...' : 'Approve'}
                    </span>
                    <span className="text-xs text-gray-500">Vote to approve claim</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleCastVote(Vote.Disagree)}
                    disabled={isTransacting}
                    className="h-20 flex-col gap-2 transition-all duration-300 ease-out
                             hover:scale-105 hover:text-red-600 hover:border-red-600 hover:bg-red-50
                             active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                             disabled:hover:scale-100 disabled:hover:text-current disabled:hover:border-current"
                  >
                    <span className="text-lg font-semibold">
                      {isTransacting ? 'Processing...' : 'Reject'}
                    </span>
                    <span className="text-xs text-gray-500">Vote to reject claim</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleCastVote(Vote.Unprovable)}
                    disabled={isTransacting}
                    className="col-span-2 h-16 flex-col gap-1 transition-all duration-300 ease-out
                             hover:scale-105 hover:text-yellow-600 hover:border-yellow-600 hover:bg-yellow-50
                             active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                             disabled:hover:scale-100 disabled:hover:text-current disabled:hover:border-current"
                  >
                    <span className="text-lg font-semibold">
                      {isTransacting ? 'Processing...' : 'Unprovable'}
                    </span>
                    <span className="text-xs text-gray-500">Vote that claim cannot be proven</span>
                  </Button>
                </>
              )}

              {/* Status message when voting phase but user is not jury */}
              {!isJury && isVoting && (
                <div className="col-span-2 text-center py-4">
                  <p className="text-gray-500">Voting phase in progress. Only jury members can vote.</p>
                </div>
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
          <TabsTrigger value="transactions" className="data-[state=active]:text-newPurple-600">Transaction History</TabsTrigger>
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
              supportsClaim={true}
              onEvidenceCreated={handleEvidenceCreated}
            />

            {/* Contradicting Evidence */}
            <EvidenceColumn
              title="Contradicting Evidence"
              evidence={contradictingEvidence}
              searchPlaceholder="Search contradicting evidence..."
              emptyMessage="No contradicting evidence found"
              claimStatement={claimData.content}
              supportsClaim={false}
              onEvidenceCreated={handleEvidenceCreated}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="transactions" className="mt-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Transaction History</h2>
              <div className="flex gap-2">
                <Button onClick={openFidoraTransactionHistory} variant="outline">
                  Fidora Contract
                </Button>
                {account && (
                  <Button onClick={openUserTransactionHistory} variant="outline">
                    My Transactions
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fidora Contract Transactions */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Fidora Contract Activity</h3>
                  <p className="text-gray-600 mb-4">
                    View all transactions for the Fidora prediction market contract on Flare Network.
                  </p>
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <p><strong>Contract:</strong> {FIDORA_ADDRESS}</p>
                    <p><strong>Network:</strong> Flare Network (Chain ID: {CHAIN_ID})</p>
                  </div>
                  <Button onClick={openFidoraTransactionHistory} className="w-full">
                    View Contract Transactions
                  </Button>
                </CardContent>
              </Card>

              {/* User Transactions */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Your Activity</h3>
                  {account ? (
                    <>
                      <p className="text-gray-600 mb-4">
                        View your transaction history on Arbitrum Sepolia.
                      </p>
                      <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <p><strong>Wallet:</strong> {account.slice(0, 6)}...{account.slice(-4)}</p>
                        <p><strong>Network:</strong> Arbitrum Sepolia</p>
                      </div>
                      <Button onClick={openUserTransactionHistory} className="w-full" variant="outline">
                        View My Transactions
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-600 mb-4">
                        Connect your wallet to view your transaction history.
                      </p>
                      <Button disabled className="w-full" variant="outline">
                        Connect Wallet First
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Additional Info */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">About Transaction History</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Real-time Updates</h4>
                    <p className="text-gray-600">Transaction status updates automatically as they&apos;re confirmed on-chain.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Detailed Analysis</h4>
                    <p className="text-gray-600">View decoded function calls, event logs, and transaction traces.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Arbitrum Sepolia</h4>
                    <p className="text-gray-600">All transactions are on the Arbitrum Sepolia testnet for development.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
