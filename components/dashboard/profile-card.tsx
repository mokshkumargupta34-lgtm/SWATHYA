"use client";

import * as React from "react";
import { Check, Loader2, UserRound } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Reads and updates the signed-in user's row in `public.profiles`, including an
 * avatar uploaded to the `avatars` storage bucket.
 * Renders just the inner content — wrap it in the dashboard's <Card>.
 */
export function ProfileCard() {
  const supabase = React.useMemo(
    () => (isSupabaseConfigured ? createClient() : null),
    [],
  );

  const fileRef = React.useRef<HTMLInputElement>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const tableMissing = (msg: string) =>
    /relation .*profiles.* does not exist|schema cache|could not find the table/i.test(
      msg,
    );

  React.useEffect(() => {
    let active = true;
    if (!supabase) {
      setLoading(false);
      return;
    }
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);
      setEmail(user.email ?? "");
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      if (!active) return;
      if (error) {
        setNotice(
          tableMissing(error.message)
            ? "Run supabase/schema.sql in your Supabase SQL editor to enable profiles."
            : error.message,
        );
      } else if (data) {
        setFullName(data.full_name ?? "");
        setAvatarUrl(data.avatar_url ?? null);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [supabase]);

  const save = async () => {
    if (!supabase || !userId) return;
    setSaving(true);
    setNotice(null);
    setSaved(false);
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      email,
      full_name: fullName.trim() || null,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) setNotice(error.message);
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase || !userId) return;
    if (!file.type.startsWith("image/")) {
      setNotice("Please choose an image file.");
      return;
    }
    setUploading(true);
    setNotice(null);

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${userId}/avatar.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (upErr) {
      setUploading(false);
      setNotice(
        /bucket not found/i.test(upErr.message)
          ? "Create the 'avatars' bucket by running supabase/schema.sql."
          : upErr.message,
      );
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);
    // Cache-bust so the new image shows even though the path is reused.
    const busted = `${publicUrl}?v=${Date.now()}`;

    const { error: dbErr } = await supabase.from("profiles").upsert({
      id: userId,
      email,
      avatar_url: busted,
      updated_at: new Date().toISOString(),
    });

    setUploading(false);
    if (dbErr) setNotice(dbErr.message);
    else setAvatarUrl(busted);
  };

  if (!supabase) {
    return (
      <p className="text-sm text-muted-foreground">
        Add your Supabase keys to <code className="font-mono">.env.local</code>{" "}
        to manage your profile.
      </p>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading profile…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 text-white">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xl font-semibold">
              {(fullName || email || "U").charAt(0).toUpperCase()}
            </span>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          )}
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPickFile}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            <UserRound className="h-4 w-4" />
            {uploading ? "Uploading…" : "Change photo"}
          </Button>
          <p className="mt-1 text-xs text-muted-foreground">PNG or JPG, up to a few MB.</p>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">Email</label>
        <input
          value={email}
          readOnly
          className="mt-1 w-full rounded-xl border border-input bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">
          Full name
        </label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your name"
          className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving} className="gap-2">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4" />
          ) : null}
          {saved ? "Saved" : "Save changes"}
        </Button>
        {notice && (
          <span
            className={cn(
              "text-xs",
              saved ? "text-emerald-600" : "text-destructive",
            )}
          >
            {notice}
          </span>
        )}
      </div>
    </div>
  );
}
