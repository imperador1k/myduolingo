import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

// Language data with flags (emoji for simplicity)
const languages = [
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "es", name: "Espanhol", flag: "🇪🇸" },
  { code: "fr", name: "Francês", flag: "🇫🇷" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "de", name: "Alemão", flag: "🇩🇪" },
  { code: "jp", name: "Japonês", flag: "🇯🇵" },
];

// Mascot characters placeholders
const MascotGroup = () => (
  <div className="relative flex flex-wrap items-center justify-center gap-4 p-8">
    {/* Row 1 */}
    <div className="flex gap-4">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-5xl shadow-lg">
        🦉
      </div>
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl shadow-lg">
        🐻
      </div>
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-100 text-5xl shadow-lg">
        🦊
      </div>
    </div>
    {/* Row 2 */}
    <div className="flex gap-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl shadow-lg">
        🐸
      </div>
      <div className="flex h-28 w-28 items-center justify-center rounded-full bg-purple-100 text-6xl shadow-lg">
        🦜
      </div>
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 text-4xl shadow-lg">
        🐰
      </div>
    </div>
  </div>
);

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🦉</span>
          <h1 className="text-2xl font-extrabold tracking-wide text-green-500">
            MyDuolingo
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/learn"
            className="font-bold uppercase tracking-wide text-slate-500 hover:text-green-500"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:flex-row lg:gap-16">
        {/* Left side - Mascots */}
        <div className="mb-8 lg:mb-0">
          <MascotGroup />
        </div>

        {/* Right side - CTA */}
        <div className="flex max-w-md flex-col items-center text-center lg:items-start lg:text-left">
          <h2 className="mb-4 text-3xl font-extrabold text-slate-700 lg:text-4xl">
            Aprende, pratica e domina novas línguas com o MyDuolingo.
          </h2>
          <p className="mb-8 text-lg text-slate-500">
            A forma gratuita, divertida e eficaz de aprender uma língua!
          </p>

          <div className="flex w-full flex-col gap-3">
            <Link href="/learn" className="w-full">
              <Button variant="primary" size="lg" className="w-full">
                Começar Agora
              </Button>
            </Link>
            <Link href="/learn" className="w-full">
              <Button variant="ghost" size="lg" className="w-full text-sky-500 hover:text-sky-600">
                Já tenho uma conta
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Language Selector */}
      <section className="border-t bg-slate-50 py-8">
        <div className="mx-auto max-w-4xl px-6">
          <h3 className="mb-6 text-center text-lg font-bold text-slate-600">
            Escolhe o teu idioma
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 transition-all hover:border-green-300 hover:bg-green-50"
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-bold text-slate-600">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-slate-400">
        <p>© 2026 MyDuolingo Clone - Projeto Educacional</p>
      </footer>
    </div>
  );
}
