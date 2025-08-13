"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardHome() {
  const { user } = useUser();

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome back, {user?.firstName || "User"}! 👋
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ready to create beautiful certificates? Choose an option below to get started.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="group">
            <div className="p-8 border border-border rounded-lg bg-card hover:shadow-lg transition-all duration-200 group-hover:border-primary/50">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg mb-6 mx-auto">
                <svg 
                  className="w-8 h-8 text-primary" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-center mb-4">Upload CSV</h3>
              <p className="text-muted-foreground text-center mb-6">
                Upload a CSV file with recipient data to generate multiple certificates at once.
              </p>
              <div className="text-center">
                <Link href="/dashboard/upload">
                  <Button size="lg" className="w-full">
                    Upload CSV File
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="group">
            <div className="p-8 border border-border rounded-lg bg-card hover:shadow-lg transition-all duration-200 group-hover:border-primary/50">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg mb-6 mx-auto">
                <svg 
                  className="w-8 h-8 text-primary" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-center mb-4">Create Certificate</h3>
              <p className="text-muted-foreground text-center mb-6">
                Design and create a single certificate with our intuitive certificate builder.
              </p>
              <div className="text-center">
                <Link href="/dashboard/create">
                  <Button size="lg" variant="outline" className="w-full">
                    Create Certificate
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats or Recent Activity */}
        <div className="bg-muted/30 rounded-lg p-8">
          <h2 className="text-xl font-semibold mb-4">Quick Start Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">📁</div>
              <h4 className="font-semibold mb-2">Prepare Your Data</h4>
              <p className="text-sm text-muted-foreground">
                Ensure your CSV has columns like Name, Course, Date, etc.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🎨</div>
              <h4 className="font-semibold mb-2">Choose a Template</h4>
              <p className="text-sm text-muted-foreground">
                Select from our pre-designed templates or create your own.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-semibold mb-2">Generate & Download</h4>
              <p className="text-sm text-muted-foreground">
                Generate certificates instantly and download them as PDFs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
