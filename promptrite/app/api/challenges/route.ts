// This REST endpoint was superseded by tRPC routers. Keeping a minimal 410.
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Gone" }, { status: 410 });
}
