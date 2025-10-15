import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({
      id: user.id,
      email: user.email,
      first_name: (user as any).first_name ?? null,
      last_name: (user as any).last_name ?? null,
      username: (user as any).username ?? null,
      elo_rating: (user as any).elo_rating ?? 1200,
      created_at: user.created_at,
    });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
