import type { Metadata } from "next";
import { Lora, Raleway } from "next/font/google";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-raleway",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://swathya.vercel.app";
const SITE_DESCRIPTION =
  "SWASTHYA (स्वास्थ्य) brings healthcare closer in distance, cost and language — rural & remote care, maternal & child health, youth mental health, affordable medicine and portable health records.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SWASTHYA — Health, Wellness & Care Access",
    template: "%s · SWASTHYA",
  },
  description: SITE_DESCRIPTION,
  applicationName: "SWASTHYA",
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
    siteName: "SWASTHYA",
    title: "SWASTHYA — Health, Wellness & Care Access",
    description: SITE_DESCRIPTION,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "SWASTHYA — Health, Wellness & Care Access",
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
      className={`${lora.variable} ${raleway.variable}`}
    >
      <head>
        {/* Apply saved theme before paint to avoid a flash of the wrong theme. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
