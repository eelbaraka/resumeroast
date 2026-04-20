import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 30

// ─── PDF Text Extraction ─────────────────────────────────────────────────────

function extractTextFromPDF(buffer: Buffer): { text: string; quality: "good" | "poor" | "empty" } {
  const content = buffer.toString("latin1")
  const textParts: string[] = []

  // Strategy 1: Extract from BT…ET text blocks (standard PDF text operator)
  const btEtRegex = /BT([\s\S]*?)ET/g
  let match
  while ((match = btEtRegex.exec(content)) !== null) {
    const block = match[1]

    // Parenthesis-encoded strings: (Hello World)
    const parenRegex = /\(([^)\\]*(?:\\.[^)\\]*)*)\)/g
    let parenMatch
    while ((parenMatch = parenRegex.exec(block)) !== null) {
      const text = parenMatch[1]
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\\(/g, "(")
        .replace(/\\\)/g, ")")
        .replace(/\\\\/g, "\\")
      if (text.trim()) textParts.push(text)
    }

    // Hex-encoded strings: <48656c6c6f>
    const hexRegex = /<([0-9A-Fa-f]+)>/g
    let hexMatch
    while ((hexMatch = hexRegex.exec(block)) !== null) {
      const hex = hexMatch[1]
      if (hex.length % 2 === 0) {
        let str = ""
        for (let i = 0; i < hex.length; i += 2) {
          const code = parseInt(hex.substr(i, 2), 16)
          if (code > 31 && code < 127) str += String.fromCharCode(code)
        }
        if (str.trim()) textParts.push(str)
      }
    }
  }

  let result = textParts.join(" ").replace(/\s+/g, " ").trim()

  // Strategy 2: Fallback — strip binary, keep printable ASCII
  if (result.length < 100) {
    result = content
      .replace(/[^\x20-\x7E\n\r]/g, " ")
      .replace(/\s{4,}/g, "\n")
      .trim()
  }

  // Quality assessment — detect garbled/non-human text
  const wordLikeTokens = (result.match(/\b[a-zA-Z]{2,}\b/g) ?? []).length
  const totalTokens = (result.match(/\S+/g) ?? []).length
  const humanRatio = totalTokens > 0 ? wordLikeTokens / totalTokens : 0

  if (result.length < 80 || totalTokens < 20) {
    return { text: result, quality: "empty" }
  }

  if (humanRatio < 0.35) {
    return { text: result, quality: "poor" }
  }

  return { text: result, quality: "good" }
}

// ─── Strict Groq Schema Prompt ────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are 'DeepRoast AI', an elite, ruthless $300/hr Silicon Valley career coach and advanced ATS parser. You analyze resumes and deliver the brutal truth.

CRITICAL OUTPUT RULES:
- You MUST respond with ONLY a valid JSON object. No markdown, no preamble, no explanation.
- Every field in the schema is required. Never omit a field or return null.
- Arrays must contain at least 1 item each.

Use EXACTLY this JSON schema:

