"use client"

import { useState } from "react"
import {
  ArrowLeft,
  ChevronRight,
  Users,
  Landmark,
  Gauge,
  RefreshCw,
  Activity,
  ShieldCheck,
} from "lucide-react"
import { useStore } from "@/lib/store"
import { Card, Badge } from "@/components/ui/primitives"
import {
  cashFlowForecast,
  chitRisk,
  creditScore,
  detectRefundFraud,
  subsidyEligible,
} from "@/lib/compute"
import { ChitFundFeature } from "@/components/features/chit-fund"
import { SubsidyFeature } from "@/components/features/subsidy"
import { CreditScoreFeature } from "@/components/features/credit-score"
import { RefundLoopFeature } from "@/components/features/refund-loop"
import { CashFlowFeature } from "@/components/features/cash-flow"

type FeatureKey = "chit" | "subsidy" | "credit" | "refund" | "cashflow" | null

export function ProtectScreen() {
  const { state } = useStore()
  const [active, setActive] = useState<FeatureKey>(null)

  // Summaries for the hub cards
  const chitAlerts = state.chitFunds.filter((f) => chitRisk(f).level !== "Low").length
  const eligibleSubsidies = state.subsidies.filter(
    (s) => subsidyEligible(s, state.profile) && s.status === "eligible",
  ).length
  const score = creditScore(state).score
  const refundAlerts = detectRefundFraud(state.transactions).filter(
    (f) => !state.reviewedRefunds.includes(f.txn.id),
  ).length
  const blindSpot = cashFlowForecast(state).blindSpotDay

  const features = [
    {
      key: "chit" as const,
      title: "The Chit Fund That Vanished Overnight",
      subtitle: "Spot risky chit funds before your money disappears",
      icon: Users,
      badge:
        chitAlerts > 0 ? (
          <Badge tone="danger">{chitAlerts} at risk</Badge>
        ) : (
          <Badge tone="success">Safe</Badge>
        ),
    },
    {
      key: "subsidy" as const,
      title: "The Subsidy That Slipped Through",
      subtitle: "Government benefits you qualify for but never claimed",
      icon: Landmark,
      badge:
        eligibleSubsidies > 0 ? (
          <Badge tone="brand">{eligibleSubsidies} eligible</Badge>
        ) : (
          <Badge tone="neutral">None</Badge>
        ),
    },
    {
      key: "credit" as const,
      title: "Credit Score for the Invisible",
      subtitle: "An alternative score from your real money habits",
      icon: Gauge,
      badge: <Badge tone="brand">{score}</Badge>,
    },
    {
      key: "refund" as const,
      title: "The Fraudulent Refund Loop",
      subtitle: "Detects scam refunds that trick you into paying back",
      icon: RefreshCw,
      badge:
        refundAlerts > 0 ? (
          <Badge tone="danger">{refundAlerts} alert{refundAlerts === 1 ? "" : "s"}</Badge>
        ) : (
          <Badge tone="success">Clear</Badge>
        ),
    },
    {
      key: "cashflow" as const,
      title: "Cash Flow Blind Spot",
      subtitle: "Predicts shortfalls before your next salary",
      icon: Activity,
      badge: blindSpot ? (
        <Badge tone="warning">Shortfall</Badge>
      ) : (
        <Badge tone="success">Healthy</Badge>
      ),
    },
  ]

  const current = features.find((f) => f.key === active)

  if (active && current) {
    return (
      <div className="flex flex-col gap-4 px-4 pb-4 pt-10">
        <button
          onClick={() => setActive(null)}
          className="flex items-center gap-1.5 text-sm font-semibold text-primary"
        >
          <ArrowLeft className="size-4" /> Protect
        </button>
        <h1 className="text-xl font-bold text-foreground">{current.title}</h1>
        {active === "chit" && <ChitFundFeature />}
        {active === "subsidy" && <SubsidyFeature />}
        {active === "credit" && <CreditScoreFeature />}
        {active === "refund" && <RefundLoopFeature />}
        {active === "cashflow" && <CashFlowFeature />}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-10">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Protect</h1>
      </div>
      <p className="-mt-1 text-sm text-muted-foreground">
        Smart safeguards that catch the money problems people usually notice too late.
      </p>

      <div className="flex flex-col gap-3">
        {features.map((f) => (
          <button
            key={f.key}
            onClick={() => setActive(f.key)}
            className="text-left transition active:scale-[0.99]"
          >
            <Card className="flex items-center gap-3 p-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary">
                <f.icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold leading-tight text-foreground">
                    {f.title}
                  </p>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{f.subtitle}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {f.badge}
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  )
}
