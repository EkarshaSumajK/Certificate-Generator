# Clerk Authentication Setup

## Environment Variables Required

Create a `.env.local` file in the root directory with the following variables:

```bash
# Clerk Environment Variables
# Get these from your Clerk Dashboard: https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
CLERK_SECRET_KEY=your_secret_key_here

# Clerk Sign-in/Sign-up URLs (optional, defaults are set)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard
```

## Getting Your Clerk Keys

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Sign up/Sign in to your account
3. Create a new application
4. Go to "API Keys" in the sidebar
5. Copy the "Publishable key" and "Secret key"
6. Paste them into your `.env.local` file

## Features Configured

✅ **ClerkProvider** - Wraps the entire app with authentication context
✅ **Middleware** - Protects all routes except home page and auth pages  
✅ **Navbar** - Shows sign-in/sign-up buttons when not authenticated
✅ **UserButton** - Shows user avatar and profile menu when authenticated
✅ **Dedicated Auth Pages** - Sign-in/sign-up pages with custom styling

## Route Protection

- **Public routes**: `/`, `/sign-in`, `/sign-up`
- **Protected routes**: All other routes require authentication
- **Middleware location**: `middleware.ts` in project root

The middleware automatically redirects unauthenticated users to the sign-in page when they try to access protected routes.
