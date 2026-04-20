import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "ResumeRoast — Get Brutally Honest AI Resume Feedback",
  description: "Find out exactly why you're not getting callbacks. Free AI-powered resume critique in 30 seconds.",
  openGraph: {
    title: "ResumeRoast — Brutal AI Resume Feedback",
    description: "Find out exactly why you're not getting callbacks. Free in 30 seconds.",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="noise">{children}</body>
    </html>
  )
}
