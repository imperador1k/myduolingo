# 🎨 MyDuolingo — HD Play Design System

> **Purpose**: Copy-paste cheat sheet for replicating the exact MyDuolingo "HD Play" aesthetic in any new project (e.g., a Coming Soon marketing site).

---

## 1. Core Tokens

### 1.1 Brand Colors

| Token | Hex | HSL | Usage |
|---|---|---|---|
| `duo-green` | `#58cc02` | `115 83% 40%` | Primary CTA, success, active states |
| `duo-green-dark` | `#46a302` | `115 83% 32%` | 3D border-bottom on green elements |
| `duo-red` | `#ff4b4b` | `0 100% 64%` | Error, danger, heart loss |
| `duo-red-dark` | `#d63e3e` | `0 70% 50%` | 3D border-bottom on red elements |
| `duo-blue` | `#0ea5e9` | `199 89% 48%` | Info, lessons, secondary actions |
| `duo-blue-dark` | `#0284c7` | `199 89% 38%` | 3D border-bottom on blue elements |
| `duo-gold` | `#f5b800` | `45 93% 58%` | Premium/PRO, achievements |
| `duo-purple` | `#8b5cf6` | `270 67% 47%` | Super/streak, listening phase |
| `duo-orange` | `#FF9600` | — | Writing phase, warnings |
| `duo-orange-dark` | `#D67B00` | — | 3D border-bottom on orange elements |
| `duo-violet` | `#CE82FF` | — | Listening phase accent |

**Shadcn Theme Variables (Light):**

| Variable | HSL Value | Mapped To |
|---|---|---|
| `--background` | `0 0% 100%` | Page background |
| `--foreground` | `222.2 84% 4.9%` | Text color |
| `--primary` | `115 83% 40%` | Green CTA |
| `--secondary` | `199 89% 48%` | Blue info |
| `--destructive` | `0 100% 64%` | Red danger |
| `--muted` | `210 40% 96.1%` | Muted backgrounds |
| `--border` | `214.3 31.8% 91.4%` | Borders |
| `--ring` | `115 83% 40%` | Focus rings |
| `--radius` | `0.75rem` | Base border-radius |

**Surface Colors (Tailwind utilities used in-app):**

| Surface | Class | Notes |
|---|---|---|
| App background | `bg-slate-50` | Applied on `<body>` |
| Card surface | `bg-white` | All bento boxes |
| Muted surface | `bg-stone-50`, `bg-stone-100` | Tags, pills |
| Border standard | `border-stone-200` | Card borders |
| Text primary | `text-stone-700`, `text-stone-800` | Headings |
| Text secondary | `text-stone-400`, `text-stone-500` | Descriptions |

### 1.2 Typography

| Property | Value |
|---|---|
| **Font Family** | `Nunito` (Google Fonts) |
| **Import** | `@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap')` |
| **Next.js Setup** | `import { Nunito } from "next/font/google"; const nunito = Nunito({ subsets: ["latin"] });` |
| **Tailwind Config** | `fontFamily: { sans: ["Nunito", "sans-serif"] }` |
| **Weights Used** | `font-medium` (500), `font-bold` (700), `font-extrabold` (800), `font-black` (900) |

**Typography Patterns:**

```
Page Title:     text-4xl font-black text-stone-800 tracking-tight
Section Head:   text-2xl font-black text-stone-700 uppercase tracking-tight
Card Title:     text-xl font-black text-stone-700
Body Text:      text-lg font-bold text-stone-500
Micro Label:    text-[10px] font-black uppercase tracking-widest text-stone-400
Badge/Pill:     text-xs font-black uppercase tracking-wider
```

### 1.3 Z-Index Scale

| Token | Value | Usage |
|---|---|---|
| `z-overlay` | `60` | Mobile nav backdrop, command menu |
| `z-modal` | `70` | General modals |
| `z-toast` | `80` | Toasts, snackbars |
| `z-above-modal` | `90` | Modal-on-modal (shop confirm) |
| `z-supreme` | `9999` | League ceremony (above everything) |

