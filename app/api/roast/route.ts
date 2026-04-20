import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("resume") as File
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let resumeText = ""
    try {
      const pdfParse = (await import("pdf-parse")).default
      const pdfData = await pdfParse(buffer)
      resumeText = pdfData.text
    } catch {
      resumeText = buffer.toString("latin1").replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s{3,}/g, "\n").trim()
    }

    if (!resumeText || resumeText.trim().length < 30) {
      return NextResponse.json({ error: "Could not read your PDF." }, { status: 400 })
    }

    const prompt = `You are a brutally honest career coach. Roast this resume hard but make every critique actionable.

Respond ONLY with raw JSON, no markdown, no backticks:

{
  "score": <integer 0-100>,
  "roast_line": "<one brutal punchy sentence about the biggest flaw>",
  "sections": [
    { "name": "Clarity", "score": <0-100>, "issue": "<specific problem>", "fix": "<specific fix>" },
    { "name": "ATS Score", "score": <0-100>, "issue": "<specific problem>", "fix": "<specific fix>" },
    { "name": "Impact", "score": <0-100>, "issue": "<specific problem>", "fix": "<specific fix>" },
    { "name": "Red Flags", "score": <0-100>, "issue": "<specific problem>", "fix": "<specific fix>" }
  ],
  "rewrites": [
    "Before: <weak bullet from resume> -> After: <improved version>",
    "Before: <weak bullet> -> After: <improved>",
    "Before: <weak bullet> -> After: <improved>"
  ]
}

Resume:
${resumeText.slice(0, 4000)}`

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 })

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
      console.error("OpenRouter error:", errText)
      return NextResponse.json({ error: "AI service error. Please try again." }, { status: 500 })
    }

    const data = await response.json()
    const rawText = data.choices?.[0]?.message?.content ?? ""
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ error: "Could not parse response." }, { status: 500 })

    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch (error) {
    console.error("Roast error:", error)
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
  }
}