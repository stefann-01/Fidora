"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWeb3 } from "@/contexts/Web3Context"
import { LogOut } from "lucide-react"
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
            <div className="bg-white border px-3 py-2 rounded-md text-sm font-medium cursor-default">
              <span 
                className="bg-gradient-to-r from-[#B37FC3] via-[#5349C6] to-[#1E8BB5] bg-clip-text text-transparent"
              >
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={disconnectWallet}
              className="hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button 
            onClick={connectWallet}
            className="text-white font-medium"
            style={{
              background: 'linear-gradient(to right, #B37FC3 0%, #5349C6 50%, #1E8BB5 100%)'
            }}
          >
            Connect Wallet
          </Button>
        )}
      </div>
    </div>
  )
}