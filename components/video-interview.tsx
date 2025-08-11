"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Square, RotateCcw, Send, Camera, CameraOff, Mic, MicOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface Question {
  question: string
  timeLimit: number
  category: string
  tips?: string
}

interface InterviewData {
  title: string
  description: string
  propertyAddress: string
  landlordName: string
  landlordEmail: string
  questions: Question[]
}

interface VideoInterviewProps {
  interviewData: InterviewData
}

export function VideoInterview({ interviewData }: VideoInterviewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedVideos, setRecordedVideos] = useState<Blob[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [micEnabled, setMicEnabled] = useState(true)
  const [isCompleted, setIsCompleted] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const { toast } = useToast()

  const currentQuestion = interviewData.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / interviewData.questions.length) * 100

  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [mediaStream])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: cameraEnabled,
        audio: micEnabled,
      })
      setMediaStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setHasStarted(true)
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera and microphone access to continue with the interview.",
        variant: "destructive",
      })
    }
  }

  const toggleCamera = () => {
    if (mediaStream) {
      const videoTrack = mediaStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !cameraEnabled
        setCameraEnabled(!cameraEnabled)
      }
    }
  }

  const toggleMic = () => {
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !micEnabled
        setMicEnabled(!micEnabled)
      }
    }
  }

  const startRecording = () => {
    if (!mediaStream) return

    chunksRef.current = []
    const mediaRecorder = new MediaRecorder(mediaStream)
    mediaRecorderRef.current = mediaRecorder

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" })
      setRecordedVideos((prev) => [...prev, blob])
    }

    mediaRecorder.start()
    setIsRecording(true)
    setTimeLeft(currentQuestion.timeLimit)

    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopRecording()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const retakeRecording = () => {
    setTimeLeft(0)
    // Remove the last recorded video if retaking
    if (recordedVideos.length > currentQuestionIndex) {
      const newVideos = [...recordedVideos]
      newVideos.splice(currentQuestionIndex, 1)
      setRecordedVideos(newVideos)
    }
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < interviewData.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setTimeLeft(0)
    } else {
      setIsCompleted(true)
    }
  }

  const submitInterview = () => {
    // In a real app, this would upload videos to server
    toast({
      title: "Interview Submitted",
      description: "Thank you! Your video interview has been submitted successfully.",
    })

    // Simulate submission
    console.log("Submitting interview with", recordedVideos.length, "videos")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (isCompleted) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-green-600">Interview Complete!</CardTitle>
          <CardDescription>
            You have successfully completed all {interviewData.questions.length} questions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <p className="text-muted-foreground">
              Your video responses have been recorded and are ready for submission.
            </p>
            <div className="flex justify-center gap-2">
              <Badge variant="secondary">{recordedVideos.length} Videos Recorded</Badge>
              <Badge variant="outline">Property: {interviewData.propertyAddress}</Badge>
            </div>
          </div>
          <div className="flex justify-center pt-4">
            <Button onClick={submitInterview} className="min-w-[200px]">
              <Send className="h-4 w-4 mr-2" />
              Submit Interview
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!hasStarted) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{interviewData.title}</CardTitle>
            <CardDescription>Property: {interviewData.propertyAddress}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">{interviewData.description}</p>
            <div className="flex gap-2">
              <Badge variant="secondary">{interviewData.questions.length} Questions</Badge>
              <Badge variant="outline">Landlord: {interviewData.landlordName}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Before You Start</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                This interview will record video responses to {interviewData.questions.length} questions. Make sure
                you're in a quiet, well-lit environment and have a stable internet connection.
              </AlertDescription>
            </Alert>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• Each question has a time limit for your response</li>
              <li>• You can retake your answer if needed</li>
              <li>• Ensure your camera and microphone are working</li>
              <li>• Speak clearly and look at the camera</li>
            </ul>
            <div className="flex justify-center pt-4">
              <Button onClick={startCamera} className="min-w-[200px]">
                <Camera className="h-4 w-4 mr-2" />
                Start Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                Question {currentQuestionIndex + 1} of {interviewData.questions.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Video Preview</span>
              {isRecording && (
                <Badge variant="destructive" className="animate-pulse">
                  REC {formatTime(timeLeft)}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              {!cameraEnabled && (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <CameraOff className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex justify-center gap-2">
              <Button onClick={toggleCamera} variant={cameraEnabled ? "outline" : "destructive"} size="sm">
                {cameraEnabled ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
              </Button>
              <Button onClick={toggleMic} variant={micEnabled ? "outline" : "destructive"} size="sm">
                {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex justify-center gap-2">
              {!isRecording && recordedVideos.length <= currentQuestionIndex && (
                <Button onClick={startRecording} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Start Recording
                </Button>
              )}
              {isRecording && (
                <Button onClick={stopRecording} variant="destructive" className="flex-1">
                  <Square className="h-4 w-4 mr-2" />
                  Stop Recording
                </Button>
              )}
              {!isRecording && recordedVideos.length > currentQuestionIndex && (
                <Button onClick={retakeRecording} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Question</CardTitle>
              <Badge variant="outline">{currentQuestion.category}</Badge>
            </div>
            <CardDescription>Time limit: {formatTime(currentQuestion.timeLimit)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium">{currentQuestion.question}</p>
            </div>

            {currentQuestion.tips && (
              <Alert>
                <AlertDescription>
                  💡 <strong>Tip:</strong> {currentQuestion.tips}
                </AlertDescription>
              </Alert>
            )}

            {recordedVideos.length > currentQuestionIndex && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-600">✓ Question answered</p>
                <Button onClick={nextQuestion} className="w-full">
                  {currentQuestionIndex < interviewData.questions.length - 1 ? "Next Question" : "Complete Interview"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
