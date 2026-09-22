"use client"

import { useState } from "react"
import { Wallet, ShieldCheck } from "lucide-react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"

export function SetupScreen() {
  const { completeOnboarding, state } = useStore()
  const [name, setName] = useState(state.profile.name)
  const [age, setAge] = useState<string>(String(state.profile.age))
  const [salaryDay, setSalaryDay] = useState<string>(String(state.profile.salaryDay))
  const [salary, setSalary] = useState<string>(String(state.profile.salary))
  const [dailyLimit, setDailyLimit] = useState<string>(String(state.profile.dailyLimit))
  const [dream, setDream] = useState(state.profile.dream)
  const [target, setTarget] = useState<string>(String(state.profile.target))
  const [pinEnabled, setPinEnabled] = useState(state.profile.pinEnabled)

  const valid = name.trim().length > 0 && Number(salary) > 0 && Number(dailyLimit) > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    completeOnboarding({
      name: name.trim(),
      age: Number(age) || 18,
      salaryDay: Number(salaryDay) || 1,
      salary: Number(salary) || 0,
      dailyLimit: Number(dailyLimit) || 0,
      dream: dream.trim(),
      target: Number(target) || 0,
      pinEnabled,
    })
  }

  const fieldClass =
    "w-full rounded-2xl border border-border bg-background px-4 py-3 text-[15px] text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
  const labelClass = "mb-1.5 block text-sm font-medium text-muted-foreground"

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-10">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-gradient text-primary-foreground shadow-lg">
          <Wallet className="size-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Let&apos;s set up ZENPAY
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <ShieldCheck className="size-4" />
          Everything stays on this device. No sign-in needed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className={labelClass} htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            className={fieldClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Yashaswini Shelar"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="age">
              Age
            </label>
            <input
              id="age"
              type="number"
              inputMode="numeric"
              className={fieldClass}
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="salaryDay">
              Salary credit day
            </label>
            <select
              id="salaryDay"
              className={fieldClass}
              value={salaryDay}
              onChange={(e) => setSalaryDay(e.target.value)}
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="salary">
              Monthly salary (₹)
            </label>
            <input
              id="salary"
              type="number"
              inputMode="numeric"
              className={fieldClass}
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="dailyLimit">
              Daily spend limit (₹)
            </label>
            <input
              id="dailyLimit"
              type="number"
              inputMode="numeric"
              className={fieldClass}
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="dream">
            Your dream / goal
          </label>
          <input
            id="dream"
            className={fieldClass}
            value={dream}
            onChange={(e) => setDream(e.target.value)}
            placeholder="Buy a bike"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="target">
            Target amount (₹)
          </label>
          <input
            id="target"
            type="number"
            inputMode="numeric"
            className={fieldClass}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
          <div>
            <p className="text-[15px] font-medium text-foreground">
              Lock app with a 4-digit PIN
            </p>
            <p className="text-xs text-muted-foreground">Optional</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={pinEnabled}
            onClick={() => setPinEnabled((v) => !v)}
            className={`relative h-7 w-12 rounded-full transition ${
              pinEnabled ? "bg-primary" : "bg-secondary"
            }`}
          >
            <span
              className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition-all ${
                pinEnabled ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>

        <Button
          type="submit"
          disabled={!valid}
          className="mt-2 h-12 w-full rounded-2xl bg-brand-gradient text-base font-semibold text-primary-foreground shadow-lg"
        >
          Get started
        </Button>
      </form>
    </div>
  )
}
