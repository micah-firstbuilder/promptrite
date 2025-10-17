// Superseded by tRPC `progress` router. Return 410.
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Gone" }, { status: 410 });
}

export async function POST(_request: NextRequest) {
  return NextResponse.json({ error: "Gone" }, { status: 410 });
}