**Tailwind config snippet:**
```ts
zIndex: {
  'overlay': '60',
  'modal': '70',
  'toast': '80',
  'above-modal': '90',
  'supreme': '9999',
}
```

### 1.4 Border Radius Scale

| Usage | Value |
|---|---|
| Buttons | `rounded-xl` (0.75rem) / `rounded-2xl` (1rem) |
| Cards / Bento Boxes | `rounded-3xl` (1.5rem) / `rounded-[2.5rem]` |
| Avatars | `rounded-full` / `rounded-[2rem]` |
| Pills / Tags | `rounded-xl` / `rounded-full` |

---

## 2. HD Play Textures & Backgrounds

### 2.1 Dotted Background Pattern

The signature texture used on landing, evaluation, and content pages:

```html
<!-- Drop this as the first child of your page container -->
<div
  aria-hidden="true"
  class="pointer-events-none absolute inset-0 z-0
         bg-[radial-gradient(#e5e7eb_2px,transparent_2px)]
         [background-size:24px_24px] opacity-40"
></div>
```

### 2.2 Floating Decorative Blobs

Soft gradient blobs that give depth behind content:

```html
<!-- Green blob — left side -->
<div class="absolute -left-32 top-10 z-0 h-96 w-96
            rounded-full bg-green-400/20 blur-3xl"></div>

<!-- Blue blob — right side -->
<div class="absolute -right-32 top-1/2 z-0 h-96 w-96
            -translate-y-1/2 rounded-full bg-sky-400/15 blur-3xl"></div>
```

**Scoped variant (inside content areas):**
```html
<div aria-hidden="true"
     class="pointer-events-none absolute -left-32 top-20
            h-96 w-96 rounded-full bg-[#58CC02]/10 blur-3xl" />
<div aria-hidden="true"
     class="pointer-events-none absolute -right-32 top-1/2
            h-96 w-96 -translate-y-1/2 rounded-full bg-[#1CB0F6]/10 blur-3xl" />
```

### 2.3 Grid Pattern (Alternative)

Used inside specific bento cards for a subtle engineering feel:

```html
<div class="absolute inset-0 opacity-[0.03] pointer-events-none"
     style="background-image: linear-gradient(#000 1px, transparent 1px),
            linear-gradient(90deg, #000 1px, transparent 1px);
            background-size: 20px 20px">
</div>
```

### 2.4 Inner Glow Blobs (Inside Cards)

```html
<div class="pointer-events-none absolute -top-20 -left-20
            w-72 h-72 bg-[#58CC02]/10 rounded-full blur-3xl" />
<div class="pointer-events-none absolute -bottom-20 -right-20
            w-72 h-72 bg-[#1CB0F6]/10 rounded-full blur-3xl" />
```

---

## 3. Tactile Components ("The Juice")

### 3.1 Buttons

**The Core 3D Press Mechanic** — every button uses `border-b-*` for depth, `active:translate-y-*` + `active:border-b-0` for the press effect:

#### Primary CTA (Green)

```
bg-green-500 text-white border-green-600 border-b-4
hover:bg-green-500/90
active:border-b-0 active:translate-y-[2px]
```

#### Massive Hero CTA ("Começar" Button)

```
h-16 px-10 bg-[#58cc02] text-white text-xl font-black
rounded-2xl border-2 border-transparent
border-b-8 border-b-[#46a302]
hover:bg-[#61da02]
active:border-b-0 active:translate-y-2
transition-all uppercase tracking-widest
shadow-md
```

#### Secondary CTA (Outline / Login)

```
bg-white text-blue-500 font-bold uppercase tracking-wide
border-2 border-slate-200 border-b-4 h-12 rounded-xl
hover:bg-slate-50 hover:text-blue-600
active:border-b-2
```

