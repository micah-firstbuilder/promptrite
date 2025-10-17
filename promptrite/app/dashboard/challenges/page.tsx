"use client";

import {
  Bookmark,
  Code2,
  ImageIcon,
  Inbox,
  MessageSquare,
  Palette,
  Play,
  RotateCcw,
  Search,
  Shapes,
  Video,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { ChallengeCard } from "@/components/challenge-card";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Category = "all" | "design" | "code" | "image" | "video";
type ChallengeType = "all" | "one-shot" | "multi-turn";

interface Challenge {
  id: number;
  title: string;
  subtitle: string;
  category: Exclude<Category, "all">;
  type: Exclude<ChallengeType, "all">;
  difficulty: string;
  time: string;
  completion: number;
  cover: string;
  tasks: string[];
}

const challenges: Challenge[] = [
  {
    id: 1,
    title: "Landing Page Revamp",
    subtitle: "Wireframe and refine a hero section for a product",
    category: "design",
    type: "one-shot",
    difficulty: "Easy",
    time: "20–30 min",
    completion: 78,
    cover:
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=1200&auto=format&fit=crop",
    tasks: [
      "Create a responsive hero layout",
      "Choose a color system and type scale",
      "Export a quick preview",
    ],
  },
  {
    id: 2,
    title: "Refactor Utilities",
    subtitle: "Improve a small helper library",
    category: "code",
    type: "multi-turn",
    difficulty: "Medium",
    time: "45–60 min",
    completion: 64,
    cover:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop",
    tasks: [
      "Discuss current approach",
      "Add tests and refactor",
      "Iterate based on feedback",
    ],
  },
  {
    id: 3,
    title: "Prompted Poster",
    subtitle: "Generate a minimal poster from a short brief",
    category: "image",
    type: "one-shot",
    difficulty: "Easy",
    time: "10–15 min",
    completion: 82,
    cover:
      "https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?q=80&w=1200&auto=format&fit=crop",
    tasks: [
      "Translate brief into visual prompt",
      "Pick a style and palette",
      "Export at social size",
    ],
  },
  {
    id: 4,
    title: "Onboarding Flow",
    subtitle: "Design a 3‑step signup with progress",
    category: "design",
    type: "multi-turn",
    difficulty: "Medium",
    time: "40–60 min",
    completion: 58,
    cover:
      "https://images.unsplash.com/photo-1555421689-43cad7100751?q=80&w=1200&auto=format&fit=crop",
    tasks: [
      "Sketch steps and states",
      "Validate with accessibility",
      "Refine microcopy",
    ],
  },
  {
    id: 5,
    title: "Build a REST Endpoint",
    subtitle: "Create a small endpoint with pagination",
    category: "code",
    type: "one-shot",
    difficulty: "Medium",
    time: "30–45 min",
    completion: 61,
    cover:
      "https://images.unsplash.com/photo-1518779578993-ec3579fee393?q=80&w=1200&auto=format&fit=crop",
    tasks: [
      "Define schema and params",
      "Implement handler",
      "Return meaningful errors",
    ],
  },
  {
    id: 6,
    title: "Explain a Codebase",
    subtitle: "Walk through a repo and answer questions",
    category: "video",
    type: "multi-turn",
    difficulty: "Hard",
    time: "60–90 min",
    completion: 37,
    cover:
      "https://images.unsplash.com/photo-1504805572947-34fad45aed93?q=80&w=1200&auto=format&fit=crop",
    tasks: [
      "Outline components",
      "Answer follow‑ups",
      "Summarize improvements",
    ],
  },
  {
    id: 7,
    title: "Brand Icon Set",
    subtitle: "Design 6 simple, consistent icons",
    category: "design",
    type: "one-shot",
    difficulty: "Medium",
    time: "35–45 min",
    completion: 66,
    cover:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=1200&auto=format&fit=crop",
    tasks: ["Define grid and stroke", "Draw base shapes", "Export SVG"],
  },
  {
    id: 8,
    title: "Image Upscale + Clean",
    subtitle: "Upscale and remove artifacts from a photo",
    category: "image",
    type: "multi-turn",
    difficulty: "Medium",
    time: "25–35 min",
    completion: 59,
    cover:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
    tasks: [
      "Assess noise and detail",
      "Apply upscale strategy",
      "Fine‑tune sharpness",
    ],
  },
  {
    id: 9,
    title: "Short Product Teaser",
    subtitle: "Storyboard and cut a 10‑second teaser",
    category: "video",
    type: "one-shot",
    difficulty: "Medium",
    time: "30–45 min",
    completion: 53,
    cover:
      "https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?q=80&w=1200&auto=format&fit=crop",
    tasks: [
      "Draft a three‑scene storyboard",
      "Pick music and pacing",
      "Export vertical format",
    ],
  },
  {
    id: 10,
    title: "Bug Hunt Mini",
    subtitle: "Find and fix a rendering glitch",
    category: "code",
    type: "one-shot",
    difficulty: "Easy",
    time: "15–25 min",
    completion: 85,
    cover:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop",
    tasks: ["Reproduce bug", "Identify root cause", "Submit fix"],
  },
  {
    id: 11,
    title: "Color‑Safe Palette",
    subtitle: "Create an accessible palette for UI",
    category: "design",
    type: "multi-turn",
    difficulty: "Medium",
    time: "30–50 min",
    completion: 57,
    cover:
      "https://images.unsplash.com/photo-1526312426976-593c2b999d9d?q=80&w=1200&auto=format&fit=crop",
    tasks: ["Define roles and contrast", "Test light/dark", "Provide tokens"],
  },
  {
    id: 12,
    title: "Caption Clean‑up",
    subtitle: "Auto‑generate and edit captions",
    category: "video",
    type: "multi-turn",
    difficulty: "Easy",
    time: "20–30 min",
    completion: 79,
    cover:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200&auto=format&fit=crop",
    tasks: ["Transcribe audio", "Fix timing and grammar", "Export SRT"],
  },
];

export default function ChallengesPage() {
  const [categoryFilter, setCategoryFilter] = useState<Category>("all");
  const [typeFilter, setTypeFilter] = useState<ChallengeType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(
    null
  );
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | null>(
    null
  );

  const filteredChallenges = challenges.filter((challenge) => {
    const categoryMatch =
      categoryFilter === "all" || challenge.category === categoryFilter;
    const typeMatch = typeFilter === "all" || challenge.type === typeFilter;
    const searchMatch =
      !searchQuery ||
      challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && typeMatch && searchMatch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "design":
        return <Palette className="size-4 text-category-design" />;
      case "code":
        return <Code2 className="size-4 text-category-code" />;
      case "image":
        return <ImageIcon className="size-4 text-category-image" />;
      case "video":
        return <Video className="size-4 text-category-video" />;
      default:
        return <Shapes className="size-4 text-muted-foreground" />;
    }
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case "design":
        return "bg-category-design/10 text-category-design ring-category-design/20";
      case "code":
        return "bg-category-code/10 text-category-code ring-category-code/20";
      case "image":
        return "bg-category-image/10 text-category-image ring-category-image/20";
      case "video":
        return "bg-category-video/10 text-category-video ring-category-video/20";
      default:
        return "bg-background text-foreground ring-border";
    }
  };

  const getTypeStyles = (type: string) =>
    type === "multi-turn"
      ? "bg-blue-500/10 text-blue-700 ring-blue-500/20"
      : "bg-amber-500/10 text-amber-700 ring-amber-500/20";

  const prettyType = (type: string) =>
    type === "multi-turn" ? "Multi‑turn" : "One‑shot";

  const openDetail = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
  };

  const closeDetail = () => {
    setSelectedChallenge(null);
  };

  const selectChallenge = () => {
    if (selectedChallenge) {
      setSelectedChallengeId(selectedChallenge.id);
      // Navigate to detail page after selecting to avoid stale overlay state bugs
      window.location.href = `/dashboard/challenges/${selectedChallenge.id}`;
    }
  };

  const resetFilters = () => {
    setCategoryFilter("all");
    setTypeFilter("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader activeRoute="challenges" />

      {/* Filters Section */}
      <section className="border-border border-b">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Category Filters */}
            <div
              aria-label="Categories"
              className="flex flex-wrap gap-2"
              role="tablist"
            >
              <button
                aria-pressed={categoryFilter === "all"}
                className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 font-medium text-sm transition-colors ${
                  categoryFilter === "all"
                    ? "bg-muted text-foreground"
                    : "bg-card text-muted-foreground ring-1 ring-border ring-inset hover:bg-muted/50"
                }`}
                onClick={() => setCategoryFilter("all")}
              >
                <Shapes className="size-4" />
                All
              </button>
              <button
                aria-pressed={categoryFilter === "design"}
                className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 font-medium text-sm transition-colors ${
                  categoryFilter === "design"
                    ? "bg-muted text-foreground"
                    : "bg-card text-muted-foreground ring-1 ring-border ring-inset hover:bg-muted/50"
                }`}
                onClick={() => setCategoryFilter("design")}
              >
                <Palette className="size-4 text-category-design" />
                Design
              </button>
              <button
                aria-pressed={categoryFilter === "code"}
                className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 font-medium text-sm transition-colors ${
                  categoryFilter === "code"
                    ? "bg-muted text-foreground"
                    : "bg-card text-muted-foreground ring-1 ring-border ring-inset hover:bg-muted/50"
                }`}
                onClick={() => setCategoryFilter("code")}
              >
                <Code2 className="size-4 text-category-code" />
                Code
              </button>
              <button
                aria-pressed={categoryFilter === "image"}
                className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 font-medium text-sm transition-colors ${
                  categoryFilter === "image"
                    ? "bg-muted text-foreground"
                    : "bg-card text-muted-foreground ring-1 ring-border ring-inset hover:bg-muted/50"
                }`}
                onClick={() => setCategoryFilter("image")}
              >
                <ImageIcon className="size-4 text-category-image" />
                Image
              </button>
              <button
                aria-pressed={categoryFilter === "video"}
                className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 font-medium text-sm transition-colors ${
                  categoryFilter === "video"
                    ? "bg-muted text-foreground"
                    : "bg-card text-muted-foreground ring-1 ring-border ring-inset hover:bg-muted/50"
                }`}
                onClick={() => setCategoryFilter("video")}
              >
                <Video className="size-4 text-category-video" />
                Video
              </button>
            </div>

            {/* Type Filters */}
            <div className="inline-flex w-full items-center rounded-lg bg-muted p-1 ring-1 ring-border ring-inset sm:w-auto">
              <button
                aria-pressed={typeFilter === "all"}
                className={`flex-1 rounded-md px-3.5 py-2 font-medium text-sm transition-colors sm:flex-none ${
                  typeFilter === "all"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
                onClick={() => setTypeFilter("all")}
              >
                All types
              </button>
              <button
                aria-pressed={typeFilter === "one-shot"}
                className={`flex-1 rounded-md px-3.5 py-2 font-medium text-sm transition-colors sm:flex-none ${
                  typeFilter === "one-shot"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
                onClick={() => setTypeFilter("one-shot")}
              >
                <span className="inline-flex items-center gap-2">
                  <Zap className="size-4 text-amber-500" />
                  One‑shot
                </span>
              </button>
              <button
                aria-pressed={typeFilter === "multi-turn"}
                className={`flex-1 rounded-md px-3.5 py-2 font-medium text-sm transition-colors sm:flex-none ${
                  typeFilter === "multi-turn"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
                onClick={() => setTypeFilter("multi-turn")}
              >
                <span className="inline-flex items-center gap-2">
                  <MessageSquare className="size-4 text-blue-600" />
                  Multi‑turn
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Mobile Search */}
          <div className="mb-5 md:hidden">
            <label className="sr-only" htmlFor="globalSearchMobile">
              Search challenges
            </label>
            <div className="flex items-center rounded-md bg-card ring-1 ring-border ring-inset">
              <Search className="ml-3 size-4 text-muted-foreground" />
              <Input
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                id="globalSearchMobile"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search challenges"
                type="search"
                value={searchQuery}
              />
            </div>
          </div>

          {/* Results Header */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground text-xl tracking-tight">
              Browse challenges
            </h2>
            <p className="text-muted-foreground text-sm">
              {filteredChallenges.length}{" "}
              {filteredChallenges.length === 1 ? "result" : "results"}
            </p>
          </div>

          {filteredChallenges.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredChallenges.map((challenge) => (
                <ChallengeCard
                  category={challenge.category}
                  completion={challenge.completion} // Added id prop for routing to challenge detail page
                  difficulty={challenge.difficulty}
                  id={String(challenge.id)}
                  isSelected={selectedChallengeId === challenge.id}
                  key={challenge.id}
                  onClick={() => openDetail(challenge)}
                  subtitle={challenge.subtitle}
                  title={challenge.title}
                  type={challenge.type}
                />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted ring-1 ring-border ring-inset">
                <Inbox className="size-6 text-muted-foreground" />
              </div>
              <p className="mt-4 font-medium text-foreground text-lg tracking-tight">
                No challenges match your filters
              </p>
              <p className="mt-1 text-muted-foreground text-sm">
                Try clearing filters or searching with a different term.
              </p>
              <Button className="mt-5" onClick={resetFilters}>
                <RotateCcw className="size-4" />
                Reset filters
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Detail Overlay */}
      {selectedChallenge && (
        <div aria-hidden="false" className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={closeDetail} />
          <div className="absolute top-0 right-0 h-full w-full overflow-hidden border-border border-l bg-card shadow-xl sm:w-[520px]">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-border border-b px-5 py-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-1 font-medium text-xs capitalize ring-1 ring-inset ${getCategoryStyles(
                      selectedChallenge.category
                    )}`}
                  >
                    {selectedChallenge.category}
                  </span>
                  <span
                    className={`rounded-md px-2 py-1 font-medium text-xs ring-1 ring-inset ${getTypeStyles(
                      selectedChallenge.type
                    )}`}
                  >
                    {prettyType(selectedChallenge.type)}
                  </span>
                </div>
                <Button
                  className="size-9 bg-transparent ring-1 ring-border ring-inset"
                  onClick={closeDetail}
                  size="icon-sm"
                  variant="outline"
                >
                  <X className="size-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="space-y-5 overflow-y-auto p-5">
                <div className="aspect-[16/10] overflow-hidden rounded-lg ring-1 ring-border ring-inset">
                  <img
                    alt={selectedChallenge.title}
                    className="h-full w-full object-cover"
                    src={selectedChallenge.cover || "/placeholder.svg"}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-2xl text-foreground tracking-tight">
                    {selectedChallenge.title}
                  </h3>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {selectedChallenge.subtitle}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted p-3 ring-1 ring-border ring-inset">
                    <div className="text-muted-foreground text-xs">
                      Completion rate
                    </div>
                    <div className="mt-1 font-medium text-foreground text-sm">
                      {selectedChallenge.completion}% passed
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted p-3 ring-1 ring-border ring-inset">
                    <div className="text-muted-foreground text-xs">
                      Difficulty
                    </div>
                    <div className="mt-1 font-medium text-foreground text-sm">
                      {selectedChallenge.difficulty}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-medium text-foreground text-sm">
                    What you'll do
                  </div>
                  <ul className="list-disc space-y-1 pl-5 text-foreground text-sm">
                    {selectedChallenge.tasks.map((task, index) => (
                      <li key={index}>{task}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-auto flex items-center justify-between border-border border-t p-5">
                <div
                  aria-live="polite"
                  className="text-muted-foreground text-sm"
                >
                  {selectedChallengeId === selectedChallenge.id
                    ? "Selected — you can start now."
                    : `Ready to start: ${selectedChallenge.title}`}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    className="bg-transparent ring-1 ring-border ring-inset"
                    size="sm"
                    variant="outline"
                  >
                    <Bookmark className="size-4" />
                    Save
                  </Button>
                  <Button
                    className="bg-primary/90 hover:bg-primary"
                    onClick={selectChallenge}
                    size="sm"
                  >
                    <Play className="size-4" />
                    Select challenge
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-border border-t">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-muted-foreground text-sm">
              Built for clarity and quick starts.
            </p>
            <div className="text-foreground text-sm">
              Selected:{" "}
              {selectedChallengeId
                ? challenges.find((c) => c.id === selectedChallengeId)?.title
                : "none"}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
