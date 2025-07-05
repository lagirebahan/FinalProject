import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define protected routes (if you want to protect certain pages)
const isProtectedRoute = createRouteMatcher([
  // Add protected routes here if needed
  // '/dashboard(.*)',
  // '/profile(.*)',
])

export default clerkMiddleware((auth, req) => {
  // Protect routes if they match the protected pattern
  if (isProtectedRoute(req)) auth().protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}