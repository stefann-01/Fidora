"use client"

import { User } from "@/app/types/db.types"
import { AccountCard } from "@/components/account-card"
import { apiService } from "@/services/api.service"
import Fuse from "fuse.js"
import { Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

export default function AccountsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const fetchedUsers = await apiService.users.getAll()
        setUsers(fetchedUsers)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const fuse = useMemo(() => {
    const fuseOptions = {
      keys: [
        'username',
        'latestPostContent'
      ],
      threshold: 0.3, 
      ignoreLocation: true, 
      includeScore: true
    }
    
    return new Fuse(users, fuseOptions)
  }, [users])

  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) {
      return users
    }

    const results = fuse.search(searchQuery)
    return results.map(result => result.item)
  }, [searchQuery, fuse, users])

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">All Accounts</h1>
        <div className="text-center py-12">
          <p className="text-gray-600">Loading accounts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">All Accounts</h1>
        <div className="text-center py-12">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">All Accounts</h1>
      
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search accounts by username or latest post..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {searchQuery ? (
            <>Showing {filteredAccounts.length} of {users.length} accounts</>
          ) : (
            <>Showing all {users.length} accounts</>
          )}
        </p>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map((account) => (
          <AccountCard key={account.username} account={account} />
        ))}
      </div>

      {/* No Results */}
      {searchQuery && filteredAccounts.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or browse all accounts.
          </p>
        </div>
      )}
    </div>
  )
}
