import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 30

function extractTextFromPDF(buffer: Buffer): string {
  const content = buffer.toString("latin1")
  const textParts: string[] = []
  const btEtRegex = /BT([\s\S]*?)ET/g
  let match
  while ((match = btEtRegex.exec(content)) !== null) {
    const block = match[1]
    const parenRegex = /\(([^)\\]*(?:\\.[^)\\]*)*)\)/g
    let parenMatch
    while ((parenMatch = parenRegex.exec(block)) !== null) {
      const text = parenMatch[1]
        .replace(/\\n/g, "\n").replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t").replace(/\\\(/g, "(")
        .replace(/\\\)/g, ")").replace(/\\\\/g, "\\")
      if (text.trim()) textParts.push(text)
    }
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
  if (result.length < 100) {
    result = content.replace(/[^\x20-\x7E\n\r]/g, " ").replace(/\s{4,}/g, "\n").trim()
  }
  return result
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("resume") as File
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const resumeText = extractTextFromPDF(buffer)

    if (!resumeText || resumeText.trim().length < 30) {
      return NextResponse.json({ error: "Could not read your PDF. Please use a text-based PDF." }, { status: 400 })
    }

    const prompt = `You are a brutally honest but genuinely helpful career coach. Analyze this resume and provide honest, specific, actionable feedback.

Respond ONLY with a raw JSON object. No markdown, no code blocks, no explanation — just JSON:

{
  "score": <integer 0-100, honest score — most resumes are 40-70>,
  "roast_line": "<one sharp, specific sentence capturing the resume's biggest weakness>",
  "sections": [
    { "name": "Clarity", "score": <0-100>, "issue": "<specific problem in THIS resume>", "fix": "<concrete actionable fix>" },
    { "name": "ATS Score", "score": <0-100>, "issue": "<specific ATS/keyword problem>", "fix": "<specific fix with example>" },
    { "name": "Impact", "score": <0-100>, "issue": "<specific weak language or missing metrics>", "fix": "<before/after example>" },
    { "name": "Red Flags", "score": <0-100, higher = fewer flags>, "issue": "<specific red flag found>", "fix": "<how to fix it>" }
  ],
  "rewrites": [
    "Before: <actual weak bullet from resume> -> After: <stronger version with metrics and action verb>",
    "Before: <another weak bullet> -> After: <improved version>",
    "Before: <another weak bullet> -> After: <improved version>"
  ]
}

Resume:
${resumeText.slice(0, 4000)}`

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 })

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("Groq error:", errText)
      return NextResponse.json({ error: "AI service error. Please try again." }, { status: 500 })
    }

    const data = await response.json()
    const rawText = data.choices?.[0]?.message?.content ?? ""
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ error: "Could not parse response. Try again." }, { status: 500 })

    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch (error) {
    console.error("Roast error:", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
