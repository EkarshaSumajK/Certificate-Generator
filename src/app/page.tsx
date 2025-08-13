import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MarketingHome() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 lg:px-8">
        <div className="mx-auto max-w-4xl pt-20 pb-32 sm:pt-32 sm:pb-40">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Create Beautiful{" "}
              <span className="text-primary">Certificates</span>{" "}
              in Minutes
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Generate professional certificates from CSV data with our easy-to-use platform. 
              Upload your data, customize your design, and download stunning certificates instantly.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/sign-in">
                <Button size="lg" className="text-lg px-8 py-3">
                  Get Started
                </Button>
              </Link>
              <Button variant="ghost" size="lg" className="text-lg px-8 py-3">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need to create certificates
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Our platform provides all the tools you need to generate professional certificates quickly and efficiently.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-foreground">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  </div>
                  CSV Upload
                </dt>
                <dd className="mt-2 text-base leading-7 text-muted-foreground">
                  Simply upload your CSV file with recipient data and let our system handle the rest.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-foreground">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 0 3 3 0 105.78-1.128zm0 0L15 10.5a3 3 0 11-4.5-4.5L10.5 6a3 3 0 010 4.24z" />
                    </svg>
                  </div>
                  Custom Design
                </dt>
                <dd className="mt-2 text-base leading-7 text-muted-foreground">
                  Customize your certificate design with our intuitive editor and templates.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-foreground">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  </div>
                  Instant Generation
                </dt>
                <dd className="mt-2 text-base leading-7 text-muted-foreground">
                  Generate hundreds of certificates in seconds with our fast processing engine.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-foreground">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                    </svg>
                  </div>
                  Easy Download
                </dt>
                <dd className="mt-2 text-base leading-7 text-muted-foreground">
                  Download individual certificates or bulk download as a ZIP file.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}