#### Premium/Super CTA (Golden Gradient)

```
bg-gradient-to-b from-amber-400 to-amber-500 text-white
border-amber-600 border-b-4
hover:from-amber-400/90 hover:to-amber-500/90
active:border-b-0 active:translate-y-[2px]
```

#### Danger CTA (Red)

```
bg-rose-500 text-white border-rose-600 border-b-4
hover:bg-rose-500/90
active:border-b-0 active:translate-y-[2px]
```

#### Ghost / Sidebar Button

```
bg-transparent text-slate-500 border-transparent
hover:bg-slate-100 hover:text-slate-800
```

#### Icon Button (Close, Info, Settings)

```
w-12 h-12 bg-white rounded-2xl
border-2 border-slate-200 border-b-[6px]
text-slate-400 hover:text-slate-600
hover:bg-slate-50
active:translate-y-1 active:border-b-[2px]
transition-all shadow-lg
```

**All button variants are defined in `src/components/ui/button.tsx` using CVA (class-variance-authority).**

### 3.2 Bento Boxes / Cards

The signature modular card used across the entire app:

#### Standard Bento Box

```
bg-white rounded-[2.5rem]
border-2 border-stone-200 border-b-8
shadow-sm
hover:shadow-md hover:-translate-y-1
active:translate-y-0 active:border-b-0
transition-all
```

#### HD Play Bento (Evaluation Cards)

```
bg-white rounded-[1.75rem]
border-2 border-slate-200 border-b-[6px]
p-5 shadow-sm
transition-all duration-300
hover:scale-[1.03] hover:-translate-y-1
hover:shadow-[0_8px_30px_rgba(88,204,2,0.25)]
hover:border-[#58CC02]/60
```

#### Hero Banner Bento (Full-width)

```
bg-white rounded-[2.5rem]
border-2 border-slate-200 border-b-[8px]
shadow-[0_15px_40px_-10px_rgba(0,0,0,0.05)]
p-8 md:p-10
overflow-hidden relative
```

#### Mascot Container Bento

```
bg-white rounded-[2rem]
border-2 border-b-[6px] border-slate-200
shadow-sm p-6
relative overflow-hidden
```

#### Profile Hero Card

```
bg-white rounded-[3rem]
border-2 border-stone-200 border-b-8
p-8 shadow-sm
hover:shadow-md transition-all
```

#### Achievement Card (Unlocked)

```
border-amber-200 bg-white border-2 border-b-8
rounded-[2.5rem] p-6 shadow-sm
hover:shadow-md hover:-translate-y-1
active:translate-y-0 active:border-b-0 active:mb-[8px]
```

#### Achievement Card (Locked)

```
border-stone-200 bg-stone-50/50 border-2 border-b-8
rounded-[2.5rem] p-6
grayscale opacity-70
```

### 3.3 Headers & Status Banners

#### Sticky HD Play Header

```
sticky top-0 z-50
bg-white/70 backdrop-blur-2xl
border-b-[3px] border-slate-200/80
shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)]
pt-4 sm:pt-6 pb-4 px-4 md:px-8
```

#### Unit Banner (Green Active)

```
bg-gradient-to-b from-[#58CC02] to-[#4eb801]
border-2 border-[#46a302] border-b-8
rounded-t-3xl p-6
```

#### Unit Banner (Locked Gray)

```
bg-stone-200
border-2 border-stone-300 border-b-8
rounded-3xl opacity-80
```

### 3.4 Progress Bars (3D HD Play)

#### Track Container

```
h-7 sm:h-9 bg-slate-100 rounded-2xl
border-2 border-slate-200/80
shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]
overflow-hidden relative
```

#### Color Fill (Green example)

```
bg-[#58CC02] shadow-[#58CC02]/40
rounded-2xl border-r-[4px] border-white/30
shadow-[0_0_20px_rgba(0,0,0,0.1)]
transition-all duration-1000 ease-out
```

