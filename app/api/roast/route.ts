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
