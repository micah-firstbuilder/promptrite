"use client";

import {
  Film,
  ImageIcon,
  Inbox,
  MessageSquare,
  Palette,
  Sparkles,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { LeaderboardRow } from "@/components/leaderboard-row";

// Leaderboard data
const DATA = {
  Design: [
    {
      name: "Ava Patel",
      avatar:
        "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=128&auto=format&fit=crop",
      messages: 287,
      score: 968,
      activity: 8,
      badge: "Design",
      catIcon: "palette",
    },
    {
      name: "Ethan Ross",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=128&auto=format&fit=crop",
      messages: 214,
      score: 742,
      activity: 6,
      badge: "Design",
      catIcon: "palette",
    },
    {
      name: "Sofia Nguyen",
      avatar:
        "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=128&auto=format&fit=crop",
      messages: 198,
      score: 705,
      activity: 7,
      badge: "Design",
      catIcon: "palette",
    },
    {
      name: "Leo Martins",
      avatar:
        "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=128&auto=format&fit=crop",
      messages: 152,
      score: 610,
      activity: 5,
      badge: "Design",
      catIcon: "palette",
    },
  ],
  Code: [
    {
      name: "Noah Kim",
      avatar:
        "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=128&auto=format&fit=crop",
      messages: 308,
      score: 1104,
      activity: 9,
      badge: "Code",
      catIcon: "sparkles",
    },
    {
      name: "Zara Singh",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=128&auto=format&fit=crop",
      messages: 255,
      score: 980,
      activity: 8,
      badge: "Code",
      catIcon: "sparkles",
    },
    {
      name: "Oliver Jackson",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=128&auto=format&fit=crop",
      messages: 230,
      score: 905,
      activity: 7,
      badge: "Code",
      catIcon: "sparkles",
    },
    {
      name: "Grace Park",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=128&auto=format&fit=crop",
      messages: 216,
      score: 880,
      activity: 7,
      badge: "Code",
      catIcon: "sparkles",
    },
  ],
  Image: [
    {
      name: "Mia Rodriguez",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=128&auto=format&fit=crop",
      messages: 179,
      score: 912,
      activity: 8,
      badge: "Image",
      catIcon: "image",
    },
    {
      name: "Kai Becker",
      avatar:
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=128&auto=format&fit=crop",
      messages: 140,
      score: 790,
      activity: 6,
      badge: "Image",
      catIcon: "image",
    },
    {
      name: "Nora Ali",
      avatar:
        "https://images.unsplash.com/photo-1524504388993-ec3579fee39f?q=80&w=128&auto=format&fit=crop",
      messages: 133,
      score: 764,
      activity: 7,
      badge: "Image",
      catIcon: "image",
    },
    {
      name: "Felix Anders",
      avatar:
        "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=128&auto=format&fit=crop",
      messages: 120,
      score: 701,
      activity: 6,
      badge: "Image",
      catIcon: "image",
    },
  ],
  Video: [
    {
      name: "Liam Chen",
      avatar:
        "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?q=80&w=128&auto=format&fit=crop",
      messages: 168,
      score: 876,
      activity: 7,
      badge: "Video",
      catIcon: "film",
    },
    {
      name: "Iris Romero",
      avatar:
        "https://images.unsplash.com/photo-1541534401786-2077eed87a72?q=80&w=128&auto=format&fit=crop",
      messages: 150,
      score: 842,
      activity: 7,
      badge: "Video",
      catIcon: "film",
    },
    {
      name: "Mason Lee",
      avatar:
        "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=128&auto=format&fit=crop",
      messages: 139,
      score: 799,
      activity: 6,
      badge: "Video",
      catIcon: "film",
    },
    {
      name: "Elena Petrova",
      avatar:
        "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=128&auto=format&fit=crop",
      messages: 129,
      score: 760,
      activity: 6,
      badge: "Video",
      catIcon: "film",
    },
  ],
};

type Category = "All" | "Design" | "Code" | "Image" | "Video";
type TimeRange = "6h" | "12h" | "24h" | "1w" | "all";

const iconMap = {
  palette: Palette,
  sparkles: Sparkles,
  image: ImageIcon,
  film: Film,
};

export default function LeaderboardPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("24h");

  // Get all data or filtered by category
  const getAllData = () => [
    ...DATA.Design,
    ...DATA.Code,
    ...DATA.Image,
    ...DATA.Video,
  ];

  const getFilteredData = () => {
    const data =
      selectedCategory === "All" ? getAllData() : DATA[selectedCategory];
    return [...data].sort((a, b) => b.score - a.score);
  };

  const leaderboardData = getFilteredData();

  const getCategoryColor = (badge: string) => {
    const colors = {
      Design: "text-category-design-foreground bg-category-design-muted",
      Code: "text-category-code-foreground bg-category-code-muted",
      Image: "text-category-image-foreground bg-category-image-muted",
      Video: "text-category-video-foreground bg-category-video-muted",
    };
    return colors[badge as keyof typeof colors] || "text-foreground bg-muted";
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader activeRoute="leaderboard" />

      {/* Page Header */}
      <header className="border-border border-b">
        <div className="mx-auto max-w-7xl px-6 py-8 md:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-semibold text-4xl tracking-tight sm:text-5xl">
                Leaderboard
              </h1>
              <p className="mt-2 text-muted-foreground text-sm">
                Live snapshot of top prompt problem solvers across design, code,
                image, and video.
              </p>
            </div>
            {/* Time range */}
            <div className="flex w-full items-center gap-2 rounded-full bg-muted p-1 sm:w-auto">
              {(["6h", "12h", "24h", "1w", "all"] as TimeRange[]).map(
                (range) => (
                  <button
                    className={`rounded-full px-3 py-1.5 font-medium text-xs transition-colors ${
                      selectedTimeRange === range
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    key={range}
                    onClick={() => setSelectedTimeRange(range)}
                  >
                    {range === "all" ? "All Time" : range}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-10 px-6 py-8 md:px-8">
        {/* Team Stats */}
        <section aria-labelledby="stats" className="space-y-4">
          <h2 className="font-semibold text-lg tracking-tight" id="stats">
            Team Stats
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-muted p-5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-muted-foreground text-xs">
                  Prompts Solved
                </span>
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-3 font-semibold text-2xl tracking-tight">
                1,248
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted p-5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-muted-foreground text-xs">
                  Active Solvers
                </span>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-3 font-semibold text-2xl tracking-tight">
                71
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted p-5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-muted-foreground text-xs">
                  Threads
                </span>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-3 font-semibold text-2xl tracking-tight">
                469
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted p-5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-muted-foreground text-xs">
                  Messages
                </span>
                <Inbox className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-3 font-semibold text-2xl tracking-tight">
                8,317
              </div>
            </div>
          </div>
        </section>

        {/* Awards */}
        <section aria-labelledby="awards" className="space-y-4">
          <h2 className="font-semibold text-lg tracking-tight" id="awards">
            Awards
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Design */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-muted p-5">
              <div className="-right-8 -top-10 absolute opacity-[0.05]">
                <Image
                  alt=""
                  className="h-56 w-56 rotate-12 object-cover"
                  height={224}
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop"
                  width={224}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-muted-foreground text-sm">
                    Design Ace
                  </p>
                  <h3 className="font-semibold text-xl tracking-tight">
                    Most approved comps
                  </h3>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-category-design-muted text-category-design-foreground">
                  <Palette className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <Image
                  alt="Ava portrait"
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
                  height={40}
                  src="https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=256&auto=format&fit=crop"
                  width={40}
                />
                <div>
                  <div className="font-medium text-sm">Ava Patel</div>
                  <div className="text-muted-foreground text-xs">
                    42 approved | 6 revisions
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt Strategy */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-muted p-5">
              <div className="-right-8 -top-10 absolute opacity-[0.05]">
                <Image
                  alt=""
                  className="h-56 w-56 rotate-12 object-cover"
                  height={224}
                  src="https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop"
                  width={224}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-muted-foreground text-sm">
                    Prompt Strategist
                  </p>
                  <h3 className="font-semibold text-xl tracking-tight">
                    Most accepted solutions
                  </h3>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-category-code-muted text-category-code-foreground">
                  <Sparkles className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <Image
                  alt="Noah portrait"
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
                  height={40}
                  src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=256&auto=format&fit=crop"
                  width={40}
                />
                <div>
                  <div className="font-medium text-sm">Noah Kim</div>
                  <div className="text-muted-foreground text-xs">
                    58 solutions | 92% accepted
                  </div>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-muted p-5">
              <div className="-right-8 -top-10 absolute opacity-[0.05]">
                <Image
                  alt=""
                  className="h-56 w-56 rotate-12 object-cover"
                  height={224}
                  src="https://images.unsplash.com/photo-1495567720989-cebdbdd97913?q=80&w=1200&auto=format&fit=crop"
                  width={224}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-muted-foreground text-sm">
                    Prompt Painter
                  </p>
                  <h3 className="font-semibold text-xl tracking-tight">
                    Highest acceptance
                  </h3>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-category-image-muted text-category-image-foreground">
                  <ImageIcon className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <Image
                  alt="Mia portrait"
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
                  height={40}
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop"
                  width={40}
                />
                <div>
                  <div className="font-medium text-sm">Mia Rodriguez</div>
                  <div className="text-muted-foreground text-xs">
                    78 images | 92% approved
                  </div>
                </div>
              </div>
            </div>

            {/* Video */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-muted p-5">
              <div className="-right-8 -top-10 absolute opacity-[0.05]">
                <Image
                  alt=""
                  className="h-56 w-56 rotate-12 object-cover"
                  height={224}
                  src="https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?q=80&w=1200&auto=format&fit=crop"
                  width={224}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-muted-foreground text-sm">
                    Frame Maestro
                  </p>
                  <h3 className="font-semibold text-xl tracking-tight">
                    Fastest delivery
                  </h3>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-category-video-muted text-category-video-foreground">
                  <Film className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <Image
                  alt="Liam portrait"
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
                  height={40}
                  src="https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?q=80&w=256&auto=format&fit=crop"
                  width={40}
                />
                <div>
                  <div className="font-medium text-sm">Liam Chen</div>
                  <div className="text-muted-foreground text-xs">
                    24 edits | 1.3d avg turnaround
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rankings */}
        <section aria-labelledby="rankings" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold text-lg tracking-tight" id="rankings">
              Rankings
            </h2>
            {/* Category filter */}
            <div className="flex w-full items-center gap-2 rounded-full bg-muted p-1 sm:w-auto">
              {(["All", "Design", "Code", "Image", "Video"] as Category[]).map(
                (cat) => (
                  <button
                    className={`rounded-full px-3 py-1.5 font-medium text-xs transition-colors ${
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-muted">
            <div className="grid grid-cols-12 px-4 py-3 text-muted-foreground text-xs uppercase tracking-wide sm:px-6">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5 sm:col-span-4">User</div>
              <div className="hidden sm:col-span-2 sm:block">Category</div>
              <div className="hidden md:col-span-2 md:block">Activity</div>
              <div className="col-span-2 text-right">Messages</div>
              <div className="col-span-2 text-right">Score</div>
            </div>

            <ul className="divide-y divide-border">
              {leaderboardData.map((item, idx) => {
                const Icon = iconMap[item.catIcon as keyof typeof iconMap];
                return (
                  <LeaderboardRow
                    activity={item.activity}
                    avatar={item.avatar}
                    badge={item.badge}
                    badgeColor={getCategoryColor(item.badge)}
                    badgeIcon={Icon}
                    key={idx}
                    messages={item.messages}
                    name={item.name}
                    rank={idx + 1}
                    score={item.score}
                  />
                );
              })}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