**Internal shine reflection:**
```html
<div class="absolute top-1.5 left-4 right-4 h-2 sm:h-3
            bg-white/25 rounded-full" />
```

**Animated gradient stripes:**
```html
<div class="absolute inset-0 opacity-30
     bg-[linear-gradient(45deg,rgba(255,255,255,0.4)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.4)_50%,rgba(255,255,255,0.4)_75%,transparent_75%,transparent)]
     bg-[length:32px_32px]
     animate-[pushScroll_3s_linear_infinite]" />
```

#### Percentage Pill

```
px-6 py-3 bg-white rounded-2xl
border-2 border-slate-200 border-b-[6px]
font-black text-slate-600 text-lg
shadow-xl tabular-nums
active:translate-y-1 active:border-b-[2px]
```

### 3.5 Lesson Nodes (Game Map)

#### Active Node (Golden Jewel)

```
w-[84px] h-[84px] sm:w-[96px] sm:h-[96px]
bg-yellow-400 rounded-full
border-4 border-yellow-500 border-b-[10px] border-b-yellow-600
shadow-[0_10px_20px_rgba(250,204,21,0.5)]
ring-4 ring-yellow-400/50
hover:-translate-y-2 hover:scale-105
active:scale-95 active:translate-y-2 active:border-b-[4px]
transition-all
```

#### Completed Node

```
w-[64px] h-[64px] sm:w-[72px] sm:h-[72px]
rounded-full border-4 border-b-2
shadow-sm
hover:scale-105 active:scale-95
transition-all
```

#### Locked Node

```
w-[64px] h-[64px] sm:w-[72px] sm:h-[72px]
bg-stone-200 rounded-full
border-4 border-white border-b-[6px] border-b-stone-300
shadow-sm cursor-not-allowed
```

### 3.6 Toast Notifications

```
fixed bottom-6 left-1/2 -translate-x-1/2 z-toast
bg-white px-5 py-4 rounded-3xl
shadow-lg border-2 border-slate-100 border-b-4
min-w-[320px]
/* Error variant: border-b-red-200 */
/* Default variant: border-b-slate-200 */
```

### 3.7 Sidebar Item (Active State)

```
/* Active */
bg-[#ddf4ff] border-2 border-b-4 border-[#147bb0]

/* Inactive */
text-gray-400 hover:text-gray-600 hover:bg-gray-100
border-2 border-transparent hover:border-gray-200 hover:border-b-4
```

### 3.8 Micro-label / Badge Pill

```
text-[10px] font-black uppercase tracking-widest
px-3 py-1.5 rounded-full
/* Green variant: */
text-[#58CC02] bg-[#58CC02]/10 border border-[#58CC02]/20
```

### 3.9 Tags / Info Pills

```
bg-slate-50 border border-slate-200
rounded-xl px-3 py-1.5
text-[11px] font-black text-slate-400
uppercase tracking-wider
```

---

## 4. Animations & Keyframes

### 4.1 CSS Keyframes (globals.css)

```css
/* Error shake */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

/* Success bounce */
@keyframes bounce-success {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Heart loss pulse */
@keyframes pulse-heart {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(0.7); }
}

/* Lesson node entrance */
@keyframes lessonNodeIn {
  from { opacity: 0; transform: translateY(12px) scale(0.85); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Progress bar stripes */
@keyframes pushScroll {
  from { transform: translateX(0); }
  to { transform: translateX(24px); }
}

/* Card shine sweep */
@keyframes shimmer {
  0% { transform: translateX(-150%) skewX(12deg); }
  100% { transform: translateX(150%) skewX(12deg); }
}

/* Gentle breathing hover */
@keyframes breathe {
  0%, 100% { transform: scale(1) translateY(0); }
  50% { transform: scale(1.04) translateY(-4px); }
}

/* Floating decorative elements */
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
  50% { transform: translateY(-8px) rotate(10deg); opacity: 0.9; }
}
```

