"use client"

import { StoreProvider } from "@/lib/store"
import { RootView } from "@/components/root-view"

export default function Page() {
  return (
    <StoreProvider>
      <RootView />
    </StoreProvider>
  )
}
