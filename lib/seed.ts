import type { AppState, Category } from "./types"
import { dayOffset } from "./format"

export const CATEGORIES: Category[] = [
  "Food",
  "Travel",
  "Bills",
  "Shopping",
  "Entertainment",
  "Others",
]

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: "var(--chart-1)",
  Travel: "var(--chart-2)",
  Bills: "var(--chart-3)",
  Shopping: "var(--chart-4)",
  Entertainment: "var(--chart-5)",
  Others: "var(--muted-foreground)",
}

export function createInitialState(): AppState {
  return {
    onboarded: false,
    profile: {
      name: "",
      age: 24,
      salaryDay: 1,
      salary: 45000,
      dailyLimit: 1500,
      dream: "",
      target: 40000,
      pinEnabled: false,
    },
    goalSaved: 0,
    transactions: [
      // Today's spending (used for the daily-limit warning)
      { id: "t-today-1", merchant: "Swiggy", category: "Food", amount: 420, direction: "out", date: dayOffset(0), status: "Success", vpa: "swiggy@ybl" },
      { id: "t-today-2", merchant: "Auto Rickshaw", category: "Travel", amount: 180, direction: "out", date: dayOffset(0), status: "Success", vpa: "namma@upi" },
      { id: "t-today-3", merchant: "Blinkit", category: "Food", amount: 640, direction: "out", date: dayOffset(0), status: "Success", vpa: "blinkit@axl" },
      // Earlier this month
      { id: "t-1", merchant: "Uber", category: "Travel", amount: 280, direction: "out", date: dayOffset(-1), status: "Success", vpa: "uber@icici" },
      { id: "t-2", merchant: "BESCOM Electricity", category: "Bills", amount: 1240, direction: "out", date: dayOffset(-3), status: "Success", vpa: "bescom@sbi" },
      { id: "t-3", merchant: "Myntra", category: "Shopping", amount: 1899, direction: "out", date: dayOffset(-4), status: "Pending", vpa: "myntra@hdfc" },
      { id: "t-4", merchant: "BookMyShow", category: "Entertainment", amount: 640, direction: "out", date: dayOffset(-5), status: "Success", vpa: "bms@ptys" },
      { id: "t-5", merchant: "Amazon", category: "Shopping", amount: 2499, direction: "out", date: dayOffset(-6), status: "Success", vpa: "amazon@apl" },
      // A legit refund
      { id: "t-6", merchant: "Amazon", category: "Shopping", amount: 2499, direction: "in", date: dayOffset(-5), status: "Refund", vpa: "amazon@apl", refundOf: "t-5" },
      // A suspicious refund pattern: refund from an unknown handle, no matching purchase
      { id: "t-7", merchant: "QuickCashback", category: "Others", amount: 3200, direction: "in", date: dayOffset(-2), status: "Refund", vpa: "kyc-refund@okaxis" },
      { id: "t-8", merchant: "QuickCashback", category: "Others", amount: 3200, direction: "out", date: dayOffset(-2), status: "Success", vpa: "kyc-refund@okaxis" },
    ],
    bills: [
      { id: "b-1", name: "Electricity Bill", amount: 1340, dueDate: dayOffset(4), category: "Bills", paid: false, recurring: true },
      { id: "b-2", name: "Broadband", amount: 999, dueDate: dayOffset(9), category: "Bills", paid: false, recurring: true },
      { id: "b-3", name: "Netflix", amount: 499, dueDate: dayOffset(14), category: "Entertainment", paid: false, recurring: true },
      { id: "b-4", name: "Bike EMI", amount: 3200, dueDate: dayOffset(20), category: "Bills", paid: false, recurring: true },
    ],
    categoryLimits: {
      Food: 11250,
      Travel: 3375,
      Bills: 7875,
      Shopping: 6750,
      Entertainment: 4050,
      Others: 2700,
    },
    chitFunds: [
      {
        id: "c-1",
        name: "Gold Savings Chit",
        organizer: "Sri Lakshmi Chits (Regd.)",
        monthlyContribution: 2000,
        totalMonths: 20,
        monthsPaid: 6,
        members: 20,
        registered: true,
        hasReceipts: true,
        promisedReturnPct: 8,
        organizerResponsive: true,
        payoutOverdue: false,
      },
      {
        id: "c-2",
        name: "Double-Money Turbo Chit",
        organizer: "Ramesh (neighbour)",
        monthlyContribution: 5000,
        totalMonths: 12,
        monthsPaid: 4,
        members: 8,
        registered: false,
        hasReceipts: false,
        promisedReturnPct: 45,
        organizerResponsive: false,
        payoutOverdue: true,
      },
    ],
    subsidies: [
      {
        id: "s-1",
        name: "PM Shram Yogi Maandhan",
        agency: "Ministry of Labour",
        benefit: 3000,
        benefitLabel: "₹3,000 / month pension after 60",
        description: "Guaranteed pension for unorganised workers earning up to ₹15,000/month.",
        maxMonthlySalary: 15000,
        minAge: 18,
        maxAge: 40,
        status: "eligible",
      },
      {
        id: "s-2",
        name: "Atal Pension Yojana",
        agency: "PFRDA",
        benefit: 5000,
        benefitLabel: "Up to ₹5,000 / month pension",
        description: "Government co-contribution pension scheme for citizens aged 18–40.",
        minAge: 18,
        maxAge: 40,
        status: "eligible",
      },
      {
        id: "s-3",
        name: "PMAY Home Loan Subsidy",
        agency: "Ministry of Housing",
        benefit: 267000,
        benefitLabel: "Up to ₹2.67L interest subsidy",
        description: "Interest subsidy on home loans for first-time buyers (income up to ₹18L/yr).",
        maxMonthlySalary: 150000,
        minAge: 21,
        status: "eligible",
      },
      {
        id: "s-4",
        name: "NPS Tax Benefit (80CCD 1B)",
        agency: "Income Tax Dept.",
        benefit: 15600,
        benefitLabel: "Up to ₹15,600 saved in tax",
        description: "Extra ₹50,000 deduction for National Pension System contributions.",
        minAge: 18,
        status: "eligible",
      },
    ],
    reviewedRefunds: [],
    rewardPoints: 1240,
    offers: [
      {
        id: "o-1",
        title: "5% back on groceries",
        detail: "Blinkit, Zepto & BigBasket",
        cashback: "Up to ₹75",
      },
      {
        id: "o-2",
        title: "₹50 back on mobile recharge",
        detail: "Recharge ₹199 or more",
        cashback: "Flat ₹50",
      },
      {
        id: "o-3",
        title: "10% back on first bill pay",
        detail: "Electricity & broadband",
        cashback: "Up to ₹100",
      },
    ],
    kyc: {
      aadhaar: { status: "unverified", number: "" },
      pan: { status: "unverified", number: "" },
    },
  }
}
