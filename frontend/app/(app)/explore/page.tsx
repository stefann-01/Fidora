"use client"

import { Claim, User } from '@/app/types/db.types'
import { AccountCard } from "@/components/account-card"
import { PostForm } from "@/components/post-form"
import { TweetGrid } from "@/components/tweet-grid"
import { Button } from "@/components/ui/button"
import { apiService } from '@/services/api.service'
import { useEffect, useState } from 'react'

export default function ExplorePage() {
  const [showPostForm, setShowPostForm] = useState(false)
  const [tweets, setTweets] = useState<Claim[]>([])
  const [accounts, setAccounts] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [claimsData, usersData] = await Promise.all([
          apiService.claims.getAll(),
          apiService.users.getAll()
        ])
        setTweets(claimsData)
        setAccounts(usersData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">Error: {error}</div>
        </div>
      </div>
    )
  }

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
        {accounts.map((account) => (
          <div key={account.username} className="flex-none w-80">
            <AccountCard account={account} />
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-4 mt-8">Recent Tweets</h2>
      <TweetGrid tweets={tweets}/>
    </div>
  )
}
