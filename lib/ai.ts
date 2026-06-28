/**
 * Health-record explainer for an uploaded record (photo or PDF), powered by
 * Google Gemini's FREE tier (Google AI Studio).
 *
 * Get a free key (no credit card) at https://aistudio.google.com/apikey and set
 * GEMINI_API_KEY in .env.local. When it's absent the feature degrades gracefully
 * (the API route returns a friendly 503) rather than crashing.
 *
 * The analysis is intentionally cautious: it explains what the document says in
 * plain language, never invents values, and never gives a diagnosis.
 */

const apiKey = () => process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";

export const isAIConfigured = !!apiKey();

// gemini-2.0-flash is fast, multimodal (images + PDF) and free-tier eligible.
const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
// Gemini inline data must fit in a ~20 MB request; base64 inflates ~33%, so cap
// the source file well under that.
const MAX_BYTES = 12 * 1024 * 1024;

const SYSTEM = `You are a careful health-record explainer inside Sanjeevani, a healthcare access app for patients in India who may have low medical literacy and often read in a second language.

You are given ONE uploaded health record (a photo or a PDF — e.g. a lab report, prescription, vaccination card or scan) plus a little context the patient typed.

Write a short, plain-language explanation a non-expert can understand, using EXACTLY these headings:

What this is
- one or two lines naming the kind of document and its date/provider if visible.

Key findings
- 2-6 short bullets. For lab values give the value, the printed normal range if present, and whether it looks low / normal / high. For a prescription list each medicine, its dose and how to take it. Only state what is actually visible.

What it may mean
- 1-3 measured, plain bullets. Do not alarm.

Questions to ask your doctor
- 1-3 useful questions.

Rules:
- NEVER invent values or text that is not in the document. If something is unreadable, say so.
- Do NOT give a diagnosis and do NOT tell the patient to start or stop any medicine.
- Keep it under ~250 words, using simple words.
- End with EXACTLY this line: "Note: This is an automated explanation, not a medical diagnosis. Always confirm with your doctor."
- If the file is not a health document, say so briefly instead of forcing the structure.`;

function classify(mime: string): { mime: string } | null {
  const m = mime.toLowerCase();
  if (m === "application/pdf") return { mime: "application/pdf" };
  if (m.startsWith("image/")) return { mime: m };
  return null;
}

export async function analyzeHealthRecord(input: {
  type: string;
  title: string;
  notes: string | null;
  fileUrl: string;
  fileMime: string | null;
}): Promise<{ insight: string; model: string }> {
  // 1. Download the attachment.
  const res = await fetch(input.fileUrl);
  if (!res.ok) throw new Error(`Could not download the attachment (${res.status}).`);
  const headerMime = res.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
  const cls = classify((input.fileMime || headerMime || "").trim());
  if (!cls) throw new Error("Only image or PDF attachments can be analyzed.");

  const bytes = Buffer.from(await res.arrayBuffer());
  if (bytes.length > MAX_BYTES)
    throw new Error("That file is too large to analyze (max ~12 MB).");
  const data = bytes.toString("base64");

  const context =
    `Patient-provided context — record type: ${input.type}; title: ${input.title}` +
    (input.notes ? `; notes: ${input.notes}` : "") +
    ".";

  // 2. Call Gemini (REST — keeps the dependency footprint at zero).
  const body = {
    system_instruction: { parts: [{ text: SYSTEM }] },
    contents: [
      {
        role: "user",
        parts: [
          { inline_data: { mime_type: cls.mime, data } },
          { text: `${context}\n\nExplain this record for the patient.` },
        ],
      },
    ],
    generationConfig: { temperature: 0.2, maxOutputTokens: 1500 },
  };

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey() },
      body: JSON.stringify(body),
    },
  );

  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    let detail = "";
    try {
      detail = (JSON.parse(txt)?.error?.message as string) || "";
    } catch {
      /* non-JSON error body */
    }
    throw new Error(`AI request failed (${resp.status})${detail ? `: ${detail}` : "."}`);
  }

  const json = (await resp.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const insight = (json.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text ?? "")
    .join("")
    .trim();

  if (!insight) throw new Error("The AI did not return any analysis. Please try again.");
  return { insight, model: MODEL };
}
