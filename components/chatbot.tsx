"use client"

import { useEffect, useRef, useState } from "react"
import { Bot, Send, Sparkles, X } from "lucide-react"
import { useStore } from "@/lib/store"
import {
  cashFlowForecast,
  creditScore,
  dailyLimitStatus,
  daysUntilSalary,
  detectRefundFraud,
  spendByCategory,
  spentThisMonth,
  spentToday,
} from "@/lib/compute"
import { inr } from "@/lib/format"
import type { AppState } from "@/lib/types"

interface Message {
  role: "user" | "bot"
  text: string
}

const SUGGESTIONS = [
  "How much did I spend today?",
  "Am I within budget?",
  "What's my credit score?",
  "Any fraud alerts?",
  "When is my salary?",
]

function answer(question: string, state: AppState): string {
  const q = question.toLowerCase()

  const today = spentToday(state.transactions)
  const month = spentThisMonth(state.transactions)
  const daily = dailyLimitStatus(state)

  if (/(spend|spent|spending).*(today)|today.*(spend|spent)/.test(q)) {
    return `You've spent ${inr(today)} today. Your daily limit is ${inr(
      daily.limit,
    )}, so you have ${inr(Math.max(daily.remaining, 0))} left${
      daily.over ? " — you're over your limit." : "."
    }`
  }

  if (/(spend|spent).*(month|this month)|month.*(spend|spent)/.test(q)) {
    return `This month you've spent ${inr(month)} out of a salary of ${inr(
      state.profile.salary,
    )}.`
  }

  if (/budget|limit|within|over/.test(q)) {
    const cat = spendByCategory(state.transactions)
    const top = (Object.entries(cat) as [string, number][])
      .sort((a, b) => b[1] - a[1])
      .filter(([, v]) => v > 0)
      .slice(0, 3)
      .map(([k, v]) => `${k} ${inr(v)}`)
      .join(", ")
    return `${
      daily.over
        ? `You're over today's limit by ${inr(daily.spent - daily.limit)}.`
        : `You're within today's limit (${inr(daily.spent)} of ${inr(daily.limit)}).`
    }${top ? ` Top categories this month: ${top}.` : ""}`
  }

  if (/credit|score/.test(q)) {
    const c = creditScore(state)
    return `Your ZenPay credit score is ${c.score} (${c.band}). Biggest lever: ${
      c.factors.slice().sort((a, b) => b.max - b.points - (a.max - a.points))[0].label
    }.`
  }

  if (/fraud|scam|alert|suspicious|refund/.test(q)) {
    const flags = detectRefundFraud(state.transactions).filter(
      (f) => !state.reviewedRefunds.includes(f.txn.id),
    )
    if (flags.length === 0) return "Good news — no active fraud alerts right now."
    return `Heads up: ${flags.length} suspicious refund ${
      flags.length === 1 ? "activity" : "activities"
    } detected. ${flags[0].reason} Check the Protect tab.`
  }

  if (/salary|paid|payday|income/.test(q)) {
    const d = daysUntilSalary(state.profile.salaryDay)
    return `Your salary of ${inr(state.profile.salary)} arrives in ${d} day${
      d === 1 ? "" : "s"
    } (day ${state.profile.salaryDay} of the month).`
  }

  if (/goal|save|saving|dream/.test(q)) {
    const pct = state.profile.target
      ? Math.round((state.goalSaved / state.profile.target) * 100)
      : 0
    return `You've saved ${inr(state.goalSaved)} toward ${
      state.profile.dream || "your goal"
    } (${pct}% of ${inr(state.profile.target)}).`
  }

  if (/bill|due|pending/.test(q)) {
    const pending = state.bills.filter((b) => !b.paid)
    if (pending.length === 0) return "All your bills are paid. Nicely done."
    const total = pending.reduce((s, b) => s + b.amount, 0)
    return `You have ${pending.length} pending bill${
      pending.length === 1 ? "" : "s"
    } totalling ${inr(total)}. Next up: ${pending[0].name} (${inr(pending[0].amount)}).`
  }

  if (/forecast|cash ?flow|run out|blind/.test(q)) {
    const f = cashFlowForecast(state)
    if (f.blindSpotDay) {
      return `Careful — at your current burn of ${inr(
        f.dailyBurn,
      )}/day, your balance could dip below zero in about ${f.blindSpotDay.day} days. Consider slowing spend.`
    }
    return `You're on track. Lowest projected balance before salary is ${inr(
      f.lowestBalance,
    )}.`
  }

  if (/scan|pay|qr/.test(q)) {
    return "Tap Scan & Pay on the Home tab to open the camera scanner. If the camera isn't available, you can enter payment details manually."
  }

  if (/(hi|hello|hey|help)\b/.test(q)) {
    return `Hi ${
      state.profile.name || "there"
    }! I'm your ZenPay assistant. Ask me about your spending, budget, bills, goal, credit score, or fraud alerts.`
  }

  return "I can help with your spending, budget, bills, savings goal, credit score, salary timing, and fraud alerts. Try one of the suggestions below."
}

export function Chatbot() {
  const { state } = useStore()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hi! I'm your ZenPay assistant. Ask me about your money and I'll answer using your live data.",
    },
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, open])

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    setMessages((m) => [...m, { role: "user", text: trimmed }, { role: "bot", text: answer(trimmed, state) }])
    setInput("")
  }

  return (
    <>
      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-4 z-40 flex h-[28rem] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl lg:bottom-24 lg:right-6">
          <header className="flex items-center gap-3 border-b border-border bg-brand-gradient px-4 py-3 text-primary-foreground">
            <span className="flex size-9 items-center justify-center rounded-2xl bg-white/20">
              <Sparkles className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">ZenPay Assistant</p>
              <p className="text-xs text-primary-foreground/80">Answers from your live data</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto flex size-8 items-center justify-center rounded-full text-primary-foreground/90 transition hover:bg-white/20"
              aria-label="Close assistant"
            >
              <X className="size-5" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-secondary text-foreground"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your money…"
              className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary"
              aria-label="Message"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground transition disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        aria-expanded={open}
        className="fixed bottom-24 right-4 z-40 flex size-14 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground shadow-xl transition hover:scale-105 active:scale-95 lg:bottom-6 lg:right-6"
      >
        {open ? <X className="size-6" /> : <Bot className="size-6" />}
      </button>
    </>
  )
}
