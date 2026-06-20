"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  Baby,
  Bell,
  Brain,
  CalendarClock,
  FileHeart,
  Frown,
  HeartPulse,
  Laugh,
  LayoutDashboard,
  LogOut,
  MapPin,
  Meh,
  Pill,
  Smile,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Upload,
  Users,
} from "lucide-react";
import { ClickPowerUp } from "@/components/ui/click-powerup";
import { FrameButton } from "@/components/ui/frame-button";
import { ProgressiveFluxLoader } from "@/components/ui/progressive-flux-loader";
import { Sketch } from "@/components/ui/generative-geometry";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { icon: LayoutDashboard, label: "Overview", href: "#overview" },
  { icon: Stethoscope, label: "Tele-Care", href: "#telecare" },
  { icon: Baby, label: "Maternal & Child", href: "#maternal" },
  { icon: Brain, label: "Mental Health", href: "#mind" },
  { icon: Pill, label: "Medicine", href: "#medicine" },
  { icon: FileHeart, label: "Records", href: "#records" },
];

const STATS = [
  { icon: Users, k: "12,480", v: "Patients reached", c: "text-cyan-600 bg-cyan-500/10" },
  { icon: CalendarClock, k: "318", v: "Consults today", c: "text-emerald-600 bg-emerald-500/10" },
  { icon: MapPin, k: "94", v: "Villages live", c: "text-teal-600 bg-teal-500/10" },
  { icon: ShieldCheck, k: "100%", v: "Records secured", c: "text-sky-600 bg-sky-500/10" },
];

