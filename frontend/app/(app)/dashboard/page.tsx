'use client'

import { getAllClaims } from '@/back/funcs/claims'
import { CircularProgress } from '@/components/circular-progress'
import { JuryActionModal } from '@/components/jury-action-modal'
import { TweetCard } from '@/components/tweet-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Fuse from 'fuse.js'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isJuryMember, setIsJuryMember] = useState(false) 

  const allClaims = getAllClaims()
  
  const fuse = useMemo(() => {
    return new Fuse(allClaims, {
      keys: [
        'claimId',
        'content',
        'author',
        'evidence.title',
        'evidence.description'
      ],
      threshold: 0.3,
      includeScore: true
    })
  }, [allClaims])

  
  const filteredTweets = useMemo(() => {
    if (!searchQuery.trim()) return allClaims
    
    const results = fuse.search(searchQuery)
    return results.map(result => result.item)
  }, [searchQuery, fuse, allClaims])

  
  const ongoingCases = filteredTweets.filter((_, index) => index % 2 === 0)
  const closedCases = filteredTweets.filter((_, index) => index % 2 === 1)
  const votingPerformance = 87 

  const handleJuryAction = () => {
    setIsJuryMember(!isJuryMember)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">
            You have been selected as a digital juror to evaluate the veracity of social media posts. Review the evidence and cast your verdict on each case.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - My Cases (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Cases</CardTitle>
                {/* Search Bar */}
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search posts, evidence titles, or descriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="ongoing" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger 
                      value="ongoing"
                      className="data-[state=active]:text-newPurple-600"
                    >
                      Ongoing Cases
                    </TabsTrigger>
                    <TabsTrigger 
                      value="closed"
                      className="data-[state=active]:text-newPurple-600"
                    >
                      Closed Cases
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="ongoing" className="space-y-4 mt-4">
                    <div className="text-sm text-gray-600">
                      {ongoingCases.length} ongoing {ongoingCases.length === 1 ? 'case' : 'cases'}
                    </div>
                    <div className="space-y-4">
                      {ongoingCases.length > 0 ? (
                        ongoingCases.map((tweetData) => (
                          <TweetCard key={tweetData.claimId} tweetData={tweetData} />
                        ))
                      ) : (
                        <Card className="w-full">
                          <CardContent className="flex items-center justify-center py-12">
                            <p className="text-lg text-gray-500">No ongoing cases found</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="closed" className="space-y-4 mt-4">
                    <div className="text-sm text-gray-600">
                      {closedCases.length} closed {closedCases.length === 1 ? 'case' : 'cases'}
                    </div>
                    <div className="space-y-4">
                      {closedCases.length > 0 ? (
                        closedCases.map((tweetData) => (
                          <TweetCard key={tweetData.claimId} tweetData={tweetData} />
                        ))
                      ) : (
                        <Card className="w-full">
                          <CardContent className="flex items-center justify-center py-12">
                            <p className="text-lg text-gray-500">No closed cases found</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Voting Performance (1/3 width) */}
          <div className="space-y-4">
            {/* Jury Action Modal */}
            <JuryActionModal
              isJuryMember={isJuryMember}
              onConfirmAction={handleJuryAction}
            />

            <Card>
              <CardHeader>
                <CardTitle>Voting Performance</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <CircularProgress percentage={votingPerformance} />
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">Accuracy Rate</p>
                  <p className="text-xs text-gray-500">
                    Based on {closedCases.length} completed cases
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Additional stats cards can go here */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Cases</span>
                  <span className="font-semibold">{filteredTweets.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ongoing</span>
                  <span className="font-semibold text-blue-600">{ongoingCases.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">{closedCases.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
