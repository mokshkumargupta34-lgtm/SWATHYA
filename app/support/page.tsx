import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/marketing/info-page";

export const metadata: Metadata = {
  title: "Support · SwasthyaSetu",
  description: "Get help with SwasthyaSetu.",
};

export default function SupportPage() {
  return (
    <InfoPage
      eyebrow="Support"
      title="We're here to help"
      intro="Questions about care, your account or your plan? Reach us in your language, 24/7."
    >
      <InfoSection title="Contact us">
        <p>
          Have a question the FAQs below don&rsquo;t cover? Reach out from inside
          your Care Console once you&rsquo;re signed in, and we&rsquo;ll get back
          within one working day. Community (SAMUDAY) plans include a dedicated
          success manager.
        </p>
      </InfoSection>
      <InfoSection title="Common questions">
        <p>
          <strong className="text-foreground">How do I add a health record?</strong>
          <br />
          Sign in, open the Care Console and go to Records → New record.
        </p>
        <p>
          <strong className="text-foreground">Which languages are supported?</strong>
          <br />
          Eight, including Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati and
          Kannada. Set yours in Settings.
        </p>
        <p>
          <strong className="text-foreground">How many family members can I add?</strong>
          <br />
          Individual covers you, Family+ up to six, and Community unlimited.
        </p>
      </InfoSection>
      <InfoSection title="Get started">
        <p>
          New here?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary underline underline-offset-2"
          >
            Create a free account
          </Link>{" "}
          or{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline underline-offset-2"
          >
            sign in
          </Link>{" "}
          to open your Care Console.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