function Card({
  id,
  icon: Icon,
  title,
  children,
  className,
}: {
  id?: string;
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className={cn(
        "scroll-mt-24 rounded-3xl border border-border bg-card p-6 shadow-sm",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="font-heading text-lg font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

function MoodCheckIn() {
  const moods = [
    { Icon: Frown, label: "Low", c: "hover:bg-rose-500/10", ic: "text-rose-500" },
    { Icon: Meh, label: "Okay", c: "hover:bg-amber-500/10", ic: "text-amber-500" },
    { Icon: Smile, label: "Good", c: "hover:bg-emerald-500/10", ic: "text-emerald-500" },
    { Icon: Laugh, label: "Great", c: "hover:bg-cyan-500/10", ic: "text-cyan-500" },
  ];
  const [sel, setSel] = React.useState<number | null>(2);
  return (
    <div>
      <p className="text-sm text-muted-foreground">How are you feeling today?</p>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {moods.map((m, i) => (
          <button
            key={m.label}
            onClick={() => setSel(i)}
            className={cn(
              "flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-3 transition-colors",
              m.c,
              sel === i ? "border-primary bg-primary/5" : "border-border",
            )}
          >
            <m.Icon className={cn("h-6 w-6", m.ic)} />
            <span className="text-[11px] font-medium text-muted-foreground">{m.label}</span>
          </button>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        {sel !== null && sel < 2
          ? "A counsellor can talk now — completely private."
          : "Glad to hear it. Keep tracking your mood daily."}
      </p>
      <Button className="mt-3 w-full" variant={sel !== null && sel < 2 ? "default" : "secondary"}>
        {sel !== null && sel < 2 ? "Talk to a counsellor" : "Log mood"}
      </Button>
    </div>
  );
}

function MedicineSearch() {
  const all = [
    { name: "Paracetamol 500mg", store: "Jan Aushadhi · 0.8 km", price: "₹12", stock: true },
    { name: "Amoxicillin 250mg", store: "City Pharmacy · 1.4 km", price: "₹38", stock: true },
    { name: "Iron + Folic Acid", store: "PHC Dispensary · 2.1 km", price: "Free", stock: true },
    { name: "Insulin (generic)", store: "Care Pharmacy · 3.0 km", price: "₹140", stock: false },
  ];
  const [q, setQ] = React.useState("");
  const res = all.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a medicine…"
          className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <ul className="mt-4 space-y-2">
        {res.map((m) => (
          <li
            key={m.name}
            className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.store}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{m.price}</p>
              <p className={cn("text-[11px] font-medium", m.stock ? "text-emerald-600" : "text-rose-500")}>
                {m.stock ? "In stock" : "Out of stock"}
              </p>
            </div>
          </li>
        ))}
        {res.length === 0 && (
          <li className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
            No matches — try a generic name.
          </li>
        )}
      </ul>
    </div>
  );
}

function WeeklyChart() {
  const bars = [40, 62, 48, 80, 55, 92, 70, 88, 60, 96, 74, 82];
  const days = ["M", "T", "W", "T", "F", "S", "S", "M", "T", "W", "T", "F"];
  return (
    <div>
      <div className="flex h-48 items-end gap-1.5">
        {bars.map((h, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center">
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t bg-gradient-to-t from-cyan-500/40 to-emerald-400 transition-all hover:from-cyan-500/70"
                style={{ height: `${h}%` }}
              />
            </div>
            <span className="mt-2 text-[10px] text-muted-foreground">{days[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = React.useMemo(
    () => (isSupabaseConfigured ? createClient() : null),
    [],
  );
  const [email, setEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!supabase) return;
    supabase.auth
      .getUser()
      .then(({ data }) => setEmail(data.user?.email ?? null));
  }, [supabase]);

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const initial = (email?.[0] ?? "A").toUpperCase();

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Sidebar */}
      <aside className="sticky top-0 z-30 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card/60 p-5 backdrop-blur lg:flex">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 text-white">
            <HeartPulse className="h-4 w-4" />
          </span>
          <span className="text-lg">SWASTHYA</span>
        </Link>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map((n) => (
            <a
              key={n.label}
              href={n.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <n.icon className="h-4.5 w-4.5" />
              {n.label}
            </a>
          ))}
        </nav>

        <button
          onClick={signOut}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600"
        >
          <LogOut className="h-4.5 w-4.5" />
          Log out
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-sm text-muted-foreground">
              Welcome back{email ? `, ${email}` : ""},
            </p>
            <h1 className="font-heading text-xl font-semibold text-foreground">
              Care Console
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-emerald-500" />
            </button>
            <span
              title={email ?? undefined}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 font-semibold text-white"
            >
              {initial}
            </span>
          </div>
        </header>

        <main id="overview" className="mx-auto max-w-6xl space-y-6 p-6">
          {/* Stat row */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STATS.map((s, i) => (
              <motion.div
                key={s.v}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <span className={cn("inline-flex h-10 w-10 items-center justify-center rounded-xl", s.c)}>
                  <s.icon className="h-5 w-5" />
                </span>
                <p className="mt-3 font-heading text-2xl font-bold text-foreground">{s.k}</p>
                <p className="text-xs text-muted-foreground">{s.v}</p>
              </motion.div>
            ))}
          </div>

          {/* Row: chart + tele-care */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card icon={Activity} title="Weekly consultations" className="lg:col-span-2">
              <WeeklyChart />
            </Card>

            <Card id="telecare" icon={Stethoscope} title="Tele-Care">
              <p className="text-sm text-muted-foreground">
                Your next consult is in <span className="font-semibold text-foreground">12 min</span>.
                Start an instant video visit with a doctor in your language.
              </p>
              <div className="mt-5 flex justify-center">
                <ClickPowerUp className="text-foreground">Start Consult</ClickPowerUp>
              </div>
            </Card>
          </div>

          {/* Row: maternal + mind */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card id="maternal" icon={Baby} title="Maternal & Child Health">
              <ul className="space-y-3">
                {[
                  { t: "ANC visit · Week 28", d: "Due in 3 days", done: false },
                  { t: "Tetanus booster", d: "Completed", done: true },
                  { t: "Child growth check", d: "Scheduled · 12 Jul", done: false },
                ].map((it) => (
                  <li key={it.t} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5">
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                        it.done ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600",
                      )}
                    >
                      {it.done ? "✓" : "•"}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{it.t}</p>
                      <p className="text-xs text-muted-foreground">{it.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            <Card id="mind" icon={Brain} title="Mental Health Check-in">
              <MoodCheckIn />
            </Card>
          </div>

          {/* Row: medicine + records */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card id="medicine" icon={Pill} title="Medicine Availability & Affordability">
              <MedicineSearch />
            </Card>

            <Card id="records" icon={FileHeart} title="Portable Health Records">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="aspect-square overflow-hidden rounded-2xl border border-border">
                  <Sketch />
                </div>
                <div className="flex flex-col justify-between">
                  <ul className="space-y-2 text-sm">
                    {["Prescriptions (14)", "Lab reports (6)", "Vaccination card", "Discharge summary"].map(
                      (r) => (
                        <li key={r} className="flex items-center gap-2 text-foreground">
                          <FileHeart className="h-4 w-4 text-primary" /> {r}
                        </li>
                      ),
                    )}
                  </ul>
                  <div className="mt-4">
                    <ProgressiveFluxLoader
                      duration={6}
                      showLabel={false}
                      className="max-w-full gap-0"
                      barClassName="h-3"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">Syncing records securely…</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick actions + explore */}
          <Card icon={Sparkles} title="Quick actions">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex flex-wrap items-center gap-4">
                <Button className="gap-2">
                  <Upload className="h-4 w-4" /> Upload report
                </Button>
                <Button variant="secondary" className="gap-2">
                  <CalendarClock className="h-4 w-4" /> Book appointment
                </Button>
                <ClickPowerUp className="text-foreground">New Record</ClickPowerUp>
              </div>
              <Link href="/explore" className="no-underline">
                <FrameButton as="button" variant="outline" glow>
                  Explore our vision
                </FrameButton>
              </Link>
            </div>
          </Card>

          <p className="pb-10 pt-2 text-center text-xs text-muted-foreground">
            SWASTHYA · स्वास्थ्य — bringing healthcare closer in distance, cost and language.
          </p>
        </main>
      </div>
    </div>
  );
}
