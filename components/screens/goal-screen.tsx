"use client"

import { useState } from "react"
import { Target, Sparkles } from "lucide-react"
import { useStore } from "@/lib/store"
import { Card, Progress } from "@/components/ui/primitives"
import { Button } from "@/components/ui/button"
import { daysUntilSalary } from "@/lib/compute"
import { inr } from "@/lib/format"

const QUICK = [500, 1000, 2500, 5000]

export function GoalScreen() {
  const { state, addToGoal } = useStore()
  const { profile, goalSaved } = state
  const [custom, setCustom] = useState("")

  const remaining = Math.max(profile.target - goalSaved, 0)
  const pct = profile.target > 0 ? (goalSaved / profile.target) * 100 : 0
  const days = daysUntilSalary(profile.salaryDay)
  const monthsLeft = remaining > 0 ? Math.ceil(remaining / Math.max(profile.salary * 0.2, 1)) : 0

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-10">
      <h1 className="text-2xl font-bold text-foreground">Goal</h1>

      <Card className="bg-brand-gradient text-primary-foreground">
        <div className="flex items-center gap-2">
          <Target className="size-5" />
          <p className="font-semibold">{profile.dream || "Your dream goal"}</p>
        </div>
        <p className="mt-4 text-3xl font-bold">{inr(goalSaved)}</p>
        <p className="text-sm opacity-85">of {inr(profile.target)} target</p>
        <Progress
          className="mt-3 bg-white/20"
          value={pct}
          indicatorClassName="bg-white"
        />
        <p className="mt-2 text-sm opacity-90">{Math.round(pct)}% funded</p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-sm text-muted-foreground">Still to save</p>
          <p className="mt-1 text-xl font-bold text-foreground">{inr(remaining)}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">At 20% / month</p>
          <p className="mt-1 text-xl font-bold text-foreground">
            {remaining === 0 ? "Done!" : `~${monthsLeft} mo`}
          </p>
        </Card>
      </div>

      <Card>
        <p className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          <Sparkles className="size-4 text-primary" /> Add to goal
        </p>
        <div className="grid grid-cols-4 gap-2">
          {QUICK.map((amt) => (
            <button
              key={amt}
              onClick={() => addToGoal(amt)}
              disabled={remaining === 0}
              className="rounded-2xl bg-accent py-2.5 text-sm font-semibold text-primary transition active:scale-95 disabled:opacity-40"
            >
              +{inr(amt)}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Custom amount"
            className="flex-1 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
          />
          <Button
            onClick={() => {
              const n = Number(custom)
              if (n > 0) {
                addToGoal(n)
                setCustom("")
              }
            }}
            disabled={remaining === 0 || !(Number(custom) > 0)}
            className="h-auto rounded-2xl bg-brand-gradient px-5 font-semibold text-primary-foreground"
          >
            Add
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Next salary in {days} day{days === 1 ? "" : "s"} — a great time to top up your goal.
        </p>
      </Card>
    </div>
  )
}
