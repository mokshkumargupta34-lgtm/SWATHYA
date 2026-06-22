import Link from "next/link";
import { ArrowLeft, HeartPulse } from "lucide-react";

/**
 * Shared shell for the marketing/legal pages (Privacy, Terms, Support). Styled
 * with the SWASTHYA tokens so it matches the rest of the site in light & dark.
 */
export function InfoPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 text-white">
              <HeartPulse className="h-4 w-4" />
            </span>
            <span className="text-lg">SWASTHYA</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-14">
        <span className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
          {eyebrow}
        </span>
        <h1 className="mt-5 bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text font-heading text-4xl font-bold text-transparent sm:text-5xl">
          {title}
        </h1>
        {intro ? (
          <p className="mt-4 text-lg text-muted-foreground">{intro}</p>
        ) : null}

        <div className="mt-10 space-y-8 leading-relaxed">{children}</div>

        <p className="mt-14 border-t border-border pt-6 text-sm text-muted-foreground">
          SWASTHYA · स्वास्थ्य — Health, wellness &amp; care access. Last updated 21 June 2026.
        </p>
      </article>
    </main>
  );
}

export function InfoSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-heading text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-2 space-y-3 text-muted-foreground">{children}</div>
    </section>
  );
}
