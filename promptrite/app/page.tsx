"use client";

import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Calendar,
  Check,
  CheckCircle,
  ChevronRight,
  Compass,
  Gamepad2,
  Gauge,
  Keyboard,
  LayoutGrid,
  Lock,
  Map,
  Menu,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Type,
  Users,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useState } from "react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-neutral-900 antialiased selection:bg-black/10">
      {/* NAV */}
      <header className="relative z-20">
        <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand */}
            <a className="group inline-flex items-center gap-2" href="#">
              <Image
                alt="AIPREP"
                className="h-[75px] w-auto"
                height={32}
                src="/aipreplogo.png"
                width={120}
              />
            </a>
            {/* Desktop Nav */}
            <div className="hidden items-center gap-2 md:flex">
              <a
                className="rounded-full border-background bg-background px-3 py-1.5 font-medium text-neutral-900 text-sm ring-1 ring-black/10 transition hover:bg-black/10"
                href="#how"
              >
                How it works
              </a>
              <a
                className="rounded-full bg-background px-3 py-1.5 font-medium text-neutral-600 text-sm ring-1 ring-black/10 transition hover:bg-black/10 hover:text-neutral-900"
                href="#who"
              >
                Who it's for
              </a>
              <a
                className="rounded-full bg-background px-3 py-1.5 font-medium text-neutral-600 text-sm ring-1 ring-black/10 transition hover:bg-black/10 hover:text-neutral-900"
                href="#proof"
              >
                Social proof
              </a>
            </div>
            {/* Actions */}
            <div className="hidden items-center gap-3 md:flex">
              <SignedOut>
                <a
                  className="font-medium text-neutral-700 text-sm transition hover:text-neutral-900"
                  href="/sign-in"
                >
                  Sign in
                </a>
              </SignedOut>
              <SignedIn>
                <a
                  className="font-medium text-neutral-700 text-sm transition hover:text-neutral-900"
                  href="/dashboard"
                >
                  Dashboard
                </a>
                <UserButton appearance={{ elements: { userButtonAvatarBox: "h-8 w-8" } }} />
              </SignedIn>
              <a
                className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 font-semibold text-sm text-white transition hover:bg-neutral-800"
                href="#cta"
              >
                <Target className="h-4 w-4" />
                Start free
              </a>
            </div>
            {/* Mobile menu */}
            <button
              aria-label="Open menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-black/5 ring-1 ring-black/10 transition hover:bg-black/10 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-neutral-900" />
              ) : (
                <Menu className="h-5 w-5 text-neutral-900" />
              )}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="mt-2 border-black/10 border-t pt-2 pb-3 md:hidden">
              <div className="grid gap-2">
                <a
                  className="rounded-lg bg-black/5 px-3 py-2 font-medium text-neutral-900 text-sm ring-1 ring-black/10"
                  href="#how"
                >
                  How it works
                </a>
                <a
                  className="rounded-lg bg-black/5 px-3 py-2 font-medium text-neutral-700 text-sm ring-1 ring-black/10"
                  href="#who"
                >
                  Who it's for
                </a>
                <a
                  className="rounded-lg bg-black/5 px-3 py-2 font-medium text-neutral-700 text-sm ring-1 ring-black/10"
                  href="#proof"
                >
                  Social proof
                </a>
                <div className="flex items-center justify-between gap-2 pt-2">
                  <SignedOut>
                    <a className="font-medium text-neutral-700 text-sm" href="/sign-in">
                      Sign in
                    </a>
                  </SignedOut>
                  <SignedIn>
                    <a className="font-medium text-neutral-700 text-sm" href="/dashboard">
                      Dashboard
                    </a>
                  </SignedIn>
                  <a
                    className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 font-semibold text-sm text-white transition hover:bg-neutral-800"
                    href="#cta"
                  >
                    <Target className="h-4 w-4" />
                    Start free
                  </a>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* HERO with fullscreen video */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Video background */}
        <div className="absolute inset-0">
          <video
            autoPlay
            className="h-full w-full object-cover"
            loop
            muted
            playsInline
            preload="auto"
          >
            <source
              src="https://res.cloudinary.com/ddjc8gbnz/video/upload/v1760106742/FLORA_Untitled_u8qidl.mp4"
              type="video/mp4"
            />
          </video>
          {/* Light overlays to keep text legible while preserving a light look */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.85),transparent_55%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/80 to-white" />
        </div>

        {/* Content */}
        <div className="relative z-10 mr-auto ml-auto max-w-6xl pt-24 pr-4 pb-24 pl-4 sm:px-6 sm:pt-28 sm:pb-40 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 ring-1 ring-black/10 backdrop-blur">
              <Compass className="h-4 w-4 text-neutral-700" />
              <span className="font-medium text-neutral-700 text-xs">
                Rite of Passage to AI Mastery
              </span>
            </div>

            {/* Pattern interruption line */}
            <p className="mt-6 text-neutral-600 text-sm sm:text-base">
              You think you're good with AI?{" "}
              <span className="font-semibold text-neutral-900">Prove it.</span>
            </p>

            <h1 className="mt-3 text-balance font-light text-4xl tracking-tighter sm:text-5xl lg:text-7xl">
              Get Good With AI — The Rite of Passage to AI Mastery
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-base text-neutral-700 sm:text-lg">
              Play real AI challenges, learn how to prompt like a pro, and earn
              your AI Score (ELO) to track your progress.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <a
                className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 font-semibold text-sm text-white transition hover:bg-neutral-800 sm:text-base"
                href="#cta"
              >
                <span>🎯</span>
                Take Your First Challenge
              </a>
              <a
                className="inline-flex items-center gap-2 rounded-full bg-black/5 px-5 py-3 font-medium text-neutral-900 text-sm ring-1 ring-black/10 backdrop-blur transition hover:bg-black/10 sm:text-base"
                href="#insight"
              >
                <Play className="h-4 w-4" />
                See a quick demo
              </a>
            </div>

            {/* ELO preview / progress card */}
            <div className="mx-auto mt-10 max-w-xl">
              <div className="rounded-2xl bg-white p-4 ring-1 ring-black/10 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-black/5 ring-1 ring-black/10">
                      <Trophy className="h-4 w-4 text-amber-500" />
                    </span>
                    <div>
                      <p className="text-neutral-500 text-xs uppercase tracking-wider">
                        AI ELO
                      </p>
                      <p className="font-semibold text-base tracking-tight">
                        1420
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-neutral-500 text-xs">Next tier</p>
                    <p className="font-medium text-sm">Pro 1500</p>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10">
                  <div className="h-full w-[68%] animate-pulse rounded-full bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400" />
                </div>
                <div className="mt-3 flex items-center justify-between text-neutral-600 text-xs">
                  <span className="inline-flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5" />
                    +35 last challenge
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    7‑day streak
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Target className="h-3.5 w-3.5" />
                    Goal: 1500
                  </span>
                </div>
              </div>
            </div>

            {/* Prompt demo card */}
            <div
              className="mx-auto mt-6 max-w-2xl rounded-2xl bg-black/5 ring-1 ring-black/10 backdrop-blur"
              id="insight"
            >
              <div className="p-4 text-left sm:p-5">
                <div className="flex items-center justify-between">
                  <p className="text-neutral-500 text-xs">Prompt attempt</p>
                  <span className="inline-flex items-center gap-1 text-emerald-600 text-xs">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Scored
                  </span>
                </div>
                <div className="mt-2 rounded-xl bg-white p-3 ring-1 ring-black/10">
                  <p className="text-neutral-700 text-sm">
                    "Draft a friendly follow‑up email reminding the client of
                    tomorrow's 10am call. Keep it under 90 words and include a
                    short agenda."
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white p-3 ring-1 ring-black/10">
                    <p className="text-[11px] text-neutral-500 uppercase tracking-wider">
                      Score
                    </p>
                    <p className="mt-1 font-semibold text-lg">86 / 100</p>
                  </div>
                  <div className="rounded-xl bg-white p-3 ring-1 ring-black/10">
                    <p className="text-[11px] text-neutral-500 uppercase tracking-wider">
                      Tips
                    </p>
                    <p className="mt-1 text-neutral-700 text-sm">
                      Specify tone and call‑to‑action for clarity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Emotional Hook */}
      <section className="-mt-10 relative z-10 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-black/5 p-6 ring-1 ring-black/10 backdrop-blur sm:p-8">
            <h2 className="font-semibold text-3xl tracking-tight sm:text-4xl">
              AI Is Everywhere — But Most People Use It Wrong
            </h2>
            <p className="mt-3 text-base text-neutral-700">
              Most people type random stuff into ChatGPT and hope for magic. The
              real skill is knowing how to talk to AI — and that's what
              separates casual users from power users.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Random prompt */}
              <div className="rounded-2xl bg-white p-4 ring-1 ring-black/10">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm">
                    <Keyboard className="h-4 w-4 text-neutral-700" />
                    Random Prompt
                  </span>
                  <span className="text-neutral-500 text-xs">Meh Output</span>
                </div>
                <div className="mt-3 rounded-xl bg-black/5 p-3 ring-1 ring-black/10">
                  <p className="text-neutral-700 text-sm">
                    "Write a marketing email about our product."
                  </p>
                </div>
                <div className="mt-2 rounded-xl bg-black/5 p-3 ring-1 ring-black/10">
                  <p className="text-neutral-600 text-sm">
                    Generic, too long, no clear CTA.
                  </p>
                </div>
              </div>
              {/* Smart prompt */}
              <div className="rounded-2xl bg-white p-4 ring-1 ring-black/10">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm">
                    <Wand2 className="h-4 w-4 text-emerald-600" />
                    Smart Prompt
                  </span>
                  <span className="text-neutral-500 text-xs">Wow Output</span>
                </div>
                <div className="mt-3 rounded-xl bg-black/5 p-3 ring-1 ring-black/10">
                  <p className="text-neutral-700 text-sm">
                    "Write a 90‑word email to warm leads announcing our 20%
                    launch discount, friendly tone, highlight 2 benefits, and
                    end with 'Book a 10‑min demo' CTA."
                  </p>
                </div>
                <div className="mt-2 rounded-xl bg-black/5 p-3 ring-1 ring-black/10">
                  <p className="text-neutral-700 text-sm">
                    Concise, compelling, clear CTA — results you can use.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Insight */}
      <section className="relative z-10 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <h3 className="font-semibold text-3xl tracking-tight sm:text-4xl">
                You Don't Learn AI by Watching Tutorials — You Learn by Doing.
              </h3>
              <p className="mt-4 text-base text-neutral-700">
                AIPREP turns learning AI into a game. Each challenge helps you
                practice real-world prompting, get feedback, and see your skills
                (and score) grow.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 ring-1 ring-black/10">
                  <Gamepad2 className="h-4 w-4" />
                  <span className="text-xs">Challenge-based learning</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 ring-1 ring-black/10">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-xs">Actionable feedback</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-6">
              {/* Dashboard mockup */}
              <div className="rounded-2xl bg-white p-5 ring-1 ring-black/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-black/5 ring-1 ring-black/10">
                      <LayoutGrid className="h-4 w-4" />
                    </span>
                    <p className="font-semibold text-sm tracking-tight">
                      Dashboard
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-neutral-600 text-xs">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Private by design
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-black/5 p-3 ring-1 ring-black/10">
                    <p className="text-[11px] text-neutral-500 uppercase tracking-wider">
                      ELO
                    </p>
                    <p className="mt-1 font-semibold text-lg">1420</p>
                  </div>
                  <div className="rounded-xl bg-black/5 p-3 ring-1 ring-black/10">
                    <p className="text-[11px] text-neutral-500 uppercase tracking-wider">
                      Challenges
                    </p>
                    <p className="mt-1 font-semibold text-lg">27</p>
                  </div>
                  <div className="rounded-xl bg-black/5 p-3 ring-1 ring-black/10">
                    <p className="text-[11px] text-neutral-500 uppercase tracking-wider">
                      Streak
                    </p>
                    <p className="mt-1 font-semibold text-lg">7 days</p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-black/5 p-4 ring-1 ring-black/10">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm tracking-tight">
                      Challenge completed
                    </p>
                    <span className="inline-flex items-center gap-1 text-emerald-600 text-xs">
                      <Star className="h-3.5 w-3.5" />
                      +35 ELO
                    </span>
                  </div>
                  <p className="mt-2 text-neutral-700 text-sm">
                    Tip: Add constraints (format, tone, length) to boost clarity
                    and quality.
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10">
                    <div className="h-full w-3/4 rounded-full bg-emerald-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How it works */}
      <section className="relative z-10 pb-16" id="how">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-black/5 p-6 ring-1 ring-black/10 backdrop-blur sm:p-8">
            <h3 className="font-semibold text-3xl tracking-tight sm:text-4xl">
              How It Works
            </h3>
            <p className="mt-2 text-base text-neutral-700">
              Remove friction and grow fast — four steps, zero fluff.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              {/* Step 1 */}
              <article className="flex min-h-[260px] flex-col justify-between rounded-2xl bg-white p-5 ring-1 ring-black/10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/5 ring-1 ring-black/10">
                      <Map className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg tracking-tight">
                        Pick a Challenge
                      </h4>
                      <p className="text-neutral-500 text-xs uppercase tracking-wider">
                        Real tasks
                      </p>
                    </div>
                  </div>
                  <p className="text-neutral-700 text-sm">
                    Choose a real-life task (write an email, plan a trip, design
                    a logo).
                  </p>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/10">
                  <div
                    className="h-full rounded-full bg-neutral-400"
                    style={{ width: "25%" }}
                  />
                </div>
              </article>

              {/* Step 2 */}
              <article className="flex min-h-[260px] flex-col justify-between rounded-2xl bg-white p-5 ring-1 ring-black/10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/5 ring-1 ring-black/10">
                      <Type className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg tracking-tight">
                        Talk to AI
                      </h4>
                      <p className="text-neutral-500 text-xs uppercase tracking-wider">
                        Your prompt
                      </p>
                    </div>
                  </div>
                  <p className="text-neutral-700 text-sm">
                    Type your best instructions — the clearer the guidance, the
                    better the results.
                  </p>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/10">
                  <div
                    className="h-full rounded-full bg-neutral-400"
                    style={{ width: "50%" }}
                  />
                </div>
              </article>

              {/* Step 3 */}
              <article className="flex min-h-[260px] flex-col justify-between rounded-2xl bg-white p-5 ring-1 ring-black/10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/5 ring-1 ring-black/10">
                      <Gauge className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg tracking-tight">
                        Get Feedback
                      </h4>
                      <p className="text-neutral-500 text-xs uppercase tracking-wider">
                        Scored
                      </p>
                    </div>
                  </div>
                  <p className="text-neutral-700 text-sm">
                    We score your result and show exactly how to improve next
                    time.
                  </p>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/10">
                  <div
                    className="h-full rounded-full bg-neutral-400"
                    style={{ width: "75%" }}
                  />
                </div>
              </article>

              {/* Step 4 */}
              <article className="flex min-h-[260px] flex-col justify-between rounded-2xl bg-white p-5 ring-1 ring-black/10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/5 ring-1 ring-black/10">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg tracking-tight">
                        Level Up
                      </h4>
                      <p className="text-neutral-500 text-xs uppercase tracking-wider">
                        ELO + unlocks
                      </p>
                    </div>
                  </div>
                  <p className="text-neutral-700 text-sm">
                    Boost your ELO score and unlock advanced challenges as you
                    grow.
                  </p>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/10">
                  <div
                    className="h-full rounded-full bg-neutral-400"
                    style={{ width: "100%" }}
                  />
                </div>
              </article>
            </div>

            <div className="mt-6 text-center">
              <a
                className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 font-semibold text-sm text-white transition hover:bg-neutral-800"
                href="#cta"
              >
                Start Your First Challenge — It's Free
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Who it's for */}
      <section className="relative z-10 pb-16" id="who">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h3 className="font-semibold text-3xl tracking-tight sm:text-4xl">
                Made for Curious Minds, Not Coders
              </h3>
              <p className="mt-3 text-base text-neutral-700">
                Whether you're a student, creator, teacher, or business owner —
                if you want to actually use AI (not just play with it), you
                belong here.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1.5 font-medium text-neutral-900 text-sm tracking-tight ring-1 ring-black/10 backdrop-blur hover:bg-black/10">
                <Users className="h-4 w-4" />
                Inclusive, practical, real-world
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {/* Avatar cards */}
                <div className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-black/10">
                  <img
                    alt="Creator"
                    className="h-40 w-full object-cover"
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop"
                  />
                  <div className="absolute right-2 bottom-2 left-2 flex items-center justify-between rounded-xl bg-white/70 px-2 py-1.5 ring-1 ring-black/10">
                    <span className="text-xs">Sarah • Creator</span>
                    <span className="inline-flex items-center gap-1 text-xs">
                      <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />{" "}
                      1480
                    </span>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-black/10">
                  <img
                    alt="Student"
                    className="h-40 w-full object-cover"
                    src="https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=400&auto=format&fit=crop"
                  />
                  <div className="absolute right-2 bottom-2 left-2 flex items-center justify-between rounded-xl bg-white/70 px-2 py-1.5 ring-1 ring-black/10">
                    <span className="text-xs">Noah • Student</span>
                    <span className="inline-flex items-center gap-1 text-xs">
                      <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />{" "}
                      1290
                    </span>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-black/10">
                  <img
                    alt="Teacher"
                    className="h-40 w-full object-cover"
                    src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=400&auto=format&fit=crop"
                  />
                  <div className="absolute right-2 bottom-2 left-2 flex items-center justify-between rounded-xl bg-white/70 px-2 py-1.5 ring-1 ring-black/10">
                    <span className="text-xs">Amira • Teacher</span>
                    <span className="inline-flex items-center gap-1 text-xs">
                      <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />{" "}
                      1355
                    </span>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-black/10">
                  <img
                    alt="Founder"
                    className="h-40 w-full object-cover"
                    src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=400&auto=format&fit=crop"
                  />
                  <div className="absolute right-2 bottom-2 left-2 flex items-center justify-between rounded-xl bg-white/70 px-2 py-1.5 ring-1 ring-black/10">
                    <span className="text-xs">Marcus • Founder</span>
                    <span className="inline-flex items-center gap-1 text-xs">
                      <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />{" "}
                      1410
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. What you'll get */}
      <section className="relative z-10 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-black/5 p-6 ring-1 ring-black/10 backdrop-blur sm:p-8">
            <h3 className="font-semibold text-3xl tracking-tight sm:text-4xl">
              What You'll Get
            </h3>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/10">
                <Check className="h-5 w-5 shrink-0 text-emerald-600" />
                <p className="text-base text-neutral-800">
                  Learn by Doing — Practice real-world AI tasks
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/10">
                <Check className="h-5 w-5 shrink-0 text-emerald-600" />
                <p className="text-base text-neutral-800">
                  Get Your AI Score (ELO) — Track your growth like a game
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/10">
                <Check className="h-5 w-5 shrink-0 text-emerald-600" />
                <p className="text-base text-neutral-800">
                  See Your Progress — Watch your skill rise over time
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/10">
                <Check className="h-5 w-5 shrink-0 text-emerald-600" />
                <p className="text-base text-neutral-800">
                  Build Real Skills — Learn to make AI work with you
                </p>
              </div>
            </div>
            <div className="mt-6">
              <a
                className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 font-semibold text-sm text-white transition hover:bg-neutral-800"
                href="#cta"
              >
                Take the First Challenge →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Social Proof */}
      <section className="relative z-10 pb-16" id="proof">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h3 className="text-center font-semibold text-3xl tracking-tight sm:text-4xl">
            Join Thousands Leveling Up Their AI Skills
          </h3>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    alt="Sarah"
                    className="h-10 w-10 rounded-full object-cover"
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop"
                  />
                  <div>
                    <p className="font-semibold text-sm tracking-tight">
                      Sarah
                    </p>
                    <p className="text-neutral-600 text-xs">Creator</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2 py-1 text-xs ring-1 ring-black/10">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" /> 1480
                </span>
              </div>
              <p className="mt-3 text-neutral-700 text-sm">
                "I finally understand how to make AI do what I want. It feels
                like a superpower."
              </p>
            </div>
            {/* Testimonial 2 */}
            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    alt="Marcus"
                    className="h-10 w-10 rounded-full object-cover"
                    src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop"
                  />
                  <div>
                    <p className="font-semibold text-sm tracking-tight">
                      Marcus
                    </p>
                    <p className="text-neutral-600 text-xs">
                      Small business owner
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2 py-1 text-xs ring-1 ring-black/10">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" /> 1410
                </span>
              </div>
              <p className="mt-3 text-neutral-700 text-sm">
                "It's like Duolingo, but for learning how to use AI."
              </p>
            </div>
            {/* Testimonial 3 */}
            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    alt="Lena"
                    className="h-10 w-10 rounded-full object-cover"
                    src="https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=200&auto=format&fit=crop"
                  />
                  <div>
                    <p className="font-semibold text-sm tracking-tight">Lena</p>
                    <p className="text-neutral-600 text-xs">Product designer</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2 py-1 text-xs ring-1 ring-black/10">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" /> 1455
                </span>
              </div>
              <p className="mt-3 text-neutral-700 text-sm">
                "My productivity jumped — I ship concepts in hours instead of
                days."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CTA */}
      <section className="relative z-10 pb-16" id="cta">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-black/5 ring-1 ring-black/10 backdrop-blur">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-40"
            >
              <div className="h-full w-full bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_50%)]" />
            </div>
            <div className="relative p-8 text-center sm:p-12">
              <h3 className="font-semibold text-4xl tracking-tight sm:text-5xl">
                Your AI Mastery Starts Here
              </h3>
              <p className="mt-3 text-base text-neutral-700 sm:text-lg">
                Try your first challenge now — get scored, get feedback, and
                start improving instantly.
              </p>
              <div className="mt-6">
                <a
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 font-semibold text-sm text-white transition hover:bg-neutral-800"
                  href="#"
                >
                  ✨ Take Your First Challenge
                </a>
                <p className="mt-2 text-neutral-600 text-xs">
                  It's free to start. No login needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Vision */}
      <section className="relative z-10 pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-black/5 p-6 ring-1 ring-black/10 backdrop-blur sm:p-8">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black/5 ring-1 ring-black/10">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-base text-neutral-800 sm:text-lg">
                  We believe everyone deserves to be fluent in AI — not
                  overwhelmed by it. AIPREP is your modern training ground to
                  become confident, creative, and AI-literate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-6 pb-12">
        <div className="rounded-3xl border border-black/10 bg-white p-8 backdrop-blur-2xl lg:p-12">
          <div className="mb-12 grid grid-cols-1 gap-12 lg:grid-cols-4">
            <div>
              <div className="mb-5 flex items-center">
                <Image
                  alt="AIPREP"
                  className="h-8 w-auto"
                  height={32}
                  src="/aipreplogo.png"
                  width={120}
                />
              </div>
              <p className="mb-6 text-neutral-600 text-sm leading-relaxed">
                Turn AI learning into a game. Practice real prompts, get
                feedback, and watch your ELO climb.
              </p>
              <div className="flex items-center gap-3">
                <a
                  aria-label="X"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 transition hover:border-black/20 hover:bg-black/5"
                  href="#"
                >
                  <svg
                    fill="none"
                    height="16"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    width="16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </a>
                <a
                  aria-label="LinkedIn"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 transition hover:border-black/20 hover:bg-black/5"
                  href="#"
                >
                  <svg
                    fill="none"
                    height="16"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    width="16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect height="12" width="4" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
                <a
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 transition hover:border-black/20 hover:bg-black/5"
                  href="#"
                >
                  <svg
                    fill="none"
                    height="16"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    width="16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect height="20" rx="5" ry="5" width="20" x="2" y="2" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="mb-4 font-medium text-sm uppercase tracking-wide">
                Product
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    className="text-neutral-600 text-sm transition hover:text-neutral-900"
                    href="#how"
                  >
                    How it works
                  </a>
                </li>
                <li>
                  <a
                    className="text-neutral-600 text-sm transition hover:text-neutral-900"
                    href="#cta"
                  >
                    Start a challenge
                  </a>
                </li>
                <li>
                  <a
                    className="text-neutral-600 text-sm transition hover:text-neutral-900"
                    href="#proof"
                  >
                    Testimonials
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-medium text-sm uppercase tracking-wide">
                Resources
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    className="text-neutral-600 text-sm transition hover:text-neutral-900"
                    href="#"
                  >
                    Prompting basics
                  </a>
                </li>
                <li>
                  <a
                    className="text-neutral-600 text-sm transition hover:text-neutral-900"
                    href="#"
                  >
                    Use cases
                  </a>
                </li>
                <li>
                  <a
                    className="text-neutral-600 text-sm transition hover:text-neutral-900"
                    href="#"
                  >
                    Community
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-medium text-sm uppercase tracking-wide">
                Company
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    className="text-neutral-600 text-sm transition hover:text-neutral-900"
                    href="#"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    className="text-neutral-600 text-sm transition hover:text-neutral-900"
                    href="#"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    className="text-neutral-600 text-sm transition hover:text-neutral-900"
                    href="#"
                  >
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-6 border-black/10 border-t pt-8 md:flex-row">
            <div className="flex flex-wrap items-center gap-6 text-neutral-500 text-xs">
              <span>© 2025 AIPREP. All rights reserved.</span>
              <a className="transition hover:text-neutral-700" href="#">
                Terms
              </a>
              <a className="transition hover:text-neutral-700" href="#">
                Privacy
              </a>
            </div>
            <div className="flex items-center gap-4 text-neutral-500 text-xs">
              <span className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5" />
                Private by design
              </span>
              <span className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-emerald-600" />
                Train by doing
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
