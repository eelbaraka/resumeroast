"use client"
import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

const s = {
  nav: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 28px", borderBottom:"0.5px solid var(--border)", background:"rgba(12,12,11,0.92)", backdropFilter:"blur(16px)", position:"sticky" as const, top:0, zIndex:50 },
  logoIcon: { width:28, height:28, borderRadius:8, background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 as const },
  navBtn: { fontSize:12, color:"var(--t2)", padding:"6px 14px", borderRadius:8, border:"0.5px solid var(--border2)", background:"var(--bg3)", cursor:"pointer", fontFamily:"Inter,sans-serif" },
  badge: { display:"inline-flex", alignItems:"center", gap:6, background:"var(--accent-bg)", border:"0.5px solid rgba(255,68,34,0.18)", borderRadius:100, padding:"5px 14px", marginBottom:26 },
  badgeDot: { width:5, height:5, borderRadius:"50%", background:"var(--accent)", display:"inline-block" },
  card: { width:"100%", maxWidth:460, background:"var(--bg2)", borderRadius:18, border:"0.5px solid var(--border2)", overflow:"hidden" },
  dropzone: { padding:"32px 28px", borderBottom:"0.5px solid var(--border)", cursor:"pointer", textAlign:"center" as const, transition:"background 0.2s" },
  dropIcon: { width:52, height:52, borderRadius:14, background:"var(--bg3)", border:"0.5px solid var(--border2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", fontSize:24 },
  btnMain: { width:"100%", padding:"13px 18px", borderRadius:11, border:"none", fontSize:14, fontWeight:700, letterSpacing:"-0.02em", cursor:"pointer", fontFamily:"DM Sans,sans-serif", transition:"opacity 0.15s, transform 0.15s" },
  trustItem: { display:"flex", alignItems:"center", gap:5, fontSize:12, color:"var(--t3)", fontFamily:"Inter,sans-serif" },
  step: { background:"var(--bg3)", padding:"16px 14px" },
  stepN: { fontSize:10, fontFamily:"DM Mono,monospace", color:"var(--t3)", marginBottom:8, letterSpacing:"0.04em" },
  stat: { padding:"20px 14px", textAlign:"center" as const, borderRight:"0.5px solid var(--border)" },
  featureRow: { display:"flex", alignItems:"flex-start", gap:16, padding:"18px 24px", borderTop:"0.5px solid var(--border)", background:"var(--bg2)" },
  featureIcon: { fontSize:16, color:"var(--accent)", marginTop:1, flexShrink:0 as const, fontFamily:"DM Mono,monospace", width:20 },
}

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
      setTimeout(() => router.push("/results"), 400)
    } catch (err: unknown) {
      clearInterval(iv); setProgress(0)
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column" }}>
      <nav style={s.nav}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={s.logoIcon}>🔥</div>
          <span className="font-display" style={{ fontWeight:700, fontSize:15, letterSpacing:"-0.02em", color:"var(--t1)" }}>ResumeRoast</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span className="font-mono" style={{ fontSize:11, color:"var(--t3)", letterSpacing:"0.04em" }}>Free · No signup</span>
          <a href="#how" style={s.navBtn}>How it works</a>
        </div>
      </nav>

      <main style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"56px 20px" }}>
        <div className="afu" style={s.badge}>
          <span style={s.badgeDot} />
          <span className="font-mono" style={{ fontSize:10, fontWeight:500, color:"var(--accent)", letterSpacing:"0.05em" }}>AI-POWERED · FREE · 30 SECONDS</span>
        </div>

        <h1 className="afu d1 font-display" style={{ fontSize:"clamp(38px,6.5vw,68px)", fontWeight:700, lineHeight:1.06, letterSpacing:"-0.03em", textAlign:"center", maxWidth:640, marginBottom:16, color:"var(--t1)" }}>
          Get your resume<br />
          <span style={{ color:"var(--accent)" }}>roasted</span>{" "}
          <span style={{ color:"var(--t2)", fontWeight:400 }}>by AI</span>
        </h1>

        <p className="afu d2" style={{ fontSize:16, color:"var(--t2)", textAlign:"center", maxWidth:420, marginBottom:36, lineHeight:1.65, fontFamily:"Inter,sans-serif" }}>
          Find out exactly why you&apos;re not getting callbacks. Honest AI feedback, ATS analysis, and specific fixes — completely free.
        </p>

        <div className="afu d3" style={s.card}>
          <div
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onClick={() => !loading && inputRef.current?.click()}
            style={{ ...s.dropzone, background: dragging ? "rgba(255,68,34,0.05)" : file ? "rgba(34,197,94,0.03)" : "var(--bg2)", borderColor: dragging ? "var(--accent)" : "var(--border)" }}
          >
            <input ref={inputRef} type="file" accept=".pdf" style={{ display:"none" }}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {!file ? (
              <>
                <div style={s.dropIcon}>📄</div>
                <p className="font-display" style={{ fontSize:15, fontWeight:600, color:"var(--t1)", marginBottom:5, letterSpacing:"-0.01em" }}>
                  {dragging ? "Drop it here" : "Drop your resume here"}
                </p>
                <p style={{ fontSize:12, color:"var(--t3)", fontFamily:"Inter,sans-serif" }}>
                  PDF only · Max 10MB · <span style={{ color:"var(--accent)", fontWeight:500, textDecoration:"underline" }}>browse files</span>
                </p>
              </>
            ) : (
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:"var(--green-bg)", border:"0.5px solid rgba(34,197,94,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>📄</div>
                <div style={{ flex:1, minWidth:0, textAlign:"left" }}>
                  <p className="font-display" style={{ fontSize:13, fontWeight:600, color:"var(--t1)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{file.name}</p>
                  <p className="font-mono" style={{ fontSize:11, color:"var(--t3)", marginTop:2 }}>{(file.size/1024).toFixed(0)} KB · PDF · Ready</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setFile(null) }}
                  style={{ width:28, height:28, borderRadius:7, border:"0.5px solid var(--border2)", background:"var(--bg4)", cursor:"pointer", fontSize:16, color:"var(--t3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>×</button>
              </div>
            )}
          </div>

          {loading && (
            <div style={{ height:2, background:"var(--bg4)" }}>
              <div style={{ height:"100%", background:"var(--accent)", width:`${progress}%`, transition:"width 0.25s ease", borderRadius:2 }} />
            </div>
          )}

          {error && (
            <div style={{ padding:"11px 18px", background:"rgba(239,68,68,0.06)", borderTop:"0.5px solid rgba(239,68,68,0.15)" }}>
              <p style={{ fontSize:12, color:"var(--red)", fontFamily:"Inter,sans-serif" }}>⚠ {error}</p>
            </div>
          )}

          <div style={{ padding:"14px 16px", background:"var(--bg2)" }}>
            <button onClick={handleRoast} disabled={!file || loading}
              style={{ ...s.btnMain, background: !file || loading ? "var(--bg4)" : "var(--t1)", color: !file || loading ? "var(--t3)" : "var(--bg)", opacity: !file || loading ? 0.7 : 1 }}>
              {loading ? `Analyzing... ${Math.round(progress)}%` : "Analyze My Resume →"}
            </button>
          </div>
        </div>

        <div className="afu d4" style={{ display:"flex", alignItems:"center", gap:24, marginTop:24, flexWrap:"wrap", justifyContent:"center" }}>
          {[{ icon:"🔒", text:"Private & secure" }, { icon:"⚡", text:"Results in 30s" }, { icon:"✦", text:"No signup needed" }].map(({ icon, text }) => (
            <div key={text} style={s.trustItem}><span style={{ fontSize:13 }}>{icon}</span><span>{text}</span></div>
          ))}
        </div>
      </main>

      {/* How it works */}
      <section id="how" style={{ borderTop:"0.5px solid var(--border)", padding:"48px 20px", background:"var(--bg2)" }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <p className="font-mono" style={{ fontSize:10, color:"var(--t3)", letterSpacing:"0.1em", textTransform:"uppercase", textAlign:"center", marginBottom:20 }}>How it works</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", background:"var(--border)", gap:"0.5px", border:"0.5px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
            {[
              { n:"01", title:"Upload PDF", desc:"Drop your resume. We accept any text-based PDF." },
              { n:"02", title:"AI reads it", desc:"Every line analyzed — structure, keywords, impact." },
              { n:"03", title:"Get roasted", desc:"Score, critique, and specific fixes in seconds." },
              { n:"04", title:"Apply & win", desc:"Use the feedback to land more interviews." },
            ].map(({ n, title, desc }) => (
              <div key={n} style={s.step}>
                <p style={s.stepN}>{n}</p>
                <p className="font-display" style={{ fontSize:13, fontWeight:600, color:"var(--t1)", marginBottom:4, letterSpacing:"-0.01em" }}>{title}</p>
                <p style={{ fontSize:12, color:"var(--t2)", lineHeight:1.55, fontFamily:"Inter,sans-serif" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ borderTop:"0.5px solid var(--border)" }}>
        <div style={{ maxWidth:960, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)" }}>
          {[{ v:"50k+", l:"Resumes analyzed" }, { v:"4.8", l:"Average rating" }, { v:"30s", l:"Average time" }, { v:"100%", l:"Always free" }].map(({ v, l }, i) => (
            <div key={l} style={{ ...s.stat, borderRight: i < 3 ? "0.5px solid var(--border)" : "none" }}>
              <p className="font-display" style={{ fontSize:26, fontWeight:700, color:"var(--t1)", letterSpacing:"-0.03em", marginBottom:3 }}>
                {v.replace(/[k+%s]/g, m => ``)}<span style={{ color:"var(--accent)" }}>{v.match(/[k+%s]/g)?.[0]||""}</span>{v.replace(/[\d.]/g,"").slice(1)}
              </p>
              <p style={{ fontSize:11, color:"var(--t3)", fontFamily:"Inter,sans-serif" }}>{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What you get */}
      <section style={{ borderTop:"0.5px solid var(--border)", padding:"56px 20px" }}>
        <div style={{ maxWidth:700, margin:"0 auto" }}>
          <p className="font-mono" style={{ fontSize:10, color:"var(--t3)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>What you get</p>
          <h2 className="font-display" style={{ fontSize:"clamp(22px,3.5vw,36px)", fontWeight:700, letterSpacing:"-0.02em", marginBottom:28, color:"var(--t1)", lineHeight:1.2 }}>
            Everything a $300/hr career coach<br />would tell you. <span style={{ color:"var(--accent)" }}>Free.</span>
          </h2>
          <div style={{ borderRadius:12, border:"0.5px solid var(--border)", overflow:"hidden" }}>
            {[
              { icon:"◎", label:"Overall score", desc:"A 0–100 rating with reasoning behind every point deducted." },
              { icon:"◈", label:"ATS compatibility check", desc:"Find out if your resume makes it past automated screening." },
              { icon:"◉", label:"Section-by-section breakdown", desc:"Clarity, impact, keywords, and red flags — all scored separately." },
              { icon:"◇", label:"Before/after rewrites", desc:"Your actual weak bullets rewritten with stronger language and metrics." },
              { icon:"◆", label:"3 quick wins", desc:"The changes you can make today that will have the biggest impact." },
            ].map(({ icon, label, desc }, i) => (
              <div key={label} style={{ ...s.featureRow, borderTop: i === 0 ? "none" : "0.5px solid var(--border)" }}>
                <span style={s.featureIcon} className="font-mono">{icon}</span>
                <div>
                  <p className="font-display" style={{ fontSize:13, fontWeight:600, color:"var(--t1)", marginBottom:3, letterSpacing:"-0.01em" }}>{label}</p>
                  <p style={{ fontSize:12, color:"var(--t2)", lineHeight:1.6, fontFamily:"Inter,sans-serif" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop:"0.5px solid var(--border)", padding:"56px 20px", background:"var(--bg2)", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center" }}>
        <h2 className="font-display" style={{ fontSize:"clamp(24px,3.5vw,40px)", fontWeight:700, letterSpacing:"-0.025em", marginBottom:14, color:"var(--t1)", lineHeight:1.15 }}>
          Ready to find out the truth?
        </h2>
        <p style={{ fontSize:15, color:"var(--t2)", marginBottom:24, maxWidth:380, fontFamily:"Inter,sans-serif" }}>No email. No credit card. Just upload and get your honest score.</p>
        <button onClick={() => window.scrollTo({ top:0, behavior:"smooth" })}
          style={{ padding:"13px 28px", borderRadius:12, border:"none", background:"var(--accent)", color:"white", fontSize:14, fontWeight:700, cursor:"pointer", letterSpacing:"-0.01em", fontFamily:"DM Sans,sans-serif" }}>
          Analyze My Resume — Free →
        </button>
      </section>

      <footer style={{ borderTop:"0.5px solid var(--border)", padding:"20px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span>🔥</span>
          <span className="font-display" style={{ fontSize:13, fontWeight:600, color:"var(--t1)" }}>ResumeRoast</span>
        </div>
        <p style={{ fontSize:11, color:"var(--t3)", fontFamily:"Inter,sans-serif" }}>Free AI resume analysis · No data stored · Built for job seekers</p>
        <div style={{ display:"flex", gap:14 }}>
          {["Privacy","Contact"].map(l => <a key={l} href="#" style={{ fontSize:11, color:"var(--t3)", textDecoration:"none", fontFamily:"Inter,sans-serif" }}>{l}</a>)}
        </div>
      </footer>
    </div>
  )
}
