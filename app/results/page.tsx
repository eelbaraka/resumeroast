"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface Section { name: string; score: number; issue: string; fix: string }
interface RoastResult { score: number; roast_line: string; sections: Section[]; rewrites: string[] }

function ScoreRing({ score }: { score: number }) {
  const r = 54, circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score < 40 ? "#ef4444" : score < 65 ? "#f97316" : score < 80 ? "#eab308" : "#16a34a"
  const label = score < 40 ? "Needs Work" : score < 65 ? "Below Average" : score < 80 ? "Good" : "Strong"

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", width: 140, height: 140 }}>
        <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="70" cy="70" r={r} fill="none" stroke="var(--bg-3)" strokeWidth="7" />
          <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            className="score-ring" style={{ filter: `drop-shadow(0 0 6px ${color}40)` }} />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 34, fontWeight: 700, color: "var(--text-1)", lineHeight: 1, letterSpacing: "-0.03em" }}>
            {score}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "Geist Mono", marginTop: 2 }}>/ 100</span>
        </div>
      </div>
      <span style={{
        fontSize: 11, fontWeight: 600, color, fontFamily: "Geist Mono",
        letterSpacing: "0.08em", textTransform: "uppercase",
        background: `${color}15`, padding: "3px 10px", borderRadius: 100,
        border: `1px solid ${color}30`,
      }}>{label}</span>
    </div>
  )
}

