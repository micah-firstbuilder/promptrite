import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const publishable = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const secret = Boolean(process.env.CLERK_SECRET_KEY);

  let authInfo: any = null;
  try {
    const a = await auth();
    authInfo = {
      userId: a.userId ?? null,
      sessionId: (a as any).sessionId ?? null,
      orgId: (a as any).orgId ?? null,
    };
  } catch (e: any) {
    authInfo = { error: e?.message ?? "auth() failed" };
  }

  const cookies = request.cookies.get("__session")?.value ? true : false;

  return NextResponse.json({
    keys: { publishable, secret },
    cookie: { hasSessionCookie: cookies },
    auth: authInfo,
  });
}
