"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { value: "explore", label: "Explore", href: "/explore" },
  { value: "my-cases", label: "My Cases", href: "/my-cases" },
  { value: "my-claims", label: "My Claims", href: "/my-claims" },
]

export function Navbar() {
  const pathname = usePathname()
  const currentTab = navItems.find(item => pathname.startsWith(item.href))?.value || "explore"

  return (
      <div className="px-6 py-4 flex items-center justify-between">
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