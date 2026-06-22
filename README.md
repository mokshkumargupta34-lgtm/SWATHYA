# SWASTHYA (स्वास्थ्य)

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
- **Pricing**, **animated cinematic footer**, and a feature-rich **dashboard** (tele-care, maternal tracking, mental-health check-in, medicine search, portable records).
- **Supabase authentication** — magic-link email + Google/GitHub OAuth, protected dashboard, with a graceful front-end mock fallback until keys are set.
- Performance-tuned: every canvas/WebGL loop pauses when off-screen.

## Getting started

```bash
npm install
cp .env.example .env.local   # then add your Supabase URL + anon key (optional)
npm run dev
```

Open <https://swathya.vercel.app/>.

### Enabling real auth (optional)

1. Create a project at [supabase.com](https://supabase.com).
2. Put the **Project URL** and **anon/public key** (Settings → API) into `.env.local`.
3. In Supabase → Authentication → URL Configuration, set Site URL `http://localhost:3000` and add Redirect URL `http://localhost:3000/auth/callback`.
4. Restart the dev server. (Without keys, login uses a front-end mock.)

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run typecheck` — TypeScript check

## Tech stack

Next.js · React 18 · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · Framer Motion · GSAP · three.js · p5.js · canvas-confetti · @number-flow/react · Supabase (`@supabase/ssr`).
