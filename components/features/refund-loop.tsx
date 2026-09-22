"use client"

import { AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react"
import { useStore } from "@/lib/store"
import { Card, Badge } from "@/components/ui/primitives"
import { detectRefundFraud } from "@/lib/compute"
import { inr, shortDate } from "@/lib/format"

export function RefundLoopFeature() {
  const { state, markRefundReviewed } = useStore()
  const flags = detectRefundFraud(state.transactions)
  const open = flags.filter((f) => !state.reviewedRefunds.includes(f.txn.id))

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        A scammer &quot;accidentally&quot; sends you money, then begs you to refund it — but
        the original credit was fake or stolen, so you lose your own cash. ZENPAY watches
        your transactions for this <strong>fraudulent refund loop</strong>.
      </p>

      {open.length === 0 ? (
        <Card className="items-center text-center">
          <ShieldCheck className="mx-auto size-10 text-success" />
          <p className="mt-2 font-semibold text-foreground">No active refund threats</p>
          <p className="mt-1 text-sm text-muted-foreground">
            We&apos;ll alert you the moment a suspicious refund pattern appears.
          </p>
        </Card>
      ) : (
        <Card className="border-destructive/40 bg-destructive/5">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" />
            <p className="font-semibold">
              {open.length} suspicious refund{open.length === 1 ? "" : "s"} detected
            </p>
          </div>
        </Card>
      )}

      {flags.map((flag) => {
        const reviewed = state.reviewedRefunds.includes(flag.txn.id)
        return (
          <Card key={flag.txn.id} className={reviewed ? "opacity-60" : ""}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <RefreshCw className="size-4" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">{flag.txn.merchant}</p>
                  <p className="text-xs text-muted-foreground">
                    {flag.txn.vpa} · {shortDate(flag.txn.date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-bold ${
                    flag.txn.direction === "in" ? "text-success" : "text-foreground"
                  }`}
                >
                  {flag.txn.direction === "in" ? "+" : "−"}
                  {inr(flag.txn.amount)}
                </p>
                <Badge tone={flag.severity === "high" ? "danger" : "warning"}>
                  {flag.severity === "high" ? "High" : "Medium"}
                </Badge>
              </div>
            </div>

            <p className="mt-3 text-sm text-foreground">{flag.reason}</p>

            {!reviewed && (
              <button
                onClick={() => markRefundReviewed(flag.txn.id)}
                className="mt-3 w-full rounded-2xl bg-secondary py-2.5 text-sm font-semibold text-foreground transition active:scale-[0.99]"
              >
                I&apos;ve reviewed this
              </button>
            )}
          </Card>
        )
      })}

      <Card className="bg-accent/60">
        <p className="text-sm font-medium text-foreground">Golden rule</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Never send back money you didn&apos;t request. Ask the sender to raise a proper
          reversal through their own bank instead.
        </p>
      </Card>
    </div>
  )
}
