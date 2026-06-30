/**
 * AI helpers for Sanjeevani. Primary provider is Groq (free, fast — Llama
 * models, OpenAI-compatible API). Gemini is kept as an optional fallback,
 * mainly because it can read PDFs (Groq vision handles images only).
 *
 *   GROQ_API_KEY   — free key from https://console.groq.com/keys      (preferred)
 *   GEMINI_API_KEY — free key from https://aistudio.google.com/apikey (optional)
 *
 * When no key is set the feature degrades gracefully (the API route returns a
 * friendly 503) rather than crashing. The output is intentionally cautious: it
 * explains, never invents values, and never gives a diagnosis.
 */

const GROQ_KEY = () => process.env.GROQ_API_KEY || "";
const GEMINI_KEY = () => process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";

export const isAIConfigured = !!(GROQ_KEY() || GEMINI_KEY());

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const GROQ_VISION_MODEL =
  process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

// Inline file data must fit a single request; base64 inflates ~33%.
const MAX_BYTES = 12 * 1024 * 1024;

const LANG_NAMES: Record<string, string> = {
  en: "English", hi: "Hindi", bn: "Bengali", mr: "Marathi", te: "Telugu",
  ta: "Tamil", gu: "Gujarati", kn: "Kannada", pa: "Punjabi", ml: "Malayalam", ur: "Urdu",
};
function languageName(code?: string) {
  return (code && LANG_NAMES[code]) || "English";
}

export type ChatMessage = { role: "user" | "model"; text: string };

// ---------------------------------------------------------------------------
// Provider calls
// ---------------------------------------------------------------------------

type GroqContent = string | { type: string; [k: string]: unknown }[];
type GroqMsg = { role: "system" | "user" | "assistant"; content: GroqContent };

async function callGroq(
  model: string,
  messages: GroqMsg[],
  opts?: { temperature?: number; maxTokens?: number },
): Promise<string> {
  const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_KEY()}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: opts?.temperature ?? 0.3,
      max_tokens: opts?.maxTokens ?? 1100,
    }),
  });
  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    let detail = "";
    try {
      detail = (JSON.parse(txt)?.error?.message as string) || "";
    } catch {
      /* non-JSON */
    }
    throw new Error(`AI request failed (${resp.status})${detail ? `: ${detail}` : "."}`);
  }
  const json = (await resp.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = json.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) throw new Error("The AI did not return a response. Please try again.");
  return text;
}

async function callGemini(
  system: string,
  contents: { role: string; parts: unknown[] }[],
  opts?: { temperature?: number; maxTokens?: number },
): Promise<string> {
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_KEY() },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents,
        generationConfig: {
          temperature: opts?.temperature ?? 0.3,
          maxOutputTokens: opts?.maxTokens ?? 1100,
        },
      }),
    },
  );
  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    let detail = "";
    try {
      detail = (JSON.parse(txt)?.error?.message as string) || "";
    } catch {
      /* non-JSON */
    }
    throw new Error(`AI request failed (${resp.status})${detail ? `: ${detail}` : "."}`);
  }
  const json = (await resp.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = (json.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text ?? "")
    .join("")
    .trim();
  if (!text) throw new Error("The AI did not return a response. Please try again.");
  return text;
}

/** Provider-agnostic text/chat: Groq first, then Gemini. */
async function generateText(
  system: string,
  turns: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number },
): Promise<string> {
  if (GROQ_KEY()) {
    const messages: GroqMsg[] = [
      { role: "system", content: system },
      ...turns.map((t) => ({
        role: (t.role === "model" ? "assistant" : "user") as "assistant" | "user",
        content: t.text,
      })),
    ];
    return callGroq(GROQ_MODEL, messages, opts);
  }
  if (GEMINI_KEY()) {
    return callGemini(
      system,
      turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
      opts,
    );
  }
  throw new Error("AI isn't configured.");
}

// ---------------------------------------------------------------------------
// Record explainer (multimodal)
// ---------------------------------------------------------------------------

const RECORD_SYSTEM = `You are a careful health-record explainer inside Sanjeevani, a healthcare access app for patients in India who may have low medical literacy and often read in a second language.

You are given ONE uploaded health record (an image, or a PDF — e.g. a lab report, prescription, vaccination card or scan) plus a little context the patient typed.

Write a short, plain-language explanation using EXACTLY these headings:

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
- End with EXACTLY: "Note: This is an automated explanation, not a medical diagnosis. Always confirm with your doctor."
- If the file is not a health document, say so briefly instead of forcing the structure.`;

function classify(mime: string): "image" | "pdf" | null {
  const m = mime.toLowerCase();
  if (m === "application/pdf") return "pdf";
  if (m.startsWith("image/")) return "image";
  return null;
}

