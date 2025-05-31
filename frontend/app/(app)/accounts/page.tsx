"use client"

import { accountsMock } from "@/app/(app)/mocks/accounts-mock"
import { AccountCard } from "@/components/account-card"
import Fuse from "fuse.js"
import { Search } from "lucide-react"
import { useMemo, useState } from "react"

export default function AccountsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  
  const fuse = useMemo(() => {
    const fuseOptions = {
      keys: [
        'accountName',
        'latestTweetContent'
      ],
      threshold: 0.3, 
      ignoreLocation: true, 
      includeScore: true
    }
    
    return new Fuse(accountsMock, fuseOptions)
  }, [])

  
  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) {
      return accountsMock
    }

    const results = fuse.search(searchQuery)
    return results.map(result => result.item)
  }, [searchQuery, fuse])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">All Accounts</h1>
      
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search accounts by name or latest tweet..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {searchQuery ? (
            <>Showing {filteredAccounts.length} of {accountsMock.length} accounts</>
          ) : (
            <>Showing all {accountsMock.length} accounts</>
          )}
        </p>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map((account) => (
          <AccountCard key={account.id} account={account} />
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
