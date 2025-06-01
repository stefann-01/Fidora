"use client"

import { Claim, User } from "@/app/types/db.types"
import { TweetGrid } from "@/components/tweet-grid"
import { apiService } from "@/services/api.service"
import { notFound } from "next/navigation"
import { use, useEffect, useState } from "react"

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { username } = use(params)
  const [account, setAccount] = useState<User | null>(null)
  const [userClaims, setUserClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [claimsLoading, setClaimsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const users = await apiService.users.getAll()
        const foundAccount = users.find(user => 
          user.username.replace('@', '') === username
        )
        
        if (!foundAccount) {
          notFound()
          return
        }
        
        setAccount(foundAccount)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [username])

  // Fetch user's claims when account is loaded
  useEffect(() => {
    const fetchUserClaims = async () => {
      if (!account) return
      
      try {
        setClaimsLoading(true)
        const claims = await apiService.claims.getByAuthor(account.username)
        setUserClaims(claims)
      } catch (err) {
        console.error('Failed to fetch user claims:', err)
        // Don't set error state for claims, just log it
      } finally {
        setClaimsLoading(false)
      }
    }

    fetchUserClaims()
  }, [account])

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    )
  }

  if (!account) {
    notFound()
    return null
  }

  return (
    <div className="p-6">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {account.username}
              </h1>
              <p className="text-gray-600 mt-1">
                {claimsLoading ? 'Loading...' : `${userClaims.length} claims`}
              </p>
            </div>
          </div>
          
          {/* Progress Bar - on the far right */}
          <div className="flex flex-col items-end">
            <div className="relative w-64 bg-gray-200 rounded-full h-3 mb-1">
              <div 
                className="h-3 rounded-full transition-all duration-300"
                style={{ 
                  width: `${account.rating}%`,
                  backgroundImage: 'linear-gradient(to right, #B37FC3 0%, #5349C6 50%, #1E8BB5 100%)',
                  backgroundSize: `${100 * (100 / account.rating)}% 100%`,
                  backgroundPosition: 'left center'
                }}
              />
            </div>
            <span 
              className={`text-sm font-medium ${
                account.rating >= 70 
                  ? 'text-newCyan-700'
                  : account.rating >= 50
                  ? 'text-newPurple-700'
                  : 'text-rawPink-700'
              }`}
            >
              {account.rating}% Credibility Rating
            </span>
          </div>
        </div>
      </div>

      {/* Tweets Section */}
      <div className="space-y-6 mt-12">
        <h2 className="text-xl font-bold mb-4">Tweets</h2>
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tweets..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        <TweetGrid tweets={userClaims} />
      </div>
    </div>
  )
}       
