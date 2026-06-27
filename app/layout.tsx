import type { Metadata } from "next";
import { JetBrains_Mono, Lora, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { GoogleTranslateInit } from "@/components/ui/language-selector";

// Lora (serif) — brand identity, hero titles, section headings.
const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
  display: "swap",
});

// Plus Jakarta Sans (sans) — navigation, body content, form controls.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-raleway", // kept var name so existing token wiring resolves
  display: "swap",
});

// JetBrains Mono — numeric metrics, counters, technical status indicators.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://swathya.vercel.app";
const SITE_DESCRIPTION =
  "SwasthyaSetu (स्वास्थ्य) brings healthcare closer in distance, cost and language — rural & remote care, maternal & child health, youth mental health, affordable medicine and portable health records.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SwasthyaSetu — Health, Wellness & Care Access",
    template: "%s · SwasthyaSetu",
  },
  description: SITE_DESCRIPTION,
  applicationName: "SwasthyaSetu",
  keywords: [
    "rural healthcare",
    "telemedicine India",
    "maternal health",
    "mental health",
    "affordable medicine",
    "health records",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "SwasthyaSetu",
    title: "SwasthyaSetu — Health, Wellness & Care Access",
    description: SITE_DESCRIPTION,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "SwasthyaSetu — Health, Wellness & Care Access",
    description: SITE_DESCRIPTION,
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${lora.variable} ${jakarta.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* Apply saved theme before paint to avoid a flash of the wrong theme. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var e=document.documentElement;if(localStorage.getItem('theme')==='dark'){e.classList.add('dark')}if(localStorage.getItem('swasthya:lite')==='1'){e.classList.add('lite')}}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-background text-foreground antialiased">
        <GoogleTranslateInit />
        {children}
      </body>
    </html>
  );
}
