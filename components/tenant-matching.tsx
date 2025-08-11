"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Search, User, MapPin, DollarSign, Calendar, Star, Phone, Mail, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

const propertySchema = z.object({
  country: z.string().min(1, "Country is required"),
  region: z.string().min(1, "Region is required"),
  district: z.string().min(1, "District is required"),
  suburb: z.string().min(1, "Suburb is required"),
  address: z.string().min(1, "Address is required"),
  postcode: z.string().min(1, "Postcode is required"),
  apartmentCode: z.string().optional(),
  propertyType: z.string().min(1, "Property type is required"),
  pricePerWeek: z.number().min(1, "Price per week is required"),
  bondAmount: z.number().min(1, "Bond amount is required"),
  bedrooms: z.number().min(0, "Bedrooms must be 0 or more"),
  bathrooms: z.number().min(0, "Bathrooms must be 0 or more"),
  carSpaces: z.number().min(0, "Car spaces must be 0 or more"),
  petsAllowed: z.boolean().default(false),
  availableFrom: z.string().min(1, "Available date is required"),
  features: z.string().optional(),
  description: z.string().optional(),
})

type PropertyForm = z.infer<typeof propertySchema>

// Mock tenant database
const mockTenants = [
  {
    id: 1,
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "+64 21 345 678",
    age: 28,
    occupation: "Software Engineer",
    income: 95000,
    preferredLocation: ["Te Aro", "Mount Victoria", "Thorndon"],
    maxBudget: 500,
    minBedrooms: 2,
    minBathrooms: 1,
    needsParking: true,
    hasPets: false,
    availableFrom: "01-04-2024",
    tenantScore: 95,
    creditScore: 780,
    references: 3,
    previousRentals: 2,
    smokingStatus: "Non-smoker",
    employmentStatus: "Full-time",
    preferredLease: "12 months",
    notes: "Quiet professional, excellent rental history",
    matchScore: 92,
  },
  {
    id: 2,
    firstName: "Michael",
    lastName: "Chen",
    email: "m.chen@email.com",
    phone: "+64 21 456 789",
    age: 32,
    occupation: "Marketing Manager",
    income: 78000,
    preferredLocation: ["Cuba Street", "Thorndon", "Kelburn"],
    maxBudget: 450,
    minBedrooms: 1,
    minBathrooms: 1,
    needsParking: false,
    hasPets: true,
    availableFrom: "15-03-2024",
    tenantScore: 88,
    creditScore: 720,
    references: 2,
    previousRentals: 3,
    smokingStatus: "Non-smoker",
    employmentStatus: "Full-time",
    preferredLease: "6-12 months",
    notes: "Has a small dog, very responsible tenant",
    matchScore: 85,
  },
  {
    id: 3,
    firstName: "Emma",
    lastName: "Williams",
    email: "emma.w@email.com",
    phone: "+64 21 567 890",
    age: 25,
    occupation: "Nurse",
    income: 72000,
    preferredLocation: ["Oriental Bay", "Mount Victoria", "Newtown"],
    maxBudget: 480,
    minBedrooms: 1,
    minBathrooms: 1,
    needsParking: false,
    hasPets: false,
    availableFrom: "20-03-2024",
    tenantScore: 90,
    creditScore: 750,
    references: 4,
    previousRentals: 1,
    smokingStatus: "Non-smoker",
    employmentStatus: "Full-time",
    preferredLease: "12+ months",
    notes: "First-time renter, excellent references from employer",
    matchScore: 78,
  },
  {
    id: 4,
    firstName: "David",
    lastName: "Thompson",
    email: "d.thompson@email.com",
    phone: "+64 21 678 901",
    age: 35,
    occupation: "Accountant",
    income: 85000,
    preferredLocation: ["Te Aro", "Thorndon", "Kelburn"],
    maxBudget: 550,
    minBedrooms: 2,
    minBathrooms: 2,
    needsParking: true,
    hasPets: false,
    availableFrom: "10-04-2024",
    tenantScore: 93,
    creditScore: 800,
    references: 5,
    previousRentals: 4,
    smokingStatus: "Non-smoker",
    employmentStatus: "Full-time",
    preferredLease: "12 months",
    notes: "Excellent tenant history, always pays on time",
    matchScore: 88,
  },
  {
    id: 5,
    firstName: "Lisa",
    lastName: "Rodriguez",
    email: "lisa.rodriguez@email.com",
    phone: "+64 21 789 012",
    age: 29,
    occupation: "Teacher",
    income: 68000,
    preferredLocation: ["Thorndon", "Cuba Street", "Island Bay"],
    maxBudget: 420,
    minBedrooms: 1,
    minBathrooms: 1,
    needsParking: false,
    hasPets: true,
    availableFrom: "25-03-2024",
    tenantScore: 87,
    creditScore: 710,
    references: 3,
    previousRentals: 2,
    smokingStatus: "Non-smoker",
    employmentStatus: "Full-time",
    preferredLease: "12 months",
    notes: "Has a cat, very clean and organized",
    matchScore: 82,
  },
]

