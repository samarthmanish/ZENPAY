"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type {
  AppState,
  Bill,
  Category,
  Profile,
  Transaction,
} from "./types"
import { createInitialState } from "./seed"
import { dayOffset } from "./format"

const STORAGE_KEY = "zenpay_state_v2"

interface StoreValue {
  state: AppState
  ready: boolean
  completeOnboarding: (profile: Profile) => void
  updateProfile: (patch: Partial<Profile>) => void
  addTransaction: (txn: Omit<Transaction, "id" | "date"> & { date?: string }) => void
  payBill: (billId: string) => void
  addToGoal: (amount: number) => void
  setCategoryLimit: (category: Category, limit: number) => void
  resetLimitsToSuggestion: () => void
  markRefundReviewed: (id: string) => void
  claimSubsidy: (id: string) => void
  verifyDocument: (kind: "aadhaar" | "pan", number: string) => void
  resetApp: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

function loadState(): AppState {
  if (typeof window === "undefined") return createInitialState()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState()
    const parsed = JSON.parse(raw) as AppState
    return { ...createInitialState(), ...parsed }
  } catch {
    return createInitialState()
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => createInitialState())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setState(loadState())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore quota errors */
    }
  }, [state, ready])

  const value = useMemo<StoreValue>(() => {
    const uid = () => Math.random().toString(36).slice(2, 10)

    return {
      state,
      ready,
      completeOnboarding: (profile) =>
        setState((s) => ({ ...s, onboarded: true, profile })),
      updateProfile: (patch) =>
        setState((s) => ({ ...s, profile: { ...s.profile, ...patch } })),
      addTransaction: (txn) =>
        setState((s) => ({
          ...s,
          transactions: [
            {
              ...txn,
              id: `t-${uid()}`,
              date: txn.date ?? dayOffset(0),
            },
            ...s.transactions,
          ],
        })),
      payBill: (billId) =>
        setState((s) => {
          const bill = s.bills.find((b) => b.id === billId)
          if (!bill || bill.paid) return s
          const txn: Transaction = {
            id: `t-${uid()}`,
            merchant: bill.name,
            category: bill.category,
            amount: bill.amount,
            direction: "out",
            date: dayOffset(0),
            status: "Success",
            vpa: "biller@zenpay",
          }
          return {
            ...s,
            bills: s.bills.map((b) =>
              b.id === billId ? { ...b, paid: true } : b,
            ),
            transactions: [txn, ...s.transactions],
          }
        }),
      addToGoal: (amount) =>
        setState((s) => ({
          ...s,
          goalSaved: Math.min(s.goalSaved + amount, s.profile.target),
          transactions: [
            {
              id: `t-${uid()}`,
              merchant: `Goal: ${s.profile.dream || "Savings"}`,
              category: "Others",
              amount,
              direction: "out",
              date: dayOffset(0),
              status: "Success",
              vpa: "goal@zenpay",
            },
            ...s.transactions,
          ],
        })),
      setCategoryLimit: (category, limit) =>
        setState((s) => ({
          ...s,
          categoryLimits: { ...s.categoryLimits, [category]: Math.max(0, limit) },
        })),
      resetLimitsToSuggestion: () =>
        setState((s) => {
          const salary = s.profile.salary
          return {
            ...s,
            categoryLimits: {
              Food: Math.round((salary * 0.25) / 100) * 100,
              Travel: Math.round((salary * 0.075) / 100) * 100,
              Bills: Math.round((salary * 0.175) / 100) * 100,
              Shopping: Math.round((salary * 0.15) / 100) * 100,
              Entertainment: Math.round((salary * 0.09) / 100) * 100,
              Others: Math.round((salary * 0.06) / 100) * 100,
            },
          }
        }),
      markRefundReviewed: (id) =>
        setState((s) =>
          s.reviewedRefunds.includes(id)
            ? s
            : { ...s, reviewedRefunds: [...s.reviewedRefunds, id] },
        ),
      claimSubsidy: (id) =>
        setState((s) => ({
          ...s,
          subsidies: s.subsidies.map((sub) =>
            sub.id === id ? { ...sub, status: "claimed" } : sub,
          ),
        })),
      verifyDocument: (kind, number) => {
        setState((s) => ({
          ...s,
          kyc: { ...s.kyc, [kind]: { status: "pending", number } },
        }))
        // Simulate a verification check completing
        setTimeout(() => {
          setState((s) => ({
            ...s,
            kyc: { ...s.kyc, [kind]: { status: "verified", number } },
          }))
        }, 1600)
      },
      resetApp: () => {
        setState(createInitialState())
      },
    }
  }, [state, ready])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}

export type { Bill }
