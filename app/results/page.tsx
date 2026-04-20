"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ResumeViewer from "@/components/ResumeViewer"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RoastResult {
  overall_score: number
  roast_quote: string
  metrics: {
    ats_parsability_percent: number
    quantified_bullets_percent: number
    strong_action_verbs: number
    weak_verbs: number
  }
  skill_gap: {
    inferred_role: string
    detected_skills: string[]
    missing_critical_skills: string[]
  }
  red_flags: Array<{
    issue: string
    severity: "High" | "Medium" | "Low" | string
    fix: string
  }>
  sections: {
    summary: number
    experience: number
    skills: number
    education: number
    formatting: number
  }
  upsell_teaser: {
    weak_bullet_original: string
    strong_bullet_rewrite: string
  }
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 48
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color =
    score < 40 ? "#ef4444" : score < 65 ? "#f59e0b" : score < 80 ? "#eab308" : "#22c55e"
  const label =
    score < 40 ? "Needs work" : score < 65 ? "Below average" : score < 80 ? "Good" : "Strong"

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-[120px] h-[120px]">
        <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" className="stroke-bg4" strokeWidth="7" />
          <circle
            cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            className="animate-ring-fill"
            style={{ filter: `drop-shadow(0 0 12px ${color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display text-3xl font-bold text-t1 leading-none tracking-tighter"
            style={{ textShadow: `0 0 20px ${color}60` }}
          >
            {score}
          </span>
          <span className="font-mono text-[10px] text-t3 mt-0.5">/ 100</span>
        </div>
      </div>
      <span
        className="font-mono text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full border"
        style={{ color, backgroundColor: `${color}15`, borderColor: `${color}30` }}
      >
        {label}
      </span>
    </div>
  )
}

function MetricCard({
  label,
  value,
  type,
  i,
}: {
  label: string
  value: number | string
  type: "good" | "bad" | "neutral"
  i: number
}) {
  const colorMap = {
    good: "text-green border-green/10 bg-green/5",
    bad: "text-red border-red/10 bg-red/5",
    neutral: "text-t2 border-border bg-bg3/60",
  }
  const valueColor = {
    good: "text-green",
    bad: "text-red",
    neutral: "text-t1",
  }

  return (
    <div
      className={`afu glass-panel rounded-xl p-4 flex flex-col justify-between interactive-hover border ${colorMap[type]}`}
      style={{ animationDelay: `${i * 0.1}s` }}
    >
      <p className="font-mono text-[9px] tracking-widest uppercase text-t3 mb-2">{label}</p>
      <p className={`font-display text-2xl font-bold tracking-tight ${valueColor[type]}`}>{value}</p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<RoastResult | null>(null)
  const [fileName, setFileName] = useState<string | undefined>()
  const [fileSize, setFileSize] = useState<number | undefined>()
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("roastResult")
    const meta = localStorage.getItem("roastMeta")

    if (!stored) { router.push("/"); return }

    try {
      setResult(JSON.parse(stored))
      if (meta) {
        const { name, size } = JSON.parse(meta)
        setFileName(name)
        setFileSize(size)
      }
    } catch {
      router.push("/")
    }
  }, [router])

  const share = (p: "linkedin" | "x") => {
    if (!result) return
    const text = `My resume scored ${result.overall_score}/100 on ResumeRoast.ai\n\n"${result.roast_quote}"\n\nGet yours reviewed free →`
    const url = "https://resumeroast.ai"
    if (p === "linkedin")
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank")
    else
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank")
  }

  const copy = () => {
    if (!result) return
    navigator.clipboard.writeText(
      `My resume scored ${result.overall_score}/100 on ResumeRoast.ai — "${result.roast_quote}" — Get yours free at resumeroast.ai`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Loading state
  if (!mounted || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-border2 border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-t3 font-medium tracking-wide">Loading your results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      {/* ── Top Navigation ── */}
      <nav className="glass-panel sticky top-0 z-50 flex items-center justify-between px-5 md:px-8 py-3.5 border-b border-border border-t-0 border-x-0 shrink-0">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 rounded-md bg-accent text-accent-fg flex items-center justify-center text-sm shadow-[0_0_10px_rgba(255,79,42,0.4)]">
            🔥
          </div>
          <span className="font-display font-bold text-sm tracking-tight text-white">ResumeRoast</span>
        </button>

        <div className="flex gap-2.5 items-center">
          <button
            onClick={copy}
            className="text-xs text-t2 px-3.5 py-2 rounded-lg border border-border2 bg-bg3 interactive-hover font-medium"
          >
            {copied ? "✓ Copied" : "Copy score"}
          </button>
          <button
            onClick={() => share("x")}
            className="text-xs text-t2 px-3.5 py-2 rounded-lg border border-border2 bg-bg3 interactive-hover font-medium hidden sm:block"
          >
            Share on X
          </button>
          <button
            onClick={() => router.push("/")}
            className="text-xs text-t2 px-3.5 py-2 rounded-lg border border-border2 bg-bg3 interactive-hover font-medium hidden md:block"
          >
            ← New resume
          </button>
        </div>
      </nav>

      {/* ── Split-Screen Body ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* ── LEFT PANE: PDF Viewer (35%, sticky) ── */}
        <aside className="
          hidden lg:flex flex-col
          lg:w-[35%] lg:max-w-[480px]
          lg:sticky lg:top-[57px] lg:h-[calc(100vh-57px)] lg:overflow-hidden
          shrink-0
        ">
          <ResumeViewer fileName={fileName} fileSize={fileSize} />
        </aside>

        {/* ── RIGHT PANE: Analytics (65%, scrolling) ── */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-28">
          <div className="max-w-[860px] mx-auto px-4 md:px-8 py-8 md:py-12">

            {/* ── SECTION 1: Score Hero Card ── */}
            <div className="afu glass-panel rounded-3xl p-8 md:p-10 mb-8 flex flex-col items-center text-center gap-6 relative overflow-hidden shadow-2xl shadow-accent/5">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-accent opacity-[0.035] blur-[80px] rounded-full pointer-events-none" />
              <ScoreRing score={result.overall_score} />
              <div className="relative z-10 max-w-lg">
                <p className="font-mono text-[9px] tracking-[0.2em] text-t3 mb-3 uppercase">
                  Your Roast — {result.skill_gap.inferred_role}
                </p>
                <p className="font-display text-xl md:text-2xl font-bold text-t1 leading-relaxed tracking-tight italic">
                  &ldquo;{result.roast_quote}&rdquo;
                </p>
              </div>
              <div className="flex gap-3 flex-wrap justify-center relative z-10 mt-1">
                {(["linkedin", "x"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => share(p)}
                    className="px-5 py-2.5 rounded-lg border border-border2 bg-bg3 hover:bg-bg4 interactive-hover text-xs text-t2 font-medium transition-colors"
                  >
                    Share on {p === "x" ? "X (Twitter)" : "LinkedIn"}
                  </button>
                ))}
              </div>
            </div>

            {/* ── SECTION 2: Key Metrics Bentogrid ── */}
            <p className="font-mono text-[9px] tracking-[0.2em] text-t3 uppercase mb-4 ml-1">
              Key Metrics
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
              <MetricCard i={0} label="ATS Readability" value={`${result.metrics.ats_parsability_percent}%`} type={result.metrics.ats_parsability_percent > 75 ? "good" : "bad"} />
              <MetricCard i={1} label="Quantified Output" value={`${result.metrics.quantified_bullets_percent}%`} type={result.metrics.quantified_bullets_percent > 30 ? "neutral" : "bad"} />
              <MetricCard i={2} label="Strong Verbs" value={result.metrics.strong_action_verbs} type="good" />
              <MetricCard i={3} label="Weak Verbs" value={result.metrics.weak_verbs} type={result.metrics.weak_verbs > 5 ? "bad" : "neutral"} />
            </div>

            {/* ── SECTION 3: Section Scores ── (charts will slot in here) */}
            <p className="font-mono text-[9px] tracking-[0.2em] text-t3 uppercase mb-4 ml-1">
              Section Scores
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
              {Object.entries(result.sections).map(([key, val], i) => (
                <div
                  key={key}
                  className="afu glass-panel rounded-xl p-4 text-center interactive-hover"
                  style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                >
                  <p className="font-display text-2xl font-bold text-t1 mb-1">{val}<span className="text-t3 text-sm">/10</span></p>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-t3 capitalize">{key}</p>
                  <div className="mt-2 h-1 rounded-full bg-bg4 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-700"
                      style={{ width: `${val * 10}%`, opacity: 0.7 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* ── SECTION 4: Skill Gap Analysis ── */}
            <p className="font-mono text-[9px] tracking-[0.2em] text-t3 uppercase mb-4 ml-1">
              Skill Gap — {result.skill_gap.inferred_role}
            </p>
            <div
              className="afu glass-panel rounded-2xl p-6 mb-10 border border-border/60"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-t3 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green" />
                    Detected Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.skill_gap.detected_skills.map((s, i) => (
                      <span key={i} className="text-xs px-3 py-1 rounded-md bg-green/10 text-green border border-green/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-t3 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red" />
                    Missing Industry Standards
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.skill_gap.missing_critical_skills.map((s, i) => (
                      <span key={i} className="text-xs px-3 py-1 rounded-md bg-red/5 text-red border border-red/20 flex items-center gap-1.5">
                        <span className="opacity-60">+</span> {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── SECTION 5: Red Flags ── */}
            <p className="font-mono text-[9px] tracking-[0.2em] text-t3 uppercase mb-4 ml-1">
              Red Flags Review
            </p>
            <div className="flex flex-col gap-3 mb-10">
              {result.red_flags.map((flag, i) => {
                const isHigh = flag.severity.toLowerCase() === "high"
                const borderColor = isHigh ? "#ef4444" : "#f59e0b"
                return (
                  <div
                    key={i}
                    className="afu glass-panel rounded-xl p-5 border-l-4 overflow-hidden interactive-hover"
                    style={{ animationDelay: `${i * 0.1 + 0.3}s`, borderLeftColor: borderColor }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-display text-sm font-semibold text-t1">{flag.issue}</span>
                      <span
                        className="font-mono text-[9px] uppercase px-2 py-0.5 rounded-sm border font-bold"
                        style={{
                          borderColor: `${borderColor}40`,
                          color: borderColor,
                          backgroundColor: `${borderColor}10`,
                        }}
                      >
                        {flag.severity}
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs text-t2 leading-relaxed">
                        <strong className="text-t1 font-medium font-mono text-[10px] tracking-widest uppercase mr-2 opacity-70">
                          FIX:
                        </strong>
                        {flag.fix}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── SECTION 6: Quick Win Rewrite ── */}
            <p className="font-mono text-[9px] tracking-[0.2em] text-t3 uppercase mb-4 ml-1">
              Quick Win Rewrite
            </p>
            <div
              className="afu glass-panel rounded-2xl overflow-hidden shadow-lg shadow-black/20 mb-8 border border-border/60"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="p-5 md:p-6 bg-red/5 border-b border-border/40 relative">
                <p className="font-mono text-[9px] text-red tracking-widest uppercase mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
                  Before
                </p>
                <p className="text-sm text-t2 leading-relaxed italic">&ldquo;{result.upsell_teaser.weak_bullet_original}&rdquo;</p>
              </div>
              <div className="p-5 md:p-6 bg-green/5 relative">
                <p className="font-mono text-[9px] text-green tracking-widest uppercase mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                  After
                </p>
                <p className="text-sm text-t1 font-medium leading-relaxed">{result.upsell_teaser.strong_bullet_rewrite}</p>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* ── Sticky Upsell CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-[#09090b]/90 backdrop-blur-xl px-6 py-4 shadow-[0_-10px_40px_rgba(0,0,0,0.6)]">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-display text-sm font-bold text-t1 tracking-tight">
              Want an elite resume rewrite?
            </p>
            <p className="text-xs text-t3 mt-0.5">
              Deep Roast — full rewrite + ATS optimization + Cover Letter &middot; One-time $29
            </p>
          </div>
          <a
            href="mailto:hello@resumeroast.ai?subject=Deep Roast"
            className="px-6 py-3 rounded-xl bg-accent text-white font-display text-sm font-bold tracking-tight shadow-[0_0_20px_rgba(255,79,42,0.4)] interactive-hover whitespace-nowrap"
          >
            Unlock Deep Roast — $29 →
          </a>
        </div>
      </div>
    </div>
  )
}
