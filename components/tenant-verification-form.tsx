"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Trash2, Download } from "lucide-react"
import jsPDF from "jspdf"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

const landlordSchema = z.object({
  name: z.string().min(1, "Landlord name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Valid email is required"),
  address: z.string().min(1, "Address is required"),
  residencyPeriod: z.string().min(1, "Residency period is required"),
  allowContact: z.boolean().default(false),
})

const tenantVerificationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  preferredName: z.string().optional(),
  isOver18: z.boolean().refine((val) => val === true, {
    message: "Must be over 18 years old",
  }),
  previousLandlords: z.array(landlordSchema),
  allowCriminalCheck: z.boolean().default(false),
  allowCreditCheck: z.boolean().default(false),
  allowIdVerification: z.boolean().default(false),
})

type TenantVerificationForm = z.infer<typeof tenantVerificationSchema>

export function TenantVerificationForm() {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const form = useForm<TenantVerificationForm>({
    resolver: zodResolver(tenantVerificationSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      preferredName: "",
      isOver18: false,
      previousLandlords: [
        {
          name: "",
          phone: "",
          email: "",
          address: "",
          residencyPeriod: "",
          allowContact: false,
        },
      ],
      allowCriminalCheck: false,
      allowCreditCheck: false,
      allowIdVerification: false,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "previousLandlords",
  })

  const addLandlord = () => {
    append({
      name: "",
      phone: "",
      email: "",
      address: "",
      residencyPeriod: "",
      allowContact: false,
    })
  }

  const generatePDF = (data: TenantVerificationForm) => {
    setIsGenerating(true)

    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.width
      let yPosition = 20

      // Header
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text("TENANT VERIFICATION REPORT", pageWidth / 2, yPosition, { align: "center" })
      yPosition += 20

      // Personal Information
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Personal Information", 20, yPosition)
      yPosition += 10

      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Name: ${data.firstName} ${data.middleName || ""} ${data.lastName}`.trim(), 20, yPosition)
      yPosition += 8

      if (data.preferredName) {
        doc.text(`Preferred Name: ${data.preferredName}`, 20, yPosition)
        yPosition += 8
      }

      doc.text(`Age Verification: ${data.isOver18 ? "Confirmed over 18" : "Not confirmed"}`, 20, yPosition)
      yPosition += 15

      // Previous Landlords
      if (data.previousLandlords.length > 0) {
        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        doc.text("Previous Landlords", 20, yPosition)
        yPosition += 10

        data.previousLandlords.forEach((landlord, index) => {
          if (yPosition > 250) {
            doc.addPage()
            yPosition = 20
          }

          doc.setFontSize(14)
          doc.setFont("helvetica", "bold")
          doc.text(`Landlord ${index + 1}`, 20, yPosition)
          yPosition += 8

          doc.setFontSize(12)
          doc.setFont("helvetica", "normal")
          doc.text(`Name: ${landlord.name}`, 25, yPosition)
          yPosition += 6
          doc.text(`Phone: ${landlord.phone}`, 25, yPosition)
          yPosition += 6
          doc.text(`Email: ${landlord.email}`, 25, yPosition)
          yPosition += 6
          doc.text(`Address: ${landlord.address}`, 25, yPosition)
          yPosition += 6
          doc.text(`Residency Period: ${landlord.residencyPeriod}`, 25, yPosition)
          yPosition += 6
          doc.text(`Contact Permission: ${landlord.allowContact ? "Yes" : "No"}`, 25, yPosition)
          yPosition += 12
        })
      }

      // Permissions
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Verification Permissions", 20, yPosition)
      yPosition += 10

      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Criminal History Check: ${data.allowCriminalCheck ? "Authorized" : "Not Authorized"}`, 20, yPosition)
      yPosition += 8
      doc.text(`Credit History Check: ${data.allowCreditCheck ? "Authorized" : "Not Authorized"}`, 20, yPosition)
      yPosition += 8
      doc.text(`ID Verification Check: ${data.allowIdVerification ? "Authorized" : "Not Authorized"}`, 20, yPosition)
      yPosition += 15

      // Footer
      doc.setFontSize(10)
      doc.setFont("helvetica", "italic")
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPosition)

      // Save the PDF
      const fileName = `tenant_verification_${data.firstName}_${data.lastName}_${new Date().toISOString().split("T")[0]}.pdf`
      doc.save(fileName)

      toast({
        title: "PDF Generated Successfully",
        description: `Report saved as ${fileName}`,
      })
    } catch (error) {
      toast({
        title: "Error Generating PDF",
        description: "There was an error creating the report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const onSubmit = (data: TenantVerificationForm) => {
    generatePDF(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Basic details of the tenant applicant</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" {...form.register("firstName")} placeholder="Enter first name" />
              {form.formState.errors.firstName && (
                <p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input id="middleName" {...form.register("middleName")} placeholder="Enter middle name (optional)" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" {...form.register("lastName")} placeholder="Enter last name" />
              {form.formState.errors.lastName && (
                <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferredName">Preferred/Other Names</Label>
            <Input
              id="preferredName"
              {...form.register("preferredName")}
              placeholder="Enter preferred or other names (optional)"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isOver18"
              checked={form.watch("isOver18")}
              onCheckedChange={(checked) => form.setValue("isOver18", checked as boolean)}
            />
            <Label htmlFor="isOver18">I confirm that I am over 18 years old *</Label>
          </div>
          {form.formState.errors.isOver18 && (
            <p className="text-sm text-red-500">{form.formState.errors.isOver18.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Previous Landlords */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Previous Landlords</CardTitle>
              <CardDescription>Information about previous rental history</CardDescription>
            </div>
            <Button type="button" onClick={addLandlord} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Landlord
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Landlord {index + 1}</h4>
                {fields.length > 1 && (
                  <Button type="button" onClick={() => remove(index)} variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`landlord-${index}-name`}>Name *</Label>
                  <Input
                    id={`landlord-${index}-name`}
                    {...form.register(`previousLandlords.${index}.name`)}
                    placeholder="Landlord's full name"
                  />
                  {form.formState.errors.previousLandlords?.[index]?.name && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.previousLandlords[index]?.name?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`landlord-${index}-phone`}>Phone Number *</Label>
                  <Input
                    id={`landlord-${index}-phone`}
                    {...form.register(`previousLandlords.${index}.phone`)}
                    placeholder="Phone number"
                  />
                  {form.formState.errors.previousLandlords?.[index]?.phone && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.previousLandlords[index]?.phone?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`landlord-${index}-email`}>Email *</Label>
                  <Input
                    id={`landlord-${index}-email`}
                    type="email"
                    {...form.register(`previousLandlords.${index}.email`)}
                    placeholder="Email address"
                  />
                  {form.formState.errors.previousLandlords?.[index]?.email && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.previousLandlords[index]?.email?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`landlord-${index}-period`}>Residency Period *</Label>
                  <Input
                    id={`landlord-${index}-period`}
                    {...form.register(`previousLandlords.${index}.residencyPeriod`)}
                    placeholder="e.g., Jan 2020 - Dec 2022"
                  />
                  {form.formState.errors.previousLandlords?.[index]?.residencyPeriod && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.previousLandlords[index]?.residencyPeriod?.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`landlord-${index}-address`}>Address *</Label>
                <Input
                  id={`landlord-${index}-address`}
                  {...form.register(`previousLandlords.${index}.address`)}
                  placeholder="Full address of rental property"
                />
                {form.formState.errors.previousLandlords?.[index]?.address && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.previousLandlords[index]?.address?.message}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`landlord-${index}-contact`}
                  checked={form.watch(`previousLandlords.${index}.allowContact`)}
                  onCheckedChange={(checked) =>
                    form.setValue(`previousLandlords.${index}.allowContact`, checked as boolean)
                  }
                />
                <Label htmlFor={`landlord-${index}-contact`}>Allow contact for reference check</Label>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Verification Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Permissions</CardTitle>
          <CardDescription>Authorise various background checks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowCriminalCheck"
              checked={form.watch("allowCriminalCheck")}
              onCheckedChange={(checked) => form.setValue("allowCriminalCheck", checked as boolean)}
            />
            <Label htmlFor="allowCriminalCheck">Allow criminal history check</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowCreditCheck"
              checked={form.watch("allowCreditCheck")}
              onCheckedChange={(checked) => form.setValue("allowCreditCheck", checked as boolean)}
            />
            <Label htmlFor="allowCreditCheck">Allow credit history check</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowIdVerification"
              checked={form.watch("allowIdVerification")}
              onCheckedChange={(checked) => form.setValue("allowIdVerification", checked as boolean)}
            />
            <Label htmlFor="allowIdVerification">Allow ID verification check</Label>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button type="submit" disabled={isGenerating} className="min-w-[200px]">
          {isGenerating ? (
            "Generating Report..."
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Generate PDF Report
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
