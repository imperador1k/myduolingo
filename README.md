<div align="center">
  
  # 🚀 MyDuolingo 🦉

[![CI/CD Pipeline](https://github.com/imperador1k/myduolingo/actions/workflows/ci.yml/badge.svg)](https://github.com/imperador1k/myduolingo/actions/workflows/ci.yml)

> *The Ultimate Open-Source Language Learning Ecosystem, Powered by Next.js 14, Clerk, Drizzle, and Google Gemini AI. An enterprise-grade SaaS application, AI-augmented and built for performance, retention, and massive scale.*

  ![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)
  ![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.31-C5F74F?logo=drizzle)
  ![Clerk Auth](https://img.shields.io/badge/Clerk_Auth-Secure-6C47FF?logo=clerk)
  ![Google AI](https://img.shields.io/badge/Gemini_AI-Integrated-4285F4?logo=google)
  ![Supabase Realtime](https://img.shields.io/badge/Supabase_Realtime-WebSockets-3ECF8E?logo=supabase)
  ![Stripe PRO](https://img.shields.io/badge/Stripe-Subscription-635BFF?logo=stripe)
  ![Security](https://img.shields.io/badge/Supabase_RLS-Zero_Trust-red?logo=security)
  ![Zod](https://img.shields.io/badge/Zod-Validation-3068b7?logo=zod)

  <br />
  <a href="README.pt.md">Ler em Português 🇵🇹/🇧🇷</a>

</div>

<br/>

## 📖 The Pitch
**MyDuolingo** isn't just an academic clone; it is a *state-of-the-art* ed-tech retention engine. It combines proven gamification mechanics with a server-side **Generative AI pipeline**, high-fidelity communication via **Real-Time WebSockets**, and a robust **Zero-Trust DevSecOps** foundation. Driven by a modular, tactile, and highly polished interface, this system delivers a global-scale experience right from *localhost*.

---

## 🔥 Enterprise Key Features

- **🧠 Headless CMS & AI Pipeline:** Gone are the days of static JSONs. An `/admin` dashboard built with RBAC hierarchies allows generating infinite language curriculums with just a few clicks, pairing TypeScript *Server Actions* with the Gemini 2.5 SDK and media file management via Supabase Storage.
- **⚡ Real-Time Engine (WebSockets):** Immaculate social interconnectivity with 1-to-1 chat using Supabase's Realtime infrastructure. Optimized channels transmit "*Presence*" activity ("Online" state via green dot and "Typing..." indicators) ephemerally (`0` write costs to the DB), with interface updates orbiting around *Optimistic UI* patterns.
- **🛡️ DevSecOps & Anti-Cheat Engine:** Reliability first. An armored engine rigidly validates gamification interactions; payloads pass through strict **Zod** filters, while point approvals (XP and rewards) happen behind the oppressive Server perimeter (verified `Server Actions`). This connects with Supabase *Row Level Security* (RLS) policies temporarily unlocked by an unbreakable JWT minted by Clerk.
- **🏆 Hybrid Economy and Leaderboard System:** Dopamine-driven gamified retention. A relentless loop processes weekly XP, distributing titles and positions on the global Top 50 *Leaderboard*. Decorated alongside passive Heart systems (regenerating every 5 hours on the server), Shields, Streak Freezes, and an In-Game Shop with active power-ups.
- **💎 MyDuolingo PRO & VIP Badges:** Monetization and prestige ecosystem. Deep integration with **Stripe** for recurring subscriptions that unlock Infinite Hearts, exclusive AI Practice, and the coveted **VIP Gold Badge** (`BadgeCheck`) visible across the entire social ecosystem (Leaderboard, Chat, and Profile).
- **📱 Premium UI/UX Dynamics:** Superlative CSS architecture using Bento-Grid abstractions from the Tailwind CSS layer. The interface overflows with micro-reactive animations, drag-and-drop interactions, and haptic sound gratifications locally embedded into the app via `use-sound`.

---

## 🏗️ System Architecture

The repository follows pure corporate design conventions utilizing Next.js App Router for extreme fragmentation between *Client Edge* and restricted back-end executions. See more details in our [Architecture Documentation](ARCHITECTURE.md).

- **Routing & React:** Central rendering of *Server Components (RSC)* balanced with asynchronous *Server Actions* - thereby eliminating full instances of Redux and Axios for secure database fetching against vulnerabilities.
- **Database & Typed Mutation:** Relational **PostgreSQL** database manipulated under strict, high-focus supervision issued by **Drizzle ORM**.
- **Fragmented Identity:** **Clerk** governs Authentication.

### Modular Structure
```text
├── src/
│   ├── app/                # Next Router Endpoints & Server Pages
│   ├── actions/            # Server Mutation Engine (+ Anti-Cheat Logic)
│   ├── components/
│   │   ├── chat/           # Realtime Presence & Storage Hooks
│   │   ├── admin/          # AI Generator CMS Interfaces
│   │   └── ui/             # Radix UI Primitive Entities
│   ├── db/                 # Drizzle Server Migrations and DDL
│   └── lib/                # JWT Configs, Webhooks, and AI Auth Wrappers
```

---

## 🚀 Local Deployment (Installation Roadmap)

Boot up the machine in a Node.js Environment version 20.x or higher.

### 1. Clone & Bootstrap
```bash
git clone https://github.com/your-username/myduolingo.git
cd myduolingo
npm install
```

### 2. Environment Variables (The Matrix)
Empower your `.env` and `.env.local` with omnipotent capabilities by filling in the following integrations (PostgreSQL Edge, Clerk Admin Keys, and Google AI Model Secrets). Copy `.env.example` to start.

```bash
cp .env.example .env
```

### 3. Physical Layer Migration
Compile your schema against the base infrastructure.

```bash
npx drizzle-kit push
```

### 4. Ignite the Development Server
```bash
npm run dev
```

Go to `http://localhost:3000` to experience the future of how Front-end engineering combines with AI ecosystems.

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) and our [Code of Conduct](CODE_OF_CONDUCT.md) before submitting a Pull Request.

## 🛡️ Security

If you discover a security vulnerability within MyDuolingo, please review our [Security Policy](SECURITY.md).

---
<div align="center">
  <i>Architected with passion. Armored via SecOps. Engineered for Maximum Scale.</i>
</div>
