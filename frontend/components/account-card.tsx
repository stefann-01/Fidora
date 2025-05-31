import { AccountData } from "@/app/(app)/mocks/accounts-mock"
import { ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface AccountCardProps {
  account: AccountData
}

export function AccountCard({ account }: AccountCardProps) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-4">
        <Image
          src={account.photo}
          alt={`${account.accountName} profile`}
          width={48}
          height={48}
          className="rounded-full"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 truncate">
              {account.accountName}
            </h3>
            <Link 
              href={`/accounts/${account.accountName.replace('@', '')}`}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </Link>
          </div>
          
          <div className="mb-2">
            <span className="text-xs text-gray-500 font-medium">Latest Tweet</span>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-3">
            {account.latestTweetContent}
          </p>
        </div>
      </div>
      
      {/* Progress Bar at bottom */}
      <div>
        <div className="relative w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
          <div 
            className="h-2 transition-all duration-300"
            style={{ 
              width: `${account.rating}%`,
              background: 'linear-gradient(to right, #ef4444 0%, #eab308 50%, #22c55e 100%)',
              backgroundSize: `${100 * (100 / account.rating)}% 100%`,
              backgroundPosition: 'left center'
            }}
          />
        </div>
        <div className="text-center">
          <span 
            className={`text-xs font-medium ${
              account.rating >= 70 
                ? 'text-green-700'
                : account.rating >= 50
                ? 'text-yellow-700'
                : 'text-red-700'
            }`}
          >
            {account.rating}% Credibility
          </span>
        </div>
      </div>
    </div>
  )
} 