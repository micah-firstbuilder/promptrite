import { NextRequest, NextResponse } from 'next/server'

// Edge-safe middleware (no Clerk imports). Protects key routes
// by checking for Clerk's session cookie. Full auth is enforced
// inside route handlers via @clerk/nextjs/server.
export default function middleware(req: NextRequest) {
  const url = new URL(req.url)

  // Skip when Clerk is not configured
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY)
  if (!hasClerk) return NextResponse.next()

  const pathname = url.pathname
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/api/')
  if (!isProtected) return NextResponse.next()

  // Clerk sets "__session" cookie for authenticated users
  const hasSession = Boolean(req.cookies.get('__session')?.value)
  if (hasSession) return NextResponse.next()

  // Redirect unauthenticated users to sign-in, preserving return URL
  const signInUrl = new URL('/sign-in', url.origin)
  signInUrl.searchParams.set('redirect_url', pathname + url.search)
  return NextResponse.redirect(signInUrl)
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
}