{
  "overall_score": <Integer 1-100. Be harsh. Average resumes score 35-45>,
  "roast_quote": "<One brutal, punchy, sarcastic-but-accurate sentence about the resume's biggest flaw. Make it quotable.>",
  "metrics": {
    "ats_parsability_percent": <Integer 1-100. Deduct for non-standard headers, tables, text boxes, columns>,
    "quantified_bullets_percent": <Integer 1-100. % of bullets using hard numbers, %, $, or timeframes>,
    "strong_action_verbs": <Integer count of strong verbs: Led, Built, Drove, Launched, Scaled, Grew, etc.>,
    "weak_verbs": <Integer count of weak verbs: Helped, Assisted, Supported, Worked on, Responsible for, etc.>
  },
  "skill_gap": {
    "inferred_role": "<The most senior role this resume targets, e.g. 'Senior Product Manager'>",
    "detected_skills": ["<Skill 1>", "<Skill 2>", "<Skill 3>"],
    "missing_critical_skills": ["<Missing Skill 1>", "<Missing Skill 2>", "<Missing Skill 3>", "<Missing Skill 4>"]
  },
  "red_flags": [
    {
      "issue": "<Short title, max 5 words>",
      "severity": "<High | Medium | Low>",
      "fix": "<Actionable, direct, one-sentence fix. Be specific.>"
    }
  ],
  "sections": {
    "summary": <Integer 1-10>,
    "experience": <Integer 1-10>,
    "skills": <Integer 1-10>,
    "education": <Integer 1-10>,
    "formatting": <Integer 1-10>
  },
  "upsell_teaser": {
    "weak_bullet_original": "<Copy one genuinely weak bullet point verbatim from the resume text>",
    "strong_bullet_rewrite": "<Rewrite using 'Accomplished [X] by doing [Y] resulting in [Z]' — include invented but plausible metrics>"
  }
}`

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Parse multipart form data
  let file: File | null = null
  try {
    const formData = await req.formData()
    file = formData.get("resume") as File | null
  } catch {
    return NextResponse.json(
      { error: "Invalid request. Expected multipart/form-data with a 'resume' field." },
      { status: 400 }
    )
  }

  if (!file) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 })
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are accepted." }, { status: 415 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File exceeds 10MB limit." }, { status: 413 })
  }

  // 2. Extract text with quality gate
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const { text: resumeText, quality } = extractTextFromPDF(buffer)

  if (quality === "empty") {
    return NextResponse.json(
      {
        error: "PDF_EMPTY",
        message:
          "We couldn't extract any readable text from your PDF. This usually means it's a scanned image. Please export your resume as a text-based PDF from Word, Google Docs, or Figma.",
      },
      { status: 422 }
    )
  }

  if (quality === "poor") {
    return NextResponse.json(
      {
        error: "PDF_GARBLED",
        message:
          "Your PDF appears to use embedded fonts or encoding that our parser can't read. Please re-save it as a standard PDF from Word or Google Docs and try again.",
      },
      { status: 422 }
    )
  }

  // 3. Validate API key
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    console.error("[roast] GROQ_API_KEY is not set")
    return NextResponse.json({ error: "Service temporarily unavailable." }, { status: 503 })
  }

  // 4. Call Groq API with enforced JSON object response
  let rawText = ""
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1800,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Analyze this resume text and return the JSON:\n\n${resumeText.slice(0, 4500)}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error(`[roast] Groq HTTP ${response.status}:`, errBody)
      return NextResponse.json(
        { error: "AI service returned an error. Please try again in a moment." },
        { status: 502 }
      )
    }

    const data = await response.json()
    rawText = data.choices?.[0]?.message?.content ?? ""

    if (!rawText) {
      console.error("[roast] Groq returned empty content", data)
      return NextResponse.json(
        { error: "AI returned an empty response. Please try again." },
        { status: 502 }
      )
    }
  } catch (networkErr) {
    console.error("[roast] Network error calling Groq:", networkErr)
    return NextResponse.json(
      { error: "Could not reach the AI service. Check your connection and try again." },
      { status: 503 }
    )
  }

  // 5. Parse and validate the JSON response
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(rawText)
  } catch {
    // Attempt to salvage a JSON object from the response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error("[roast] Could not extract JSON from Groq response:", rawText.slice(0, 500))
      return NextResponse.json(
        { error: "AI response was not valid JSON. Please try again." },
        { status: 502 }
      )
    }
    try {
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      return NextResponse.json(
        { error: "AI response was malformed. Please try again." },
        { status: 502 }
      )
    }
  }

  // 6. Validate required top-level fields
  const required = ["overall_score", "roast_quote", "metrics", "skill_gap", "red_flags", "sections", "upsell_teaser"]
  const missing = required.filter((k) => !(k in parsed))
  if (missing.length > 0) {
    console.error("[roast] Response missing fields:", missing, parsed)
    return NextResponse.json(
      { error: "AI response was incomplete. Please try again." },
      { status: 502 }
    )
  }

  return NextResponse.json(parsed)
}
