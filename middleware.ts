import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
]);

const isDashboardRoute = createRouteMatcher([
  '/dashboard(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  
  // Redirect authenticated users from home page to dashboard
  if (userId && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  // Protect dashboard routes
  if (isDashboardRoute(req)) {
    await auth.protect();
  }
  
  // Protect other non-public routes
  if (!isPublicRoute(req) && !isDashboardRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
