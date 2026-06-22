import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/marketing/info-page";

export const metadata: Metadata = {
  title: "Terms · SWASTHYA",
  description: "The terms of using SWASTHYA.",
};

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Terms"
      title="Terms of service"
      intro="By using SWASTHYA you agree to the following. We've kept them plain."
    >
      <InfoSection title="Using SWASTHYA">
        <p>
          SWASTHYA helps you reach tele-consults, store health records, find
          medicines and manage care for your family. You agree to use it lawfully
          and to keep your login credentials secure.
        </p>
      </InfoSection>
      <InfoSection title="Not a medical emergency service">
        <p>
          SWASTHYA connects you with healthcare information and providers, but it
          is not a substitute for emergency care. In an emergency, contact your
          local emergency services immediately.
        </p>
      </InfoSection>
      <InfoSection title="Plans &amp; billing">
        <p>
          The Individual (JAN) plan is free forever. Family+ (PARIVAR) and
          Community (SAMUDAY) are paid plans billed monthly or annually. You can
          change or cancel your plan at any time from Settings.
        </p>
      </InfoSection>
      <InfoSection title="Accounts">
        <p>
          You are responsible for the activity on your account. We may suspend
          accounts that abuse the service or put others&rsquo; safety at risk.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
