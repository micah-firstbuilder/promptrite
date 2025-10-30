"use client";

import {
  Bookmark,
  Code2,
  ImageIcon,
  Inbox,
  Palette,
  Play,
  RotateCcw,
  Search,
  Shapes,
  Video,
  X,
} from "lucide-react";
import { useState } from "react";
import { trpc } from "@/app/utils/trpc";
import { ChallengeCard } from "@/components/challenge-card";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Category = "all" | "design" | "code" | "image" | "video";
type ChallengeCategory = Exclude<Category, "all">;

interface Challenge {
  id: number;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: string;
  technicalMode: string;
  example?: string | null;
}

// Type guard to ensure category is valid
const isValidCategory = (cat: string | null | undefined): cat is ChallengeCategory => {
  return cat === "design" || cat === "code" || cat === "image" || cat === "video";
};

export default function ChallengesPage() {
  const [categoryFilter, setCategoryFilter] = useState<Category>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(
    null
  );
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | null>(
    null
  );

  // Fetch challenges dynamically from tRPC
  const { data: challengesData, isLoading } = trpc.challenges.list.useQuery();
  const challenges = challengesData?.challenges || [];
  const stats = challengesData?.stats;

  const filteredChallenges = challenges.filter((challenge) => {
    const categoryMatch =
      categoryFilter === "all" || challenge.category === categoryFilter;
    const searchMatch =
      !searchQuery ||
      challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
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
    setSearchQuery("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader activeRoute="challenges" />
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="mx-auto size-12 animate-spin rounded-full border-4 border-border border-t-primary" />
            <p className="mt-4 text-muted-foreground text-sm">
              Loading challenges...
            </p>
          </div>
        </div>
      </div>
    );
  }

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
              {filteredChallenges.map((challenge) => {
                // Validate and cast category to ensure type safety
                const category: ChallengeCategory = isValidCategory(challenge.category)
                  ? challenge.category
                  : "design"; // Default fallback
                
                // Create properly typed challenge object for openDetail
                const typedChallenge: Challenge = {
                  ...challenge,
                  category,
                };
                
                return (
                  <ChallengeCard
                    category={category}
                    completion={0}
                    difficulty={challenge.difficulty}
                    id={String(challenge.id)}
                    isSelected={selectedChallengeId === challenge.id}
                    key={challenge.id}
                    onClick={() => openDetail(typedChallenge)}
                    subtitle={challenge.description}
                    title={challenge.title}
                    type="multi-turn"
                  />
                );
              })}
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
                <div>
                  <h3 className="font-semibold text-2xl text-foreground tracking-tight">
                    {selectedChallenge.title}
                  </h3>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {selectedChallenge.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted p-3 ring-1 ring-border ring-inset">
                    <div className="text-muted-foreground text-xs">
                      Difficulty
                    </div>
                    <div className="mt-1 font-medium text-foreground text-sm capitalize">
                      {selectedChallenge.difficulty}
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted p-3 ring-1 ring-border ring-inset">
                    <div className="text-muted-foreground text-xs">Type</div>
                    <div className="mt-1 font-medium text-foreground text-sm capitalize">
                      {selectedChallenge.technicalMode}
                    </div>
                  </div>
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
