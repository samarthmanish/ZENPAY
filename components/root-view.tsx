"use client"

import { useEffect, useState } from "react"
import { Wallet } from "lucide-react"
import { useStore } from "@/lib/store"
import { SetupScreen } from "@/components/setup-screen"
import { AppShell } from "@/components/app-shell"

function Splash() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-brand-gradient text-primary-foreground">
      <div className="flex size-20 items-center justify-center rounded-3xl bg-white/15 backdrop-blur">
        <Wallet className="size-10" />
      </div>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">ZENPAY</h1>
      <p className="mt-1 text-sm opacity-85">Pay smart. Save smarter.</p>
    </div>
  )
}

export function RootView() {
  const { state, ready } = useStore()
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1600)
    return () => clearTimeout(t)
  }, [])

  if (showSplash || !ready) return <Splash />
  if (!state.onboarded) return <SetupScreen />
  return <AppShell />
}
