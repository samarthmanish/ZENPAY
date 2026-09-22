export type Category =
  | "Food"
  | "Travel"
  | "Bills"
  | "Shopping"
  | "Entertainment"
  | "Others"

export type TxnStatus = "Success" | "Pending" | "Failed" | "Refund"

export interface Transaction {
  id: string
  merchant: string
  category: Category
  /** Positive number. Use `direction` to know if money left or came in. */
  amount: number
  direction: "out" | "in"
  /** ISO date string */
  date: string
  status: TxnStatus
  /** UPI handle or note */
  vpa?: string
  /** Marks refund-related transactions for fraud analysis */
  refundOf?: string
}

export interface Bill {
  id: string
  name: string
  amount: number
  dueDate: string
  category: Category
  paid: boolean
  recurring?: boolean
}

export interface ChitFund {
  id: string
  name: string
  organizer: string
  monthlyContribution: number
  totalMonths: number
  monthsPaid: number
  members: number
  registered: boolean
  hasReceipts: boolean
  promisedReturnPct: number
  organizerResponsive: boolean
  payoutOverdue: boolean
}

export interface Subsidy {
  id: string
  name: string
  agency: string
  benefit: number
  benefitLabel: string
  description: string
  maxAge?: number
  maxMonthlySalary?: number
  minAge?: number
  status: "eligible" | "claimed" | "missed"
}

export interface RewardOffer {
  id: string
  title: string
  detail: string
  cashback: string
}

export type KycStatus = "unverified" | "pending" | "verified"

export interface KycDoc {
  status: KycStatus
  /** Masked/entered document number */
  number: string
}

export interface Profile {
  name: string
  age: number
  salaryDay: number
  salary: number
  dailyLimit: number
  dream: string
  target: number
  pinEnabled: boolean
}

export interface AppState {
  onboarded: boolean
  profile: Profile
  goalSaved: number
  transactions: Transaction[]
  bills: Bill[]
  categoryLimits: Record<Category, number>
  chitFunds: ChitFund[]
  subsidies: Subsidy[]
  /** ids of refund transactions the user has reviewed */
  reviewedRefunds: string[]
  /** Loyalty points earned through payments */
  rewardPoints: number
  /** Cashback offers available to the user */
  offers: RewardOffer[]
  /** KYC document verification state */
  kyc: {
    aadhaar: KycDoc
    pan: KycDoc
  }
}
