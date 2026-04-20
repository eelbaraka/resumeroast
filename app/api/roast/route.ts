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
        .replace(/\\n/g,"\n").replace(/\\r/g,"\r").replace(/\\t/g,"\t")
        .replace(/\\\(/g,"(").replace(/\\\)/g,")").replace(/\\\\/g,"\\")
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
      return NextResponse.json({ error: "Could not read your PDF. Please use a text-based PDF, not a scanned image." }, { status: 400 })
    }

    const prompt = `You are 'DeepRoast AI', an elite, ruthless, $300/hr Silicon Valley career coach and an advanced Applicant Tracking System (ATS) parser. Your job is to analyze resumes, identify why the candidate is getting rejected, and deliver the brutal truth. 

You must evaluate the provided resume text against modern industry standards for high-impact, results-driven resumes. 

You will analyze the text and output a strict JSON object. DO NOT output any conversational text, markdown formatting outside of the JSON block, or pleasantries. Output ONLY valid, parsable JSON.

Here are your analysis rules:
1. The Roast: Write a one-sentence, brutally honest, slightly sarcastic, but highly accurate critique of the resume's biggest flaw. It should be punchy and shareable. 
2. ATS Parsability: Estimate out of 100% how easily standard ATS software could read this text. Deduct heavily for weird formatting, missing standard headers, or unreadable blocks.
3. Impact Metrics: Calculate the percentage of experience bullet points that include hard numbers, percentages, or measurable data. 
4. Skill Gap: Identify the candidate's core profession based on the text. List 2-3 skills they have, and 3-4 critical, modern industry skills they are missing.
5. Red Flags: Identify the single biggest issue (e.g., "Fluff words", "No impact", "Formatting disaster") and provide a direct 1-sentence fix.

Use this EXACT JSON schema for your output:

{
  "overall_score": <Integer between 1 and 100. Be harsh. Average resumes get a 40>,
  "roast_quote": "<Your brutal, one-sentence roast>",
  "metrics": {
    "ats_parsability_percent": <Integer 1-100>,
    "quantified_bullets_percent": <Integer 1-100>,
    "strong_action_verbs": <Integer count of strong verbs used>,
    "weak_verbs": <Integer count of passive/weak verbs used like 'helped', 'assisted', 'managed'>
  },
  "skill_gap": {
    "inferred_role": "<e.g., Senior Product Manager>",
    "detected_skills": ["<Skill 1>", "<Skill 2>"],
    "missing_critical_skills": ["<Missing Skill 1>", "<Missing Skill 2>", "<Missing Skill 3>"]
  },
  "red_flags": [
    {
      "issue": "<Short title of the problem>",
      "severity": "<High, Medium, or Low>",
      "fix": "<Actionable, one-sentence advice>"
    }
  ],
  "upsell_teaser": {
    "weak_bullet_original": "<Extract one genuinely weak bullet point from the text>",
    "strong_bullet_rewrite": "<Rewrite that bullet point using the 'Accomplished X by doing Y resulting in Z' framework>"
  }
}

Analyze the following resume text:
${resumeText.slice(0, 4000)}`

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 })

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
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
