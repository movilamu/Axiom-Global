export const USER_PROFILE = {
  name: "Alexandra Reyes",
  accountNumber: "4821 •••• •••• 7734",
  balance: 12480.5,
  currency: "USD",
  locale: "en-US",
  homeBranch: "Harbor Point",
  homeCity: "Austin",
  emailDomain: "@icloud.com",
  primaryDevice: "iPhone",
  accountAgeBracket: "3–5 years",
  primaryRecipientType: "Family member",
  countryTransacted: "UK",
  monthlyTransferBracket: "$500–$1,000",
  mostFrequentMerchant: "Netflix",
  mothersMaidenNameInitial: "M",
  pin: "2847",
  transactions: [
    {
      id: "TXN-8821",
      date: "Today, 09:14",
      merchant: "Netflix",
      amount: -15.99,
      type: "debit",
    },
    {
      id: "TXN-8820",
      date: "Today, 07:30",
      merchant: "Direct Deposit – Payroll",
      amount: 3240.0,
      type: "credit",
    },
    {
      id: "TXN-8819",
      date: "Yesterday",
      merchant: "Harbor Point Grocery",
      amount: -87.43,
      type: "debit",
    },
    {
      id: "TXN-8818",
      date: "Mar 7",
      merchant: "Uber Eats",
      amount: -24.15,
      type: "debit",
    },
    {
      id: "TXN-8817",
      date: "Mar 6",
      merchant: "Amazon Prime",
      amount: -14.99,
      type: "debit",
    },
  ],
} as const;

export const EXCHANGE_RATES: Record<string, number> = {
  GBP: 0.79,
  EUR: 0.92,
  INR: 83.12,
  AED: 3.67,
};

export const SILENTSENTINEL_THRESHOLDS = {
  TIER1_MAX: 35,
  TIER2_MAX: 75,
  KEYSTROKE_BASELINE_DWELL: 130,
  KEYSTROKE_BASELINE_FLIGHT: 180,
  PAUSE_PENALTY: 8,
  PAUSE_PENALTY_CAP: 40,
} as const;

export const SESSION_TIMEOUT_WARN_MS = 5 * 60 * 1000;
export const SESSION_TIMEOUT_HARD_MS = 7 * 60 * 1000;
export const PIN_MAX_ATTEMPTS = 3;
