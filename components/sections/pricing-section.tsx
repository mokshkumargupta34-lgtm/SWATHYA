"use client";

import * as React from "react";
import { Pricing } from "@/components/ui/pricing";

export const SWASTHYA_PLANS = [
  {
    name: "JAN (Individual)",
    price: "0",
    yearlyPrice: "0",
    period: "per month",
    features: [
      "Tele-consults with general physicians",
      "Personal health record",
      "Medicine availability search",
      "Maternal & child reminders",
      "Multilingual support (8 languages)",
    ],
    description: "Free forever for individuals and families",
    buttonText: "Start Free",
    href: "/signup",
    isPopular: false,
  },
  {
    name: "PARIVAR (Family+)",
    price: "99",
    yearlyPrice: "79",
    period: "per month",
    features: [
      "Everything in Individual",
      "Up to 6 family members",
      "Specialist tele-consults",
      "Youth mental-health counselling",
      "Priority pharmacy & generic alerts",
      "Lab report storage & sharing",
      "24-hour support",
    ],
    description: "Best for households managing care together",
    buttonText: "Get Parivar",
    href: "/signup",
    isPopular: true,
  },
  {
    name: "SAMUDAY (Community)",
    price: "499",
    yearlyPrice: "399",
    period: "per month",
    features: [
      "Everything in Family+",
      "ASHA / health-worker console",
      "Village-level dashboards",
      "Bulk records & camp scheduling",
      "Offline-first data sync",
      "Dedicated success manager",
      "Custom integrations & SLA",
    ],
    description: "For NGOs, clinics and health programs",
    buttonText: "Contact Care Team",
    href: "/support",
    isPopular: false,
  },
];

export function PricingSection({
  title = "Care plans for every reach",
  description = `Choose the plan that fits your family, clinic or community.
Every plan keeps care affordable — most features are free, forever.`,
}: {
  title?: string;
  description?: string;
} = {}) {
  return (
    <section className="relative bg-background py-12">
      <Pricing plans={SWASTHYA_PLANS} title={title} description={description} />
    </section>
  );
}
