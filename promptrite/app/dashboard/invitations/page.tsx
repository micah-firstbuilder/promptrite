"use client";

import { Mail } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { InvitationCard } from "@/components/invitation-card";

interface Invitation {
  id: string;
  from: {
    name: string;
    role: string;
    initials: string;
    color: string;
  };
  challengeId: number;
  what: string;
  category: "design" | "code" | "image" | "video";
  due: string;
}

const invitations: Invitation[] = [
  {
    id: "inv-1",
    from: {
      name: "Ava Reed",
      role: "Instructor",
      initials: "AR",
      color: "bg-category-design",
    },
    challengeId: 4,
    what: "Onboarding Flow",
    category: "design",
    due: "2025-10-20",
  },
  {
    id: "inv-2",
    from: {
      name: "Noah Patel",
      role: "Recruiter",
      initials: "NP",
      color: "bg-category-code",
    },
    challengeId: 5,
    what: "Build a REST Endpoint",
    category: "code",
    due: "2025-10-14",
  },
  {
    id: "inv-3",
    from: {
      name: "Studio Q",
      role: "Instructor",
      initials: "SQ",
      color: "bg-category-image",
    },
    challengeId: 9,
    what: "Short Product Teaser",
    category: "video",
    due: "2025-10-24",
  },
];

export default function InvitationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader activeRoute="invitations" />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-semibold text-2xl text-foreground">
            Your Invitations
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Challenge invitations from instructors and recruiters
          </p>
        </div>

        {/* Invitations Section */}
        <section className="overflow-hidden rounded-lg bg-card ring-1 ring-border ring-inset">
          <div className="flex items-center justify-between border-border border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" />
              <h3 className="font-medium text-base text-foreground">
                Invitations
              </h3>
            </div>
            <span className="text-muted-foreground text-xs">
              {invitations.length} new
            </span>
          </div>

          <div className="divide-y divide-border">
            {invitations.map((invitation) => (
              <InvitationCard
                category={invitation.category}
                challengeName={invitation.what}
                dueDate={invitation.due}
                from={invitation.from}
                key={invitation.id}
              />
            ))}
          </div>
        </section>

        {/* Empty State (hidden when there are invitations) */}
        {invitations.length === 0 && (
          <div className="py-24 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted ring-1 ring-border ring-inset">
              <Mail className="size-6 text-muted-foreground" />
            </div>
            <p className="mt-4 font-medium text-foreground text-lg tracking-tight">
              No invitations yet
            </p>
            <p className="mt-1 text-muted-foreground text-sm">
              When instructors or recruiters invite you to challenges, they'll
              appear here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
