"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface RoastResult {
  overall_score: number;
  roast_quote: string;
  metrics: { ats_parsability_percent: number; quantified_bullets_percent: number; strong_action_verbs: number; weak_verbs: number; };
  skill_gap: { inferred_role: string; detected_skills: string[]; missing_critical_skills: string[]; };
  red_flags: Array<{ issue: string; severity: "High" | "Medium" | "Low" | string; fix: string; }>;
  upsell_teaser: { weak_bullet_original: string; strong_bullet_rewrite: string; };
}

function ScoreRing({ score }: { score: number }) {
  const r = 48, circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
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

function MetricCard({ label, value, type, i }: { label: string, value: number | string, type: "good"|"bad"|"neutral", i: number }) {
  let colorClass = "text-t2"; let bg = "bg-bg3"
  if (type === "good") { colorClass = "text-green"; bg = "bg-green-bg/20 border-green/20" }
  if (type === "bad") { colorClass = "text-red"; bg = "bg-red-bg/20 border-red/20" }

  return (
    <div className={`afu glass-panel rounded-xl p-4 flex flex-col justify-between interactive-hover ${bg}`} style={{ animationDelay:`${i*0.1}s` }}>
      <p className="font-mono text-[9px] tracking-widest uppercase text-t3 mb-2">{label}</p>
      <p className={`font-display text-2xl font-bold tracking-tight ${colorClass}`}>{value}</p>
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
    const text = `My resume scored ${result.overall_score}/100 on ResumeRoast.ai\n\n"${result.roast_quote}"\n\nGet yours reviewed free →`
    const url = "https://resumeroast.ai"
    if (p === "linkedin") window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank")
    else window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank")
  }

  const copy = () => {
    if (!result) return
    navigator.clipboard.writeText(`My resume scored ${result.overall_score}/100 on ResumeRoast.ai — "${result.roast_quote}" — Get yours free at resumeroast.ai`)
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
        <div className="afu glass-panel rounded-3xl p-8 md:p-12 mb-10 flex flex-col items-center text-center gap-6 relative overflow-hidden shadow-2xl shadow-accent/5">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-accent opacity-[0.03] blur-[80px] rounded-full pointer-events-none" />
          
          <ScoreRing score={result.overall_score} />
          <div className="relative z-10">
            <p className="font-mono text-[9px] tracking-[0.2em] text-t3 mb-3 uppercase">Your Roast</p>
            <p className="font-display text-xl md:text-3xl font-bold text-t1 leading-relaxed md:leading-[1.4] tracking-tight italic max-w-lg">
              &ldquo;{result.roast_quote}&rdquo;
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

        {/* Metrics Grid */}
        <p className="font-mono text-[9px] tracking-[0.2em] text-t3 uppercase mb-4 ml-1">Key Metrics</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <MetricCard i={0} label="ATS Readability" value={`${result.metrics.ats_parsability_percent}%`} type={result.metrics.ats_parsability_percent > 75 ? "good" : "bad"} />
          <MetricCard i={1} label="Quantified Output" value={`${result.metrics.quantified_bullets_percent}%`} type={result.metrics.quantified_bullets_percent > 30 ? "neutral" : "bad"} />
          <MetricCard i={2} label="Action Verbs" value={result.metrics.strong_action_verbs} type="good" />
          <MetricCard i={3} label="Weak Verbs" value={result.metrics.weak_verbs} type={result.metrics.weak_verbs > 5 ? "bad" : "neutral"} />
        </div>

        {/* Skill Gap Analysis */}
        <p className="font-mono text-[9px] tracking-[0.2em] text-t3 uppercase mb-4 ml-1 mt-6">Skill Gap: {result.skill_gap.inferred_role}</p>
        <div className="afu glass-panel rounded-2xl p-6 mb-10 border border-border/60" style={{ animationDelay: '0.2s' }}>
          <div className="mb-6">
            <p className="text-xs font-semibold text-t3 mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green" /> Detected Skills</p>
            <div className="flex flex-wrap gap-2">
              {result.skill_gap.detected_skills.map((s, i) => (
                <span key={i} className="text-xs px-3 py-1 rounded-md bg-green-bg/20 text-green border border-green/20">{s}</span>
              ))}
              {result.skill_gap.detected_skills.length === 0 && <span className="text-xs text-t3 italic">No core skills detected</span>}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-t3 mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red" /> Missing Industry Standards</p>
            <div className="flex flex-wrap gap-2">
              {result.skill_gap.missing_critical_skills.map((s, i) => (
                <span key={i} className="text-xs px-3 py-1 rounded-md bg-red-bg/20 text-red border border-red/20 flex items-center gap-1.5"><span className="opacity-60">+</span> {s}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Red Flags List */}
        <p className="font-mono text-[9px] tracking-[0.2em] text-t3 uppercase mb-4 ml-1">Red Flags Review</p>
        <div className="flex flex-col gap-3 mb-10">
          {result.red_flags.map((flag, i) => {
            const isHigh = flag.severity.toLowerCase() === "high";
            return (
              <div key={i} className="afu glass-panel rounded-xl p-5 border-l-4 overflow-hidden relative interactive-hover" style={{ animationDelay:`${i*0.1 + 0.3}s`, borderLeftColor: isHigh ? "#ef4444" : "#f59e0b" }}>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-display text-sm font-semibold text-t1">{flag.issue}</span>
                  <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded-sm border font-bold" style={{ borderColor: isHigh ? "#ef444440" : "#f59e0b40", color: isHigh ? "#ef4444" : "#f59e0b", backgroundColor: isHigh ? "#ef444410" : "#f59e0b10" }}>
                    {flag.severity}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs text-t2 leading-relaxed"><strong className="text-t1 font-medium font-mono text-[10px] tracking-widest uppercase mr-2 opacity-70">FIX:</strong> {flag.fix}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Upsell Teaser */}
        <p className="font-mono text-[9px] tracking-[0.2em] text-t3 uppercase mb-4 ml-1">Quick Win Rewrite</p>
        <div className="afu glass-panel rounded-2xl overflow-hidden shadow-lg shadow-black/20 mb-8 border border-border/60" style={{ animationDelay: '0.5s' }}>
          <div className="p-5 md:p-6 bg-red-bg/10 border-b border-border/40 relative">
            <p className="font-mono text-[9px] text-red tracking-widest uppercase mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" /> Before</p>
            <p className="text-sm text-t2 leading-relaxed italic">&ldquo;{result.upsell_teaser.weak_bullet_original}&rdquo;</p>
          </div>
          <div className="p-5 md:p-6 bg-green-bg/10 relative">
            <p className="font-mono text-[9px] text-green tracking-widest uppercase mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" /> After</p>
            <p className="text-sm text-t1 font-medium leading-relaxed">{result.upsell_teaser.strong_bullet_rewrite}</p>
          </div>
        </div>
      </div>

      {/* Sticky upgrade */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-[#09090b]/80 backdrop-blur-xl px-6 py-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-[700px] mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-display text-sm font-bold text-t1 tracking-tight">Want an elite resume rewrite?</p>
            <p className="text-xs text-t3 mt-1">Deep Roast — full rewrite + ATS optimization + Cover Letter &middot; One-time</p>
          </div>
          <a href="mailto:hello@resumeroast.ai?subject=Deep Roast" className="px-6 py-3 rounded-xl bg-accent text-white font-display text-sm font-bold tracking-tight shadow-[0_0_20px_rgba(255,79,42,0.4)] interactive-hover whitespace-nowrap">
            Unlock Full Rewrite — $29
          </a>
        </div>
      </div>
    </div>
  )
}
