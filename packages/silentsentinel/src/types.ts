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
