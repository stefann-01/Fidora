"use client"

import { tweetsMock } from "@/app/(app)/mocks/tweet-mock"
import { Claim } from "@/app/types/db.types"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { Tweet } from "react-tweet"

interface TweetGridProps {
  tweets?: Claim[]
  accountFilter?: string
}

export function TweetGrid({ tweets, accountFilter }: TweetGridProps) {
  // Use mock data if no tweets provided
  const allTweets = tweets || tweetsMock
  
  const filteredTweets = accountFilter 
    ? allTweets.filter(tweet => tweet.author.includes(accountFilter))
    : allTweets

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredTweets.map((tweetData) => {
        const tweetId = tweetData.url.split('/').pop() || ''
        
        return (
          <div key={tweetData.claimId} className="relative">
            <div className="border rounded-lg overflow-hidden">
              <div className="[&>div]:!my-0 [&>div]:!py-0 [&>div]:!rounded-b-none [&>div]:max-h-[200px] [&>div]:overflow-y-auto">
                <Tweet id={tweetId} />
              </div>
              <div className="p-3 bg-gray-50 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Evidence Items:</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                      {tweetData.evidence.length}
                    </span>
                  </div>
                  <Link 
                    href={`/${tweetData.claimId}`}
                    className="flex items-center gap-1 text-xs p-1 hover:bg-blue-100 rounded-full transition-colors justify-center"
                  >
                    <span className="text-blue-600 font-medium">View Full Tweet</span>
                    <ChevronRight className="w-3 h-3 text-gray-600" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
} 
