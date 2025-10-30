"use client";

import { TrendingUp, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { trpc } from "@/app/utils/trpc";
import { DashboardHeader } from "@/components/dashboard-header";
import { StatCard } from "@/components/stat-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserStats {
  totalChallenges: number;
  completedChallenges: number;
  completionRate: number;
  averageScore: number;
  currentStreak: number;
  userRank: number;
  totalUsers: number;
}

// Challenge interface matching the API response from challenges.list
interface Challenge {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  technicalMode: string;
  example?: string | null;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: me } = trpc.user.me.useQuery(undefined, { staleTime: 30_000 });
  const challengesQuery = trpc.challenges.list.useQuery(undefined, {
    enabled: true,
  });
  useEffect(() => {
    if (challengesQuery.data) {
      setStats(challengesQuery.data.stats as UserStats);
      // API returns challenges with id as number, matching Challenge interface
      setChallenges(challengesQuery.data.challenges);
      setLoading(false);
    }
  }, [challengesQuery.data]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <DashboardHeader activeRoute="dashboard" />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl text-foreground">
            Welcome back!
          </h1>
          <p className="text-muted-foreground">
            Track your progress and continue your AI learning journey.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={TrendingUp}
            title="Current ELO"
            trend={{ value: "+127 this week", positive: true }}
            value={
              loading ? "..." : stats?.averageScore.toLocaleString() || "1,200"
            }
          />
          <StatCard
            title="Challenges Completed"
            value={
              loading ? "..." : stats?.completedChallenges.toString() || "0"
            }
          >
            <Progress className="h-2" value={stats?.completionRate || 0} />
            <p className="mt-2 text-muted-foreground text-xs">
              {stats?.completionRate || 0}% completion rate
            </p>
          </StatCard>
          <StatCard
            description="Keep it up!"
            title="Current Streak"
            value={loading ? "..." : `${stats?.currentStreak || 0} days`}
          />
          <StatCard
            icon={Trophy}
            title="Leaderboard Rank"
            trend={{
              value: `Top ${Math.round(((stats?.userRank || 1) / (stats?.totalUsers || 100)) * 100)}%`,
            }}
            value={loading ? "..." : `#${stats?.userRank || 1}`}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs className="space-y-4" defaultValue="challenges">
          <TabsList>
            <TabsTrigger value="challenges">Active Challenges</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent className="space-y-4" value="challenges">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Challenges</CardTitle>
                <CardDescription>
                  Based on your current skill level
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">
                      Loading challenges...
                    </p>
                  </div>
                ) : (
                  challenges.slice(0, 3).map((challenge) => (
                    <div
                      className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                      key={challenge.id}
                    >
                      <div className="space-y-1">
                        <h3 className="font-medium text-foreground">
                          {challenge.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {challenge.difficulty}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {challenge.category}
                          </Badge>
                        </div>
                        {challenge.description && (
                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {challenge.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <Button size="sm">Start</Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent className="space-y-4" value="invitations">
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>
                  Challenge invitations from other users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    from: "Sarah Chen",
                    challenge: "RAG Implementation Challenge",
                    time: "2h ago",
                  },
                  {
                    from: "Alex Kumar",
                    challenge: "Fine-tuning Showdown",
                    time: "5h ago",
                  },
                  {
                    from: "Jordan Lee",
                    challenge: "Prompt Battle Royale",
                    time: "1d ago",
                  },
                ].map((invitation, index) => (
                  <div
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                    key={index}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={`/.jpg?height=40&width=40&query=${invitation.from}`}
                        />
                        <AvatarFallback>
                          {invitation.from
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">
                          {invitation.from}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {invitation.challenge}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {invitation.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Decline
                      </Button>
                      <Button size="sm">Accept</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent className="space-y-4" value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>
                  Your skill development over time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    skill: "Prompt Engineering",
                    level: 85,
                    color: "bg-chart-1",
                  },
                  { skill: "Model Selection", level: 72, color: "bg-chart-2" },
                  {
                    skill: "Context Management",
                    level: 68,
                    color: "bg-chart-3",
                  },
                  {
                    skill: "Output Optimization",
                    level: 91,
                    color: "bg-chart-4",
                  },
                ].map((skill, index) => (
                  <div className="space-y-2" key={index}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground text-sm">
                        {skill.skill}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full ${skill.color} transition-all duration-500`}
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
