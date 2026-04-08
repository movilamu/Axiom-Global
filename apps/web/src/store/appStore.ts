import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { loadAuth, saveAuth, clearAuth } from "../lib/authStorage";

export type Page =
  | "dashboard"
  | "transfer"
  | "assessing"
  | "tier1"
  | "tier2"
  | "tier3"
  | "approved"
  | "denied"
  | "savings"
  | "crypto"
  | "business"
  | "security"
  | "auth/login"
  | "auth/signup"
  | "auth/otp"
  | "transactions"
  | "exchange"
  | "cards"
  | "analytics"
  | "notifications"
  | "profile";

export type RiskTier = 1 | 2 | 3;

export interface BiometricData {
  keystroke: {
    dwellTimes: number[];
    flightTimes: number[];
    longPauses: number;
    averageDwell: number;
    averageFlight: number;
  };
  mouse: {
    velocities: number[];
    averageVelocity: number;
    clickCount: number;
    clickIntervals: number[];
    jerkiness: number;
  };
  device: {
    tiltAngle: number;
    shakeIntensity: number;
  };
}

export interface AuditEntry {
  id: string;
  sessionId: string;
  action: string;
  riskScore: number;
  riskTier: RiskTier;
  riskFactors: string[];
  outcome: string;
  timestamp: string;
  transferDetails?: TransferDetails;
  breakdown?: { keystroke: number; mouse: number; device: number };
}

export interface TransferDetails {
  recipient: string;
  accountNumber: string;
  amount: string;
  currency: string;
}

export interface AppState {
  page: Page;
  sessionId: string;
  locale: string;
  currency: string;
  riskScore: number | null;
  riskFactors: string[];
  riskTier: RiskTier | null;
  transferDetails: TransferDetails;
  biometrics: BiometricData;
  kbaAnswers: string[];
  kbaQuestions: number[];
  auditLog: AuditEntry[];
  demoMode: "off" | "low" | "medium" | "high";
  pinAttempts: number;
  isAuthenticated: boolean;
  userId: string | null;

  navigate: (page: Page) => void;
  setPageFromUrl: (page: Page) => void;
  setRiskScore: (score: number, factors: string[]) => void;
  setRiskTier: (tier: RiskTier) => void;
  updateTransferDetails: (details: Partial<TransferDetails>) => void;
  updateBiometrics: (data: Partial<BiometricData>) => void;
  addKbaAnswer: (answer: string) => void;
  setKbaAnswers: (answers: string[]) => void;
  setKbaQuestions: (questions: number[]) => void;
  appendAuditLog: (entry: AuditEntry) => void;
  setDemoMode: (mode: "off" | "low" | "medium" | "high") => void;
  incrementPinAttempts: () => void;
  resetPinAttempts: () => void;
  setAuthenticated: (userId: string) => void;
  logout: () => void;
  resetTransferFlow: () => void;
}

const initialBiometrics: BiometricData = {
  keystroke: {
    dwellTimes: [],
    flightTimes: [],
    longPauses: 0,
    averageDwell: 0,
    averageFlight: 0,
  },
  mouse: {
    velocities: [],
    averageVelocity: 0,
    clickCount: 0,
    clickIntervals: [],
    jerkiness: 0,
  },
  device: {
    tiltAngle: 15,
    shakeIntensity: 0.2,
  },
};

const savedAuth = loadAuth();

export const useAppStore = create<AppState>()(
  devtools((set) => ({
    page: savedAuth ? "dashboard" : "auth/login",
    sessionId: `SS-${Date.now()}`,
    locale: "en-US",
    currency: "USD",
    riskScore: null,
    riskFactors: [],
    riskTier: null,
    transferDetails: {
      recipient: "",
      accountNumber: "",
      amount: "",
      currency: "USD",
    },
    biometrics: initialBiometrics,
    kbaAnswers: [],
    kbaQuestions: [],
    auditLog: [],
    demoMode: "off",
    pinAttempts: 0,
    isAuthenticated: !!savedAuth,
    userId: savedAuth?.userId ?? null,

    navigate: (page) => set({ page }),
    setPageFromUrl: (page) => set({ page }),
    setRiskScore: (score, factors) => set({ riskScore: score, riskFactors: factors }),
    setRiskTier: (tier) => set({ riskTier: tier }),
    updateTransferDetails: (details) =>
      set((s) => ({ transferDetails: { ...s.transferDetails, ...details } })),
    updateBiometrics: (data) =>
      set((s) => ({ biometrics: { ...s.biometrics, ...data } })),
    addKbaAnswer: (answer) =>
      set((s) => ({ kbaAnswers: [...s.kbaAnswers, answer] })),
    setKbaAnswers: (answers) => set({ kbaAnswers: answers }),
    setKbaQuestions: (questions) => set({ kbaQuestions: questions }),
    appendAuditLog: (entry) =>
      set((s) => ({ auditLog: [entry, ...s.auditLog] })),
    setDemoMode: (mode) => set({ demoMode: mode }),
    incrementPinAttempts: () =>
      set((s) => ({ pinAttempts: s.pinAttempts + 1 })),
    resetPinAttempts: () => set({ pinAttempts: 0 }),
    setAuthenticated: (userId) => {
      saveAuth(userId);
      set({ isAuthenticated: true, userId });
    },
    logout: () => {
      clearAuth();
      set({ isAuthenticated: false, userId: null, page: "auth/login" });
    },
    resetTransferFlow: () =>
      set({
        riskScore: null,
        riskFactors: [],
        riskTier: null,
        transferDetails: {
          recipient: "",
          accountNumber: "",
          amount: "",
          currency: "USD",
        },
        biometrics: initialBiometrics,
        kbaAnswers: [],
        kbaQuestions: [],
        pinAttempts: 0,
      }),
  }))
);
