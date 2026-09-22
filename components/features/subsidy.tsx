"use client"

import { CheckCircle2, Landmark, XCircle } from "lucide-react"
import { useStore } from "@/lib/store"
import { Card, Badge } from "@/components/ui/primitives"
import { subsidyEligible } from "@/lib/compute"
import { inr } from "@/lib/format"

export function SubsidyFeature() {
  const { state, claimSubsidy } = useStore()
  const { subsidies, profile } = state

  const evaluated = subsidies.map((s) => ({
    sub: s,
    eligible: subsidyEligible(s, profile),
  }))

  const unclaimedBenefit = evaluated
    .filter((e) => e.eligible && e.sub.status === "eligible")
    .reduce((sum, e) => sum + e.sub.benefit, 0)

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Every year, real money in government schemes goes unclaimed simply because people
        never knew they qualified — the <strong>subsidy that slipped through</strong>.
        ZENPAY matches your profile to schemes you&apos;re eligible for.
      </p>

      <Card className="bg-brand-gradient text-primary-foreground">
        <p className="text-sm opacity-85">Benefits you could still claim</p>
        <p className="mt-1 text-3xl font-bold">{inr(unclaimedBenefit)}</p>
        <p className="mt-1 text-sm opacity-85">
          Based on age {profile.age} and {inr(profile.salary)}/month income
        </p>
      </Card>

      {evaluated.map(({ sub, eligible }) => (
        <Card key={sub.id} className={eligible ? "" : "opacity-70"}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                <Landmark className="size-4" />
              </span>
              <div>
                <p className="font-semibold text-foreground">{sub.name}</p>
                <p className="text-xs text-muted-foreground">{sub.agency}</p>
              </div>
            </div>
            {sub.status === "claimed" ? (
              <Badge tone="success">
                <CheckCircle2 className="size-3.5" /> Claimed
              </Badge>
            ) : eligible ? (
              <Badge tone="brand">Eligible</Badge>
            ) : (
              <Badge tone="neutral">
                <XCircle className="size-3.5" /> Not eligible
              </Badge>
            )}
          </div>

          <p className="mt-3 text-sm text-foreground">{sub.description}</p>
          <p className="mt-2 text-sm font-semibold text-primary">{sub.benefitLabel}</p>

          {eligible && sub.status === "eligible" && (
            <button
              onClick={() => claimSubsidy(sub.id)}
              className="mt-3 w-full rounded-2xl bg-brand-gradient py-2.5 text-sm font-semibold text-primary-foreground transition active:scale-[0.99]"
            >
              Mark as applied
            </button>
          )}
        </Card>
      ))}
    </div>
  )
}
