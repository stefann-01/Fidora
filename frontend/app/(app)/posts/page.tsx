"use client"

import { tweetEvidenceMock } from "@/app/(app)/mocks/tweet-evidence-mock"
import { TweetGrid } from "@/components/tweet-grid"
import Fuse from "fuse.js"
import { Search } from "lucide-react"
import { useMemo, useState } from "react"

export default function PostsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Configure Fuse.js for searching
  const fuse = useMemo(() => {
    const options = {
      keys: [
        'postId',
        'evidence.title',
        'evidence.description'
      ],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true
    }
    return new Fuse(tweetEvidenceMock, options)
  }, [])

  // Filter tweets based on search query
  const filteredTweets = useMemo(() => {
    if (!searchQuery.trim()) {
      return tweetEvidenceMock
    }
    
    const results = fuse.search(searchQuery)
    return results.map(result => result.item)
  }, [searchQuery, fuse])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">All Posts</h1>
        
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tweets and evidence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        
        {/* Search Results Info */}
        {searchQuery && (
          <p className="text-sm text-gray-600 mt-2">
            Found {filteredTweets.length} result{filteredTweets.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
          </p>
        )}
      </div>

      {/* Tweets Grid */}
      <TweetGrid tweets={filteredTweets} />

      {/* No Results Message */}
      {searchQuery && filteredTweets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No tweets found matching your search.</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  )
}
