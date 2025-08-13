import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
              card: 'shadow-lg',
            }
          }}
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  )
}
