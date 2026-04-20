"use client"
import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setMounted(true) }, [])

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") { setError("Only PDF files are supported."); return }
    if (f.size > 10 * 1024 * 1024) { setError("File must be under 10MB."); return }
    setError(""); setFile(f)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]; if (f) handleFile(f)
  }, [])

  const handleRoast = async () => {
    if (!file) return
    setLoading(true); setError(""); setProgress(0)
    const iv = setInterval(() => setProgress(p => Math.min(p + 1.5, 88)), 180)
    try {
      const fd = new FormData(); fd.append("resume", file)
      const res = await fetch("/api/roast", { method:"POST", body:fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Failed") }
      const result = await res.json()
      clearInterval(iv); setProgress(100)
      localStorage.setItem("roastResult", JSON.stringify(result))
      localStorage.setItem("roastMeta", JSON.stringify({ name: file.name, size: file.size }))
      setTimeout(() => router.push("/results"), 400)
    } catch (err: unknown) {
      clearInterval(iv); setProgress(0)
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="glass-panel sticky top-0 z-50 flex items-center justify-between px-6 md:px-8 py-4 border-b-0 border-x-0 border-t-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent text-accent-fg flex items-center justify-center text-lg shadow-[0_0_15px_rgba(255,79,42,0.4)]">🔥</div>
          <span className="font-display font-bold text-lg tracking-tight text-white">ResumeRoast</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-t3 hidden sm:inline-block tracking-widest uppercase">Free &middot; No signup</span>
          <a href="#how" className="text-xs text-t2 px-4 py-2 rounded-lg border border-border2 bg-bg3 interactive-hover font-medium">How it works</a>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 md:py-32">
        <div className="afu inline-flex items-center gap-2 bg-accent-subtle border border-accent/20 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-glow-pulse" />
          <span className="font-mono text-[10px] font-semibold text-accent tracking-widest uppercase">AI-Powered &middot; Free &middot; 30 Seconds</span>
        </div>

        <h1 className="afu d1 font-display md:text-7xl text-5xl font-bold leading-tight tracking-tighter text-center max-w-4xl mb-6">
          Get your resume<br className="hidden md:block" />
          <span className="text-accent glow-text"> roasted </span> 
          <span className="text-t2 font-medium">by AI</span>
        </h1>

        <p className="afu d2 text-base md:text-lg text-t2 text-center max-w-xl mb-12 leading-relaxed">
          Find out exactly why you&apos;re not getting callbacks. Honest AI feedback, ATS analysis, and specific fixes — completely free.
        </p>

        <div className="afu d3 w-full max-w-[480px] bg-bg2 rounded-2xl border border-border2 overflow-hidden shadow-2xl shadow-accent/5">
          <div
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onClick={() => !loading && inputRef.current?.click()}
            className={`p-10 cursor-pointer text-center transition-all duration-300 border-b border-border2 ${
              dragging ? 'bg-accent-subtle border-b-accent' : file ? 'bg-green-bg' : 'hover:bg-bg3'
            }`}
          >
            <input ref={inputRef} type="file" accept=".pdf" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {!file ? (
              <>
                <div className="w-14 h-14 rounded-xl bg-bg3 border border-border2 flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
                  📄
                </div>
                <p className="font-display text-base font-semibold text-t1 mb-1">
                  {dragging ? "Drop it here" : "Drop your resume here"}
                </p>
                <p className="text-xs text-t3">
                  PDF only &middot; Max 10MB &middot; <span className="text-accent font-medium hover:underline">browse files</span>
                </p>
              </>
            ) : (
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-xl bg-green-bg border border-green/20 flex items-center justify-center text-xl shrink-0">📄</div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-semibold text-t1 truncate">{file.name}</p>
                  <p className="font-mono text-xs text-t3 mt-1">{(file.size/1024).toFixed(0)} KB &middot; PDF &middot; Ready</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setFile(null) }}
                  className="w-8 h-8 rounded-lg border border-border2 bg-bg4 hover:bg-bg3 text-t2 flex items-center justify-center shrink-0 transition-colors">✕</button>
              </div>
            )}
          </div>

          {loading && (
            <div className="h-1 bg-bg4 w-full overflow-hidden">
              <div className="h-full bg-accent rounded-r-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(255,79,42,0.8)]" style={{ width: `${progress}%` }} />
            </div>
          )}

          {error && (
            <div className="px-5 py-3 bg-red-bg border-b border-red/20">
              <p className="text-xs text-red font-medium flex items-center gap-2"><span>⚠️</span> {error}</p>
            </div>
          )}

          <div className="p-5 bg-bg2">
            <button onClick={handleRoast} disabled={!file || loading}
              className={`w-full py-3.5 rounded-xl font-display font-bold text-sm tracking-wide transition-all duration-300 ${
                !file || loading 
                  ? 'bg-bg4 text-t3 cursor-not-allowed' 
                  : 'bg-t1 text-bg interactive-hover shadow-[0_0_20px_rgba(255,255,255,0.1)]'
              }`}>
              {loading ? `Analyzing... ${Math.round(progress)}%` : "Analyze My Resume →"}
            </button>
          </div>
        </div>

        <div className="afu d4 flex items-center justify-center gap-6 md:gap-10 mt-10 flex-wrap">
          {[
            { icon: "🔒", text: "Private & secure" }, 
            { icon: "⚡", text: "Results in 30s" }, 
            { icon: "✦", text: "No signup needed" }
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-xs text-t3 font-medium">
              <span className="text-sm">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </main>

      {/* How it works */}
      <section id="how" className="border-t border-border bg-bg/50 backdrop-blur-sm py-24 px-6 md:px-8">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-xs text-t3 tracking-[0.2em] uppercase text-center mb-12">How it works</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { n:"01", title:"Upload PDF", desc:"Drop your resume. We accept any text-based PDF." },
              { n:"02", title:"AI reads it", desc:"Every line analyzed — structure, keywords, impact." },
              { n:"03", title:"Get roasted", desc:"Score, critique, and specific fixes in seconds." },
              { n:"04", title:"Apply & win", desc:"Use the feedback to land more interviews." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="glass-panel p-6 rounded-2xl interactive-hover">
                <p className="font-mono text-xs text-accent mb-4 tracking-widest">{n}</p>
                <p className="font-display text-base font-semibold text-t1 mb-2">{title}</p>
                <p className="text-sm text-t2 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-border py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 divide-x-0 md:divide-x divide-border">
          {[
            { v:"50k+", l:"Resumes analyzed" }, 
            { v:"4.8", l:"Average rating" }, 
            { v:"30s", l:"Average time" }, 
            { v:"100%", l:"Always free" }
          ].map(({ v, l }, i) => (
            <div key={l} className="text-center px-4">
              <p className="font-display text-4xl font-bold text-t1 tracking-tighter mb-2">
                {v.replace(/[k+%s]/g, "")}
                <span className="text-accent glow-text">{v.match(/[k+%s]/g)?.[0]||""}</span>
                {v.replace(/[\d.]/g,"").slice(1)}
              </p>
              <p className="text-xs text-t3 font-medium uppercase tracking-wider">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What you get */}
      <section className="border-t border-border py-24 px-6 md:px-8 bg-bg2 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-3xl bg-accent opacity-5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <p className="font-mono text-xs text-accent tracking-[0.2em] uppercase mb-4">What you get</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-12 text-t1 leading-[1.1]">
            Everything a $300/hr career coach<br className="hidden md:block"/> would tell you. <span className="text-accent glow-text">Free.</span>
          </h2>
          <div className="glass-panel rounded-2xl overflow-hidden divide-y divide-border">
            {[
              { icon:"◎", label:"Overall score", desc:"A 0–100 rating with reasoning behind every point deducted." },
              { icon:"◈", label:"ATS compatibility check", desc:"Find out if your resume makes it past automated screening." },
              { icon:"◉", label:"Section breakdown", desc:"Clarity, impact, keywords, and red flags — all scored separately." },
              { icon:"◇", label:"Before/after rewrites", desc:"Your weak bullets rewritten with stronger language and metrics." },
              { icon:"◆", label:"3 quick wins", desc:"The changes you can make today that will have the biggest impact." },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="flex items-start gap-4 p-6 md:p-8 bg-bg/40 hover:bg-bg/80 transition-colors">
                <span className="font-mono text-xl text-accent mt-0.5 w-6 text-center">{icon}</span>
                <div>
                  <p className="font-display text-base font-semibold text-t1 mb-2">{label}</p>
                  <p className="text-sm text-t2 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-32 px-6 md:px-8 flex flex-col items-center text-center relative">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent opacity-10 blur-[150px] rounded-full pointer-events-none" />
        <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6 text-t1 relative z-10">
          Ready to find out the truth?
        </h2>
        <p className="text-lg text-t2 mb-10 max-w-md relative z-10">
          No email. No credit card. Just upload and get your honest score.
        </p>
        <button onClick={() => window.scrollTo({ top:0, behavior:"smooth" })}
          className="px-8 py-4 rounded-xl bg-accent text-white font-display font-bold shadow-[0_0_30px_rgba(255,79,42,0.3)] interactive-hover relative z-10">
          Analyze My Resume — Free →
        </button>
      </section>

      <footer className="border-t border-border py-8 px-6 md:px-8 flex flex-col md:flex-row shadow-[0_-1px_0_var(--border)] items-center justify-between gap-6 bg-bg">
        <div className="flex items-center gap-3">
          <span className="text-lg">🔥</span>
          <span className="font-display text-sm font-bold text-t1">ResumeRoast</span>
        </div>
        <p className="text-xs text-t3 text-center">Free AI resume analysis &middot; No data stored &middot; Built for job seekers</p>
        <div className="flex gap-6">
          {["Privacy","Contact"].map(l => (
            <a key={l} href="#" className="text-xs text-t3 hover:text-t1 transition-colors">{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
