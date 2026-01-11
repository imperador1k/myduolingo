# 🦉 MyDuolingo - The Ultimate Language Learning Platform

![MyDuolingo Banner](/public/duolingo_home.png)

**MyDuolingo** is a full-stack, pixel-perfect clone of the world's most popular language learning app. Built with modern web technologies, it features interactive lessons, gamification, real-time messaging, and a beautiful, responsive UI.

## ✨ Features

- **Auth & User Management**: Secure authentication via Clerk (Google, GitHub, Email).
- **Interactive Lessons**: fun, gamified learning experience with multiple challenge types.
- **Heart System**: Lives mechanic that regenerates over time or can be refilled.
- **Shop & Currency**: Earn "Points" to buy hearts and upgrades.
- **Leaderboard**: Compete with other learners in weekly leagues.
- **Quests & XP**: Daily targets and experience tracking.
- **Real-time Chat**: Instant messaging with friends, supporting **Images**, **GIFs**, and **Files**.
- **Admin Dashboard**: React Admin interface for managing courses, units, and levels.
- **Responsive Design**: Mobile-first architecture using Tailwind CSS.
- **Sound Effects**: Audio feedback for correct/incorrect answers.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **State Management**: React Hooks + Zustand
- **Animations**: Framer Motion / CSS Animations

### Backend & Database
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [NeonDB](https://neon.tech/))
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Auth**: [Clerk](https://clerk.com/)
- **Storage & Realtime**: [Supabase](https://supabase.com/)
- **Payments**: [Stripe](https://stripe.com/) (Integration ready)

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites
- Node.js 18+
- npm or pnpm
- PostgreSQL Database URL

### 1. Clone the repository
```bash
git clone https://github.com/your-username/myduolingo.git
cd myduolingo
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory and add the following keys:

```bash
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database (Neon/Postgres)
DATABASE_URL=postgresql://...

# Supabase (Storage & Realtime)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Giphy (Chat Media)
NEXT_PUBLIC_GIPHY_API_KEY=...

# Stripe (Optional)
STRIPE_API_KEY=...
STRIPE_WEBHOOK_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup
Push the schema to your database and seed initial data.

```bash
# Push schema
npm run db:push

# Seed data (Categories, Units, Lessons)
npm run db:seed
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```
├── public/          # Static assets (images, sounds)
├── src/
│   ├── actions/     # Server Actions (Mutations)
│   ├── app/         # Next.js App Router Pages
│   ├── components/  # Reusable UI Components
│   ├── db/          # Database Schema & Queries
│   ├── lib/         # Utilities & Configs
│   └── scripts/     # Seeding & Maintenance scripts
└── drizzle/         # SQL Migrations
```

## 🔐 Permissions (Supabase)

To enable File Uploads in Chat, ensure your Supabase Storage Bucket `chat-attachments` has RLS policies enabled for:
- **INSERT**: `authenticated` and `anon` roles.
- **SELECT**: `public` access.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is for educational purposes.

---

Made with 💚 by **Miguel Santos**
