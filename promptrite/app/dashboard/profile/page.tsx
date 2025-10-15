"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ApiUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  elo_rating: number;
  created_at: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<ApiUser | null>(null);

  useEffect(() => {
    const run = async () => {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = (await res.json()) as ApiUser;
        setUser(data);
      }
    };
    run();
  }, []);

  const initials = `${(user?.first_name?.[0] ?? "").toUpperCase()}${(user?.last_name?.[0] ?? "").toUpperCase()}`;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader activeRoute="dashboard" />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted text-xl font-semibold">
                {initials || "?"}
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {user?.first_name || ""} {user?.last_name || ""}
                </p>
                <p className="text-muted-foreground text-sm">{user?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-md border border-border p-4">
                <div className="text-muted-foreground text-sm">Username</div>
                <div className="font-medium text-foreground">{user?.username || "—"}</div>
              </div>
              <div className="rounded-md border border-border p-4">
                <div className="text-muted-foreground text-sm">ELO Rating</div>
                <div className="font-medium text-foreground">{user?.elo_rating ?? 1200}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


