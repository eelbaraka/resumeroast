"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface Section { name: string; score: number; issue: string; fix: string }
interface RoastResult { score: number; roast_line: string; sections: Section[]; rewrites: string[] }

function ScoreRing({ score }: { score: number }) {
  const r = 48, circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score < 40 ? "#ef4444" : score < 65 ? "#f59e0b" : score < 80 ? "#eab308" : "#22c55e"
  const label = score < 40 ? "Needs work" : score < 65 ? "Below average" : score < 80 ? "Good" : "Strong"
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
      <div style={{ position:"relative", width:120, height:120 }}>
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform:"rotate(-90deg)" }}>
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--bg4)" strokeWidth="7" />
          <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            className="ring" style={{ filter:`drop-shadow(0 0 8px ${color}50)` }} />
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <span className="font-display" style={{ fontSize:32, fontWeight:700, color:"var(--t1)", lineHeight:1, letterSpacing:"-0.03em" }}>{score}</span>
          <span className="font-mono" style={{ fontSize:10, color:"var(--t3)", marginTop:2 }}>/ 100</span>
        </div>
      </div>
      <span className="font-mono" style={{ fontSize:10, fontWeight:500, color, letterSpacing:"0.07em", textTransform:"uppercase", background:`${color}15`, padding:"3px 10px", borderRadius:100, border:`0.5px solid ${color}30` }}>{label}</span>
    </div>
  )
}

