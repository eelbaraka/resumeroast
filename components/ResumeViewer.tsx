"use client"

interface ResumeViewerProps {
  fileName?: string
  fileSize?: number
}

export default function ResumeViewer({ fileName, fileSize }: ResumeViewerProps) {
  const sizeKb = fileSize ? (fileSize / 1024).toFixed(0) : null

  return (
    <div className="h-full flex flex-col bg-bg2/60 backdrop-blur-2xl border-r border-border">
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
            <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
              <path
                d="M2 0C0.9 0 0 0.9 0 2v12c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5L9 0H2z"
                fill="currentColor"
                className="text-accent/70"
              />
              <path d="M9 0v4a1 1 0 001 1h4" stroke="currentColor" className="text-accent/40" strokeWidth="1" fill="none" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-display text-xs font-semibold text-t1 truncate leading-tight">
              {fileName ?? "resume.pdf"}
            </p>
            {sizeKb && (
              <p className="font-mono text-[9px] text-t3 mt-0.5 tracking-wider">
                {sizeKb} KB · PDF
              </p>
            )}
          </div>
        </div>

        {/* Page indicator */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="font-mono text-[9px] text-t3 px-2 py-1 rounded-md bg-bg4 border border-border2">
            1 / 1
          </div>
        </div>
      </div>

      {/* PDF Preview area */}
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4 scrollbar-thin">
        {/* Simulated page */}
        <div className="relative w-full rounded-xl bg-[#1a1a1f] border border-border/50 shadow-2xl overflow-hidden aspect-[8.5/11]">
          {/* Page content skeleton */}
          <div className="p-6 flex flex-col gap-3">
            {/* Name block */}
            <div className="flex flex-col gap-1.5 mb-2">
              <div className="h-4 w-3/5 rounded bg-bg4 animate-pulse" />
              <div className="h-2.5 w-2/5 rounded bg-bg4/60 animate-pulse" style={{ animationDelay: "100ms" }} />
            </div>
            {/* Contact row */}
            <div className="flex gap-2 mb-3">
              <div className="h-2 w-1/4 rounded bg-bg4/40 animate-pulse" style={{ animationDelay: "150ms" }} />
              <div className="h-2 w-1/4 rounded bg-bg4/40 animate-pulse" style={{ animationDelay: "200ms" }} />
              <div className="h-2 w-1/5 rounded bg-bg4/40 animate-pulse" style={{ animationDelay: "250ms" }} />
            </div>
            {/* Divider */}
            <div className="h-px w-full bg-border/80 mb-1" />
            {/* Section: Experience */}
            <div className="h-2.5 w-1/4 rounded bg-accent/20 animate-pulse" style={{ animationDelay: "300ms" }} />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-1.5 ml-1">
                <div className="h-2.5 w-3/4 rounded bg-bg4/70 animate-pulse" style={{ animationDelay: `${350 + i * 60}ms` }} />
                <div className="h-2 w-1/3 rounded bg-bg4/40 animate-pulse" style={{ animationDelay: `${380 + i * 60}ms` }} />
                <div className="h-1.5 w-full rounded bg-bg4/30 animate-pulse" style={{ animationDelay: `${410 + i * 60}ms` }} />
                <div className="h-1.5 w-5/6 rounded bg-bg4/30 animate-pulse" style={{ animationDelay: `${430 + i * 60}ms` }} />
              </div>
            ))}
            {/* Divider */}
            <div className="h-px w-full bg-border/80 my-1" />
            {/* Section: Skills */}
            <div className="h-2.5 w-1/5 rounded bg-accent/20 animate-pulse" style={{ animationDelay: "550ms" }} />
            <div className="flex flex-wrap gap-2">
              {[40, 55, 35, 50, 45, 60, 38].map((w, i) => (
                <div
                  key={i}
                  className="h-2 rounded bg-bg4/50 animate-pulse"
                  style={{ width: `${w}px`, animationDelay: `${580 + i * 40}ms` }}
                />
              ))}
            </div>
            {/* Divider */}
            <div className="h-px w-full bg-border/80 my-1" />
            {/* Section: Education */}
            <div className="h-2.5 w-1/4 rounded bg-accent/20 animate-pulse" style={{ animationDelay: "800ms" }} />
            <div className="flex flex-col gap-1.5 ml-1">
              <div className="h-2.5 w-2/3 rounded bg-bg4/70 animate-pulse" style={{ animationDelay: "830ms" }} />
              <div className="h-2 w-1/2 rounded bg-bg4/40 animate-pulse" style={{ animationDelay: "860ms" }} />
            </div>
          </div>

          {/* Overlay badge: "Your PDF" */}
          <div className="absolute bottom-3 right-3">
            <div className="flex items-center gap-1.5 bg-bg3/80 backdrop-blur-sm border border-border2 rounded-md px-2 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-[8px] text-t3 tracking-wider uppercase">Your Resume</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer controls */}
      <div className="px-5 py-4 border-t border-border flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-1">
          <button
            disabled
            className="w-7 h-7 rounded-md border border-border2 bg-bg3 flex items-center justify-center text-t3 cursor-not-allowed opacity-40 transition-all"
            aria-label="Previous page"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M6.5 2L3.5 5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            disabled
            className="w-7 h-7 rounded-md border border-border2 bg-bg3 flex items-center justify-center text-t3 cursor-not-allowed opacity-40 transition-all"
            aria-label="Next page"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M3.5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className="font-mono text-[9px] text-t3 tracking-wider">Interactive viewer coming soon</p>
      </div>
    </div>
  )
}
