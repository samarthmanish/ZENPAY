"use client"

import { AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react"
import { useStore } from "@/lib/store"
import { Card, Progress, Badge } from "@/components/ui/primitives"
import { chitRisk } from "@/lib/compute"
import { inr } from "@/lib/format"

export function ChitFundFeature() {
  const { state } = useStore()
  const { chitFunds } = state

  const totalAtRisk = chitFunds
    .map(chitRisk)
    .filter((r) => r.level !== "Low")
    .reduce((s, r) => s + r.invested, 0)

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Chit funds are a common way to save together — until an unregistered organizer
        collects everyone&apos;s money and <strong>vanishes overnight</strong>. ZENPAY
        scores each chit for warning signs so you can pull out before it&apos;s too late.
      </p>

      {totalAtRisk > 0 && (
        <Card className="border-destructive/40 bg-destructive/5">
          <div className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="size-5" />
            <p className="font-semibold">{inr(totalAtRisk)} exposed to risky chits</p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Money you&apos;ve already paid into medium/high-risk chit funds.
          </p>
        </Card>
      )}

      {chitFunds.map((fund) => {
        const risk = chitRisk(fund)
        const tone =
          risk.level === "High" ? "danger" : risk.level === "Medium" ? "warning" : "success"
        return (
          <Card key={fund.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-foreground">{fund.name}</p>
                <p className="text-xs text-muted-foreground">by {fund.organizer}</p>
              </div>
              <Badge tone={tone}>
                {risk.level === "Low" ? (
                  <ShieldCheck className="size-3.5" />
                ) : (
                  <AlertTriangle className="size-3.5" />
                )}
                {risk.level} risk
              </Badge>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-secondary py-2">
                <p className="text-[11px] text-muted-foreground">You paid</p>
                <p className="text-sm font-bold text-foreground">{inr(risk.invested)}</p>
              </div>
              <div className="rounded-xl bg-secondary py-2">
                <p className="text-[11px] text-muted-foreground">Per month</p>
                <p className="text-sm font-bold text-foreground">
                  {inr(fund.monthlyContribution)}
                </p>
              </div>
              <div className="rounded-xl bg-secondary py-2">
                <p className="text-[11px] text-muted-foreground">Progress</p>
                <p className="text-sm font-bold text-foreground">
                  {fund.monthsPaid}/{fund.totalMonths}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Risk score</span>
                <span className="font-semibold text-foreground">{risk.score}/100</span>
              </div>
              <Progress
                value={risk.score}
                indicatorClassName={
                  risk.level === "High"
                    ? "bg-destructive"
                    : risk.level === "Medium"
                      ? "bg-warning"
                      : "bg-success"
                }
              />
            </div>

            {risk.reasons.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {risk.reasons.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm text-foreground">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                    {r}
                  </li>
                ))}
              </ul>
            )}

            {risk.level === "High" && (
              <div className="mt-3 rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">
                Stop paying and demand written records now. This chit shows the classic
                pattern of one that vanishes overnight.
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