function SectionCard({ s, i }: { s: Section; i: number }) {
  const color = s.score < 40 ? "#ef4444" : s.score < 65 ? "#f59e0b" : s.score < 80 ? "#eab308" : "#22c55e"
  return (
    <div className="afu" style={{ animationDelay:`${i*0.07}s`, background:"var(--bg2)", border:"0.5px solid var(--border2)", borderRadius:13, overflow:"hidden" }}>
      <div style={{ height:2, background:"var(--bg4)" }}>
        <div style={{ width:`${s.score}%`, height:"100%", background:color, borderRadius:2 }} />
      </div>
      <div style={{ padding:"15px 16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:11 }}>
          <span className="font-display" style={{ fontSize:12, fontWeight:600, color:"var(--t1)", letterSpacing:"-0.01em" }}>{s.name}</span>
          <span className="font-mono" style={{ fontSize:10, fontWeight:700, color, background:`${color}12`, padding:"2px 7px", borderRadius:5, border:`0.5px solid ${color}25` }}>{s.score}</span>
        </div>
        <div style={{ marginBottom:10 }}>
          <p className="font-mono" style={{ fontSize:9, color:"var(--t3)", marginBottom:3, letterSpacing:"0.06em" }}>PROBLEM</p>
          <p style={{ fontSize:12, color:"var(--t2)", lineHeight:1.55, fontFamily:"Inter,sans-serif" }}>{s.issue}</p>
        </div>
        <div style={{ paddingTop:10, borderTop:"0.5px solid var(--border)" }}>
          <p className="font-mono" style={{ fontSize:9, color:"var(--accent)", marginBottom:3, letterSpacing:"0.06em" }}>FIX</p>
          <p style={{ fontSize:12, color:"var(--t1)", lineHeight:1.55, fontWeight:500, fontFamily:"Inter,sans-serif" }}>{s.fix}</p>
        </div>
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

  const navBtn = { fontSize:12, color:"var(--t2)", padding:"6px 14px", borderRadius:8, border:"0.5px solid var(--border2)", background:"var(--bg3)", cursor:"pointer", fontFamily:"Inter,sans-serif" }

  if (!mounted || !result) return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div className="spin" style={{ width:32, height:32, border:"2px solid var(--border2)", borderTopColor:"var(--accent)", borderRadius:"50%", margin:"0 auto 14px" }} />
        <p style={{ fontSize:13, color:"var(--t3)", fontFamily:"Inter,sans-serif" }}>Loading your results...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"15px 28px", borderBottom:"0.5px solid var(--border)", background:"rgba(12,12,11,0.92)", backdropFilter:"blur(16px)", position:"sticky", top:0, zIndex:50 }}>
        <button onClick={() => router.push("/")} style={{ display:"flex", alignItems:"center", gap:9, background:"none", border:"none", cursor:"pointer", padding:0 }}>
          <div style={{ width:26, height:26, borderRadius:7, background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>🔥</div>
          <span className="font-display" style={{ fontWeight:700, fontSize:14, color:"var(--t1)", letterSpacing:"-0.02em" }}>ResumeRoast</span>
        </button>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={copy} style={navBtn}>{copied ? "✓ Copied" : "Copy score"}</button>
          <button onClick={() => router.push("/")} style={navBtn}>← New resume</button>
        </div>
      </nav>

      <div style={{ maxWidth:700, margin:"0 auto", padding:"40px 20px 130px" }}>

        {/* Score card */}
        <div className="afu" style={{ background:"var(--bg2)", border:"0.5px solid var(--border2)", borderRadius:16, padding:"36px 28px", marginBottom:14, display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:20 }}>
          <ScoreRing score={result.score} />
          <div>
            <p className="font-mono" style={{ fontSize:9, color:"var(--t3)", letterSpacing:"0.08em", marginBottom:8 }}>YOUR ROAST</p>
            <p className="font-display" style={{ fontSize:"clamp(16px,2.5vw,22px)", fontWeight:600, fontStyle:"italic", color:"var(--t1)", lineHeight:1.4, letterSpacing:"-0.01em", maxWidth:500 }}>
              &ldquo;{result.roast_line}&rdquo;
            </p>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
            {[{ label:"Share on LinkedIn", p:"linkedin" as const }, { label:"Share on X", p:"x" as const }].map(({ label, p }) => (
              <button key={p} onClick={() => share(p)} style={{ padding:"8px 16px", borderRadius:9, border:"0.5px solid var(--border2)", background:"var(--bg3)", cursor:"pointer", fontSize:12, color:"var(--t2)", fontFamily:"Inter,sans-serif" }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Breakdown */}
        <p className="font-mono" style={{ fontSize:9, color:"var(--t3)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10, paddingLeft:2 }}>Breakdown</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))", gap:8, marginBottom:14 }}>
          {result.sections.map((sec, i) => <SectionCard key={sec.name} s={sec} i={i} />)}
        </div>

        {/* Rewrites */}
        <p className="font-mono" style={{ fontSize:9, color:"var(--t3)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10, paddingLeft:2 }}>Quick wins — rewrites</p>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {result.rewrites.map((r, i) => {
            const parts = r.split(/->|→/)
            const before = parts[0]?.replace(/^Before:/i, "").trim()
            const after  = parts[1]?.replace(/^After:/i,  "").trim()
            return (
              <div key={i} className="afu" style={{ animationDelay:`${i*0.08}s`, background:"var(--bg2)", border:"0.5px solid var(--border2)", borderRadius:13, overflow:"hidden" }}>
                <div style={{ padding:"14px 16px", background:"rgba(239,68,68,0.05)", borderBottom:"0.5px solid var(--border)" }}>
                  <p className="font-mono" style={{ fontSize:9, color:"var(--red)", letterSpacing:"0.06em", marginBottom:5 }}>BEFORE</p>
                  <p style={{ fontSize:13, color:"var(--t2)", lineHeight:1.55, fontFamily:"Inter,sans-serif" }}>{before || r}</p>
                </div>
                {after && (
                  <div style={{ padding:"14px 16px", background:"rgba(34,197,94,0.04)" }}>
                    <p className="font-mono" style={{ fontSize:9, color:"var(--green)", letterSpacing:"0.06em", marginBottom:5 }}>AFTER</p>
                    <p style={{ fontSize:13, color:"var(--t1)", lineHeight:1.55, fontWeight:500, fontFamily:"Inter,sans-serif" }}>{after}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Sticky upgrade */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:40, borderTop:"0.5px solid var(--border)", background:"rgba(12,12,11,0.96)", backdropFilter:"blur(20px)", padding:"14px 24px" }}>
        <div style={{ maxWidth:700, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
          <div>
            <p className="font-display" style={{ fontSize:13, fontWeight:700, color:"var(--t1)", letterSpacing:"-0.01em" }}>Want every section fully rewritten?</p>
            <p style={{ fontSize:11, color:"var(--t3)", marginTop:2, fontFamily:"Inter,sans-serif" }}>Deep Roast — full rewrite + cover letter + LinkedIn headline · One-time</p>
          </div>
          <a href="mailto:hello@resumeroast.ai?subject=Deep Roast" style={{ padding:"11px 22px", borderRadius:10, border:"none", background:"var(--accent)", color:"white", fontSize:13, fontWeight:700, textDecoration:"none", letterSpacing:"-0.01em", whiteSpace:"nowrap", fontFamily:"DM Sans,sans-serif", boxShadow:"0 2px 12px rgba(255,68,34,0.3)" }}>
            Get Deep Roast — $9
          </a>
        </div>
      </div>
    </div>
  )
}
