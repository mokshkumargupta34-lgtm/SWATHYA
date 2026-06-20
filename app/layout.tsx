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

export const metadata: Metadata = {
  title: "SWASTHYA — Health, Wellness & Care Access",
  description:
    "SWASTHYA (स्वास्थ्य) brings healthcare closer in distance, cost and language — rural & remote care, maternal & child health, youth mental health, affordable medicine and portable health records.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${lora.variable} ${raleway.variable}`}>
      <body className="bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
