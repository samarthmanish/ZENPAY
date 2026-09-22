"use client"

import { CheckCircle2 } from "lucide-react"
import { useStore } from "@/lib/store"
import { Card, Badge } from "@/components/ui/primitives"
import { inr, shortDate } from "@/lib/format"

export function BillsScreen() {
  const { state, payBill } = useStore()
  const { bills } = state

  const pending = bills.filter((b) => !b.paid)
  const paid = bills.filter((b) => b.paid)
  const totalDue = pending.reduce((s, b) => s + b.amount, 0)

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-10">
      <h1 className="text-2xl font-bold text-foreground">Bills</h1>

      <Card className="bg-brand-gradient text-primary-foreground">
        <p className="text-sm opacity-85">Total due this cycle</p>
        <p className="mt-1 text-3xl font-bold">{inr(totalDue)}</p>
        <p className="mt-1 text-sm opacity-85">
          {pending.length} bill{pending.length === 1 ? "" : "s"} pending
        </p>
      </Card>

      <Card>
        <p className="mb-3 font-semibold text-foreground">Pending</p>
        {pending.length === 0 ? (
          <p className="py-3 text-sm text-muted-foreground">
            You&apos;re all caught up. No pending bills.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {pending.map((b) => (
              <li key={b.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{b.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.category} · Due {shortDate(b.dueDate)}
                  </p>
                </div>
                <button
                  onClick={() => payBill(b.id)}
                  className="rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-primary-foreground transition active:scale-95"
                >
                  Pay {inr(b.amount)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {paid.length > 0 && (
        <Card>
          <p className="mb-3 font-semibold text-foreground">Paid</p>
          <ul className="divide-y divide-border">
            {paid.map((b) => (
              <li key={b.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{b.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.category} · {shortDate(b.dueDate)}
                  </p>
                </div>
                <Badge tone="success">
                  <CheckCircle2 className="size-3.5" /> Paid {inr(b.amount)}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
