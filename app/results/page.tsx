"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface Section {
  name: string
  score: number
  issue: string
  fix: string
}

interface RoastResult {
  score: number
  roast_line: string
  sections: Section[]
  rewrites: string[]
}

function ScoreRing({ score }: { score: number }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score < 40 ? "#ef4444" : score < 70 ? "#FF4500" : "#22c55e"

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle
          cx="72" cy="72" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)", filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="text-center z-10">
        <p className="font-display text-4xl text-white leading-none">{score}</p>
        <p className="font-mono text-xs text-white/30 uppercase tracking-widest mt-1">score</p>
      </div>
    </div>
  )
}

function SectionCard({ section }: { section: Section }) {
  const color = section.score < 40 ? "text-red-400 border-red-500/20 bg-red-500/5"
    : section.score < 70 ? "text-orange-400 border-orange-500/20 bg-orange-500/5"
    : "text-green-400 border-green-500/20 bg-green-500/5"

  const badgeColor = section.score < 40 ? "bg-red-500/20 text-red-400"
    : section.score < 70 ? "bg-orange-500/20 text-orange-400"
    : "bg-green-500/20 text-green-400"

  return (
    <div className={`border rounded-2xl p-5 ${color} animate-slide-up`}>
      <div className="flex items-center justify-between mb-3">
        <p className="font-body font-semibold text-white text-sm">{section.name}</p>
        <span className={`font-mono text-xs font-medium px-2 py-1 rounded-full ${badgeColor}`}>
          {section.score}/100
        </span>
      </div>
      <div className="space-y-3">
        <div>
          <p className="font-mono text-xs text-white/30 uppercase tracking-widest mb-1">Problem</p>
          <p className="font-body text-sm text-white/70 leading-relaxed">{section.issue}</p>
        </div>
        <div>
          <p className="font-mono text-xs text-flame uppercase tracking-widest mb-1">Fix</p>
          <p className="font-body text-sm text-white/90 leading-relaxed">{section.fix}</p>
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
    if (!stored) {
      router.push("/")
      return
    }
    try {
      setResult(JSON.parse(stored))
    } catch {
      router.push("/")
    }
  }, [router])

  const handleShare = (platform: "linkedin" | "twitter") => {
    if (!result) return
    const text = `My resume just got roasted by AI and scored ${result.score}/100 💀\n\n"${result.roast_line}"\n\nGet yours roasted free 👇`
    const url = "https://resumeroast.ai"
    if (platform === "linkedin") {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank")
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank")
    }
  }

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(`My resume scored ${result.score}/100 on ResumeRoast.ai\n"${result.roast_line}"\n\nGet yours roasted free at resumeroast.ai`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!mounted || !result) {
    return (
      <div className="min-h-screen bg-char flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl animate-flicker mb-4">🔥</p>
          <p className="font-mono text-white/30 text-sm">Loading your roast...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-char pb-32">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-char/90 backdrop-blur-sm z-10">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <span className="text-xl">🔥</span>
          <span className="font-display text-xl tracking-wider text-white">RESUMEROAST</span>
        </button>
        <button
          onClick={handleCopy}
          className="text-sm font-body font-medium text-flame border border-flame/30 px-4 py-2 rounded-full hover:bg-flame/10 transition-colors"
        >
          {copied ? "✓ Copied!" : "Copy My Score"}
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Score + Roast Line */}
        <div className="text-center mb-10 animate-fade-in">
          <ScoreRing score={result.score} />
          <div className="mt-6 px-4">
            <p className="font-mono text-xs text-white/30 uppercase tracking-widest mb-3">Your roast</p>
            <p className="font-display text-2xl md:text-3xl tracking-wide text-white leading-tight">
              &ldquo;{result.roast_line}&rdquo;
            </p>
          </div>
        </div>

        {/* Score Cards */}
        <div className="mb-8">
          <p className="font-mono text-xs text-white/30 uppercase tracking-widest mb-4">Breakdown</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.sections.map((section) => (
              <SectionCard key={section.name} section={section} />
            ))}
          </div>
        </div>

        {/* Quick Wins / Rewrites */}
        <div className="mb-8">
          <p className="font-mono text-xs text-white/30 uppercase tracking-widest mb-4">Quick wins</p>
          <div className="space-y-3">
            {result.rewrites.map((rewrite, i) => {
              const [before, after] = rewrite.split("→")
              return (
                <div key={i} className="border border-white/5 rounded-2xl p-5 bg-white/2 animate-slide-up">
                  {before && (
                    <div className="mb-3">
                      <span className="font-mono text-xs text-red-400 uppercase tracking-widest">Before</span>
                      <p className="font-body text-sm text-white/50 mt-1 leading-relaxed">{before.replace("Before:", "").trim()}</p>
                    </div>
                  )}
                  {after && (
                    <div>
                      <span className="font-mono text-xs text-green-400 uppercase tracking-widest">After</span>
                      <p className="font-body text-sm text-white/90 mt-1 leading-relaxed">{after.replace("After:", "").trim()}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Share */}
        <div className="mb-6">
          <p className="font-mono text-xs text-white/30 uppercase tracking-widest mb-4 text-center">Share your roast</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleShare("linkedin")}
              className="py-3 rounded-xl border border-white/10 text-white/70 hover:border-blue-500/40 hover:text-blue-400 hover:bg-blue-500/5 transition-all font-body text-sm font-medium"
            >
              Share on LinkedIn
            </button>
            <button
              onClick={() => handleShare("twitter")}
              className="py-3 rounded-xl border border-white/10 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/5 transition-all font-body text-sm font-medium"
            >
              Share on X
            </button>
          </div>
        </div>

        {/* Roast Again */}
        <button
          onClick={() => router.push("/")}
          className="w-full py-4 rounded-xl border border-white/5 text-white/30 hover:text-white/60 hover:border-white/10 transition-all font-body text-sm"
        >
          ← Roast another resume
        </button>
      </div>

      {/* Sticky Upgrade Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-char/95 backdrop-blur-sm border-t border-white/5 px-4 py-4 z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="font-body font-semibold text-white text-sm">Want a full rewrite?</p>
            <p className="font-body text-xs text-white/40">Get every section rewritten by AI + cover letter</p>
          </div>
          <a
            href="mailto:hello@resumeroast.ai?subject=Deep Roast Order"
            className="shrink-0 bg-flame hover:bg-ember text-white font-display tracking-wider text-sm px-6 py-3 rounded-xl transition-colors shadow-lg shadow-flame/20"
          >
            DEEP ROAST — $9
          </a>
        </div>
      </div>
    </main>
  )
}
