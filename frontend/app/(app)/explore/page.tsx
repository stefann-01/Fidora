"use client"

import { accountsMock } from "@/app/(app)/mocks/accounts-mock"
import { tweetEvidenceMock } from "@/app/(app)/mocks/tweet-evidence-mock"
import { AccountCard } from "@/components/account-card"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { Tweet } from "react-tweet"

export default function ExplorePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Explore Accounts</h1>
      <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {accountsMock.map((account) => (
          <div key={account.id} className="flex-none w-80">
            <AccountCard account={account} />
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-4 mt-8">Recent Tweets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tweetEvidenceMock.map((tweetData) => {
          
          const tweetId = tweetData.tweetUrl.split('/').pop() || ''
          
          return (
            <div key={tweetData.id} className="relative">
              <div className="border rounded-lg overflow-hidden">
                <div className="[&>div]:!my-0 [&>div]:!py-0 [&>div]:!rounded-b-none">
                  <Tweet id={tweetId} />
                </div>
                <div className="p-3 bg-gray-50 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Evidence Items:</span>
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                        {tweetData.evidence.length}
                      </span>
                      <Link 
                        href={`/${tweetData.claimId}`}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
