import {
  HeartHandshake,
  MessageCircle,
  Network,
  ScanLine,
  ShieldCheck,
  WifiOff,
} from "lucide-react";

const ITEMS = [
  {
    icon: WifiOff,
    accent: "text-cyan-600 bg-cyan-500/10",
    title: "Offline-first & 2G tele-care",
    body: "Async video consults and records that sync when the signal returns — built for the last village on the map.",
  },
  {
    icon: MessageCircle,
    accent: "text-emerald-600 bg-emerald-500/10",
    title: "WhatsApp care reminders",
    body: "Antenatal check-ups, vaccination schedules and refill nudges delivered where families already are.",
  },
  {
    icon: ScanLine,
    accent: "text-sky-600 bg-sky-500/10",
    title: "AI anaemia screening",
    body: "A phone-flash + fingernail check designed for ASHA workers in settings with no lab access.",
  },
  {
    icon: Network,
    accent: "text-teal-600 bg-teal-500/10",
    title: "Crowd-sourced medicine map",
    body: "Pharmacists and patients mark live stock of essential drugs across small towns and villages.",
  },
  {
    icon: HeartHandshake,
    accent: "text-cyan-600 bg-cyan-500/10",
    title: "Anonymous peer support",
    body: "Moderated student group chats with AI that quietly watches for crisis signals and escalates to a counsellor.",
  },
  {
    icon: ShieldCheck,
    accent: "text-emerald-600 bg-emerald-500/10",
    title: "Portable health identity",
    body: "One verified, tamper-evident record that travels with seasonal workers across states and jobs.",
  },
];

export function Roadmap() {
  return (
    <section className="relative bg-background py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
            On the roadmap
          </span>
          <h2 className="mt-5 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            What we&rsquo;re building{" "}
            <span className="bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
              next
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Live today: AI symptom guidance, a wellness companion, AI record
            insights and history, generic-medicine search and a portable QR card.
            These are coming.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((it) => (
            <div
              key={it.title}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${it.accent}`}>
                  <it.icon className="h-6 w-6" />
                </span>
                <span className="rounded-full border border-border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Soon
                </span>
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold text-foreground">{it.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
