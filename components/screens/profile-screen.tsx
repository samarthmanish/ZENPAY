"use client"

import { useState } from "react"
import {
  BadgeCheck,
  CreditCard,
  Fingerprint,
  Loader2,
  Lock,
  LogOut,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react"
import { useStore } from "@/lib/store"
import { Card, Badge } from "@/components/ui/primitives"
import { creditScore } from "@/lib/compute"
import { inr } from "@/lib/format"
import type { KycDoc } from "@/lib/types"

export function ProfileScreen() {
  const { state, updateProfile, verifyDocument, resetApp } = useStore()
  const { profile, kyc } = state
  const score = creditScore(state)

  const fieldClass =
    "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-10">
      <h1 className="text-2xl font-bold text-foreground">Profile</h1>

      <Card>
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-gradient text-primary-foreground">
            <UserIcon className="size-7" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">{profile.name}</p>
            <p className="text-sm text-muted-foreground">
              Age {profile.age} · ZENPAY score {score.score}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <p className="mb-3 font-semibold text-foreground">Account details</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Name</span>
            <input
              className={fieldClass}
              value={profile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Age</span>
            <input
              type="number"
              inputMode="numeric"
              className={fieldClass}
              value={profile.age}
              onChange={(e) => updateProfile({ age: Number(e.target.value) || 0 })}
            />
          </label>
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
            <span className="mb-1 block text-muted-foreground">Daily limit (₹)</span>
            <input
              type="number"
              inputMode="numeric"
              className={fieldClass}
              value={profile.dailyLimit}
              onChange={(e) => updateProfile({ dailyLimit: Number(e.target.value) || 0 })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Salary credit day</span>
            <select
              className={fieldClass}
              value={profile.salaryDay}
              onChange={(e) => updateProfile({ salaryDay: Number(e.target.value) })}
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Goal target (₹)</span>
            <input
              type="number"
              inputMode="numeric"
              className={fieldClass}
              value={profile.target}
              onChange={(e) => updateProfile({ target: Number(e.target.value) || 0 })}
            />
          </label>
        </div>
        <label className="mt-3 block text-sm">
          <span className="mb-1 block text-muted-foreground">Dream / goal</span>
          <input
            className={fieldClass}
            value={profile.dream}
            onChange={(e) => updateProfile({ dream: e.target.value })}
          />
        </label>
      </Card>

      <Card>
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <p className="font-semibold text-foreground">Document verification (KYC)</p>
          </div>
          {kyc.aadhaar.status === "verified" && kyc.pan.status === "verified" && (
            <Badge tone="success">
              <BadgeCheck className="size-3" />
              Verified
            </Badge>
          )}
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          Verify your Aadhaar and PAN to unlock higher payment limits and instant credit.
        </p>
        <div className="space-y-3">
          <DocRow
            icon={<Fingerprint className="size-5" />}
            label="Aadhaar Card"
            placeholder="1234 5678 9012"
            inputMode="numeric"
            maxLength={14}
            format={formatAadhaar}
            doc={kyc.aadhaar}
            onVerify={(v) => verifyDocument("aadhaar", v)}
          />
          <DocRow
            icon={<CreditCard className="size-5" />}
            label="PAN Card"
            placeholder="ABCDE1234F"
            maxLength={10}
            format={(v) => v.toUpperCase().replace(/[^A-Z0-9]/g, "")}
            doc={kyc.pan}
            onVerify={(v) => verifyDocument("pan", v)}
          />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="size-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">App lock (4-digit PIN)</p>
              <p className="text-xs text-muted-foreground">Demo toggle — on device</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={profile.pinEnabled}
            onClick={() => updateProfile({ pinEnabled: !profile.pinEnabled })}
            className={`relative h-7 w-12 rounded-full transition ${
              profile.pinEnabled ? "bg-primary" : "bg-secondary"
            }`}
          >
            <span
              className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition-all ${
                profile.pinEnabled ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </Card>

      <Card className="flex items-center gap-3">
        <ShieldCheck className="size-5 text-success" />
        <p className="text-sm text-muted-foreground">
          Everything stays on this device. No sign-in, no cloud.
        </p>
      </Card>

      <button
        onClick={() => {
          if (confirm("Reset ZENPAY and clear all on-device data?")) resetApp()
        }}
        className="flex items-center justify-center gap-2 rounded-2xl border border-destructive/30 py-3 text-sm font-semibold text-destructive transition active:scale-[0.99]"
      >
        <LogOut className="size-4" /> Reset app data
      </button>

      <p className="pb-2 text-center text-xs text-muted-foreground">
        ZENPAY · Pay smart. Save smarter.
      </p>
    </div>
  )
}

function formatAadhaar(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 12)
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim()
}

function DocRow({
  icon,
  label,
  placeholder,
  doc,
  onVerify,
  format,
  maxLength,
  inputMode,
}: {
  icon: React.ReactNode
  label: string
  placeholder: string
  doc: KycDoc
  onVerify: (value: string) => void
  format: (value: string) => string
  maxLength: number
  inputMode?: "numeric" | "text"
}) {
  const [value, setValue] = useState(doc.number)
  const verified = doc.status === "verified"
  const pending = doc.status === "pending"
  const canSubmit = value.replace(/\s/g, "").length >= (inputMode === "numeric" ? 12 : 10)

  return (
    <div className="rounded-2xl border border-border p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className={`flex size-9 items-center justify-center rounded-xl ${
              verified ? "bg-success/10 text-success" : "bg-accent text-primary"
            }`}
          >
            {icon}
          </span>
          <p className="text-sm font-medium text-foreground">{label}</p>
        </div>
        {verified ? (
          <Badge tone="success">
            <BadgeCheck className="size-3" />
            Verified
          </Badge>
        ) : pending ? (
          <Badge tone="warning">
            <Loader2 className="size-3 animate-spin" />
            Verifying
          </Badge>
        ) : (
          <Badge tone="neutral">Not verified</Badge>
        )}
      </div>

      {verified ? (
        <p className="mt-2.5 pl-11 font-mono text-sm tracking-wider text-muted-foreground">
          {doc.number}
        </p>
      ) : (
        <div className="mt-2.5 flex gap-2">
          <input
            className="w-full rounded-xl border border-border bg-background px-3 py-2 font-mono text-sm tracking-wider outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 disabled:opacity-60"
            placeholder={placeholder}
            value={value}
            inputMode={inputMode}
            maxLength={maxLength}
            disabled={pending}
            onChange={(e) => setValue(format(e.target.value))}
          />
          <button
            type="button"
            disabled={!canSubmit || pending}
            onClick={() => onVerify(value)}
            className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition active:scale-95 disabled:opacity-40"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : "Verify"}
          </button>
        </div>
      )}
    </div>
  )
}
