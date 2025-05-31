"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWeb3 } from "@/contexts/Web3Context"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { value: "explore", label: "Explore", href: "/explore" },
  { value: "posts", label: "Posts", href: "/posts" },
  { value: "dashboard", label: "Dashboard", href: "/dashboard" },
  { value: "accounts", label: "Accounts", href: "/accounts" },
]

export function Navbar() {
  const pathname = usePathname()
  const currentTab = navItems.find(item => pathname.startsWith(item.href))?.value || "explore"
  const { account, isConnected, connectWallet, disconnectWallet } = useWeb3()

  return (
    <div className="px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="text-xl font-bold">
          Logo
        </div>
        
        <Tabs value={currentTab}>
          <TabsList>
            {navItems.map((item) => (
              <TabsTrigger 
                key={item.value} 
                value={item.value} 
                asChild 
                className="text-md data-[state=active]:text-newPurple-600"
              >
                <Link href={item.href}>
                  {item.label}
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex items-center gap-4">
        {isConnected ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {account?.slice(0, 6)}...{account?.slice(-4)}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={disconnectWallet}
              className="hover:text-red-600"
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <Button 
            onClick={connectWallet}
            className="bg-newPurple-600 hover:bg-newPurple-700 text-white"
          >
            Connect Wallet
          </Button>
        )}
      </div>
    </div>
  )
}