"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePathname } from "next/navigation"
import Link from "next/link"

const navItems = [
  { value: "explore", label: "Explore", href: "/explore" },
  { value: "posts", label: "Posts", href: "/posts" },
  { value: "dashboard", label: "Dashboard", href: "/dashboard" },
  { value: "accounts", label: "Accounts", href: "/accounts" },
]

export function Navbar() {
  const pathname = usePathname()
  const currentTab = navItems.find(item => pathname.startsWith(item.href))?.value || "explore"

  return (
      <div className="px-6 py-4 flex items-center justify-between bg-newCyan-50">
        <div className="flex items-center gap-6">
          <div className="text-xl font-bold">
            Logo
          </div>
          
          <Tabs value={currentTab}>
            <TabsList>
              {navItems.map((item) => (
                <TabsTrigger key={item.value} value={item.value} asChild className="text-md">
                  <Link href={item.href}>
                    {item.label}
                  </Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>
  )
}