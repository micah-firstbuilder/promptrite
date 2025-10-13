"use client";

import {
  Calendar,
  Check,
  CheckCircle,
  ExternalLink,
  LayoutGrid,
  MailCheck,
  SearchCheck,
  Share2,
  Table2,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";

export default function EloPage() {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="min-h-screen bg-muted">
      <DashboardHeader activeRoute="elo" />

      {/* Main Content */}
      <main className="flex items-center justify-center px-4 py-10">
        <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          {/* Profile photo */}
          <div className="relative flex w-full flex-shrink-0 items-center justify-center bg-muted p-6">
            <img
              alt="Profile"
              className="h-80 w-72 rounded-xl border-4 border-white object-cover shadow-lg"
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop"
            />
            {/* ELO Badge */}
            <span className="absolute bottom-6 left-6 flex items-center gap-1 rounded-xl bg-card/90 px-3 py-1 font-medium text-muted-foreground text-xs shadow ring-1 ring-border">
              <Trophy className="h-3.5 w-3.5" />
              ELO 1420
            </span>
            {/* Share */}
            <button
              aria-label="Share profile"
              className="absolute top-6 right-6 rounded-full bg-card/90 p-2 shadow ring-1 ring-border transition hover:bg-card"
              onClick={handleShare}
              title="Share profile"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Profile content/statistics */}
          <div className="flex flex-1 flex-col gap-6 p-7">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-2xl tracking-tight">
                  Alex Rivera
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-muted px-2 font-medium text-muted-foreground text-xs ring-1 ring-border">
                  <CheckCircle className="h-3.5 w-3.5" /> Verified
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-muted-foreground text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  27 challenges
                </span>
                <span className="select-none text-border">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  7-day streak
                </span>
              </div>
              <p className="mt-4 text-card-foreground leading-relaxed">
                I practice real AI challenges daily. Focused on concise prompts,
                clear constraints, and measurable outcomes.
              </p>
            </div>

            {/* Key challenges completed */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-1 flex-col items-start rounded-lg bg-muted p-3 shadow-sm ring-1 ring-border">
                <div className="flex items-center gap-2">
                  <MailCheck className="h-4 w-4" />
                  <span className="text-muted-foreground text-xs uppercase tracking-wider">
                    Challenge
                  </span>
                </div>
                <span className="mt-1 font-medium text-sm tracking-tight">
                  Concise Follow-up Email
                </span>
                <span className="mt-0.5 text-muted-foreground text-xs">
                  Score 86/100
                </span>
              </div>
              <div className="flex flex-1 flex-col items-start rounded-lg bg-muted p-3 shadow-sm ring-1 ring-border">
                <div className="flex items-center gap-2">
                  <SearchCheck className="h-4 w-4" />
                  <span className="text-muted-foreground text-xs uppercase tracking-wider">
                    Challenge
                  </span>
                </div>
                <span className="mt-1 font-medium text-sm tracking-tight">
                  Market Research Sprint
                </span>
                <span className="mt-0.5 text-muted-foreground text-xs">
                  Score 91/100
                </span>
              </div>
              <div className="flex flex-1 flex-col items-start rounded-lg bg-muted p-3 shadow-sm ring-1 ring-border">
                <div className="flex items-center gap-2">
                  <Table2 className="h-4 w-4" />
                  <span className="text-muted-foreground text-xs uppercase tracking-wider">
                    Challenge
                  </span>
                </div>
                <span className="mt-1 font-medium text-sm tracking-tight">
                  Data Cleanup Prompt
                </span>
                <span className="mt-0.5 text-muted-foreground text-xs">
                  Score 88/100
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between gap-3">
              <button
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2 font-semibold text-primary-foreground shadow transition hover:bg-primary/90"
                onClick={handleShare}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    Share
                  </>
                )}
              </button>
              <Link
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-background py-2 font-medium text-foreground shadow transition hover:bg-muted"
                href="/dashboard"
              >
                <ExternalLink className="h-4 w-4" />
                View Profile
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
