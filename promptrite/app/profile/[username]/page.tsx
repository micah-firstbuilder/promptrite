import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeCard } from "@/components/profile/BadgeCard";
import { Heatmap } from "@/components/profile/Heatmap";
import { RecentChallengeItem } from "@/components/profile/RecentChallengeItem";
import { headers } from "next/headers";

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

async function getData(username: string) {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/profile/${username}`, { next: { revalidate: 30 } });
  if (!res.ok) return null;
  return (await res.json()) as any;
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const data = await getData(username);
  if (!data) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="text-muted-foreground">Profile not found.</div>
      </main>
    );
  }

  const initials = `${(data.user.first_name?.[0] ?? "").toUpperCase()}${(data.user.last_name?.[0] ?? "").toUpperCase()}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>{data.user.username || "Profile"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted text-xl font-semibold">
              {initials || "?"}
            </div>
            <div>
              <p className="font-medium text-foreground">
                {data.user.first_name || ""} {data.user.last_name || ""}
              </p>
              <p className="text-muted-foreground text-sm">ELO {data.user.elo_rating}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="mt-6">
        <div className="mb-3 font-semibold text-foreground">Badges</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {data.badges?.map((b: any) => (
            <BadgeCard key={b.id} label={b.label} description={b.description} earned={b.earned} progress={b.progress} />
          ))}
        </div>
      </section>

      <section className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Activity in the past year</CardTitle>
          </CardHeader>
          <CardContent>
            {data.activity && <Heatmap data={data.activity} />}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6">
        <Tabs className="space-y-4" defaultValue="recent">
          <TabsList>
            <TabsTrigger value="recent">Recent Challenges</TabsTrigger>
            <TabsTrigger value="badges">All Badges</TabsTrigger>
          </TabsList>
          <TabsContent value="recent" className="space-y-3">
            {data.recentChallenges?.map((c: any) => (
              <RecentChallengeItem key={`${c.id}-${c.created_at}`} {...c} />
            ))}
          </TabsContent>
          <TabsContent value="badges">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {data.badges?.map((b: any) => (
                <BadgeCard key={`all-${b.id}`} label={b.label} description={b.description} earned={b.earned} progress={b.progress} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return {
    title: `${username} • Profile`,
    openGraph: {
      title: `${username} • Profile`,
    },
  };
}




