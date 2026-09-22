"use client"

import { useState } from "react"
import {
  AlertTriangle,
  Send,
  ScanLine,
  Smartphone,
  Receipt,
  PiggyBank,
  Bell,
  CheckCircle2,
  CircleDashed,
} from "lucide-react"
import { useStore } from "@/lib/store"
import { Card, Progress, Badge, Donut } from "@/components/ui/primitives"
import { PaySheet, type PayMode } from "@/components/pay-sheet"
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/seed"
import {
  dailyLimitStatus,
  daysUntilSalary,
  spendByCategory,
  spentThisMonth,
} from "@/lib/compute"
import { inr, shortDate } from "@/lib/format"
import type { Tab } from "@/components/app-shell"

export function HomeScreen({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const { state, payBill } = useStore()
  const [payMode, setPayMode] = useState<PayMode>(null)

  const { profile, transactions, bills, goalSaved } = state
  const spent = spentThisMonth(transactions)
  const remaining = profile.salary - spent
  const daily = dailyLimitStatus(state)
  const byCat = spendByCategory(transactions)
  const days = daysUntilSalary(profile.salaryDay)
  const goalPct = profile.target > 0 ? (goalSaved / profile.target) * 100 : 0

  const segments = CATEGORIES.map((c) => ({
    value: byCat[c],
    color: CATEGORY_COLORS[c],
  }))

  const upcoming = bills.filter((b) => !b.paid).slice(0, 3)

  const quickActions = [
    { label: "Send Money", icon: Send, onClick: () => setPayMode("send") },
    { label: "Scan & Pay", icon: ScanLine, onClick: () => setPayMode("scan") },
    { label: "Recharge", icon: Smartphone, onClick: () => setPayMode("recharge") },
    { label: "Bills", icon: Receipt, onClick: () => onNavigate("bills") },
    { label: "Add to Goal", icon: PiggyBank, onClick: () => onNavigate("goal") },
  ]

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Header */}
      <div className="bg-brand-gradient px-5 pb-8 pt-10 text-primary-foreground">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm/none opacity-80">Hi {profile.name} 👋</p>
            <h1 className="mt-1.5 text-2xl font-bold">Here&apos;s your money today</h1>
          </div>
          {daily.over && (
            <span
              className="flex size-10 animate-pulse items-center justify-center rounded-full bg-warning text-warning-foreground shadow-lg ring-4 ring-white/20"
              title="Over daily limit"
              aria-label="You are over your daily spending limit"
            >
              <AlertTriangle className="size-5 text-black/80" />
            </span>
          )}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {[
            { label: "Salary", value: profile.salary },
            { label: "Spent", value: spent },
            { label: "Remaining", value: remaining },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white/12 px-3 py-2.5 backdrop-blur">
              <p className="text-xs opacity-80">{s.label}</p>
              <p className="mt-0.5 text-[15px] font-bold">{inr(s.value)}</p>
            </div>
          ))}
        </div>

        <p className="mt-4 flex items-center gap-1.5 text-sm opacity-90">
          <Bell className="size-4" />
          {days === 0
            ? "Salary credits today"
            : `Next salary in ${days} day${days === 1 ? "" : "s"} (day ${profile.salaryDay} of the month)`}
        </p>
      </div>

      <div className="-mt-6 flex flex-col gap-4 px-4">
        {/* Daily limit card */}
        <Card
          className={
            daily.over
              ? "border-warning/50 bg-warning/5"
              : daily.near
                ? "border-warning/30"
                : ""
          }
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">Today&apos;s spending</p>
              {daily.over && <AlertTriangle className="size-4 text-warning" />}
            </div>
            {daily.over ? (
              <Badge tone="warning">
                <AlertTriangle className="size-3" />
                Over limit
              </Badge>
            ) : daily.near ? (
              <Badge tone="warning">Almost there</Badge>
            ) : (
              <Badge tone="success">On track</Badge>
            )}
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {inr(daily.spent)}{" "}
            <span className="text-base font-medium text-muted-foreground">
              / {inr(daily.limit)}
            </span>
          </p>
          <Progress
            className="mt-3"
            value={daily.ratio * 100}
            indicatorClassName={daily.over ? "bg-warning" : daily.near ? "bg-warning" : "bg-success"}
          />
          <p className="mt-2 text-sm text-muted-foreground">
            {daily.over
              ? `You are ${inr(daily.spent - daily.limit)} over your daily limit.`
              : `${inr(daily.remaining)} left for today.`}
          </p>
        </Card>

        {/* Dream goal */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Dream goal</p>
              <p className="text-lg font-semibold text-foreground">
                {profile.dream || "Set a goal"}
              </p>
            </div>
            <Badge tone="warning">{Math.round(goalPct)}%</Badge>
          </div>
          <Progress className="mt-3" value={goalPct} indicatorClassName="bg-brand-gradient" />
          <p className="mt-2 text-sm text-muted-foreground">
            {inr(goalSaved)} / {inr(profile.target)} saved
          </p>
        </Card>

        {/* Quick actions */}
        <div className="grid grid-cols-5 gap-1">
          {quickActions.map((a) => (
            <button
              key={a.label}
              onClick={a.onClick}
              className="flex flex-col items-center gap-1.5 rounded-2xl p-2 transition active:scale-95"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-primary">
                <a.icon className="size-5" />
              </span>
              <span className="text-center text-[11px] font-medium leading-tight text-muted-foreground">
                {a.label}
              </span>
            </button>
          ))}
        </div>

        {/* Spending by category */}
        <Card>
          <p className="mb-3 font-semibold text-foreground">Spending by category</p>
          <div className="flex items-center gap-5">
            <Donut segments={segments} />
            <ul className="flex-1 space-y-1.5">
              {CATEGORIES.map((c) => (
                <li key={c} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[c] }}
                    />
                    <span className="text-muted-foreground">{c}</span>
                  </span>
                  <span className="font-medium text-foreground">{inr(byCat[c])}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Upcoming bills */}
        <Card>
          <p className="mb-3 flex items-center gap-2 font-semibold text-foreground">
            <Bell className="size-4 text-primary" /> Upcoming bills
          </p>
          <ul className="divide-y divide-border">
            {upcoming.length === 0 && (
              <li className="py-2 text-sm text-muted-foreground">All bills cleared.</li>
            )}
            {upcoming.map((b) => (
              <li key={b.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-foreground">{b.name}</p>
                  <p className="text-xs text-muted-foreground">Due {shortDate(b.dueDate)}</p>
                </div>
                <button
                  onClick={() => payBill(b.id)}
                  className="rounded-full bg-accent px-3.5 py-1.5 text-sm font-semibold text-primary transition active:scale-95"
                >
                  Pay {inr(b.amount)}
                </button>
              </li>
            ))}
          </ul>
        </Card>

        {/* Recent transactions */}
        <Card>
          <p className="mb-3 font-semibold text-foreground">Recent transactions</p>
          <ul className="divide-y divide-border">
            {transactions.slice(0, 6).map((t) => (
              <li key={t.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-foreground">{t.merchant}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.category} · {shortDate(t.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      t.direction === "in" ? "text-success" : "text-foreground"
                    }`}
                  >
                    {t.direction === "in" ? "+" : "−"}
                    {inr(t.amount)}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    {t.status === "Success" || t.status === "Refund" ? (
                      <CheckCircle2 className="size-3 text-success" />
                    ) : (
                      <CircleDashed className="size-3" />
                    )}
                    {t.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <PaySheet mode={payMode} onClose={() => setPayMode(null)} />
    </div>
  )
}