export function TenantMatching() {
  const [searchResults, setSearchResults] = useState<typeof mockTenants>([])
  const [hasSearched, setHasSearched] = useState(false)
  const { toast } = useToast()

  const form = useForm<PropertyForm>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      country: "",
      region: "",
      district: "",
      suburb: "",
      address: "",
      postcode: "",
      apartmentCode: "",
      propertyType: "",
      pricePerWeek: 0,
      bondAmount: 0,
      bedrooms: 1,
      bathrooms: 1,
      carSpaces: 0,
      petsAllowed: false,
      availableFrom: "",
      features: "",
      description: "",
    },
  })

  const searchTenants = (data: PropertyForm) => {
    // First try to find exact matches
    const exactMatches = mockTenants.filter((tenant) => {
      const locationMatch = tenant.preferredLocation.some((location) =>
        location.toLowerCase().includes(data.suburb.toLowerCase()),
      )
      const budgetMatch = tenant.maxBudget >= data.pricePerWeek
      const bedroomMatch = tenant.minBedrooms <= data.bedrooms
      const bathroomMatch = tenant.minBathrooms <= data.bathrooms
      const parkingMatch = !tenant.needsParking || data.carSpaces > 0
      const petMatch = !tenant.hasPets || data.petsAllowed

      return locationMatch && budgetMatch && bedroomMatch && bathroomMatch && parkingMatch && petMatch
    })

    // If no exact matches, return all tenants with adjusted scores
    let resultsToShow = exactMatches.length > 0 ? exactMatches : mockTenants

    // Calculate match scores for better ranking
    const scoredResults = resultsToShow.map((tenant) => {
      let adjustedScore = tenant.matchScore // Base match score
      
      // Adjust score based on how well tenant matches the property
      const locationMatch = tenant.preferredLocation.some((location) =>
        location.toLowerCase().includes(data.suburb.toLowerCase()),
      )
      if (locationMatch) {
        adjustedScore += 10
      }
      
      // Budget compatibility
      if (tenant.maxBudget >= data.pricePerWeek) {
        adjustedScore += 8
      }
      
      // Room requirements
      if (tenant.minBedrooms <= data.bedrooms) {
        adjustedScore += 5
      }
      if (tenant.minBathrooms <= data.bathrooms) {
        adjustedScore += 3
      }
      
      // Parking requirements
      if (!tenant.needsParking || data.carSpaces > 0) {
        adjustedScore += 4
      }
      
      // Pet compatibility
      if (!tenant.hasPets || data.petsAllowed) {
        adjustedScore += 6
      }

      return { ...tenant, adjustedScore }
    })

    // Sort by adjusted score first, then by tenant score
    const sortedResults = scoredResults.sort((a, b) => {
      if (a.adjustedScore !== b.adjustedScore) {
        return b.adjustedScore - a.adjustedScore
      }
      return b.tenantScore - a.tenantScore
    })

    // Always show at least 3 tenants if available
    const finalResults = sortedResults.slice(0, Math.max(3, sortedResults.length))

    setSearchResults(finalResults)
    setHasSearched(true)

    const matchType = exactMatches.length > 0 ? "exact matches" : "closest matches"
    toast({
      title: "Tenant Search Complete",
      description: `Found ${finalResults.length} ${matchType}`,
    })
  }

  const TenantCard = ({ tenant }: { tenant: (typeof mockTenants)[0] }) => (
    <Card className="w-full">
      <CardHeader className="space-y-2 pb-4">
        <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="break-words">{tenant.firstName} {tenant.lastName}</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {tenant.occupation}, {tenant.age} years old
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 self-start">
            <Star className="h-4 w-4 fill-green-400 text-green-400" />
            <span className="font-semibold text-sm">{tenant.matchScore}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contact Information - Mobile: Stack vertically */}
        <div className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="break-all">{tenant.email}</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{tenant.phone}</span>
          </div>
        </div>

        {/* Financial Information - Mobile: Stack vertically */}
        <div className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 lg:grid-cols-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>${tenant.income.toLocaleString()}/year</span>
          </div>
          <div className="text-xs sm:text-sm">
            <span className="font-medium">Budget:</span> ${tenant.maxBudget}/week
          </div>
          <div className="text-xs sm:text-sm">
            <span className="font-medium">Credit:</span> {tenant.creditScore}
          </div>
          <div className="text-xs sm:text-sm">
            <span className="font-medium">Score:</span> {tenant.tenantScore}/100
          </div>
        </div>

        {/* Availability & Location */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Available from {tenant.availableFrom}</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="break-words">Preferred: {tenant.preferredLocation.join(", ")}</span>
          </div>
        </div>

        {/* Requirements - Mobile: Stack vertically */}
        <div className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 lg:grid-cols-4">
          <div className="text-xs sm:text-sm">
            <span className="font-medium">Min Bed:</span> {tenant.minBedrooms}
          </div>
          <div className="text-xs sm:text-sm">
            <span className="font-medium">Min Bath:</span> {tenant.minBathrooms}
          </div>
          <div className="text-xs sm:text-sm">
            <span className="font-medium">Parking:</span> {tenant.needsParking ? "Required" : "Not needed"}
          </div>
          <div className="text-xs sm:text-sm">
            <span className="font-medium">Lease:</span> {tenant.preferredLease}
          </div>
        </div>

        {/* Badges - Better mobile wrapping */}
        <div className="flex flex-wrap gap-1 sm:gap-2">
          <Badge variant="secondary" className="text-xs">{tenant.employmentStatus}</Badge>
          <Badge variant="secondary" className="text-xs">{tenant.smokingStatus}</Badge>
          {tenant.hasPets && <Badge variant="outline" className="text-xs">Has Pets</Badge>}
          <Badge variant="outline" className="text-xs">{tenant.references} References</Badge>
          <Badge variant="outline" className="text-xs">{tenant.previousRentals} Previous Rentals</Badge>
        </div>

        {/* Notes */}
        {tenant.notes && (
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium">Notes</Label>
            <p className="text-xs sm:text-sm text-muted-foreground bg-muted p-2 rounded">{tenant.notes}</p>
          </div>
        )}

        {/* Action Buttons - Mobile: Stack vertically */}
        <div className="flex flex-col space-y-2 sm:flex-row sm:gap-2 sm:space-y-0">
          <Button size="sm" className="w-full sm:flex-1">
            <Mail className="h-4 w-4 mr-2" />
            Contact
          </Button>
          <Button size="sm" variant="outline" className="w-full sm:flex-1">
            <User className="h-4 w-4 mr-2" />
            View Profile
          </Button>
          <Button size="sm" variant="outline" className="w-full sm:w-auto">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <form onSubmit={form.handleSubmit(searchTenants)} className="space-y-4 sm:space-y-6">
        {/* Property Details */}
        <Card>
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-lg sm:text-xl">Property Details</CardTitle>
            <CardDescription className="text-sm">Enter your property information to find the best matching tenants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Location Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm sm:text-base">Location Information</h4>
              <div className="space-y-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0">
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium">Country *</Label>
                  <Input id="country" {...form.register("country")} placeholder="e.g., New Zealand" className="text-sm" />
                  {form.formState.errors.country && (
                    <p className="text-xs text-red-500">{form.formState.errors.country.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region" className="text-sm font-medium">Region *</Label>
                  <Input id="region" {...form.register("region")} placeholder="e.g., Wellington" className="text-sm" />
                  {form.formState.errors.region && (
                    <p className="text-xs text-red-500">{form.formState.errors.region.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district" className="text-sm font-medium">District *</Label>
                  <Input id="district" {...form.register("district")} placeholder="e.g., Wellington City" className="text-sm" />
                  {form.formState.errors.district && (
                    <p className="text-xs text-red-500">{form.formState.errors.district.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
                <div className="space-y-2">
                  <Label htmlFor="suburb" className="text-sm font-medium">Suburb *</Label>
                  <Input id="suburb" {...form.register("suburb")} placeholder="e.g., Te Aro" className="text-sm" />
                  {form.formState.errors.suburb && (
                    <p className="text-xs text-red-500">{form.formState.errors.suburb.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postcode" className="text-sm font-medium">Postcode *</Label>
                  <Input id="postcode" {...form.register("postcode")} placeholder="e.g., 6011" className="text-sm" />
                  {form.formState.errors.postcode && (
                    <p className="text-xs text-red-500">{form.formState.errors.postcode.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">Address *</Label>
                  <Input id="address" {...form.register("address")} placeholder="e.g., 123 Courtenay Place" className="text-sm" />
                  {form.formState.errors.address && (
                    <p className="text-xs text-red-500">{form.formState.errors.address.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apartmentCode" className="text-sm font-medium">Apartment Code</Label>
                  <Input id="apartmentCode" {...form.register("apartmentCode")} placeholder="e.g., 12A (optional)" className="text-sm" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Property Details */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm sm:text-base">Property Details</h4>
              <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
                <div className="space-y-2">
                  <Label htmlFor="propertyType" className="text-sm font-medium">Property Type *</Label>
                  <Select onValueChange={(value) => form.setValue("propertyType", value)}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment" className="text-sm">Apartment</SelectItem>
                      <SelectItem value="house" className="text-sm">House</SelectItem>
                      <SelectItem value="townhouse" className="text-sm">Townhouse</SelectItem>
                      <SelectItem value="studio" className="text-sm">Studio</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.propertyType && (
                    <p className="text-xs text-red-500">{form.formState.errors.propertyType.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availableFrom" className="text-sm font-medium">Available From *</Label>
                  <Input id="availableFrom" {...form.register("availableFrom")} placeholder="DD-MM-YYYY" className="text-sm" />
                  {form.formState.errors.availableFrom && (
                    <p className="text-xs text-red-500">{form.formState.errors.availableFrom.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="pricePerWeek" className="text-sm font-medium">Price per Week *</Label>
                  <Input
                    id="pricePerWeek"
                    type="number"
                    {...form.register("pricePerWeek", { valueAsNumber: true })}
                    placeholder="450"
                    className="text-sm"
                  />
                  {form.formState.errors.pricePerWeek && (
                    <p className="text-xs text-red-500">{form.formState.errors.pricePerWeek.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bondAmount" className="text-sm font-medium">Bond Amount *</Label>
                  <Input
                    id="bondAmount"
                    type="number"
                    {...form.register("bondAmount", { valueAsNumber: true })}
                    placeholder="1800"
                    className="text-sm"
                  />
                  {form.formState.errors.bondAmount && (
                    <p className="text-xs text-red-500">{form.formState.errors.bondAmount.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bedrooms" className="text-sm font-medium">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    {...form.register("bedrooms", { valueAsNumber: true })}
                    placeholder="2"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms" className="text-sm font-medium">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    {...form.register("bathrooms", { valueAsNumber: true })}
                    placeholder="1"
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
                <div className="space-y-2">
                  <Label htmlFor="carSpaces" className="text-sm font-medium">Car Spaces</Label>
                  <Input
                    id="carSpaces"
                    type="number"
                    {...form.register("carSpaces", { valueAsNumber: true })}
                    placeholder="1"
                    className="text-sm"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="petsAllowed"
                    checked={form.watch("petsAllowed")}
                    onCheckedChange={(checked) => form.setValue("petsAllowed", checked as boolean)}
                  />
                  <Label htmlFor="petsAllowed" className="text-sm">Pets Allowed</Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm sm:text-base">Additional Information</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="features" className="text-sm font-medium">Features</Label>
                  <Input
                    id="features"
                    {...form.register("features")}
                    placeholder="e.g., Heat Pump, Balcony, Dishwasher"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Property Description</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="Describe your property, its unique features, and what makes it special..."
                    rows={3}
                    className="text-sm resize-none"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="w-full sm:min-w-[200px] sm:w-auto">
            <Search className="h-4 w-4 mr-2" />
            Find Matching Tenants
          </Button>
        </div>
      </form>

      {/* Search Results */}
      {hasSearched && (
        <>
          <Separator />
          <div className="space-y-4">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold">Matching Tenants</h2>
              <Badge variant="secondary" className="text-xs self-start">{searchResults.length} tenants found</Badge>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid gap-4 sm:gap-6">
                {searchResults.map((tenant) => (
                  <TenantCard key={tenant.id} tenant={tenant} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center space-y-2">
                    <User className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-base sm:text-lg font-medium">No matching tenants found</h3>
                    <p className="text-muted-foreground text-sm">
                      Try adjusting your property criteria or check back later for new tenant applications
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  )
}
