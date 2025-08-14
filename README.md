## Certificate Generator

Generate beautiful certificates from CSV data using a simple, in-browser editor. Upload a recipient list, upload a template image, place text fields, and export certificates as images (ZIP download).

### Tech Stack
- **Framework**: Next.js 15 (App Router), React 19
- **Auth**: Clerk
- **State**: Zustand
- **Canvas**: Konva, react-konva
- **UI**: Tailwind CSS 4, custom UI components, `next-themes`, `lucide-react`, `sonner`
- **CSV**: `xlsx`
- **Export**: `jszip`, `file-saver`

### Features
- **CSV upload and preview** with pagination and basic stats
- **Template upload and preview** (PNG/JPG/SVG)
- **Canvas editor**: place and resize text elements on your template
- **Live data mapping**: preview using the first row of CSV
- **Bulk generation**: export all or a limited number of certificates as a ZIP of PNGs
- **Authentication and protected routes** using Clerk

## Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm/yarn/bun
- Clerk account for authentication

### 1) Install dependencies
```bash
npm install
# or
pnpm install
# or
yarn
```

### 2) Configure environment variables
Create `.env.local` in the project root with at least the Clerk keys. See `CLERK_SETUP.md` and `ENVIRONMENT_SETUP.md` for more.

```bash
# Clerk (required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional paths and future integrations (see ENVIRONMENT_SETUP.md)
# AWS_REGION=us-east-1
# AWS_S3_BUCKET_NAME=...
```

Notes:
- By default this app runs entirely in the browser; CSV data and template are kept in-memory (Zustand). Refreshing the page clears them.
- S3 is optional and not used by default. See `AWS_S3_SETUP.md` if you plan to persist files.

### 3) Run the app
```bash
npm run dev
```
Open `http://localhost:3000` and sign in/up via Clerk.

## Usage

1. **Sign in** to access the dashboard
2. **Upload CSV** at `/dashboard/upload-csv`
   - First row should be headers (e.g., Name, Email, Course, Completion Date)
   - Preview data, see basic stats, and paginate
3. **Upload template** at `/dashboard/upload-template`
   - Supported: PNG, JPG/JPEG, SVG (recommend high resolution for print)
4. **Open editor** at `/dashboard/editor`
   - Background is set from your template
   - Add/position text elements and map to CSV columns
   - Preview using the first CSV row
5. **Generate**
   - Export as a ZIP of PNG images, optionally limiting the number generated

## Authentication and Routing
- Public routes: `/`, `/sign-in`, `/sign-up`
- Protected routes: everything under `/dashboard` and other non-public paths
- Middleware: see `middleware.ts` for route protection and redirect of signed-in users from `/` to `/dashboard`

## Scripts
```bash
# Start dev server (Turbopack)
npm run dev

# Production build & start
npm run build
npm run start

# Lint
npm run lint
```

## Project Structure
- `src/app` — App Router pages (`/`, `/dashboard/...`)
- `src/components` — UI components and feature modules
  - `canvas/` — canvas stage, toolbar, properties panel
  - `csv-upload.tsx`, `csv-preview.tsx` — CSV flow
  - `template-upload.tsx`, `template-preview.tsx` — Template flow
- `src/stores` — Zustand stores (`csv-store`, `template-store`, `canvas-store`)
- `src/lib/services` — CSV parsing and file reading services
- `src/lib/types` — Shared TypeScript types

## Environment & Integrations
- Clerk setup: see `CLERK_SETUP.md`
- Environment details and troubleshooting: see `ENVIRONMENT_SETUP.md`
- Optional S3 persistence: see `AWS_S3_SETUP.md` (not enabled by default)

## Notes & Limitations
- State is in-memory; reloading the page clears uploaded CSV/template
- Export format is PNG; ZIP file is generated client-side
- Large CSVs generate many images and may take time in the browser

## License
MIT