function SectionCard({ s, i }: { s: Section; i: number }) {
  const pct = s.score
  const color = pct < 40 ? "#ef4444" : pct < 65 ? "#f97316" : pct < 80 ? "#eab308" : "#16a34a"
  return (
    <div className={`animate-fade-up`} style={{
      animationDelay: `${i * 0.06}s`,
      background: "white", border: "1px solid var(--border)",
      borderRadius: 14, padding: "20px 22px", overflow: "hidden", position: "relative",
    }}>
      {/* Score bar accent */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: "var(--bg-3)", borderRadius: "14px 14px 0 0",
      }}>
        <div style={{
          width: `${pct}%`, height: "100%", background: color,
          borderRadius: "14px 14px 0 0", transition: "width 1s ease",
        }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, marginTop: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{s.name}</span>
        <span style={{
          fontSize: 11, fontWeight: 700, color,
          fontFamily: "Geist Mono", background: `${color}12`,
          padding: "2px 8px", borderRadius: 6, border: `1px solid ${color}25`,
        }}>{pct}</span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontFamily: "Geist Mono", color: "var(--text-3)", marginBottom: 4, letterSpacing: "0.05em" }}>
          PROBLEM
        </p>
        <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55 }}>{s.issue}</p>
      </div>

      <div style={{ paddingTop: 12, borderTop: "1px solid var(--border)" }}>
        <p style={{ fontSize: 11, fontFamily: "Geist Mono", color: "var(--accent)", marginBottom: 4, letterSpacing: "0.05em" }}>
          FIX
        </p>
        <p style={{ fontSize: 13, color: "var(--text-1)", lineHeight: 1.55, fontWeight: 500 }}>{s.fix}</p>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<RoastResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("roastResult")
    if (!stored) { router.push("/"); return }
    try { setResult(JSON.parse(stored)) } catch { router.push("/") }
  }, [router])

  const share = (p: "linkedin" | "x") => {
    if (!result) return
    const text = `My resume scored ${result.score}/100 on ResumeRoast.ai\n\n"${result.roast_line}"\n\nGet yours reviewed free →`
    const url = "https://resumeroast.ai"
    if (p === "linkedin") window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank")
    else window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank")
  }

  const copy = () => {
    if (!result) return
    navigator.clipboard.writeText(`My resume scored ${result.score}/100 on ResumeRoast.ai — "${result.roast_line}" — Get yours free at resumeroast.ai`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  if (!mounted || !result) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 40, height: 40, border: "2px solid var(--border)",
          borderTopColor: "var(--accent)", borderRadius: "50%",
          animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: 14, color: "var(--text-3)" }}>Loading your results...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 32px", borderBottom: "1px solid var(--border)",
        background: "rgba(250,250,249,0.9)", backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <button onClick={() => router.push("/")} style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "none", border: "none", cursor: "pointer", padding: 0,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
          }}>🔥</div>
          <span style={{ fontWeight: 600, fontSize: 15, color: "var(--text-1)", letterSpacing: "-0.02em" }}>
            ResumeRoast
          </span>
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={copy} style={{
            padding: "7px 14px", borderRadius: 9, border: "1px solid var(--border)",
            background: "white", cursor: "pointer", fontSize: 13, color: "var(--text-2)",
            fontFamily: "Geist, sans-serif", fontWeight: 500,
          }}>
            {copied ? "✓ Copied" : "Copy score"}
          </button>
          <button onClick={() => router.push("/")} style={{
            padding: "7px 14px", borderRadius: 9, border: "1px solid var(--border)",
            background: "white", cursor: "pointer", fontSize: 13, color: "var(--text-2)",
            fontFamily: "Geist, sans-serif", fontWeight: 500,
          }}>
            ← New resume
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 120px" }}>

        {/* Score header */}
        <div className="animate-fade-up" style={{
          background: "white", border: "1px solid var(--border)",
          borderRadius: 20, padding: "40px 36px", marginBottom: 16,
          display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
          gap: 24,
        }}>
          <ScoreRing score={result.score} />
          <div>
            <p style={{ fontSize: 11, fontFamily: "Geist Mono", color: "var(--text-3)", letterSpacing: "0.08em", marginBottom: 10 }}>
              YOUR ROAST
            </p>
            <p className="serif" style={{
              fontSize: "clamp(18px, 3vw, 26px)", fontStyle: "italic",
              color: "var(--text-1)", lineHeight: 1.4, fontWeight: 400,
              maxWidth: 520,
            }}>
              &ldquo;{result.roast_line}&rdquo;
            </p>
          </div>

          {/* Share row */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={() => share("linkedin")} style={{
              padding: "8px 16px", borderRadius: 9, border: "1px solid var(--border)",
              background: "var(--bg-2)", cursor: "pointer", fontSize: 13,
              color: "var(--text-2)", fontFamily: "Geist, sans-serif", fontWeight: 500,
            }}>Share on LinkedIn</button>
            <button onClick={() => share("x")} style={{
              padding: "8px 16px", borderRadius: 9, border: "1px solid var(--border)",
              background: "var(--bg-2)", cursor: "pointer", fontSize: 13,
              color: "var(--text-2)", fontFamily: "Geist, sans-serif", fontWeight: 500,
            }}>Share on X</button>
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ marginBottom: 16 }}>
          <p style={{
            fontSize: 11, fontFamily: "Geist Mono", color: "var(--text-3)",
            letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12, paddingLeft: 2,
          }}>Breakdown</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
            {result.sections.map((s, i) => <SectionCard key={s.name} s={s} i={i} />)}
          </div>
        </div>

        {/* Rewrites */}
        <div style={{ marginBottom: 16 }}>
          <p style={{
            fontSize: 11, fontFamily: "Geist Mono", color: "var(--text-3)",
            letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12, paddingLeft: 2,
          }}>Quick wins — rewrites</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {result.rewrites.map((r, i) => {
              const parts = r.split(/->|→/)
              const before = parts[0]?.replace(/^Before:/i, "").trim()
              const after = parts[1]?.replace(/^After:/i, "").trim()
              return (
                <div key={i} className="animate-fade-up" style={{
                  animationDelay: `${i * 0.07}s`,
                  background: "white", border: "1px solid var(--border)",
                  borderRadius: 14, overflow: "hidden",
                }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "#fff5f5" }}>
                    <p style={{ fontSize: 10, fontFamily: "Geist Mono", color: "#ef4444", letterSpacing: "0.08em", marginBottom: 6 }}>BEFORE</p>
                    <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55 }}>{before || r}</p>
                  </div>
                  {after && (
                    <div style={{ padding: "16px 20px", background: "#f0fdf4" }}>
                      <p style={{ fontSize: 10, fontFamily: "Geist Mono", color: "#16a34a", letterSpacing: "0.08em", marginBottom: 6 }}>AFTER</p>
                      <p style={{ fontSize: 13, color: "var(--text-1)", lineHeight: 1.55, fontWeight: 500 }}>{after}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sticky upgrade bar */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40,
        borderTop: "1px solid var(--border)",
        background: "rgba(250,250,249,0.95)", backdropFilter: "blur(16px)",
        padding: "14px 24px",
      }}>
        <div style={{
          maxWidth: 720, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
          flexWrap: "wrap",
        }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", letterSpacing: "-0.01em" }}>
              Want every section fully rewritten?
            </p>
            <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
              Deep Roast — full rewrite + cover letter + LinkedIn headline · One-time
            </p>
          </div>
          <a href="mailto:hello@resumeroast.ai?subject=Deep Roast" style={{
            padding: "11px 22px", borderRadius: 10, border: "none",
            background: "var(--accent)", color: "white", fontSize: 13,
            fontWeight: 600, textDecoration: "none", letterSpacing: "-0.01em",
            whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(255,68,34,0.25)",
          }}>
            Get Deep Roast — $9
          </a>
        </div>
      </div>
    </div>
  )
}
