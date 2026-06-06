# Project Database

A web application for managing user profiles, training records, and socio-economic details with authentication, search, PDF export, and analytics support.

## What this app does

This project is a full-stack Next.js application that provides a protected user dashboard for:

- Creating, editing, viewing, and deleting user profiles
- Storing personal, contact, and identity details
- Managing related socio-economic and education data
- Searching users by name, last name, academic background, and work experience
- Downloading a user profile as a PDF report
- Displaying a secure login page with protected routes
- Supporting database access via Prisma and API routes

## Main features

- Authenticated access with a login screen and protected application pages
- User profile management with a complete CRUD experience
- Search and filters for flexible user lookup
- User details view with nested related records
- PDF generation for individual user records
- Backend API routes for user operations and PDF export
- Prisma ORM with a PostgreSQL/SQLite-compatible data layer
- TypeScript-based frontend and backend
- Example socket and stats integrations in the repository

## Technology stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Prisma ORM
- React Hook Form
- Zod validation
- shadcn/ui components
- Zustand state management
- Sonner toast notifications
- Lucide icons
- Recharts charts
- Socket.io for realtime examples
- jsPDF / html2canvas for PDF downloads

## Quick start

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Project structure

- `src/app/` — Next.js app router pages and API route entry points
- `src/components/` — Reusable UI components and feature modules
- `src/contexts/` — Authentication and application contexts
- `src/hooks/` — Custom React hooks
- `src/lib/` — Database and utility helpers
- `prisma/` — Prisma schema and migration history
- `public/` — Static assets

## Relevant pages

- `/login` — Login screen for authenticated access
- `/` — Protected dashboard with user list, search, and profile actions
- `/stats` — Analytics and statistics views
- `/api/users` — REST API for listing and creating users
- `/api/users/[id]` — REST API for retrieving, updating, and deleting users
- `/api/users/[id]/pdf` — Endpoint for exporting a user profile to PDF

## Development commands

```bash
npm run dev        # start development server
npm run build      # build the production app
npm start          # run production server
npm run lint       # run ESLint checks
npm run db:push    # push Prisma schema to the database
npm run db:generate # generate Prisma client
npm run db:migrate # run migrations
npm run db:reset   # reset database migrations and data
```

## Notes

- User authentication is implemented in the repository and protects the main dashboard.
- Customer and training records are stored through Prisma models and API routes.
- The login page currently uses in-code credentials.
- The app includes UI components for responsive and accessible forms, tables, and dialogs.

---

