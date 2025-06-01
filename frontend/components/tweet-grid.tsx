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

const categoryColorMap: Record<string, string> = {
  Politics: "bg-blue-100 text-blue-700 border-blue-200",
  Technology: "bg-blue-200 text-blue-800 border-blue-300",
  Science: "bg-blue-100 text-blue-700 border-blue-200",
  Finance: "bg-violet-100 text-violet-600 border-violet-200",
  Health: "bg-violet-100 text-violet-600 border-violet-200",
  Environment: "bg-blue-100 text-blue-700 border-blue-200",
  Sports: "bg-blue-200 text-blue-800 border-blue-300",
  Entertainment: "bg-violet-100 text-violet-600 border-violet-200",
  Business: "bg-blue-100 text-blue-700 border-blue-200",
  Education: "bg-violet-100 text-violet-600 border-violet-200",
  "Social Issues": "bg-blue-100 text-blue-700 border-blue-200",
  "Law & Legal": "bg-blue-200 text-blue-800 border-blue-300",
  "International Affairs": "bg-violet-100 text-violet-600 border-violet-200",
  "Military & Defense": "bg-violet-100 text-violet-600 border-violet-200",
  Transportation: "bg-blue-100 text-blue-700 border-blue-200",
  "Food & Nutrition": "bg-violet-100 text-violet-600 border-violet-200",
  "Crime & Safety": "bg-blue-200 text-blue-800 border-blue-300",
  "Weather & Climate": "bg-blue-100 text-blue-700 border-blue-200",
  "Real Estate": "bg-violet-100 text-violet-600 border-violet-200",
  Energy: "bg-blue-100 text-blue-700 border-blue-200",
  Agriculture: "bg-violet-100 text-violet-600 border-violet-200",
  Religion: "bg-blue-200 text-blue-800 border-blue-300",
  "Art & Culture": "bg-violet-100 text-violet-600 border-violet-200",
  "Personal Life": "bg-blue-100 text-blue-700 border-blue-200",
  Other: "bg-violet-100 text-violet-600 border-violet-200"
};

function getCategoryColor(category: string) {
  // Use a strong blue-violet as the fallback for unknown categories
  return categoryColorMap[category] || "bg-violet-100 text-violet-600 border-violet-200";
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
                    {tweetData.category && (
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 ${getCategoryColor(tweetData.category)}`}>
                        {tweetData.category}
                      </span>
                    )}
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
