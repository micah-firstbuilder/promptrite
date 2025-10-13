import { desc, eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { BaselineMetrics } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();

    const metrics = await db
      .select()
      .from(BaselineMetrics)
      .where(eq(BaselineMetrics.user_id, user.id))
      .orderBy(desc(BaselineMetrics.created_at));

    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const { metric_type, value } = body;

    if (!metric_type || typeof value !== "number") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Get existing baseline for this metric type
    const existingBaseline = await db
      .select()
      .from(BaselineMetrics)
      .where(
        sql`${BaselineMetrics.user_id} = ${user.id} AND ${BaselineMetrics.metric_type} = ${metric_type}`
      )
      .orderBy(BaselineMetrics.created_at)
      .limit(1);

    const baseline_value =
      existingBaseline.length > 0
        ? existingBaseline[0].baseline_value || value
        : value;
    const improvement_percentage =
      baseline_value > 0
        ? Math.round(((value - baseline_value) / baseline_value) * 100)
        : 0;

    const newMetric = await db
      .insert(BaselineMetrics)
      .values({
        user_id: user.id,
        metric_type,
        value,
        baseline_value,
        improvement_percentage,
      })
      .returning();

    return NextResponse.json(newMetric[0]);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
