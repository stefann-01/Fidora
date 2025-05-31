"use client"

import { Logo } from "@/components/logo"
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
    <div className="mt-4 mb-2 flex items-center justify-between">
      <div className="flex items-center">
        <Link href="/explore" className="items-center">
          <Logo className="hover:opacity-80 transition-opacity" />
        </Link>
        
        <Tabs value={currentTab}>
          <TabsList className="h-16">
            {navItems.map((item) => (
              <TabsTrigger 
                key={item.value} 
                value={item.value} 
                asChild 
                className="text-md data-[state=active]:text-newPurple-600 h-14 text-lg"
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
            <div className="bg-white border px-4 py-3 rounded-md text-lg font-medium cursor-default">
              <span 
                className="bg-gradient-to-r from-[#B37FC3] via-[#5349C6] to-[#1E8BB5] bg-clip-text text-transparent"
              >
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="lg"
              onClick={disconnectWallet}
              className="hover:text-red-600 h-[52px] w-12"
            >
              <LogOut className="h-8 w-8" />
            </Button>
          </div>
        ) : (
          <Button 
            onClick={connectWallet}
            size="lg"
            className="text-white font-medium text-lg px-6 py-3"
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
