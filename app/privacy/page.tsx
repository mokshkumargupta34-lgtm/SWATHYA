import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/marketing/info-page";

export const metadata: Metadata = {
  title: "Privacy · Sanjeevani",
  description: "How Sanjeevani protects your health data.",
};

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Privacy"
      title="Your health, your data"
      intro="Sanjeevani is built so your records travel with you — and stay yours. Here's how we handle your information."
    >
      <InfoSection title="What we collect">
        <p>
          Your account details (name, email), the health information you choose
          to add (records, consults, family members, preferences) and basic usage
          data needed to keep the service secure and reliable.
        </p>
      </InfoSection>
      <InfoSection title="How your data is protected">
        <p>
          Every row of your data is protected by database-level row-level security
          — only you, signed in, can read or write your own records. Sessions are
          held in encrypted, httpOnly cookies that JavaScript can&rsquo;t read.
        </p>
      </InfoSection>
      <InfoSection title="What we never do">
        <p>
          We never sell your data, and we never share your health records with
          third parties without your explicit consent. Care workers only see what
          you share with them.
        </p>
      </InfoSection>
      <InfoSection title="Your rights">
        <p>
          You can export or delete your records at any time from the Care Console.
          Deleting your account removes your profile and all associated records.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
