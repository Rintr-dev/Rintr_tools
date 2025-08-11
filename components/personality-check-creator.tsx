"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Trash2, LinkIcon, Copy, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const questionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  timeLimit: z.number().min(30, "Minimum 30 seconds").max(300, "Maximum 5 minutes"),
  category: z.string().min(1, "Category is required"),
  tips: z.string().optional(),
})

const personalityCheckSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  propertyAddress: z.string().min(1, "Property address is required"),
  landlordName: z.string().min(1, "Landlord name is required"),
  landlordEmail: z.string().email("Valid email is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  questions: z.array(questionSchema).min(1, "At least one question is required"),
})

type PersonalityCheckForm = z.infer<typeof personalityCheckSchema>

const questionCategories = [
  "General Introduction",
  "Living Habits",
  "Property Care",
  "Communication",
  "Financial Responsibility",
  "Emergency Situations",
  "Lifestyle & Preferences",
  "References & History",
]

const defaultQuestions = [
  {
    question: "Please introduce yourself and tell us why you're interested in this property.",
    timeLimit: 120,
    category: "General Introduction",
    tips: "Be genuine and enthusiastic. Mention specific features of the property you like.",
  },
  {
    question: "How do you typically maintain and care for your living space?",
    timeLimit: 90,
    category: "Property Care",
    tips: "Discuss your cleaning habits, how you handle maintenance issues, and respect for property.",
  },
  {
    question: "Describe your ideal living environment and daily routine.",
    timeLimit: 90,
    category: "Living Habits",
    tips: "Talk about noise levels, guests, work schedule, and lifestyle preferences.",
  },
]

