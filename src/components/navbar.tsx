"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { isSignedIn, user } = useUser();
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-8">
            <Link href={isSignedIn ? "/dashboard" : "/"}>
              <h1 className="text-xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer">
                Certificate Generator
              </h1>
            </Link>
            
            {/* Dashboard Navigation */}
            {isSignedIn && isDashboard && (
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className={pathname === '/dashboard' ? 'bg-muted' : ''}>
                    Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard/upload">
                  <Button variant="ghost" size="sm" className={pathname === '/dashboard/upload' ? 'bg-muted' : ''}>
                    Upload CSV
                  </Button>
                </Link>
                <Link href="/dashboard/create">
                  <Button variant="ghost" size="sm" className={pathname === '/dashboard/create' ? 'bg-muted' : ''}>
                    Create Certificate
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Right side - Auth buttons and theme toggle */}
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user?.firstName || "User"}!
                </span>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
