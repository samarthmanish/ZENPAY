"use client"

import { useState } from "react"
import { AlertTriangle, RefreshCw, Check, Wallet, CalendarClock } from "lucide-react"
import { useStore } from "@/lib/store"
import { Card, Progress, Badge } from "@/components/ui/primitives"
import { CATEGORIES } from "@/lib/seed"
import { spendByCategory } from "@/lib/compute"
import { inr } from "@/lib/format"

export function BudgetScreen() {
  const {
    state,
    setCategoryLimit,
    resetLimitsToSuggestion,
    updateProfile,
  } = useStore()
  const [editing, setEditing] = useState(false)

  const { profile, transactions, categoryLimits, bills } = state
  const byCat = spendByCategory(transactions)

  const needs = Math.round(profile.salary * 0.5)
  const wants = Math.round(profile.salary * 0.3)
  const savings = Math.round(profile.salary * 0.2)

  const recurring = bills.filter((b) => b.recurring)

  const fieldClass =
    "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-10">
      <h1 className="text-2xl font-bold text-foreground">Budget planner</h1>

      {/* Salary & daily limit */}
      <Card>
        <p className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          <Wallet className="size-4 text-primary" /> Salary &amp; daily limit
        </p>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Monthly salary (₹)</span>
            <input
              type="number"
              inputMode="numeric"
              className={fieldClass}
              value={profile.salary}
              onChange={(e) => updateProfile({ salary: Number(e.target.value) || 0 })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Daily spend limit (₹)</span>
            <input
              type="number"
              inputMode="numeric"
              className={fieldClass}
              value={profile.dailyLimit}
              onChange={(e) => updateProfile({ dailyLimit: Number(e.target.value) || 0 })}
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Spend over your daily limit and a warning appears on the Home screen and in the
          payment sheet.
        </p>
      </Card>

      {/* 50 / 30 / 20 split */}
      <Card>
        <p className="mb-3 font-semibold text-foreground">Suggested 50 / 30 / 20 split</p>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: "Needs 50%", value: needs },
            { label: "Wants 30%", value: wants },
            { label: "Savings 20%", value: savings },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-secondary px-3 py-2.5">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="mt-0.5 text-[15px] font-bold text-foreground">{inr(s.value)}</p>
            </div>
          ))}
        </div>
        <button
          onClick={resetLimitsToSuggestion}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-2.5 text-sm font-semibold text-primary transition active:scale-[0.99]"
        >
          <RefreshCw className="size-4" /> Reset limits to suggestion
        </button>
      </Card>

      {/* Category limits */}
      <Card>
        <div className="mb-1 flex items-center justify-between">
          <p className="font-semibold text-foreground">Category limits</p>
          <button
            onClick={() => setEditing((v) => !v)}
            className="flex items-center gap-1 text-sm font-semibold text-primary"
          >
            {editing ? <Check className="size-4" /> : null}
            {editing ? "Done" : "Edit"}
          </button>
        </div>
        <ul className="mt-2 space-y-4">
          {CATEGORIES.map((c) => {
            const spent = byCat[c]
            const limit = categoryLimits[c]
            const pct = limit > 0 ? (spent / limit) * 100 : 0
            const over = limit > 0 && spent > limit
            return (
              <li key={c}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    {c}
                    {over && <AlertTriangle className="size-3.5 text-warning" />}
                  </span>
                  {editing ? (
                    <input
                      type="number"
                      inputMode="numeric"
                      className="w-28 rounded-lg border border-border bg-background px-2 py-1 text-right text-sm outline-none focus:border-primary"
                      value={limit}
                      onChange={(e) => setCategoryLimit(c, Number(e.target.value) || 0)}
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {inr(spent)} / {inr(limit)}
                    </span>
                  )}
                </div>
                <Progress
                  className="mt-2"
                  value={pct}
                  indicatorClassName={over ? "bg-warning" : "bg-primary"}
                />
                {over && (
                  <p className="mt-1 text-xs font-medium text-warning">
                    {inr(spent - limit)} over this category&apos;s limit
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      </Card>

      {/* Goal savings */}
      <Card>
        <p className="font-semibold text-foreground">Goal savings</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {profile.dream || "Your goal"}: {inr(state.goalSaved)} of {inr(profile.target)}
        </p>
        <Progress
          className="mt-3"
          value={profile.target > 0 ? (state.goalSaved / profile.target) * 100 : 0}
          indicatorClassName="bg-brand-gradient"
        />
      </Card>

      {/* Recurring reminders */}
      <Card>
        <p className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          <CalendarClock className="size-4 text-primary" /> Recurring reminders
        </p>
        <ul className="divide-y divide-border">
          {recurring.map((b) => (
            <li key={b.id} className="flex items-center justify-between py-2.5 text-sm">
              <span className="font-medium text-foreground">{b.name}</span>
              <span className="text-muted-foreground">
                {inr(b.amount)} ·{" "}
                {new Date(b.dueDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
                {b.paid && (
                  <Badge tone="success" className="ml-2">
                    Paid
                  </Badge>
                )}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
