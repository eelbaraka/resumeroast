"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setMounted(true) }, [])

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") { setError("Only PDF files are supported."); return }
    if (f.size > 10 * 1024 * 1024) { setError("File must be under 10MB."); return }
    setError("")
    setFile(f)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const handleRoast = async () => {
    if (!file) return
    setLoading(true); setError(""); setProgress(0)
    const interval = setInterval(() => setProgress(p => Math.min(p + 2, 85)), 200)
    try {
      const formData = new FormData()
      formData.append("resume", file)
      const res = await fetch("/api/roast", { method: "POST", body: formData })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Failed") }
      const result = await res.json()
      clearInterval(interval); setProgress(100)
      localStorage.setItem("roastResult", JSON.stringify(result))
      setTimeout(() => router.push("/results"), 300)
    } catch (err: unknown) {
      clearInterval(interval); setProgress(0)
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 32px", borderBottom: "1px solid var(--border)",
        background: "rgba(250,250,249,0.85)", backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "var(--accent)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 14,
          }}>🔥</div>
          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em", color: "var(--text-1)" }}>
            ResumeRoast
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: 13, color: "var(--text-3)", fontFamily: "Geist Mono" }}>
            Free · No signup required
          </span>
          <a href="#how-it-works" style={{
            fontSize: 13, color: "var(--text-2)", textDecoration: "none",
            padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border)",
            background: "white", transition: "all 0.15s",
          }}>
            How it works
          </a>
        </div>
      </nav>

      {/* Hero */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
        {/* Badge */}
        <div className="animate-fade-up" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "var(--accent-bg)", border: "1px solid rgba(255,68,34,0.15)",
          borderRadius: 100, padding: "5px 14px", marginBottom: 28,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--accent)", fontFamily: "Geist Mono", letterSpacing: "0.02em" }}>
            AI-POWERED · FREE · 30 SECONDS
          </span>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-up delay-1 serif" style={{
          fontSize: "clamp(42px, 7vw, 80px)", fontWeight: 400,
          lineHeight: 1.08, letterSpacing: "-0.02em",
          textAlign: "center", maxWidth: 700, marginBottom: 20,
          color: "var(--text-1)",
        }}>
          Your resume,<br />
          <em style={{ color: "var(--accent)", fontStyle: "italic" }}>honestly</em> reviewed.
        </h1>

        <p className="animate-fade-up delay-2" style={{
          fontSize: 17, color: "var(--text-2)", textAlign: "center",
          maxWidth: 440, marginBottom: 48, lineHeight: 1.65, fontWeight: 400,
        }}>
          Find out exactly why you&apos;re not getting callbacks. 
          Instant AI feedback, ATS analysis, and specific fixes — completely free.
        </p>

        {/* Upload Card */}
        <div className="animate-fade-up delay-3" style={{
          width: "100%", maxWidth: 520,
          background: "white", borderRadius: 20,
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden",
        }}>
          {/* Drop zone */}
          <div
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onClick={() => !loading && inputRef.current?.click()}
            style={{
              padding: "40px 36px",
              cursor: loading ? "default" : "pointer",
              transition: "background 0.2s",
              background: dragging ? "var(--accent-bg)" : file ? "#fafffe" : "white",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <input ref={inputRef} type="file" accept=".pdf" style={{ display: "none" }}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

            {!file ? (
              <div style={{ textAlign: "center" }}>
                {/* Upload icon */}
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: "var(--bg-2)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px", fontSize: 22,
                  transition: "transform 0.2s",
                  transform: dragging ? "scale(1.08)" : "scale(1)",
                }}>
                  📄
                </div>
                <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text-1)", marginBottom: 6 }}>
                  {dragging ? "Drop it here" : "Drop your resume"}
                </p>
                <p style={{ fontSize: 13, color: "var(--text-3)" }}>
                  PDF only · Max 10MB · <span style={{ color: "var(--accent)", fontWeight: 500, textDecoration: "underline" }}>browse files</span>
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "var(--green-bg)", border: "1px solid rgba(22,163,74,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, flexShrink: 0,
                }}>📄</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {file.name}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "Geist Mono", marginTop: 2 }}>
                    {(file.size / 1024).toFixed(0)} KB · PDF · Ready to roast
                  </p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setFile(null) }}
                  style={{
                    width: 28, height: 28, borderRadius: 8, border: "1px solid var(--border)",
                    background: "var(--bg-2)", cursor: "pointer", fontSize: 14,
                    color: "var(--text-3)", display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>×</button>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {loading && (
            <div style={{ height: 2, background: "var(--bg-3)", position: "relative", overflow: "hidden" }}>
              <div style={{
                position: "absolute", inset: 0, background: "var(--accent)",
                width: `${progress}%`, transition: "width 0.3s ease",
              }} />
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ padding: "12px 20px", background: "#fff5f5", borderTop: "1px solid #ffe4e0" }}>
              <p style={{ fontSize: 13, color: "var(--accent)" }}>⚠ {error}</p>
            </div>
          )}

          {/* Footer row */}
          <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={handleRoast}
              disabled={!file || loading}
              style={{
                flex: 1, padding: "13px 20px",
                borderRadius: 12, border: "none", cursor: !file || loading ? "not-allowed" : "pointer",
                background: !file || loading ? "var(--bg-3)" : "var(--text-1)",
                color: !file || loading ? "var(--text-3)" : "white",
                fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em",
                transition: "all 0.2s", fontFamily: "Geist, sans-serif",
                transform: "scale(1)",
              }}
              onMouseEnter={e => { if (file && !loading) (e.target as HTMLElement).style.transform = "scale(1.01)" }}
              onMouseLeave={e => { (e.target as HTMLElement).style.transform = "scale(1)" }}
            >
              {loading ? `Analyzing your resume... ${progress}%` : "Analyze My Resume →"}
            </button>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="animate-fade-up delay-4" style={{
          display: "flex", alignItems: "center", gap: 24,
          marginTop: 28, flexWrap: "wrap", justifyContent: "center",
        }}>
          {[
            { icon: "🔒", text: "Private & secure" },
            { icon: "⚡", text: "Results in 30s" },
            { icon: "✦", text: "No signup needed" },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13 }}>{icon}</span>
              <span style={{ fontSize: 13, color: "var(--text-3)" }}>{text}</span>
            </div>
          ))}
        </div>
      </main>

      {/* How it works */}
      <section id="how-it-works" style={{
        borderTop: "1px solid var(--border)", padding: "64px 24px",
        background: "var(--bg-2)",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <p style={{
            fontFamily: "Geist Mono", fontSize: 11, fontWeight: 500,
            color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase",
            textAlign: "center", marginBottom: 40,
          }}>How it works</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
            {[
              { n: "01", title: "Upload your PDF", desc: "Drop your resume file. We accept any text-based PDF." },
              { n: "02", title: "AI reads every line", desc: "Our AI analyzes structure, content, keywords, and impact." },
              { n: "03", title: "Get your roast", desc: "Receive a score, critique, and specific fixes in seconds." },
              { n: "04", title: "Apply and win", desc: "Use the feedback to land more interviews immediately." },
            ].map(({ n, title, desc }) => (
              <div key={n} style={{
                padding: "28px 28px 32px",
                background: "white", borderRadius: 0,
                border: "1px solid var(--border)",
                marginLeft: -1, marginTop: -1,
              }}>
                <p style={{
                  fontFamily: "Geist Mono", fontSize: 11, color: "var(--text-3)",
                  marginBottom: 14, letterSpacing: "0.05em",
                }}>{n}</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", marginBottom: 8, letterSpacing: "-0.01em" }}>
                  {title}
                </p>
                <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section style={{ padding: "56px 24px", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32, textAlign: "center" }}>
            {[
              { value: "50,000+", label: "Resumes analyzed" },
              { value: "4.8 / 5", label: "Average rating" },
              { value: "30 sec", label: "Average time" },
              { value: "100%", label: "Free, always" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="serif" style={{ fontSize: 36, fontWeight: 400, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: 4 }}>
                  {value}
                </p>
                <p style={{ fontSize: 13, color: "var(--text-3)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section style={{ padding: "64px 24px", background: "var(--bg-2)", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <p style={{
            fontFamily: "Geist Mono", fontSize: 11, color: "var(--text-3)",
            letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12,
          }}>What you get</p>
          <h2 className="serif" style={{
            fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 400,
            letterSpacing: "-0.02em", marginBottom: 40, color: "var(--text-1)", lineHeight: 1.2,
          }}>
            Everything a career coach would tell you,<br />
            <em style={{ color: "var(--accent)", fontStyle: "italic" }}>without the $300/hr price tag.</em>
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {[
              { icon: "◎", label: "Overall score", desc: "A 0–100 rating with honest reasoning behind every point deducted." },
              { icon: "◈", label: "ATS compatibility check", desc: "Find out if your resume even makes it past automated screening." },
              { icon: "◉", label: "Section-by-section breakdown", desc: "Clarity, impact, keywords, and red flags — all scored separately." },
              { icon: "◇", label: "Before/after rewrites", desc: "See your actual weak bullets rewritten with stronger language and metrics." },
              { icon: "◆", label: "Quick wins", desc: "The 3 changes you can make today that will have the biggest impact." },
            ].map(({ icon, label, desc }) => (
              <div key={label} style={{
                display: "flex", alignItems: "flex-start", gap: 16,
                padding: "20px 24px",
                background: "white", border: "1px solid var(--border)",
                marginTop: -1,
              }}>
                <span style={{ fontSize: 18, color: "var(--accent)", marginTop: 1, flexShrink: 0, fontFamily: "Geist Mono" }}>{icon}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 3 }}>{label}</p>
                  <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{
        padding: "64px 24px",
        borderTop: "1px solid var(--border)",
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
      }}>
        <h2 className="serif" style={{
          fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 400,
          letterSpacing: "-0.02em", marginBottom: 16, color: "var(--text-1)",
        }}>
          Ready to find out the truth?
        </h2>
        <p style={{ fontSize: 16, color: "var(--text-2)", marginBottom: 28, maxWidth: 400 }}>
          Upload your resume and get your honest score in under 30 seconds. No email required.
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            padding: "14px 28px", borderRadius: 12, border: "none",
            background: "var(--accent)", color: "white", fontSize: 15,
            fontWeight: 600, cursor: "pointer", letterSpacing: "-0.01em",
            fontFamily: "Geist, sans-serif",
          }}
        >
          Analyze My Resume — Free →
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "24px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>🔥</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>ResumeRoast</span>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-3)" }}>
          Free AI resume analysis · No data stored · Built for job seekers
        </p>
        <div style={{ display: "flex", gap: 16 }}>
          {["Privacy", "Contact"].map(l => (
            <a key={l} href="#" style={{ fontSize: 12, color: "var(--text-3)", textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
