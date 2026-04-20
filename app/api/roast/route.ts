import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("resume") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let resumeText = ""
    try {
      const pdfParse = (await import("pdf-parse")).default
      const pdfData = await pdfParse(buffer)
      resumeText = pdfData.text
    } catch {
      resumeText = buffer
        .toString("latin1")
        .replace(/[^\x20-\x7E\n\r\t]/g, " ")
        .replace(/\s{3,}/g, "\n")
        .trim()
    }

    if (!resumeText || resumeText.trim().length < 30) {
      return NextResponse.json(
        { error: "Could not read your PDF. Make sure it's a text-based PDF (not a scanned image)." },
        { status: 400 }
      )
    }

    const prompt = `You are a brutally honest career coach who genuinely wants people to succeed. Roast this resume with sharp wit, but make every critique specific and actionable.

IMPORTANT: Respond ONLY with a raw JSON object. No markdown, no code blocks, no explanation before or after. Just the JSON.

{
  "score": <integer 0-100, be honest — most resumes score 40-70>,
  "roast_line": "<one devastating but accurate sentence that captures the resume's biggest flaw — punchy, specific, slightly brutal>",
  "sections": [
    {
      "name": "Clarity",
      "score": <0-100>,
      "issue": "<one specific problem found in THIS resume>",
      "fix": "<one concrete, actionable fix they can do today>"
    },
    {
      "name": "ATS Score",
      "score": <0-100>,
      "issue": "<specific ATS/keyword problem in THIS resume>",
      "fix": "<specific fix with an example keyword or phrase>"
    },
    {
      "name": "Impact",
      "score": <0-100>,
      "issue": "<specific weak phrasing or lack of metrics in THIS resume>",
      "fix": "<show a before/after example using their actual content>"
    },
    {
      "name": "Red Flags",
      "score": <0-100, higher = fewer red flags>,
      "issue": "<specific red flag found — gaps, outdated tech, vague roles, etc.>",
      "fix": "<how to address or reframe this specific red flag>"
    }
  ],
  "rewrites": [
    "<Before: [copy an actual weak bullet from their resume] -> After: [improved version with metrics and strong verb]>",
    "<Before: [copy another weak bullet] -> After: [improved version]>",
    "<Before: [copy another weak bullet] -> After: [improved version]>"
  ]
}

Resume content to roast:
---
${resumeText.slice(0, 4000)}
---`

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://resumeroast-one.vercel.app",
        "X-Title": "ResumeRoast",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct:free",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("OpenRouter API error:", errText)
      return NextResponse.json({ error: "AI service error. Please try again." }, { status: 500 })
    }

    const data = await response.json()
    const rawText = data.choices?.[0]?.message?.content ?? ""

    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error("No JSON found in response:", rawText)
      return NextResponse.json({ error: "Could not parse AI response. Please try again." }, { status: 500 })
    }

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch (error) {
    console.error("Roast error:", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
