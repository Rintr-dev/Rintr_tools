import type { ReactNode } from "react"

interface InterviewLayoutProps {
  children: ReactNode
}

export function InterviewLayout({ children }: InterviewLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  )
}
