"use client"

import { useStore } from "@/lib/store"
import { Card, Progress } from "@/components/ui/primitives"
import { creditScore } from "@/lib/compute"

const MIN = 300
const MAX = 900

export function CreditScoreFeature() {
  const { state } = useStore()
  const { score, band, factors } = creditScore(state)
  const pct = ((score - MIN) / (MAX - MIN)) * 100

  const bandColor =
    band === "Excellent"
      ? "text-success"
      : band === "Good"
        ? "text-primary"
        : band === "Fair"
          ? "text-warning"
          : "text-muted-foreground"

  // Semi-circular gauge
  const radius = 90
  const circ = Math.PI * radius
  const dash = (pct / 100) * circ

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Millions of people have no formal credit history — no loans, no cards, so banks
        treat them as invisible. ZENPAY builds an <strong>alternative score</strong> from
        how you actually handle money: bills, savings, and spending discipline.
      </p>

      <Card className="items-center text-center">
        <div className="relative mx-auto w-[220px]">
          <svg viewBox="0 0 220 130" className="w-full">
            <path
              d="M 20 120 A 90 90 0 0 1 200 120"
              fill="none"
              stroke="var(--secondary)"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <path
              d="M 20 120 A 90 90 0 0 1 200 120"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
            />
          </svg>
          <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
            <span className="text-4xl font-bold text-foreground">{score}</span>
            <span className={`text-sm font-semibold ${bandColor}`}>{band}</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Range {MIN}–{MAX}</p>
      </Card>

      <Card>
        <p className="mb-3 font-semibold text-foreground">What builds your score</p>
        <ul className="space-y-4">
          {factors.map((f) => (
            <li key={f.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{f.label}</span>
                <span className="text-muted-foreground">
                  {f.points}/{f.max}
                </span>
              </div>
              <Progress className="mt-1.5" value={(f.points / f.max) * 100} />
              <p className="mt-1 text-xs text-muted-foreground">{f.detail}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="bg-accent/60">
        <p className="text-sm font-medium text-foreground">Improve your score</p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
          <li>Clear upcoming bills before their due date.</li>
          <li>Keep monthly spending well under your salary.</li>
          <li>Top up your savings goal consistently.</li>
        </ul>
      </Card>
    </div>
  )
}
