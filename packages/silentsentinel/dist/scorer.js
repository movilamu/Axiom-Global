const SILENTSENTINEL_THRESHOLDS = {
    TIER1_MAX: 35,
    TIER2_MAX: 75,
    KEYSTROKE_BASELINE_DWELL: 130,
    KEYSTROKE_BASELINE_FLIGHT: 180,
    PAUSE_PENALTY: 8,
    PAUSE_PENALTY_CAP: 40,
};
function buildResult(score, factors, breakdown) {
    return {
        score,
        tier: score <= 35 ? 1 : score <= 75 ? 2 : 3,
        factors,
        breakdown,
    };
}
export function computeRiskScore(biometrics, demoMode) {
    const T = SILENTSENTINEL_THRESHOLDS;
    if (demoMode === "low")
        return buildResult(20, [], { keystroke: 6, mouse: 9, device: 5 });
    if (demoMode === "medium")
        return buildResult(55, ["Elevated mouse jerkiness", "Moderate keystroke deviation"], {
            keystroke: 18,
            mouse: 22,
            device: 15,
        });
    if (demoMode === "high")
        return buildResult(85, [
            "High keystroke dwell deviation",
            "Elevated mouse jerkiness",
            "Unusual device motion",
        ], { keystroke: 35, mouse: 32, device: 18 });
    const factors = [];
    // KEYSTROKE — 40% weight
    const dwellDev = biometrics.keystroke.averageDwell > 0
        ? Math.abs(biometrics.keystroke.averageDwell - T.KEYSTROKE_BASELINE_DWELL) /
            T.KEYSTROKE_BASELINE_DWELL
        : 0.5;
    const flightDev = biometrics.keystroke.averageFlight > 0
        ? Math.abs(biometrics.keystroke.averageFlight - T.KEYSTROKE_BASELINE_FLIGHT) /
            T.KEYSTROKE_BASELINE_FLIGHT
        : 0.5;
    const pausePenalty = Math.min(biometrics.keystroke.longPauses * T.PAUSE_PENALTY, T.PAUSE_PENALTY_CAP);
    const keystrokeRaw = dwellDev * 50 + flightDev * 50 + pausePenalty;
    const keystrokeScore = Math.min(keystrokeRaw, 100) * 0.4;
    if (dwellDev > 0.5)
        factors.push("High keystroke dwell deviation");
    if (flightDev > 0.5)
        factors.push("High keystroke flight deviation");
    if (biometrics.keystroke.longPauses > 2)
        factors.push("Multiple long input pauses detected");
    // MOUSE — 35% weight
    let mouseVelocityScore = 5;
    if (biometrics.mouse.averageVelocity > 800) {
        mouseVelocityScore = 30;
        factors.push("Unusually high pointer velocity");
    }
    else if (biometrics.mouse.averageVelocity < 50 &&
        biometrics.mouse.averageVelocity > 0) {
        mouseVelocityScore = 25;
        factors.push("Unusually low pointer velocity");
    }
    let mouseJerkScore = 3;
    if (biometrics.mouse.jerkiness > 0.6) {
        mouseJerkScore = 25;
        factors.push("Elevated mouse jerkiness");
    }
    else if (biometrics.mouse.jerkiness > 0.3) {
        mouseJerkScore = 12;
        factors.push("Moderate pointer jerkiness");
    }
    const mouseScore = (mouseVelocityScore + mouseJerkScore) * 0.35;
    // DEVICE — 25% weight
    let shakeScore = 2;
    if (biometrics.device.shakeIntensity > 0.7) {
        shakeScore = 20;
        factors.push("High device shake intensity");
    }
    else if (biometrics.device.shakeIntensity > 0.4) {
        shakeScore = 10;
        factors.push("Moderate device motion");
    }
    let tiltScore = 4;
    if (Math.abs(biometrics.device.tiltAngle - 15) > 20) {
        tiltScore = 15;
        factors.push("Unusual device tilt angle");
    }
    const deviceScore = (shakeScore + tiltScore) * 0.25;
    const raw = keystrokeScore + mouseScore + deviceScore;
    const score = Math.min(Math.round(raw), 100);
    return buildResult(score, factors, {
        keystroke: Math.round(keystrokeScore),
        mouse: Math.round(mouseScore),
        device: Math.round(deviceScore),
    });
}
