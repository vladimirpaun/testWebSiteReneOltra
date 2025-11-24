# ReneOltra Frontend

Next.js 16 (App Router) app with Prisma and PostgreSQL. This is ready for Vercel + Vercel Postgres (free tier via the Marketplace).

## What to pick on Vercel?
- Use a **Postgres** database. In Vercel → Storage / Marketplace, pick **Prisma Postgres** (or **Vercel Postgres** if shown) for the free, serverless PostgreSQL option.
- Do **not** pick Edge Config or Blob; they are not databases. KV/Redis/Supabase/Turso are other stores, but this code is built for Postgres.

## Required environment variables
- `DATABASE_URL` → pooled connection string (on Vercel: `POSTGRES_PRISMA_URL`)
- `DIRECT_URL` → non-pooled connection string (on Vercel: `POSTGRES_URL_NON_POOLING`)
- Copy `.env.example` to `.env` and replace with your own strings.

## Local setup (with the Vercel Postgres connection)
```bash
cd frontend
cp .env.example .env               # paste your Vercel Postgres URLs
npm install
npx prisma migrate dev             # creates DB schema locally on that Postgres
npx prisma db seed                 # optional demo data (stays, supplements)
npm run dev                        # http://localhost:3000
```
Tip: If your project already exists on Vercel, pull env vars locally with `vercel env pull .env`.

## Deploy on Vercel (step by step)
1) **Create project**: Import the repo into Vercel.  
2) **Add database**: In Vercel → Storage (or Marketplace) → choose **Prisma Postgres**. Vercel will create `POSTGRES_PRISMA_URL` (pooled) and `POSTGRES_URL_NON_POOLING` (direct) env vars.  
3) **Map env vars** in Project Settings → Environment Variables:  
   - `DATABASE_URL` = `POSTGRES_PRISMA_URL`  
   - `DIRECT_URL` = `POSTGRES_URL_NON_POOLING`  
4) **Build command**: Vercel auto-detects and runs `npm run vercel-build` (which runs `prisma migrate deploy` then `next build`). If it doesn’t, set the Build Command manually to `npm run vercel-build`.  
5) **Redeploy**: Trigger a deploy (push to main or “Deploy” in the dashboard). Migrations run before the Next.js build.  
6) **(Optional) Seed production**: After deploy, run `vercel env pull .env.production && vercel exec --prod npx prisma db seed` (or run locally with the prod URLs) to insert the sample data.

## Migration and Prisma notes
- Dev DB with schema changes: `npx prisma migrate dev` (creates a new migration).
- Prod/CI deploy: `npx prisma migrate deploy` (already baked into `npm run vercel-build`).
- Regenerate client after schema edits: `npx prisma generate`.
- Seed data: `npx prisma db seed`.

## Troubleshooting
- P1012 “Environment variable not found: DATABASE_URL” → ensure `DATABASE_URL` and `DIRECT_URL` are set in Vercel and in your local `.env`.  
- Next.js build fails on Vercel → check that migrations succeed in the build log (needs `DIRECT_URL` reachable).  
- Connection issues locally → make sure you copied the **non-pooled** URL into `DIRECT_URL` and the pooled URL into `DATABASE_URL`, and that your IP is allowed (if your provider restricts IPs).  
