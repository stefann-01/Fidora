"use client"

import { accountsMock } from "@/app/(app)/mocks/accounts-mock"
import { AccountCard } from "@/components/account-card"
import { PostForm } from "@/components/post-form"
import { TweetGrid } from "@/components/tweet-grid"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function ExplorePage() {
  const [showPostForm, setShowPostForm] = useState(false)

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Explore Accounts</h1>
        <Button 
          onClick={() => setShowPostForm(true)}
          className="bg-newPurple-600 hover:bg-newPurple-700 text-white"
        >
          Make a Post
        </Button>
      </div>

      {showPostForm && (
        <div className="mb-8">
          <PostForm onCloseAction={() => setShowPostForm(false)} />
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {accountsMock.map((account) => (
          <div key={account.id} className="flex-none w-80">
            <AccountCard account={account} />
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-4 mt-8">Recent Tweets</h2>
      <TweetGrid />
    </div>
  )
}
