'use client'

import { tweetEvidenceMock } from '@/app/(app)/mocks/tweet-evidence-mock'
import { TweetCard } from '@/components/tweet-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Fuse from 'fuse.js'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isJuryMember, setIsJuryMember] = useState(false) // Mock variable for jury status

  // Configure Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(tweetEvidenceMock, {
      keys: [
        'postId',
        'evidence.title',
        'evidence.description'
      ],
      threshold: 0.3,
      includeScore: true
    })
  }, [])

  // Filter tweets based on search query
  const filteredTweets = useMemo(() => {
    if (!searchQuery.trim()) return tweetEvidenceMock
    
    const results = fuse.search(searchQuery)
    return results.map(result => result.item)
  }, [searchQuery, fuse])

  // Mock data - replace with actual data
  const ongoingCases = filteredTweets.filter((_, index) => index % 2 === 0)
  const closedCases = filteredTweets.filter((_, index) => index % 2 === 1)
  const votingPerformance = 87 // Mock percentage

  // Circular progress component
  const CircularProgress = ({ percentage }: { percentage: number }) => {
    const radius = 45
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-blue-600 transition-all duration-300 ease-in-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
        </div>
      </div>
    )
  }

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
            You have been selected as a digital juror to evaluate the veracity of social media claims. Review the evidence and cast your verdict on each case.
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
                    placeholder="Search claims, evidence titles, or descriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="ongoing" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="ongoing">Ongoing Cases</TabsTrigger>
                    <TabsTrigger value="closed">Closed Cases</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="ongoing" className="space-y-4 mt-4">
                    <div className="text-sm text-gray-600">
                      {ongoingCases.length} ongoing {ongoingCases.length === 1 ? 'case' : 'cases'}
                    </div>
                    <div className="space-y-4">
                      {ongoingCases.length > 0 ? (
                        ongoingCases.map((tweetData) => (
                          <TweetCard key={tweetData.id} tweetData={tweetData} />
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
                          <TweetCard key={tweetData.id} tweetData={tweetData} />
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
            {/* Jury Action Button */}
            <button
              onClick={handleJuryAction}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isJuryMember
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {isJuryMember ? 'Withdraw Stake' : 'Apply for Jury'}
            </button>

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
