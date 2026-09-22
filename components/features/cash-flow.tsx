"use client"

import { AlertTriangle, TrendingDown, CheckCircle2 } from "lucide-react"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/primitives"
import { cashFlowForecast } from "@/lib/compute"
import { inr, shortDate } from "@/lib/format"

export function CashFlowFeature() {
  const { state } = useStore()
  const forecast = cashFlowForecast(state)
  const { days, lowestBalance, blindSpotDay, dailyBurn, startingBalance } = forecast

  const maxAbs = Math.max(
    startingBalance,
    ...days.map((d) => Math.abs(d.balance)),
    1,
  )

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Your balance looks fine today, but bills and daily spending can quietly drain it
        before your next salary — the <strong>cash-flow blind spot</strong>. ZENPAY
        projects each day until payday so shortfalls never surprise you.
      </p>

      {blindSpotDay ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" />
            <p className="font-semibold">Blind spot on {shortDate(blindSpotDay.date)}</p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            You&apos;re projected to run short by {inr(Math.abs(blindSpotDay.balance))} in{" "}
            {blindSpotDay.day} day{blindSpotDay.day === 1 ? "" : "s"}
            {blindSpotDay.event ? ` around ${blindSpotDay.event}` : ""}. Move a bill or
            pause discretionary spends.
          </p>
        </Card>
      ) : (
        <Card className="border-success/40 bg-success/5">
          <div className="flex items-center gap-2 text-success">
            <CheckCircle2 className="size-5" />
            <p className="font-semibold">No blind spot ahead</p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            You stay in the positive every day until your next salary.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <p className="text-[11px] text-muted-foreground">Balance now</p>
          <p className="mt-1 text-lg font-bold text-foreground">{inr(startingBalance)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] text-muted-foreground">Daily burn</p>
          <p className="mt-1 text-lg font-bold text-foreground">{inr(dailyBurn)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] text-muted-foreground">Lowest point</p>
          <p
            className={`mt-1 text-lg font-bold ${
              lowestBalance < 0 ? "text-destructive" : "text-foreground"
            }`}
          >
            {inr(lowestBalance)}
          </p>
        </Card>
      </div>

      <Card>
        <p className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          <TrendingDown className="size-4 text-primary" /> Projected balance to payday
        </p>
        <div className="flex items-end gap-1" style={{ height: 140 }}>
          {days.map((d) => {
            const h = (Math.abs(d.balance) / maxAbs) * 60
            return (
              <div
                key={d.day}
                className="flex flex-1 flex-col items-center justify-end"
                title={`${shortDate(d.date)}: ${inr(d.balance)}${d.event ? ` (${d.event})` : ""}`}
              >
                <div className="flex w-full flex-col items-center justify-end" style={{ height: 120 }}>
                  {/* zero line baseline in middle */}
                  <div className="flex w-full flex-1 items-end justify-center">
                    {d.balance >= 0 && (
                      <div
                        className="w-full max-w-3 rounded-t bg-success"
                        style={{ height: `${h}%` }}
                      />
                    )}
                  </div>
                  <div className="h-px w-full bg-border" />
                  <div className="flex w-full flex-1 items-start justify-center">
                    {d.balance < 0 && (
                      <div
                        className="w-full max-w-3 rounded-b bg-destructive"
                        style={{ height: `${h}%` }}
                      />
                    )}
                  </div>
                </div>
                {d.event && <span className="mt-1 size-1.5 rounded-full bg-warning" />}
              </div>
            )
          })}
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Today</span>
          <span>Day {days.length} · payday</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded bg-success" /> Positive
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded bg-destructive" /> Shortfall
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-warning" /> Bill due
          </span>
        </div>
      </Card>
    </div>
  )
}
