import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://resumeroast.ai"),
  title: {
    default: "ResumeRoast — Free AI Resume Review in 30 Seconds",
    template: "%s | ResumeRoast",
  },
  description: "Upload your resume and get brutally honest AI feedback instantly. Find out exactly why you're not getting callbacks. Free ATS score, section breakdown, and actionable rewrites.",
  keywords: ["free resume review","AI resume feedback","resume checker","ATS score","resume critique","why am I not getting interviews","resume score checker","resume analyzer free"],
  authors: [{ name: "ResumeRoast" }],
  openGraph: {
    type: "website", locale: "en_US",
    url: "https://resumeroast.ai", siteName: "ResumeRoast",
    title: "ResumeRoast — Free AI Resume Review in 30 Seconds",
    description: "Find out exactly why you're not getting callbacks. Honest AI feedback, ATS analysis, and specific fixes. Free.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "ResumeRoast" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeRoast — Free AI Resume Feedback",
    description: "Find out why you're not getting callbacks. Free in 30 seconds.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  alternates: { canonical: "https://resumeroast.ai" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "ResumeRoast",
          "url": "https://resumeroast.ai",
          "description": "Free AI-powered resume feedback and ATS analysis",
          "applicationCategory": "BusinessApplication",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
          "featureList": ["Resume Score","ATS Analysis","Section Breakdown","Before/After Rewrites"],
        })}} />
      </head>
      <body>{children}</body>
    </html>
  )
}
