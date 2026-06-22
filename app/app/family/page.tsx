"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Plus, Trash2, UserPlus, Users } from "lucide-react";
import { apiGet, apiSend, type FamilyMember } from "@/lib/client-api";
import {
  EmptyState,
  ErrorNote,
  Field,
  PageContainer,
  PageHeading,
  SectionCard,
  Spinner,
  TextInput,
} from "@/components/app/primitives";

const PLAN_LABEL: Record<string, string> = {
  JAN: "Individual",
  PARIVAR: "Family+",
  SAMUDAY: "Community",
};

type FamilyData = {
  members: FamilyMember[];
  plan: string;
  limit: number;
};

export default function FamilyPage() {
  const [data, setData] = React.useState<FamilyData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    apiGet<FamilyData>("/api/family")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  React.useEffect(load, [load]);

  const remove = async (id: string) => {
    setData((prev) =>
      prev ? { ...prev, members: prev.members.filter((m) => m.id !== id) } : prev,
    );
    try {
      await apiSend(`/api/family/${id}`, "DELETE");
    } catch (e) {
      setError((e as Error).message);
      load();
    }
  };

  const used = data?.members.length ?? 0;
  const limit = data?.limit ?? 0;
  const atCapacity = used >= limit;

  return (
    <PageContainer>
      <PageHeading
        icon={Users}
        title="Family members"
        subtitle="Manage care for everyone under your plan."
        action={
          data ? (
            <span className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground">
              {used} / {limit === 1000 ? "∞" : limit} used ·{" "}
              <span className="text-primary">{PLAN_LABEL[data.plan]}</span>
            </span>
          ) : null
        }
      />

      <ErrorNote>{error}</ErrorNote>

      {!data ? (
        <SectionCard>
          <Spinner label="Loading family…" />
        </SectionCard>
      ) : data.plan === "JAN" ? (
        <SectionCard>
          <EmptyState
            icon={Users}
            title="Your Individual plan covers just you"
            hint="Upgrade to Family+ to add up to 6 members, or Community for unlimited."
            action={
              <Link
                href="/app/settings"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-500 px-4 py-2 text-sm font-semibold text-[#03141a] transition-transform hover:scale-105"
              >
                Upgrade plan
              </Link>
            }
          />
        </SectionCard>
      ) : (
        <>
          {!atCapacity ? (
            <FamilyForm
              onAdded={(m) =>
                setData((prev) =>
                  prev ? { ...prev, members: [...prev.members, m] } : prev,
                )
              }
              onError={setError}
            />
          ) : (
            <SectionCard>
              <p className="text-sm text-muted-foreground">
                You&rsquo;ve reached your plan&rsquo;s limit of {limit} members. Remove
                someone or upgrade your plan to add more.
              </p>
            </SectionCard>
          )}

          {data.members.length === 0 ? (
            <SectionCard>
              <EmptyState
                icon={UserPlus}
                title="No family members yet"
                hint="Add the people you manage care for."
              />
            </SectionCard>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {data.members.map((m) => (
                <SectionCard key={m.id} className="flex items-center gap-3 p-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 font-semibold text-white">
                    {m.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.relation}
                      {m.dob
                        ? ` · ${new Date(m.dob).toLocaleDateString(undefined, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}`
                        : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(m.id)}
                    aria-label="Remove member"
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </SectionCard>
              ))}
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}

function FamilyForm({
  onAdded,
  onError,
}: {
  onAdded: (m: FamilyMember) => void;
  onError: (msg: string) => void;
}) {
  const [name, setName] = React.useState("");
  const [relation, setRelation] = React.useState("");
  const [dob, setDob] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !relation.trim()) return;
    setSaving(true);
    try {
      const { member } = await apiSend<{ member: FamilyMember }>(
        "/api/family",
        "POST",
        { name: name.trim(), relation: relation.trim(), dob: dob || null },
      );
      onAdded(member);
      setName("");
      setRelation("");
      setDob("");
    } catch (err) {
      onError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Name">
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
            />
          </Field>
          <Field label="Relation">
            <TextInput
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              placeholder="e.g. Mother, Son"
              required
            />
          </Field>
          <Field label="Date of birth (optional)">
            <TextInput type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
          </Field>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add member
        </button>
      </form>
    </SectionCard>
  );
}