export async function analyzeHealthRecord(input: {
  type: string;
  title: string;
  notes: string | null;
  fileUrl: string;
  fileMime: string | null;
}): Promise<{ insight: string; model: string }> {
  const res = await fetch(input.fileUrl);
  if (!res.ok) throw new Error(`Could not download the attachment (${res.status}).`);
  const headerMime = res.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
  const mime = (input.fileMime || headerMime || "").trim();
  const kind = classify(mime);
  if (!kind) throw new Error("Only image or PDF attachments can be analyzed.");

  const bytes = Buffer.from(await res.arrayBuffer());
  if (bytes.length > MAX_BYTES)
    throw new Error("That file is too large to analyze (max ~12 MB).");
  const data = bytes.toString("base64");

  const context =
    `Patient-provided context — record type: ${input.type}; title: ${input.title}` +
    (input.notes ? `; notes: ${input.notes}` : "") +
    ". Explain this record for the patient.";

  // Groq vision handles images; PDFs need Gemini.
  if (kind === "image" && GROQ_KEY()) {
    const insight = await callGroq(
      GROQ_VISION_MODEL,
      [
        { role: "system", content: RECORD_SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: context },
            { type: "image_url", image_url: { url: `data:${mime};base64,${data}` } },
          ],
        },
      ],
      { temperature: 0.2, maxTokens: 1500 },
    );
    return { insight, model: GROQ_VISION_MODEL };
  }

  if (GEMINI_KEY()) {
    const insight = await callGemini(
      RECORD_SYSTEM,
      [
        {
          role: "user",
          parts: [{ inline_data: { mime_type: mime, data } }, { text: context }],
        },
      ],
      { temperature: 0.2, maxTokens: 1500 },
    );
    return { insight, model: GEMINI_MODEL };
  }

  throw new Error(
    "PDF analysis needs a Gemini key — attach a photo of the document instead, or add GEMINI_API_KEY.",
  );
}

// ---------------------------------------------------------------------------
// Conversational tools
// ---------------------------------------------------------------------------

const SYMPTOM_SYSTEM = `You are a cautious symptom-information assistant inside Sanjeevani, a healthcare-access app for people in India who may have low medical literacy. You are NOT a doctor and you do NOT diagnose.

Given a person's symptoms and basic details, reply using EXACTLY these headings:

How urgent this seems
- One line: "Self-care may be okay", "See a doctor soon (within a day or two)", or "Seek urgent care now". Pick conservatively.

Red flags — get emergency help if any of these
- 2-4 warning signs for these symptoms that mean they should call emergency services (112) or go to a hospital immediately.

What it could be
- 2-4 plain, non-alarming possibilities, clearly stated as POSSIBILITIES, not a diagnosis.

What you can do now
- 2-4 safe, general self-care or next-step suggestions (rest, fluids, when to book a tele-consult). Never recommend specific prescription medicines or doses.

Rules:
- Be conservative: if symptoms could be serious, lean towards urgent care.
- Never give a diagnosis or prescribe medicines.
- Keep under ~220 words, simple words.
- End with EXACTLY: "This is general information, not a diagnosis. For anything serious or worsening, see a doctor or call 112."`;

export async function symptomTriage(input: {
  symptoms: string;
  age?: string;
  sex?: string;
  duration?: string;
  language?: string;
}): Promise<{ text: string; model: string }> {
  const user =
    `Age: ${input.age || "unknown"}. Sex: ${input.sex || "unknown"}. ` +
    `Started: ${input.duration || "unknown"}.\nSymptoms: ${input.symptoms}\n\n` +
    `Reply in ${languageName(input.language)}.`;
  const text = await generateText(SYMPTOM_SYSTEM, [{ role: "user", text: user }], {
    temperature: 0.3,
    maxTokens: 1100,
  });
  return { text, model: GROQ_KEY() ? GROQ_MODEL : GEMINI_MODEL };
}

const WELLNESS_SYSTEM = `You are "Mitra", a warm, non-judgemental mental-wellness companion for young people in India, inside Sanjeevani. You use simple CBT-style techniques (gentle reframing, naming feelings, grounding, small actionable steps). You are NOT a therapist and you make that clear when relevant.

Style: brief (2-5 short sentences), kind, conversational, never preachy. Ask one gentle follow-up question when helpful.

SAFETY — this is critical: if the person mentions self-harm, suicide, wanting to die, or being in danger, respond with warmth and urgency: tell them they matter, encourage them to reach a trusted person now, and share India helplines — Tele-MANAS 14416 (24x7), iCall 9152987821, AASRA 9820466726, or emergency 112. Do not give clinical advice.

Never diagnose or recommend medication.`;

export async function wellnessReply(input: {
  messages: ChatMessage[];
  language?: string;
}): Promise<{ text: string; model: string }> {
  const text = await generateText(
    `${WELLNESS_SYSTEM}\nReply in ${languageName(input.language)}.`,
    input.messages.slice(-12),
    { temperature: 0.65, maxTokens: 700 },
  );
  return { text, model: GROQ_KEY() ? GROQ_MODEL : GEMINI_MODEL };
}

const HISTORY_SYSTEM = `You help build a clear, shareable medical-history summary inside Sanjeevani, for a patient (often a mobile/migrant worker) who has never had written records. You are given their answers to a few questions.

Produce a tidy summary a doctor could read quickly, using these headings only when there is content for them:

Profile
- age, sex, blood group if given.

Ongoing conditions & allergies
Past illnesses, surgeries or hospitalisations
Current medicines
Family history
Lifestyle notes

Rules:
- Use ONLY what the patient provided. Never invent conditions, dates or values.
- If a section has no information, omit it.
- Plain language, short bullets.
- End with EXACTLY: "Patient-reported summary — please verify clinically."`;

export async function buildHealthHistory(input: {
  answers: Record<string, string>;
  language?: string;
}): Promise<{ text: string; model: string }> {
  const filled = Object.entries(input.answers)
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  const text = await generateText(
    `${HISTORY_SYSTEM}\nWrite in ${languageName(input.language)}.`,
    [{ role: "user", text: filled || "No details provided." }],
    { temperature: 0.2, maxTokens: 1100 },
  );
  return { text, model: GROQ_KEY() ? GROQ_MODEL : GEMINI_MODEL };
}