export function PersonalityCheckCreator() {
  const [generatedLink, setGeneratedLink] = useState<string>("")
  const [showPreview, setShowPreview] = useState(false)
  const { toast } = useToast()

  const form = useForm<PersonalityCheckForm>({
    resolver: zodResolver(personalityCheckSchema),
    defaultValues: {
      title: "",
      description: "",
      propertyAddress: "",
      landlordName: "",
      landlordEmail: "",
      expiryDate: "",
      questions: defaultQuestions,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  })

  const addQuestion = () => {
    append({
      question: "",
      timeLimit: 90,
      category: "General Introduction",
      tips: "",
    })
  }

  const generateLink = (data: PersonalityCheckForm) => {
    // In a real app, this would save to database and generate a unique ID
    const checkId = Math.random().toString(36).substring(2, 15)
    const baseUrl = window.location.origin
    const link = `${baseUrl}/personality_check/interview/${checkId}`

    setGeneratedLink(link)

    // Store the data in localStorage for demo purposes
    localStorage.setItem(`personality-check-${checkId}`, JSON.stringify(data))

    toast({
      title: "Link Generated Successfully",
      description: "Your personality check link has been created and is ready to share.",
    })
  }

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink)
    toast({
      title: "Link Copied",
      description: "The personality check link has been copied to your clipboard.",
    })
  }

  const previewCheck = () => {
    setShowPreview(true)
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <form onSubmit={form.handleSubmit(generateLink)} className="space-y-4 sm:space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-lg sm:text-xl">Personality Check Setup</CardTitle>
            <CardDescription className="text-sm">Create a personalized video interview for potential tenants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mobile: Stack all fields, Desktop: Grid layout */}
            <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Interview Title *</Label>
                <Input 
                  id="title" 
                  {...form.register("title")} 
                  placeholder="e.g., Tenant Personality Assessment"
                  className="text-sm"
                />
                {form.formState.errors.title && (
                  <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyAddress" className="text-sm font-medium">Property Address *</Label>
                <Input
                  id="propertyAddress"
                  {...form.register("propertyAddress")}
                  placeholder="e.g., 123 Swan Street, Richmond"
                  className="text-sm"
                />
                {form.formState.errors.propertyAddress && (
                  <p className="text-xs text-red-500">{form.formState.errors.propertyAddress.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Explain the purpose of this personality check and what you're looking for in a tenant..."
                rows={3}
                className="text-sm resize-none"
              />
              {form.formState.errors.description && (
                <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>
              )}
            </div>

            {/* Mobile: Stack all fields, Desktop: 3-column grid */}
            <div className="space-y-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0">
              <div className="space-y-2">
                <Label htmlFor="landlordName" className="text-sm font-medium">Your Name *</Label>
                <Input 
                  id="landlordName" 
                  {...form.register("landlordName")} 
                  placeholder="Your full name"
                  className="text-sm"
                />
                {form.formState.errors.landlordName && (
                  <p className="text-xs text-red-500">{form.formState.errors.landlordName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="landlordEmail" className="text-sm font-medium">Your Email *</Label>
                <Input
                  id="landlordEmail"
                  type="email"
                  {...form.register("landlordEmail")}
                  placeholder="your.email@example.com"
                  className="text-sm"
                />
                {form.formState.errors.landlordEmail && (
                  <p className="text-xs text-red-500">{form.formState.errors.landlordEmail.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="text-sm font-medium">Link Expiry Date *</Label>
                <Input 
                  id="expiryDate" 
                  type="date" 
                  {...form.register("expiryDate")}
                  className="text-sm"
                />
                {form.formState.errors.expiryDate && (
                  <p className="text-xs text-red-500">{form.formState.errors.expiryDate.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader className="space-y-2 pb-4">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-lg sm:text-xl">Interview Questions</CardTitle>
                <CardDescription className="text-sm">
                  Add questions for the video interview. Tenants will record themselves answering each question.
                </CardDescription>
              </div>
              <Button type="button" onClick={addQuestion} variant="outline" size="sm" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 p-3 sm:p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm sm:text-base">Question {index + 1}</h4>
                  {fields.length > 1 && (
                    <Button type="button" onClick={() => remove(index)} variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`question-${index}`} className="text-sm font-medium">Question *</Label>
                    <Textarea
                      id={`question-${index}`}
                      {...form.register(`questions.${index}.question`)}
                      placeholder="Enter your question here..."
                      rows={2}
                      className="text-sm resize-none"
                    />
                    {form.formState.errors.questions?.[index]?.question && (
                      <p className="text-xs text-red-500">
                        {form.formState.errors.questions[index]?.question?.message}
                      </p>
                    )}
                  </div>

                  {/* Mobile: Stack fields, Desktop: 2-column grid */}
                  <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
                    <div className="space-y-2">
                      <Label htmlFor={`category-${index}`} className="text-sm font-medium">Category *</Label>
                      <Select
                        onValueChange={(value) => form.setValue(`questions.${index}.category`, value)}
                        defaultValue={field.category}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {questionCategories.map((category) => (
                            <SelectItem key={category} value={category} className="text-sm">
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`timeLimit-${index}`} className="text-sm font-medium">Time Limit (seconds) *</Label>
                      <Input
                        id={`timeLimit-${index}`}
                        type="number"
                        min="30"
                        max="300"
                        {...form.register(`questions.${index}.timeLimit`, { valueAsNumber: true })}
                        placeholder="90"
                        className="text-sm"
                      />
                      {form.formState.errors.questions?.[index]?.timeLimit && (
                        <p className="text-xs text-red-500">
                          {form.formState.errors.questions[index]?.timeLimit?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`tips-${index}`} className="text-sm font-medium">Tips for Applicant (Optional)</Label>
                    <Textarea
                      id={`tips-${index}`}
                      {...form.register(`questions.${index}.tips`)}
                      placeholder="Provide helpful tips or guidance for answering this question..."
                      rows={2}
                      className="text-sm resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mobile: Stack buttons, Desktop: Space between */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:space-y-0">
          <Button type="button" onClick={previewCheck} variant="outline" className="w-full sm:w-auto">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button type="submit" className="w-full sm:min-w-[200px] sm:w-auto">
            <LinkIcon className="h-4 w-4 mr-2" />
            Generate Link
          </Button>
        </div>
      </form>

      {/* Generated Link */}
      {generatedLink && (
        <Card>
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-lg sm:text-xl">Generated Interview Link</CardTitle>
            <CardDescription className="text-sm">Share this link with potential tenants to complete their video interview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:gap-2 sm:space-y-0">
              <Input value={generatedLink} readOnly className="flex-1 text-sm" />
              <Button onClick={copyLink} variant="outline" size="sm" className="w-full sm:w-auto">
                <Copy className="h-4 w-4 mr-2 sm:mr-0" />
                <span className="sm:hidden">Copy Link</span>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">Active</Badge>
              <Badge variant="outline" className="text-xs">{fields.length} Questions</Badge>
              <Badge variant="outline" className="text-xs">Expires: {form.watch("expiryDate")}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog - Mobile optimized */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg">Interview Preview</DialogTitle>
            <DialogDescription className="text-sm">This is how the interview will appear to applicants</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-semibold">{form.watch("title")}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Property: {form.watch("propertyAddress")}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Landlord: {form.watch("landlordName")}</p>
            </div>
            <Separator />
            <div>
              <p className="text-xs sm:text-sm">{form.watch("description")}</p>
            </div>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium text-sm sm:text-base">Questions ({fields.length})</h4>
              {fields.map((field, index) => (
                <div key={field.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-xs sm:text-sm">Question {index + 1}</span>
                    <Badge variant="outline" className="text-xs">
                      {form.watch(`questions.${index}.timeLimit`)}s
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm mb-2">{form.watch(`questions.${index}.question`)}</p>
                  <Badge variant="secondary" className="text-xs">
                    {form.watch(`questions.${index}.category`)}
                  </Badge>
                  {form.watch(`questions.${index}.tips`) && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      💡 {form.watch(`questions.${index}.tips`)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
