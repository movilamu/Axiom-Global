import type { BiometricData } from "./types";
export interface RiskResult {
    score: number;
    tier: 1 | 2 | 3;
    factors: string[];
    breakdown: {
        keystroke: number;
        mouse: number;
        device: number;
    };
}
export declare function computeRiskScore(biometrics: BiometricData, demoMode: "off" | "low" | "medium" | "high"): RiskResult;
//# sourceMappingURL=scorer.d.ts.map