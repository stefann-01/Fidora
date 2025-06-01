'use client'

import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Web3Provider } from "@/contexts/Web3Context"
import { NotificationProvider } from "@blockscout/app-sdk"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Web3Provider>
      <NotificationProvider>
      <div className="">
        <div className="mx-32 mb-2">
          <Navbar />
          <Card>
            <CardContent className="overflow-y-auto">
              {children}
            </CardContent>
          </Card>
        </div>
      </div>
      </NotificationProvider>
    </Web3Provider>
  )
}
