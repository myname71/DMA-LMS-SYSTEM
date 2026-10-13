Digital Manufacturing Academy — LMS & course management Platform

Tech Stack
Layer	Technology
Runtime	Node.js ≥ 20
Language	TypeScript
Framework	Express.js
Frontend	React 19 + Vite + Tailwind CSS v4
ORM	Prisma 5
Database	PostgreSQL via Supabase
Prerequisites
Node.js ≥ 20.0.0 and npm ≥ 10.0.0
A Supabase project (PostgreSQL)

Fill in .env — all required keys are documented in env.example. The critical ones are:
Variable	Description
DATABASE_URL	Supabase pooled connection string (PgBouncer, port 6543)
DIRECT_URL	Supabase direct connection string (port 5432, for migrations)
JWT_SECRET	Random string ≥ 32 characters
SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD	First-boot admin account (required)
SEED_SUPER_ADMIN_EMAIL / SEED_SUPER_ADMIN_PASSWORD	First-boot super-admin account (required)

Build locally → upload dist/, prisma/, package.json, package-lock.json, app.js, and any other root-level files.
Or connect your GitHub repository and let Hostinger pull on deploy.
. Install production dependencies on the server
bash
npm install --omit=dev
. Set the startup file

In the Hostinger Node.js panel, set the Application startup file to either:

app.js (re-exports dist/server.cjs), or
dist/server.cjs directly

Both work. app.js is the recommended choice to match Hostinger's default expectations.

. Run database migrations (first deploy or schema changes)
bash
npm run db:push

Run this via Hostinger's terminal or SSH before restarting the app.

. (First deploy only) Seed the database
bash
npm run db:seed

This creates the initial admin and super-admin accounts using the credentials from your environment variables. The server will not start if SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD are missing.

Available npm Scripts
Script	Description
npm run dev	Start dev server with tsx (hot-reload)
npm run build	Full production build
npm start	Start the compiled production bundle
npm run lint	TypeScript type-check (no emit)
npm run db:push	Push Prisma schema to database
npm run db:seed	Seed initial data and admin accounts
npm run db:generate	Regenerate Prisma client only
npm test	Run tests via tsx --test
npm run clean	Delete dist/ folder
Project Structure
.
├── app.js                  # Hostinger entry point (re-exports dist/server.cjs)
├── server.ts               # Main Express server + all API routes
├── db.js                   # Supabase JS client (optional helpers)
├── db.ts                   # Typed Supabase client (TypeScript)
├── routes/
│   ├── auth.ts             # Authentication routes
│   ├── courses.ts          # Course CRUD & publishing
│   └── enrollments.ts      # Enrolment management
├── middleware/
│   └── authorize.ts        # JWT auth & role-based access control
├── lib/
│   ├── appState.ts         # Server-side application state
│   └── mailer.ts           # Nodemailer email helpers
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed script
├── dist/                   # Production build output (git-ignored)
└── env.example             # Environment variable template

User Roles
Role	Access
student	Browse & enrol in courses, track progress, earn certificates
instructor	Create and manage own courses, view instructor dashboard
admin	Manage users, courses, events, webinars, CMS content
super_admin	Full platform access including role and subscription management
Key Features
Course Player with lessons, quizzes, and assignments (embedded JSON in Prisma)
Certificate generation on course completion
AI Tutor powered by Google Gemini
Assessment module with auto-grading
Webinar & Events management
Learning Paths for structured curricula
Instructor Dashboard with analytics
Admin Panel with CMS page renderer
Payment / Checkout flow
Email notifications via Hostinger SMTP
Subscription plans (free / paid tiers)
Environment Variables Reference

See env.example for the full list with descriptions. Never commit real values.
