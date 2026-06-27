import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/marketing/info-page";

export const metadata: Metadata = {
  title: "Terms · Sanjeevani",
  description: "The terms of using Sanjeevani.",
};

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Terms"
      title="Terms of service"
      intro="By using Sanjeevani you agree to the following. We've kept them plain."
    >
      <InfoSection title="Using Sanjeevani">
        <p>
          Sanjeevani helps you reach tele-consults, store health records, find
          medicines and manage care for your family. You agree to use it lawfully
          and to keep your login credentials secure.
        </p>
      </InfoSection>
      <InfoSection title="Not a medical emergency service">
        <p>
          Sanjeevani connects you with healthcare information and providers, but it
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
