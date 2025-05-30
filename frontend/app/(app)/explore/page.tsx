"use client"

import { accountsMock } from "@/app/(app)/mocks/accounts-mock"
import { AccountCard } from "@/components/account-card"

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
    </div>
  )
}
