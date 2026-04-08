export const STRINGS = {
  en: {
    appName: "SilentSentinel",
    tagline: "Banking with invisible intelligence",
    nav: {
      dashboard: "Dashboard",
      transfer: "Send Money",
      savings: "Savings",
      crypto: "Crypto",
      business: "Business",
      security: "Security",
      settings: "Settings",
      transactions: "Transactions",
      exchange: "Exchange",
      cards: "Cards",
      analytics: "Analytics",
      notifications: "Notifications",
      profile: "Profile",
    },
    dashboard: {
      greeting: {
        morning: "Good morning",
        afternoon: "Good afternoon",
        evening: "Good evening",
      },
      balance: "Available Balance",
      accountNumber: "Account Number",
      sendMoney: "Send Money",
      recentTransactions: "Recent Transactions",
      viewAll: "View all",
      addMoney: "Add Money",
      securityStatus: "Security Status",
      allClear: "All Clear",
      viewFullReport: "View Full Report →",
      savingsSnapshot: "Savings",
      viewVaults: "View Vaults →",
      cryptoSnapshot: "Crypto",
      viewPortfolio: "View Portfolio →",
      cardsSnapshot: "Cards",
      manageCards: "Manage Cards →",
    },
    transfer: {
      title: "Send Money",
      recipientName: "Recipient Name",
      accountNumber: "Account Number",
      amount: "Amount",
      pin: "Enter PIN",
      confirmBtn: "Confirm Transaction",
      trustBadge: "256-bit encrypted · Protected by SilentSentinel",
      conversionHint: "≈ {amount} {currency}",
      idleWarning: "Still there? Your session will expire in 2 minutes.",
      pinLocked:
        "For your security, this session has been paused. Please contact support.",
      pinAttemptsRemaining: "Attempts remaining: {count}",
      riskMonitor: "Risk Monitor",
    },
    kba: {
      heading: "Just a couple of quick checks",
      subtext:
        "These help us confirm it's really you. It'll only take a moment.",
      progress: "Question {current} of {total}",
      next: "Next question",
      back: "Back",
      confirm: "Confirm and continue",
      answerPrompt: "That's my answer",
      escalation:
        "We weren't able to verify your identity with those answers. For your security, we'll complete one more step.",
    },
    biometric: {
      heading: "One final security step",
      subtext:
        "We need to quickly confirm it's you. This will take less than 30 seconds.",
      steps: {
        camera: "Requesting camera access",
        detecting: "Detecting face",
        liveness: "Liveness challenge",
        antispoofing: "Anti-spoofing check",
      },
      challenges: [
        "Please blink twice",
        "Please slowly turn your head left then right",
      ],
      cameraBlocked:
        "Camera access is needed to complete verification. Please enable it in your browser settings and try again.",
      timeout:
        "We couldn't detect a face. Please ensure you're in good lighting and centred in the frame.",
      tryAgain: "Try Again",
      contactSupport: "Contact Support",
      success:
        "Identity Confirmed — High-Security Verification Complete.",
    },
    approved: {
      headline: "Transaction Approved",
      badge: "Verified by SilentSentinel",
      backToDashboard: "Back to Dashboard",
      downloadReceipt: "Download Receipt",
      kbaSuccess: "Identity confirmed. Your transfer is on its way.",
      biometricSuccess:
        "Identity Confirmed — High-Security Verification Complete.",
    },
    denied: {
      headline: "Transaction Paused",
      message:
        "We weren't able to verify your identity at this time. Please try again or contact support.",
      tryAgain: "Try Again",
      contactSupport: "Contact Support",
    },
    savings: {
      title: "Savings Vaults",
      newGoal: "New Goal",
      target: "Target",
      saved: "Saved",
      autoSave: "Auto-save",
      deadline: "Deadline",
      addFunds: "Add Funds",
      completeMessage: "Goal reached! 🎉",
      totalSaved: "Total Saved",
    },
    crypto: {
      title: "Crypto Portfolio",
      buy: "Buy",
      sell: "Sell",
      portfolio: "Portfolio",
      marketPrice: "Market Price",
      holdings: "Your Holdings",
      pnl: "P&L",
      history: "Transaction History",
      exchangeNow: "Exchange Now",
    },
    business: {
      title: "Business",
      expenses: "Expenses",
      cards: "Virtual Cards",
      exportCSV: "Export CSV",
      addExpense: "Add Expense",
      newCard: "New Virtual Card",
      spendLimit: "Spend Limit",
      category: "Category",
    },
    security: {
      title: "Security Centre",
      subtitle: "Your SilentSentinel protection history",
      totalScanned: "Transactions Scanned",
      avgRisk: "Average Risk Score",
      flagged: "Flagged Events",
      riskTier: "Risk Tier",
      outcome: "Outcome",
      factors: "Detected Factors",
      noEvents: "No security events recorded yet.",
      howItWorks: "How SilentSentinel Protects You",
    },
    errors: {
      amountZero: "Please enter an amount greater than $0",
      accountTooShort: "Account numbers are 12 digits",
      networkError: "Something went wrong. Please try again.",
      sessionExpired: "Your session has expired. Please log in again.",
      cameraBlocked: "Camera access was denied.",
    },
    disclaimer:
      "SilentSentinel Neobank is a functioning prototype. No real money is held or transferred. Not a licensed financial service.",
    privacyFooter:
      "SilentSentinel processes all biometric data locally. Nothing leaves your device.",
    searchPlaceholder: "Search transactions, contacts…",
    demoMode: "Demo Mode",
    demoModeActive: "Demo Mode Active",
    noTransactionsRecorded: "No transactions recorded this session.",
  },
  hi: {
    appName: "साइलेंटसेंटिनल",
    nav: { dashboard: "डैशबोर्ड", transfer: "पैसे भेजें" },
    /* TODO: Extend fully for production */
  },
  ar: {
    appName: "سايلنت سنتينل",
    nav: { dashboard: "لوحة التحكم", transfer: "إرسال الأموال" },
    /* TODO: RTL — extend fully for production */
  },
  fr: {
    appName: "SilentSentinel",
    nav: { dashboard: "Tableau de bord", transfer: "Envoyer de l'argent" },
    /* TODO: Extend fully for production */
  },
} as const;

export type Locale = keyof typeof STRINGS;
export type StringsShape = typeof STRINGS.en;
