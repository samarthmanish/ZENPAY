import type { AppState, Category, ChitFund, Subsidy, Transaction } from "./types"
import { isThisMonth, isToday } from "./format"
import { CATEGORIES } from "./seed"

export function spentToday(txns: Transaction[]): number {
  return txns
    .filter((t) => t.direction === "out" && isToday(t.date))
    .reduce((sum, t) => sum + t.amount, 0)
}

export function spentThisMonth(txns: Transaction[]): number {
  return txns
    .filter((t) => t.direction === "out" && isThisMonth(t.date))
    .reduce((sum, t) => sum + t.amount, 0)
}

export function spendByCategory(txns: Transaction[]): Record<Category, number> {
  const base = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<
    Category,
    number
  >
  for (const t of txns) {
    if (t.direction === "out" && isThisMonth(t.date)) base[t.category] += t.amount
  }
  return base
}

export function daysUntilSalary(salaryDay: number): number {
  const now = new Date()
  const today = now.getDate()
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate()
  if (salaryDay > today) return salaryDay - today
  if (salaryDay === today) return 0
  return daysInMonth - today + salaryDay
}

export interface DailyLimitStatus {
  spent: number
  limit: number
  remaining: number
  ratio: number
  over: boolean
  near: boolean
}

export function dailyLimitStatus(state: AppState): DailyLimitStatus {
  const spent = spentToday(state.transactions)
  const limit = state.profile.dailyLimit
  const ratio = limit > 0 ? spent / limit : 0
  return {
    spent,
    limit,
    remaining: limit - spent,
    ratio,
    over: limit > 0 && spent > limit,
    near: limit > 0 && spent <= limit && ratio >= 0.8,
  }
}

/* ---------- Rewards & Cashback ---------- */

export interface RewardSummary {
  points: number
  /** Cashback earned this month (1% of spend, capped) */
  cashbackThisMonth: number
  tier: "Silver" | "Gold" | "Platinum"
  /** Points needed to reach the next tier, 0 if maxed */
  toNextTier: number
  nextTier: "Gold" | "Platinum" | null
}

const TIER_THRESHOLDS = { Gold: 1000, Platinum: 2500 }

export function rewardSummary(state: AppState): RewardSummary {
  const points = state.rewardPoints
  const spend = spentThisMonth(state.transactions)
  const cashbackThisMonth = Math.min(Math.round(spend * 0.01), 500)

  let tier: RewardSummary["tier"] = "Silver"
  let nextTier: RewardSummary["nextTier"] = "Gold"
  let toNextTier = TIER_THRESHOLDS.Gold - points

  if (points >= TIER_THRESHOLDS.Platinum) {
    tier = "Platinum"
    nextTier = null
    toNextTier = 0
  } else if (points >= TIER_THRESHOLDS.Gold) {
    tier = "Gold"
    nextTier = "Platinum"
    toNextTier = TIER_THRESHOLDS.Platinum - points
  }

  return { points, cashbackThisMonth, tier, toNextTier, nextTier }
}

/* ---------- Credit Score for the Invisible ---------- */

export interface CreditFactor {
  label: string
  points: number
  max: number
  detail: string
}

export interface CreditScore {
  score: number
  band: "Building" | "Fair" | "Good" | "Excellent"
  factors: CreditFactor[]
}

export function creditScore(state: AppState): CreditScore {
  const { bills, goalSaved, profile, transactions } = state
  const factors: CreditFactor[] = []

  // On-time bills
  const paidBills = bills.filter((b) => b.paid).length
  const billScore = bills.length
    ? Math.round((paidBills / bills.length) * 180)
    : 90
  factors.push({
    label: "On-time bill payments",
    points: billScore,
    max: 180,
    detail: `${paidBills} of ${bills.length} upcoming bills cleared`,
  })

  // Savings consistency toward goal
  const goalRatio = profile.target > 0 ? goalSaved / profile.target : 0
  const savingsScore = Math.round(Math.min(goalRatio, 1) * 150)
  factors.push({
    label: "Savings discipline",
    points: savingsScore,
    max: 150,
    detail: `${Math.round(goalRatio * 100)}% of your goal funded`,
  })

  // Spending within salary
  const spent = spentThisMonth(transactions)
  const withinRatio = profile.salary > 0 ? spent / profile.salary : 1
  const spendScore = Math.round(Math.max(0, 1 - withinRatio) * 120)
  factors.push({
    label: "Spending under control",
    points: spendScore,
    max: 120,
    detail: `${Math.round(withinRatio * 100)}% of salary spent this month`,
  })

  // Digital activity footprint
  const activity = Math.min(transactions.length, 20)
  const activityScore = Math.round((activity / 20) * 90)
  factors.push({
    label: "Payment activity footprint",
    points: activityScore,
    max: 90,
    detail: `${transactions.length} digital transactions on record`,
  })

  const base = 300
  const score = Math.min(
    900,
    base + factors.reduce((sum, f) => sum + f.points, 0),
  )
  const band: CreditScore["band"] =
    score >= 750
      ? "Excellent"
      : score >= 650
        ? "Good"
        : score >= 550
          ? "Fair"
          : "Building"

  return { score, band, factors }
}

/* ---------- Chit Fund risk ---------- */

export interface ChitRisk {
  score: number
  level: "Low" | "Medium" | "High"
  reasons: string[]
  invested: number
}

