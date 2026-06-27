import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, HeartPulse, Stethoscope, UserRound } from "lucide-react";

export const metadata: Metadata = {
  title: "Get started · SwasthyaSetu",
  description: "Join SwasthyaSetu as a patient or a doctor.",
};

export default function JoinPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 text-white">
            <HeartPulse className="h-4 w-4" />
          </span>
          <span className="text-lg">SwasthyaSetu</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-20 pt-8 sm:pt-14">
        <div className="text-center">
          <span className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Get started
          </span>
          <h1 className="mt-5 font-heading text-3xl font-bold text-foreground sm:text-4xl">
            How will you use SwasthyaSetu?
          </h1>
          <p className="mt-3 text-muted-foreground">
            Choose the experience that fits you — you can always switch accounts later.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Patient */}
          <RoleCard
            icon={UserRound}
            accent="cyan"
            title="I'm a patient"
            blurb="Book tele-consults, keep your health records, find affordable medicine, and manage care for your whole family — in your language."
            primaryHref="/signup"
            primaryLabel="Continue as patient"
            signInHref="/login"
          />
          {/* Doctor */}
          <RoleCard
            icon={Stethoscope}
            accent="emerald"
            title="I'm a doctor"
            blurb="Register with your specialty and work a shared consultation queue — accept patients, complete visits with notes and prescriptions."
            primaryHref="/doctor/signup"
            primaryLabel="Continue as doctor"
            signInHref="/doctor/login"
          />
        </div>
      </section>
    </main>
  );
}

function RoleCard({
  icon: Icon,
  accent,
  title,
  blurb,
  primaryHref,
  primaryLabel,
  signInHref,
}: {
  icon: React.ElementType;
  accent: "cyan" | "emerald";
  title: string;
  blurb: string;
  primaryHref: string;
  primaryLabel: string;
  signInHref: string;
}) {
  const chip =
    accent === "cyan"
      ? "bg-cyan-500/15 text-cyan-600"
      : "bg-emerald-500/15 text-emerald-600";
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${
          accent === "cyan" ? "from-cyan-500/10" : "from-emerald-500/10"
        } to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
      />
      <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${chip}`}>
        <Icon className="h-6 w-6" />
      </span>
      <h2 className="mt-4 font-heading text-xl font-bold text-foreground">{title}</h2>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{blurb}</p>

      <div className="relative mt-6 flex items-center justify-between gap-3">
        <Link
          href={primaryHref}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-[#03141a] transition-transform hover:scale-105"
        >
          {primaryLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href={signInHref}
          className="text-sm font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
