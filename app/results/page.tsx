"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface Section { name: string; score: number; issue: string; fix: string }
interface RoastResult { score: number; roast_line: string; sections: Section[]; rewrites: string[] }

function ScoreRing({ score }: { score: number }) {
  const r = 48, circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  // Using exact hex colors matching tailwind config for SVG stroke
  const color = score < 40 ? "#ef4444" : score < 65 ? "#f59e0b" : score < 80 ? "#eab308" : "#22c55e"
  const label = score < 40 ? "Needs work" : score < 65 ? "Below average" : score < 80 ? "Good" : "Strong"
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-[120px] h-[120px]">
        <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" className="stroke-bg4" strokeWidth="7" />
          <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            className="animate-ring-fill" style={{ filter:`drop-shadow(0 0 12px ${color}80)` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-bold text-t1 leading-none tracking-tighter" style={{ textShadow: `0 0 20px ${color}60` }}>{score}</span>
          <span className="font-mono text-[10px] text-t3 mt-0.5">/ 100</span>
        </div>
      </div>
      <span className="font-mono text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full border" style={{ color, backgroundColor: `${color}15`, borderColor: `${color}30` }}>{label}</span>
    </div>
  )
}

function SectionCard({ s, i }: { s: Section; i: number }) {
  const color = s.score < 40 ? "#ef4444" : s.score < 65 ? "#f59e0b" : s.score < 80 ? "#eab308" : "#22c55e"
  return (
    <div className="afu glass-panel rounded-2xl overflow-hidden interactive-hover" style={{ animationDelay:`${i*0.1}s` }}>
      <div className="h-1 bg-bg4 w-full">
        <div className="h-full rounded-r bg-current shadow-[0_0_10px_currentColor]" style={{ width:`${s.score}%`, color }} />
      </div>
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <span className="font-display text-sm font-semibold text-t1 tracking-tight">{s.name}</span>
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border" style={{ color, backgroundColor:`${color}12`, borderColor:`${color}25` }}>{s.score}</span>
        </div>
        <div className="mb-4">
          <p className="font-mono text-[9px] text-t3 mb-1.5 tracking-widest uppercase">Problem</p>
          <p className="text-sm text-t2 leading-relaxed">{s.issue}</p>
        </div>
        <div className="pt-4 border-t border-border">
          <p className="font-mono text-[9px] text-accent mb-1.5 tracking-widest uppercase">Fix</p>
          <p className="text-sm text-t1 leading-relaxed font-medium">{s.fix}</p>
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

  if (!mounted || !result) return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-border2 border-t-accent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-t3 font-medium tracking-wide">Loading your results...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg pb-24">
      <nav className="glass-panel sticky top-0 z-50 flex items-center justify-between px-6 md:px-8 py-4 border-b-0 border-x-0 border-t-0">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-md bg-accent text-accent-fg flex items-center justify-center text-sm shadow-[0_0_10px_rgba(255,79,42,0.4)]">🔥</div>
          <span className="font-display font-bold text-sm tracking-tight text-white">ResumeRoast</span>
        </button>
        <div className="flex gap-3">
          <button onClick={copy} className="text-xs text-t2 px-4 py-2 rounded-lg border border-border2 bg-bg3 interactive-hover font-medium">{copied ? "✓ Copied" : "Copy score"}</button>
          <button onClick={() => router.push("/")} className="text-xs text-t2 px-4 py-2 rounded-lg border border-border2 bg-bg3 interactive-hover font-medium hidden sm:block">← New resume</button>
        </div>
      </nav>

      <div className="max-w-[700px] mx-auto px-4 py-12 md:py-16">
        {/* Score card */}
        <div className="afu glass-panel rounded-3xl p-8 md:p-12 mb-8 flex flex-col items-center text-center gap-6 relative overflow-hidden shadow-2xl shadow-accent/5">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-accent opacity-[0.03] blur-[80px] rounded-full pointer-events-none" />
          
          <ScoreRing score={result.score} />
          <div className="relative z-10">
            <p className="font-mono text-[9px] tracking-[0.2em] text-t3 mb-3 uppercase">Your Roast</p>
            <p className="font-display text-xl md:text-3xl font-bold text-t1 leading-relaxed md:leading-[1.4] tracking-tight italic max-w-lg">
              &ldquo;{result.roast_line}&rdquo;
            </p>
          </div>
          <div className="flex gap-3 flex-wrap justify-center relative z-10 mt-2">
            {[
              { label:"Share on LinkedIn", p:"linkedin" as const }, 
              { label:"Share on X", p:"x" as const }
            ].map(({ label, p }) => (
              <button key={p} onClick={() => share(p)} className="px-5 py-2.5 rounded-lg border border-border2 bg-bg3 hover:bg-bg4 interactive-hover text-xs text-t2 font-medium transition-colors">{label}</button>
            ))}
          </div>
        </div>

        {/* Breakdown */}
        <p className="font-mono text-[9px] tracking-[0.2em] text-t3 uppercase mb-4 ml-1">Breakdown</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {result.sections.map((sec, i) => <SectionCard key={sec.name} s={sec} i={i} />)}
        </div>

        {/* Rewrites */}
        <p className="font-mono text-[9px] tracking-[0.2em] text-t3 uppercase mb-4 ml-1">Quick wins — rewrites</p>
        <div className="flex flex-col gap-4">
          {result.rewrites.map((r, i) => {
            const parts = r.split(/->|→/)
            const before = parts[0]?.replace(/^Before:/i, "").trim()
            const after  = parts[1]?.replace(/^After:/i,  "").trim()
            return (
              <div key={i} className="afu glass-panel rounded-2xl overflow-hidden shadow-lg shadow-black/20" style={{ animationDelay:`${i*0.1}s` }}>
                <div className="p-5 md:p-6 bg-red-bg/50 border-b border-border/50">
                  <p className="font-mono text-[9px] text-red tracking-widest uppercase mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" /> Before</p>
                  <p className="text-sm text-t2 leading-relaxed">{before || r}</p>
                </div>
                {after && (
                  <div className="p-5 md:p-6 bg-green-bg/30">
                    <p className="font-mono text-[9px] text-green tracking-widest uppercase mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" /> After</p>
                    <p className="text-sm text-t1 font-medium leading-relaxed">{after}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Sticky upgrade */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-[#09090b]/80 backdrop-blur-xl px-6 py-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-[700px] mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-display text-sm font-bold text-t1 tracking-tight">Want every section fully rewritten?</p>
            <p className="text-xs text-t3 mt-1">Deep Roast — full rewrite + cover letter + LinkedIn &middot; One-time</p>
          </div>
          <a href="mailto:hello@resumeroast.ai?subject=Deep Roast" className="px-6 py-3 rounded-xl bg-accent text-white font-display text-sm font-bold tracking-tight shadow-[0_0_20px_rgba(255,79,42,0.4)] interactive-hover whitespace-nowrap">
            Get Deep Roast — $9
          </a>
        </div>
      </div>
    </div>
  )
}
