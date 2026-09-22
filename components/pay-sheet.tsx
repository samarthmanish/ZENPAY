"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, CheckCircle2, ScanLine } from "lucide-react"
import { useStore } from "@/lib/store"
import { BottomSheet } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { QrScanner, type UpiTarget } from "@/components/qr-scanner"
import { CATEGORIES } from "@/lib/seed"
import { dailyLimitStatus } from "@/lib/compute"
import { inr } from "@/lib/format"
import type { Category } from "@/lib/types"

export type PayMode = "send" | "scan" | "recharge" | null

const MODE_LABELS: Record<Exclude<PayMode, null>, { title: string; merchant: string; category: Category }> = {
  send: { title: "Send Money", merchant: "", category: "Others" },
  scan: { title: "Scan & Pay", merchant: "Merchant QR", category: "Shopping" },
  recharge: { title: "Mobile Recharge", merchant: "Prepaid Recharge", category: "Bills" },
}

export function PaySheet({ mode, onClose }: { mode: PayMode; onClose: () => void }) {
  const { state, addTransaction } = useStore()
  const preset = mode ? MODE_LABELS[mode] : null
  const [merchant, setMerchant] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState<Category>(preset?.category ?? "Others")
  const [vpa, setVpa] = useState<string | null>(null)
  // For scan mode we begin on the camera step until a QR is captured.
  const [scanning, setScanning] = useState(mode === "scan")

  useEffect(() => {
    // Reset the flow whenever a new mode opens.
    setMerchant("")
    setAmount("")
    setVpa(null)
    setCategory(MODE_LABELS[mode ?? "send"]?.category ?? "Others")
    setScanning(mode === "scan")
  }, [mode])

  const status = dailyLimitStatus(state)
  const numeric = Number(amount) || 0
  const willExceed = status.spent + numeric > status.limit
  const valid = numeric > 0 && Boolean(merchant.trim() || preset?.merchant)

  function handleDetected(target: UpiTarget) {
    setMerchant(target.name || target.vpa || preset?.merchant || "")
    if (target.vpa) setVpa(target.vpa)
    if (target.amount && target.amount > 0) setAmount(String(target.amount))
    setScanning(false)
  }

  function submit() {
    if (!valid || !mode) return
    addTransaction({
      merchant: merchant.trim() || preset!.merchant,
      category,
      amount: numeric,
      direction: "out",
      status: "Success",
      vpa: vpa ?? (mode === "recharge" ? "recharge@zenpay" : "upi@zenpay"),
    })
    onClose()
  }

  const fieldClass =
    "w-full rounded-2xl border border-border bg-background px-4 py-3 text-[15px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"

  return (
    <BottomSheet open={mode !== null} onClose={onClose} title={preset?.title}>
      {scanning ? (
        <div className="flex flex-col gap-3">
          <QrScanner onDetected={handleDetected} />
          <Button
            variant="secondary"
            onClick={() => setScanning(false)}
            className="h-11 w-full rounded-2xl"
          >
            Enter details manually
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {mode === "scan" && vpa && (
            <div className="flex items-start gap-2 rounded-2xl bg-success/15 p-3 text-success">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
              <p className="text-sm font-medium">
                QR scanned — paying {merchant || "merchant"} ({vpa}).
              </p>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
              {mode === "recharge" ? "Mobile number / operator" : "Pay to"}
            </label>
            <input
              className={fieldClass}
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder={mode === "send" ? "Name or UPI ID" : preset?.merchant}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Amount (₹)</label>
            <input
              type="number"
              inputMode="numeric"
              className={fieldClass}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Category</label>
            <select
              className={fieldClass}
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {numeric > 0 && willExceed && (
            <div className="flex items-start gap-2 rounded-2xl bg-warning/15 p-3 text-warning">
              <AlertTriangle className="mt-0.5 size-5 shrink-0" />
              <p className="text-sm font-medium">
                This pushes today&apos;s spending to {inr(status.spent + numeric)}, over your {inr(status.limit)} daily
                limit.
              </p>
            </div>
          )}

          {mode === "scan" && (
            <button
              onClick={() => {
                setVpa(null)
                setScanning(true)
              }}
              className="flex items-center justify-center gap-1.5 text-sm font-medium text-primary"
            >
              <ScanLine className="size-4" />
              Scan a different QR
            </button>
          )}

          <Button
            onClick={submit}
            disabled={!valid}
            className="mt-1 h-12 w-full rounded-2xl bg-brand-gradient text-base font-semibold text-primary-foreground"
          >
            {numeric > 0 ? `Pay ${inr(numeric)}` : "Pay"}
          </Button>
        </div>
      )}
    </BottomSheet>
  )
}