### 4.2 Utility Classes (globals.css)

```css
.shake { animation: shake 0.5s ease-in-out; }
.bounce-success { animation: bounce-success 0.5s ease-in-out; }
.pulse-heart { animation: pulse-heart 0.3s ease-in-out; }

/* 3D flip card support */
.perspective-1000 { perspective: 1000px; }
.transform-style-3d { transform-style: preserve-3d; }
.rotate-y-180 { transform: rotateY(180deg); }
.backface-hidden { backface-visibility: hidden; }
```

### 4.3 Tailwind Animate Plugin

```ts
// tailwind.config.ts
plugins: [require("tailwindcss-animate")]

// Used classes: animate-in, fade-in, zoom-in, slide-in-from-bottom-*
// Example: "animate-in fade-in zoom-in duration-300"
```

---

## 5. Scrollbar Styling

```css
::-webkit-scrollbar { width: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 5px; }
::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
* { scrollbar-width: thin; scrollbar-color: #e5e7eb transparent; }
```

---

## 6. Island Theme Palette (Unit Cards)

Each learning unit uses a rotating color theme:

| Index | Background | Text | Dark (Border) | Trail |
|---|---|---|---|---|
| 0 | `#ddf4ff` | `#1899d6` | `#147bb0` | `#a3dffd` |
| 1 | `#f0f8e2` | `#58cc02` | `#46a302` | `#c7ebb1` |
| 2 | `#ffecf0` | `#ff4b4b` | `#ea2b2b` | `#ffc1cc` |
| 3 | `#fff0d4` | `#ff9600` | `#d67b00` | `#ffe0a3` |
| 4 | `#eeecff` | `#ce82ff` | `#a547d9` | `#dcb8ff` |

---

## 7. Quick-Start Snippet for New Next.js Project

```tsx
// layout.tsx
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className={`${nunito.className} bg-slate-50`}>
        {children}
      </body>
    </html>
  );
}
```

```css
/* globals.css — minimum viable HD Play setup */
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');

html, body, :root {
  min-height: 100vh;
  font-family: 'Nunito', sans-serif;
}
```

```tsx
// Hero section with HD Play background
<div className="relative min-h-screen bg-white overflow-hidden">
  {/* Dot pattern */}
  <div className="pointer-events-none absolute inset-0 z-0
       bg-[radial-gradient(#e5e7eb_2px,transparent_2px)]
       [background-size:24px_24px] opacity-40" />

  {/* Floating blobs */}
  <div className="absolute -left-32 top-10 z-0 h-96 w-96
       rounded-full bg-green-400/20 blur-3xl" />
  <div className="absolute -right-32 top-1/2 z-0 h-96 w-96
       -translate-y-1/2 rounded-full bg-sky-400/15 blur-3xl" />

  {/* Content */}
  <main className="relative z-10">
    {/* Your content here */}
  </main>
</div>
```

---

## 8. Dependencies

| Package | Purpose |
|---|---|
| `tailwindcss` | Utility CSS |
| `tailwindcss-animate` | `animate-in`, `fade-in`, `zoom-in` utilities |
| `class-variance-authority` | Button variant system (CVA) |
| `clsx` + `tailwind-merge` | `cn()` utility for conditional classes |
| `framer-motion` | Page transitions, breathing animations |
| `lucide-react` | Icon library |
| `next/font/google` | Nunito font loading |

---

> **Document generated**: 2026-04-23 · Extracted from `myduolingo` codebase.
> **Source files audited**: `tailwind.config.ts`, `globals.css`, `button.tsx`, `empty-state.tsx`, `landing-cta.tsx`, `sidebar.tsx`, `unit-card-island.tsx`, `profile-hero.tsx`, `achievements-list.tsx`, `custom-toast.tsx`, `evaluation/page.tsx`, `page.tsx`, `layout.tsx`.
