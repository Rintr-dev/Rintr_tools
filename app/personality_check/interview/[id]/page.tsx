"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { VideoInterview } from "@/components/video-interview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Home } from "lucide-react"

interface InterviewData {
  title: string
  description: string
  propertyAddress: string
  landlordName: string
  landlordEmail: string
  expiryDate: string
  questions: Array<{
    question: string
    timeLimit: number
    category: string
    tips?: string
  }>
}

export default function InterviewPage() {
  const params = useParams()
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadInterviewData = () => {
      try {
        const data = localStorage.getItem(`personality-check-${params.id}`)
        if (data) {
          const parsedData: InterviewData = JSON.parse(data)

          // Check if expired
          const expiryDate = new Date(parsedData.expiryDate)
          const now = new Date()

          if (now > expiryDate) {
            setIsExpired(true)
          } else {
            setInterviewData(parsedData)
          }
        }
      } catch (error) {
        console.error("Error loading interview data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInterviewData()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p>Loading interview...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Interview Expired</CardTitle>
            <CardDescription className="text-center">
              This interview link has expired and is no longer available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Please contact the landlord for a new interview link if you're still interested in the property.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!interviewData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Interview Not Found</CardTitle>
            <CardDescription className="text-center">
              The interview link you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>Please check the link or contact the landlord for assistance.</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Home className="h-6 w-6" />
            <span className="font-semibold">Property Interview</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        <VideoInterview interviewData={interviewData} />
      </div>
    </div>
  )
}
