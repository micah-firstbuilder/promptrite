"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { trpc } from "@/app/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeCard } from "@/components/profile/BadgeCard";
import { Heatmap } from "@/components/profile/Heatmap";
import { RecentChallengeItem } from "@/components/profile/RecentChallengeItem";

interface ApiUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  elo_rating: number;
  created_at: string | Date;
}

interface ProfileResponse {
  user: ApiUser;
  stats: {
    totalSubmissions: number;
    totalSolvedChallenges: number;
    currentStreak: number;
    maxStreak: number;
  };
  activity: Array<{ date: string; count: number }>;
  badges: Array<{
    id: string;
    label: string;
    description: string;
    earned: boolean;
    progress?: { current: number; required: number };
  }>;
  recentChallenges: Array<{
    id: number;
    title: string;
    difficulty: string;
    category: string;
    created_at: string;
    score: number;
  }>;
}

export default function ProfilePage() {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [form, setForm] = useState({ first_name: "", last_name: "", username: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const updateUser = trpc.user.update.useMutation();

  const { data: me } = trpc.user.me.useQuery(undefined, { staleTime: 30_000 });
  const profileQuery = trpc.profile.byKey.useQuery(
    { key: (me?.username || me?.id || "").toString() },
    { enabled: Boolean(me?.username || me?.id) }
  );
  useEffect(() => {
    if (me) {
      const data = me as ApiUser;
      setUser(data);
      setForm({ first_name: data.first_name ?? "", last_name: data.last_name ?? "", username: data.username ?? "" });
    }
  }, [me]);
  useEffect(() => {
    if (profileQuery.data) setProfile(profileQuery.data as unknown as ProfileResponse);
    const onUpdate = async () => {
      await profileQuery.refetch();
    };
    const onFocus = () => { void onUpdate(); };
    if (typeof window !== "undefined") {
      window.addEventListener("progress-updated", onUpdate);
      window.addEventListener("focus", onFocus);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("progress-updated", onUpdate);
        window.removeEventListener("focus", onFocus);
      }
    };
  }, [profileQuery]);

  const initials = `${(user?.first_name?.[0] ?? "").toUpperCase()}${(user?.last_name?.[0] ?? "").toUpperCase()}`;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader activeRoute="dashboard" />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted font-semibold text-xl">
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
                <div className="font-medium text-foreground">
                  {user?.username || "—"}
                </div>
              </div>
              <div className="rounded-md border border-border p-4">
                <div className="text-muted-foreground text-sm">ELO Rating</div>
                <div className="font-medium text-foreground">{profile?.user.elo_rating ?? user?.elo_rating ?? 1200}</div>
              </div>
            </div>
            {(!user?.first_name || !user?.last_name || !user?.username) && (
              <div className="rounded-lg border border-dashed border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-foreground">Complete your profile</div>
                    <p className="text-muted-foreground text-sm">Add your name and a username to unlock badges and a public profile page.</p>
                  </div>
                </div>
                <form
                  className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      setSaving(true);
                      setSaveError(null);
                      const payload: { first_name?: string; last_name?: string; username?: string } = {};
                      const fn = form.first_name?.trim();
                      const ln = form.last_name?.trim();
                      const un = form.username?.trim();
                      if (fn) payload.first_name = fn;
                      if (ln) payload.last_name = ln;
                      if (un) payload.username = un;
                      const updated = await updateUser.mutateAsync(payload);
                      setUser(updated as unknown as ApiUser);
                      await profileQuery.refetch();
                    } catch (err: any) {
                      setSaveError(err?.message || "Failed to save profile");
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  <input
                    aria-label="First name"
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="First name"
                    value={form.first_name}
                    onChange={(e) => setForm((s) => ({ ...s, first_name: e.target.value }))}
                  />
                  <input
                    aria-label="Last name"
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Last name"
                    value={form.last_name}
                    onChange={(e) => setForm((s) => ({ ...s, last_name: e.target.value }))}
                  />
                  <input
                    aria-label="Username"
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Username"
                    pattern="^[a-zA-Z0-9_\-\.]{3,20}$"
                    title="3-20 chars, letters, numbers, underscore, dash, dot"
                    value={form.username}
                    onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
                  />
                  <button className="rounded-md bg-primary px-3 py-2 text-white text-sm disabled:opacity-50" disabled={saving} type="submit">
                    {saving ? "Saving..." : "Save"}
                  </button>
                </form>
                {saveError && (
                  <p className="mt-2 text-destructive text-sm" role="alert">{saveError}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Badges */}
        <section className="mt-6">
          <div className="mb-3 font-semibold text-foreground">Badges</div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {profile?.badges?.map((b) => (
              <BadgeCard key={b.id} label={b.label} description={b.description} earned={b.earned} progress={b.progress} />
            ))}
          </div>
        </section>

        {/* Activity Heatmap */}
        <section className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity in the past year</CardTitle>
            </CardHeader>
            <CardContent>
              {profile?.activity && <Heatmap data={profile.activity} />}
              <div className="mt-3 text-muted-foreground text-sm">
                Total submissions: {profile?.stats.totalSubmissions ?? 0} • Max streak: {profile?.stats.maxStreak ?? 0} • Current: {profile?.stats.currentStreak ?? 0}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tabs */}
        <section className="mt-6">
          <Tabs className="space-y-4" defaultValue="recent">
            <TabsList>
              <TabsTrigger value="recent">Recent Challenges</TabsTrigger>
              <TabsTrigger value="badges">All Badges</TabsTrigger>
            </TabsList>
            <TabsContent value="recent" className="space-y-3">
              {profile?.recentChallenges?.map((c) => (
                <RecentChallengeItem key={`${c.id}-${c.created_at}`} {...c} />
              ))}
            </TabsContent>
            <TabsContent value="badges">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {profile?.badges?.map((b) => (
                  <BadgeCard key={`all-${b.id}`} label={b.label} description={b.description} earned={b.earned} progress={b.progress} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}
