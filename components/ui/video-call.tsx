"use client";

import * as React from "react";
import { Loader2, Video, X } from "lucide-react";

// Embeds a Jitsi Meet room (no API keys / no signaling server needed). Both the
// doctor and the patient join the same room derived from the consult id, so the
// room name is unguessable. For production you'd self-host Jitsi or add JWT auth.

const JITSI_DOMAIN = "meet.jit.si";
const JITSI_SRC = `https://${JITSI_DOMAIN}/external_api.js`;

type JitsiApi = {
  addEventListener: (event: string, listener: (...args: unknown[]) => void) => void;
  dispose: () => void;
};
type JitsiCtor = new (domain: string, options: Record<string, unknown>) => JitsiApi;

declare global {
  interface Window {
    JitsiMeetExternalAPI?: JitsiCtor;
  }
}

function loadJitsi(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.JitsiMeetExternalAPI) return resolve(true);
    const existing = document.getElementById("jitsi-external-api");
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const s = document.createElement("script");
    s.id = "jitsi-external-api";
    s.src = JITSI_SRC;
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function VideoCallOverlay({
  room,
  displayName,
  subject,
  waitingFor,
  onClose,
}: {
  room: string;
  displayName: string;
  subject?: string;
  waitingFor?: string;
  onClose: () => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const apiRef = React.useRef<JitsiApi | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [joined, setJoined] = React.useState(false);
  const [peers, setPeers] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await loadJitsi();
      if (cancelled) return;
      const Ctor = window.JitsiMeetExternalAPI;
      if (!ok || !Ctor || !containerRef.current) {
        setError("Couldn't load the video service. Check your connection and try again.");
        setLoading(false);
        return;
      }
      const api = new Ctor(JITSI_DOMAIN, {
        roomName: `sanjeevani-${room}`,
        parentNode: containerRef.current,
        width: "100%",
        height: "100%",
        userInfo: { displayName },
        configOverwrite: {
          prejoinPageEnabled: true,
          disableDeepLinking: true,
          subject: subject ?? "Sanjeevani consultation",
        },
        interfaceConfigOverwrite: {
          MOBILE_APP_PROMO: false,
          SHOW_JITSI_WATERMARK: false,
          SHOW_CHROME_EXTENSION_BANNER: false,
        },
      });
      apiRef.current = api;
      api.addEventListener("videoConferenceJoined", () => {
        setLoading(false);
        setJoined(true);
      });
      api.addEventListener("participantJoined", () => setPeers((n) => n + 1));
      api.addEventListener("participantLeft", () => setPeers((n) => Math.max(0, n - 1)));
      api.addEventListener("readyToClose", () => onClose());
      // Hide the spinner once the iframe has had time to render the pre-join UI.
      setTimeout(() => !cancelled && setLoading(false), 3500);
    })();
    return () => {
      cancelled = true;
      try {
        apiRef.current?.dispose();
      } catch {
        /* already disposed */
      }
    };
  }, [room, displayName, subject, onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      <div className="flex items-center justify-between gap-3 bg-[#04141d] px-4 py-2.5 text-white">
        <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
          <Video className="h-4 w-4 shrink-0 text-emerald-400" />
          <span className="truncate">{subject ?? "Live consultation"}</span>
        </div>
        {joined && peers === 0 && waitingFor ? (
          <span className="hidden items-center gap-2 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-medium text-amber-200 sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300" />
            Waiting for the {waitingFor} to join…
          </span>
        ) : null}
        <button
          onClick={onClose}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-rose-500/80"
        >
          <X className="h-4 w-4" /> Leave call
        </button>
      </div>

      <div className="relative flex-1">
        {error ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-white">
            <p className="text-sm text-white/80">{error}</p>
            <button
              onClick={onClose}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {loading && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-2 bg-black text-white">
                <Loader2 className="h-5 w-5 animate-spin" /> Connecting…
              </div>
            )}
            <div ref={containerRef} className="h-full w-full" />
          </>
        )}
      </div>
    </div>
  );
}
