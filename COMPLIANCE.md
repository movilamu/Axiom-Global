# Compliance Notice

This is a functioning prototype. No real money is held, stored, or transferred. No real government IDs, real bank account numbers, or real payment card details are collected at any stage.

All biometric data (keystroke dynamics, mouse behavior, device motion, facial detection) is processed exclusively client-side and is never transmitted to any server. Only the computed risk score, risk tier, risk factors array, and outcome string are sent to the backend.

Passwords are bcrypt hashed at 14 rounds. JWTs expire in 15 minutes.

Before any production deployment this system must be reviewed against:

- **GDPR** (EU)
- **CCPA** (California)
- **DPDP Act 2023** (India)
- **PDPA** (Thailand/Singapore)
- **BIPA** (Illinois)
- **RBI Master Directions on PPIs** (India)
- **PSD2** (EU)
- **FCA EMI regulations** (UK)
