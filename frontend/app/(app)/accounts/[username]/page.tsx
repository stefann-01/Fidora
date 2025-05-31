"use client"

import { accountsMock } from "@/app/(app)/mocks/accounts-mock"
import { TweetGrid } from "@/components/tweet-grid"
import Image from "next/image"
import { notFound } from "next/navigation"
import { use } from "react"

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { username } = use(params)
  
  
  const account = accountsMock.find(acc => 
    acc.accountName.replace('@', '') === username
  )

  if (!account) {
    notFound()
  }

  return (
    <div className="p-6">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Image
              src={account.photo}
              alt={`${account.accountName} profile`}
              width={80}
              height={80}
              className="rounded-full"
            />
            <h1 className="text-3xl font-bold text-gray-900">
              {account.accountName}
            </h1>
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
      <div className="space-y-6">
        <h2 className="text-xl font-bold mb-4">All Tweets</h2>
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
        <TweetGrid accountFilter={username} />
      </div>
    </div>
  )
}       
