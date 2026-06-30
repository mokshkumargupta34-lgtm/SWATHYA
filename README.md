# Sanjeevani (संजीवनी)

**Health, Wellness & Care Access** — a high-end scrollytelling healthcare platform that brings care closer in **distance, cost and language**.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Framer Motion**, **three.js / WebGL**, **GSAP**, **p5.js**, HTML5 Canvas, and **Supabase** auth.

## Focus areas

1. Rural & remote healthcare
2. Maternal & child health
3. Mental health for youth
4. Medicine availability & affordability
5. Health records for mobile workers

## Features

- **Scrollytelling hero** — a scroll-scrubbed HTML5 Canvas sequence that narrates the five focus areas, with a multilingual morphing headline.
- **Immersive sections** — three.js anomaly, interactive particle "care mesh", a scroll-reveal dashboard preview, and a WebGL2 shader CTA.
- **Pricing**, **animated cinematic footer**, and a marketing landing page.
- **Care Console** (`/app`) — a real, database-backed authenticated product:
  - **Dashboard** — live stats, a 7-day consultation chart and the upcoming care queue.
  - **Records** — create / list / delete portable health records, **attach a photo or PDF** (lab report, prescription, scan), and get an **AI explanation** in plain language. Attachments and insights are visible to the treating doctor.
  - **Consults** — book, list and cancel tele-consultations (general, specialist, mental health, maternal).
  - **Medicines** — search the catalog for nearby-pharmacy stock with a cheaper **generic alternative** suggestion.
  - **Family** — add / remove members, enforcing plan limits (Individual = self, Family+ = 6, Community = unlimited).
  - **Settings** — edit profile, preferred language (8 languages) and switch plan.
- **REST API** under `/app/api/*` — every route is zod-validated and session-scoped; data isolation is enforced at the database level by Supabase **Row Level Security**.
- **Supabase authentication** — magic-link email + password signup + Google/GitHub OAuth, protected `/app/*`, with a graceful front-end mock fallback until keys are set.
- Performance-tuned: every canvas/WebGL loop pauses when off-screen.

## Getting started

```bash
npm install
cp .env.example .env.local   # then add your Supabase URL + anon key (optional)
npm run dev
```

Open <https://swathya.vercel.app/>.

### Enabling real auth + the Care Console (required for `/app`)

1. Create a project at [supabase.com](https://supabase.com).
2. Put the **Project URL** and **anon/public key** (Settings → API) into `.env.local`.
3. In Supabase → Authentication → URL Configuration, set Site URL `http://localhost:3000` and add Redirect URL `http://localhost:3000/auth/callback`.
4. **Run the schema + seed:** open Supabase → SQL Editor → New query, paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql) and run it. This is idempotent (safe to re-run) and creates the `profiles`, `health_profiles`, `health_records`, `consults`, `family_members` tables (all row-level-secured) plus the medicine catalog (`pharmacies`, `medicines`, `medicine_stock`) and seeds ~6 pharmacies and 15 medicines.
5. Restart the dev server, then sign up at `/signup`. (Without keys, login uses a front-end mock; the `/app` API returns `503` until the schema is run.)

> The Care Console lives under `/app`. `/dashboard` permanently redirects there.

### Record attachments + AI analysis

- Re-running [`supabase/schema.sql`](supabase/schema.sql) (step 4 above) is required after pulling this — it adds the `records` storage bucket, the AI columns on `health_records`, and the doctor read policy. It's idempotent, so just paste & run it again.
- File uploads land in a public-by-URL `records` bucket under `records/<uid>/…` (unguessable paths). Doctors open patient attachments via the same URL once they have a consult with that patient.
- For the **AI features** (symptom checker, "Mitra" wellness chat, AI history builder, and the plain-language record explanations), set `GROQ_API_KEY` in `.env.local` (see [`.env.example`](.env.example)) and restart. It uses **Groq's free tier** (Llama models, fast, no credit card) — get a free key at [console.groq.com/keys](https://console.groq.com/keys). To also analyze **PDF** record scans (Groq vision reads images but not PDFs), additionally set a free `GEMINI_API_KEY` from [aistudio.google.com/apikey](https://aistudio.google.com/apikey). All output is cautious and plain-language, never a diagnosis. Without a key, uploads still work; the AI just reports that it isn't configured.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run typecheck` — TypeScript check

## Tech stack

Next.js · React 18 · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · Framer Motion · GSAP · three.js · p5.js · canvas-confetti · @number-flow/react · Supabase (`@supabase/ssr`).
