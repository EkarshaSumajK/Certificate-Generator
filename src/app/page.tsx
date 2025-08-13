export default function Home() {
  return (
    <div className="container mx-auto p-8">
      <main className="flex flex-col gap-8 items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-foreground">Welcome to Certificate Generator</h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            A modern Next.js application built with TypeScript, Tailwind CSS, shadcn/ui components, and Clerk authentication.
            Dark mode and user authentication are fully configured and ready to use!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          <div className="p-6 border border-border rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-2">Next.js 15</h3>
            <p className="text-muted-foreground">Built with the latest Next.js App Router for optimal performance.</p>
          </div>
          <div className="p-6 border border-border rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-2">TypeScript</h3>
            <p className="text-muted-foreground">Fully typed development experience with TypeScript support.</p>
          </div>
          <div className="p-6 border border-border rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-2">Clerk Auth</h3>
            <p className="text-muted-foreground">Secure authentication with sign-in/sign-up modals and user management.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
