# Axiom-Global: SilentSentinel Neobank

A high‑fidelity neobank prototype engineered for **cross‑border financial operations**. Features **SilentSentinel**—a proprietary behavioral biometric engine that mitigates fraud at the point of interaction with institutional‑grade security.

## 💎 Value Proposition

Unlike traditional fintech platforms that treat fraud detection as an API add‑on, Axiom‑Global integrates SilentSentinel **directly into the client‑side lifecycle**:

- **Real‑time risk scoring** based on user behavior  
- **Privacy‑first**: Biometric data processed client‑side (server stores only anonymized risk scores and logic factors)  
- **Global by design**: Pre‑configured for India (UPI/Aadhaar), USA (Plaid/ACH), EU/UK (Open Banking/GDPR)  
- **Hybrid wealth**: Seamlessly bridges traditional fiat accounts with a simulated crypto investment engine  

## 🛠 Technology Stack

| Layer      | Technology                     | Purpose                                      |
|-----------|--------------------------------|----------------------------------------------|
| Frontend  | React, TypeScript, Vite        | High‑performance, type‑safe UI               |
| Styling   | Tailwind CSS, Framer Motion    | Modern UX & production‑grade animations      |
| State     | Zustand                        | Lightweight, scalable global state management|
| Backend   | Node.js, Express, TypeScript   | Enterprise‑ready REST API                    |
| Database  | PostgreSQL + Prisma ORM        | Relational data integrity for financial ledgers |
| Infra     | Supabase, Redis, Railway       | Scalable hosting, auth, and session caching  |

## 🏛 Architecture Overview

The system follows a **monorepo** architecture to cleanly separate banking logic from the security engine.
axiom-global/
├── apps/
│ ├── web/ # React Dashboard & PWA Shell
│ └── api/ # Express Server (Risk Scoring & Ledger)
├── packages/
│ ├── silentsentinel/ # Core Biometric Engine (Shared Module)
│ └── core/ # Shared TS Definitions & Utils
└── COMPLIANCE.md # Multi‑jurisdictional Regulatory Mapping

text

## 🗺 Strategic Roadmap

### 📦 Phase 1: Institutional Foundation
- Multi‑tenant auth via Supabase  
- Deploy core ledger schema (`Users`, `Accounts`, `Transactions`)  
- Internationalization (i18n) support for EN, HI, FR, and AR  

### 🛡 Phase 2: SilentSentinel Integration
- Implementation of the Biometric Risk Engine across high‑value touchpoints  
- Security Transparency Dashboard: visibility into user risk profiles  

### 📈 Phase 3: Wealth & Asset Management
- Simulated Crypto Portfolio tracking via CoinGecko API  
- Business Expense Management & Virtual Card simulation  

## ⚖️ Regulatory & Compliance Note

> [!IMPORTANT]  
> **This platform does not hold real deposits or facilitate actual movement of currency.** It is a sandbox for demonstrating the efficacy of behavioral biometrics in fintech.

| Region   | Regulatory Alignment        | Data Standard              |
|----------|-----------------------------|----------------------------|
| India    | RBI PPI Guidelines, DPDP Act 2023 | Aadhaar/UPI          |
| USA      | BSA/AML, CCPA, BIPA         | Plaid/ACH                 |
| EU/UK    | PSD2 / Open Banking, GDPR Article 9 | Open Banking    |

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Docker (optional, for local Postgres)

### Installation

```bash
# Clone the project
git clone https://github.com/movilamu/Axiom-Global.git

# Install dependencies
cd Axiom-Global
npm install

# Environment setup
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### Launch Development Environment

```bash
npm run dev
```

## 👥 Contributors

**ILAMURUHAN MOHANASUNDARAM**  
Lead Architect  
[GitHub](https://github.com/movilamu)

---

© 2026 Axiom‑Global. All rights reserved. Proprietary and Confidential.
