import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { Progress } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

// Mock challenge data - in a real app this would come from a database
const challenges = [
  {
    id: "1",
    title: "Landing Page Revamp",
    subtitle: "Wireframe and refine a hero section for a product",
    category: "design",
    type: "one-shot",
    difficulty: "Easy",
    time: "20–30 min",
    completion: 78,
    points: 100,
  },
  {
    id: "2",
    title: "Refactor Utilities",
    subtitle: "Improve a small helper library",
    category: "code",
    type: "multi-turn",
    difficulty: "Medium",
    time: "45–60 min",
    completion: 64,
    points: 150,
  },
  {
    id: "3",
    title: "Prompted Poster",
    subtitle: "Generate a minimal poster from a short brief",
    category: "image",
    type: "one-shot",
    difficulty: "Easy",
    time: "10–15 min",
    completion: 82,
    points: 80,
  },
  {
    id: "4",
    title: "Onboarding Flow",
    subtitle: "Design a 3‑step signup with progress",
    category: "design",
    type: "multi-turn",
    difficulty: "Medium",
    time: "40–60 min",
    completion: 58,
    points: 200,
  },
  {
    id: "5",
    title: "Build a REST Endpoint",
    subtitle: "Create a small endpoint with pagination",
    category: "code",
    type: "one-shot",
    difficulty: "Medium",
    time: "30–45 min",
    completion: 61,
    points: 120,
  },
];

export async function GET() {
  try {
    const user = await getCurrentUser();

    // Get user's progress to calculate completion stats
    const userProgress = await db
      .select()
      .from(Progress)
      .where(eq(Progress.user_id, user.id));

    // Calculate user stats
    const totalChallenges = challenges.length;
    const completedChallenges = userProgress.length;
    const completionRate =
      totalChallenges > 0
        ? Math.round((completedChallenges / totalChallenges) * 100)
        : 0;

    // Calculate average score (ELO-like rating)
    const averageScore =
      userProgress.length > 0
        ? Math.round(
            userProgress.reduce((sum, p) => sum + p.score, 0) /
              userProgress.length
          )
        : 1200; // Default ELO

    // Calculate current streak (simplified - challenges completed in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentProgress = userProgress.filter(
      (p) => p.created_at >= sevenDaysAgo
    );
    const currentStreak = recentProgress.length;

    // Calculate leaderboard rank (simplified - based on score)
    const totalUsers = 100; // Mock total users
    const userRank = Math.max(
      1,
      Math.floor((averageScore / 2000) * totalUsers)
    );

    return NextResponse.json({
      challenges,
      stats: {
        totalChallenges,
        completedChallenges,
        completionRate,
        averageScore,
        currentStreak,
        userRank,
        totalUsers,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
