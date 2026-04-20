"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") {
      setError("Please upload a PDF file.")
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File too large. Max 10MB.")
      return
    }
    setError("")
    setFile(f)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const onDragLeave = () => setDragging(false)

  const handleRoast = async () => {
    if (!file) return
    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("resume", file)

      const res = await fetch("/api/roast", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Something went wrong")
      }

      const result = await res.json()
      localStorage.setItem("roastResult", JSON.stringify(result))
      router.push("/results")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Try again."
      setError(message)
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-char flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <span className="font-display text-2xl tracking-wider text-white">RESUMEROAST</span>
        </div>
        <a
          href="#upgrade"
          className="text-sm font-body font-medium text-flame border border-flame/30 px-4 py-2 rounded-full hover:bg-flame/10 transition-colors"
        >
          Deep Roast — $9
        </a>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-flame/10 border border-flame/20 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-flame animate-pulse" />
          <span className="text-xs font-mono text-flame tracking-widest uppercase">AI-Powered · Free · 30 Seconds</span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl tracking-wider leading-none mb-6 max-w-4xl">
          <span className="text-white">GET YOUR</span>
          <br />
          <span className="flame-text">RESUME</span>
          <br />
          <span className="text-white">ROASTED</span>
        </h1>

        <p className="font-body text-white/50 text-lg md:text-xl max-w-md mb-12 leading-relaxed">
          No sugar-coating. No flattery. Just raw, honest feedback that tells you exactly why you&apos;re getting ghosted.
        </p>

        {/* Upload Zone */}
        <div className="w-full max-w-lg mb-6">
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => document.getElementById("file-input")?.click()}
            className={`
              relative border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all duration-300
              ${dragging
                ? "border-flame bg-flame/10 scale-[1.02]"
                : file
                  ? "border-flame/60 bg-flame/5"
                  : "border-white/10 bg-white/2 hover:border-white/20 hover:bg-white/5"
              }
            `}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {file ? (
              <div className="flex items-center justify-center gap-3 animate-fade-in">
                <div className="w-10 h-10 rounded-xl bg-flame/20 flex items-center justify-center">
                  <span className="text-xl">📄</span>
                </div>
                <div className="text-left">
                  <p className="font-body font-medium text-white text-sm truncate max-w-[240px]">{file.name}</p>
                  <p className="font-mono text-xs text-white/40">{(file.size / 1024).toFixed(0)} KB · PDF</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null) }}
                  className="ml-auto text-white/30 hover:text-white/70 transition-colors text-lg"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl">
                  📎
                </div>
                <div>
                  <p className="font-body font-medium text-white/70">Drop your resume here</p>
                  <p className="font-body text-sm text-white/30 mt-1">or click to browse · PDF only · Max 10MB</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="w-full max-w-lg mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm font-body">{error}</p>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={handleRoast}
          disabled={!file || loading}
          className={`
            w-full max-w-lg py-5 rounded-2xl font-display text-2xl tracking-wider transition-all duration-300
            ${!file || loading
              ? "bg-white/5 text-white/20 cursor-not-allowed"
              : "bg-flame hover:bg-ember text-white shadow-lg shadow-flame/30 hover:shadow-flame/50 hover:scale-[1.02] active:scale-[0.98]"
            }
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="animate-spin">🔥</span>
              ROASTING YOUR RESUME...
            </span>
          ) : (
            "ROAST MY RESUME 🔥"
          )}
        </button>

        {/* Trust row */}
        <div className="flex items-center gap-8 mt-12 text-center">
          {[
            { value: "50K+", label: "Roasted" },
            { value: "Free", label: "Always" },
            { value: "30s", label: "Results" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-2xl text-flame tracking-wider">{stat.value}</p>
              <p className="font-mono text-xs text-white/30 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/5 px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-xs text-white/30 uppercase tracking-widest text-center mb-8">How it works</p>
          <div className="grid grid-cols-3 gap-6">
            {[
              { step: "01", title: "Upload PDF", desc: "Drop your resume file" },
              { step: "02", title: "AI Roasts It", desc: "Claude reads every line" },
              { step: "03", title: "Get Better", desc: "Actionable fixes, fast" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <p className="font-display text-4xl flame-text mb-2">{item.step}</p>
                <p className="font-body font-medium text-white text-sm mb-1">{item.title}</p>
                <p className="font-body text-xs text-white/30">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