export function chitRisk(fund: ChitFund): ChitRisk {
  let score = 0
  const reasons: string[] = []
  if (!fund.registered) {
    score += 35
    reasons.push("Organizer is not a registered chit company")
  }
  if (!fund.hasReceipts) {
    score += 20
    reasons.push("No official receipts for your contributions")
  }
  if (fund.promisedReturnPct > 20) {
    score += 25
    reasons.push(`Unrealistic ${fund.promisedReturnPct}% promised return`)
  }
  if (!fund.organizerResponsive) {
    score += 10
    reasons.push("Organizer has stopped responding")
  }
  if (fund.payoutOverdue) {
    score += 15
    reasons.push("A scheduled payout is overdue")
  }
  const level: ChitRisk["level"] =
    score >= 60 ? "High" : score >= 30 ? "Medium" : "Low"
  return {
    score: Math.min(score, 100),
    level,
    reasons,
    invested: fund.monthlyContribution * fund.monthsPaid,
  }
}

/* ---------- Subsidy eligibility ---------- */

export function subsidyEligible(sub: Subsidy, profile: AppState["profile"]): boolean {
  if (sub.minAge !== undefined && profile.age < sub.minAge) return false
  if (sub.maxAge !== undefined && profile.age > sub.maxAge) return false
  if (sub.maxMonthlySalary !== undefined && profile.salary > sub.maxMonthlySalary)
    return false
  return true
}

/* ---------- Fraudulent Refund Loop detection ---------- */

export interface RefundFlag {
  txn: Transaction
  severity: "high" | "medium" | "low"
  reason: string
}

const TRUSTED_HANDLES = ["@apl", "@ybl", "@icici", "@hdfc", "@sbi", "@axl", "@ptys"]

export function detectRefundFraud(txns: Transaction[]): RefundFlag[] {
  const flags: RefundFlag[] = []
  const refunds = txns.filter((t) => t.status === "Refund" || t.refundOf)

  for (const r of refunds) {
    // A refund that has a matching original purchase is legit.
    const hasOriginal = r.refundOf
      ? txns.some((t) => t.id === r.refundOf)
      : txns.some(
          (t) =>
            t.direction === "out" &&
            t.merchant === r.merchant &&
            Math.abs(t.amount - r.amount) < 1,
        )

    const untrusted = !TRUSTED_HANDLES.some((h) => r.vpa?.endsWith(h))
    const looksLikeKyc = /kyc|refund|cashback|verify|reward/i.test(
      `${r.merchant} ${r.vpa ?? ""}`,
    )

    if (!hasOriginal && untrusted) {
      flags.push({
        txn: r,
        severity: "high",
        reason:
          "Money credited with no matching purchase, from an unverified UPI handle. Classic refund-scam loop.",
      })
    } else if (looksLikeKyc && untrusted) {
      flags.push({
        txn: r,
        severity: "medium",
        reason: "‘KYC/refund’ handle — scammers often ask you to send it back.",
      })
    }
  }

  // Detect send-money that immediately follows a suspicious refund (the "loop")
  for (const flag of [...flags]) {
    const followUp = txns.find(
      (t) =>
        t.direction === "out" &&
        t.vpa === flag.txn.vpa &&
        Math.abs(t.amount - flag.txn.amount) < 1,
    )
    if (followUp && !flags.some((f) => f.txn.id === followUp.id)) {
      flags.push({
        txn: followUp,
        severity: "high",
        reason:
          "You sent this amount back to the same handle — the refund loop completed. Report immediately.",
      })
    }
  }

  return flags
}

/* ---------- Cash Flow Blind Spot forecast ---------- */

export interface CashFlowDay {
  day: number
  date: string
  balance: number
  event?: string
  negative: boolean
}

export interface CashFlowForecast {
  days: CashFlowDay[]
  lowestBalance: number
  blindSpotDay: CashFlowDay | null
  dailyBurn: number
  startingBalance: number
}

export function cashFlowForecast(state: AppState): CashFlowForecast {
  const { profile, transactions, bills } = state
  const spent = spentThisMonth(transactions)
  const startingBalance = profile.salary - spent
  const horizon = Math.max(daysUntilSalary(profile.salaryDay), 1)

  // Average daily discretionary burn based on this month's spend
  const now = new Date()
  const dayOfMonth = now.getDate()
  const dailyBurn = Math.round(spent / Math.max(dayOfMonth, 1))

  const days: CashFlowDay[] = []
  let balance = startingBalance
  let lowestBalance = startingBalance
  let blindSpotDay: CashFlowDay | null = null

  for (let i = 1; i <= horizon; i++) {
    balance -= dailyBurn
    const date = new Date()
    date.setDate(now.getDate() + i)
    const dueBills = bills.filter(
      (b) => !b.paid && new Date(b.dueDate).toDateString() === date.toDateString(),
    )
    let event: string | undefined
    for (const b of dueBills) {
      balance -= b.amount
      event = event ? `${event}, ${b.name}` : b.name
    }
    const dayEntry: CashFlowDay = {
      day: i,
      date: date.toISOString(),
      balance: Math.round(balance),
      event,
      negative: balance < 0,
    }
    days.push(dayEntry)
    if (balance < lowestBalance) lowestBalance = balance
    if (balance < 0 && !blindSpotDay) blindSpotDay = dayEntry
  }

  return {
    days,
    lowestBalance: Math.round(lowestBalance),
    blindSpotDay,
    dailyBurn,
    startingBalance: Math.round(startingBalance),
  }
}
