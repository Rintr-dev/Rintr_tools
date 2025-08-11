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
    phone: "+61 412 345 678",
    age: 28,
    occupation: "Software Engineer",
    income: 95000,
    preferredLocation: ["Richmond", "South Yarra", "Carlton"],
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
    phone: "+61 423 456 789",
    age: 32,
    occupation: "Marketing Manager",
    income: 78000,
    preferredLocation: ["Fitzroy", "Carlton", "Brunswick"],
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
    phone: "+61 434 567 890",
    age: 25,
    occupation: "Nurse",
    income: 72000,
    preferredLocation: ["St Kilda", "South Melbourne", "Port Melbourne"],
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
    phone: "+61 445 678 901",
    age: 35,
    occupation: "Accountant",
    income: 85000,
    preferredLocation: ["Richmond", "Hawthorn", "Camberwell"],
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
    phone: "+61 456 789 012",
    age: 29,
    occupation: "Teacher",
    income: 68000,
    preferredLocation: ["Carlton", "Fitzroy", "Collingwood"],
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
    // Simulate tenant matching with mock data
    const matchedTenants = mockTenants.filter((tenant) => {
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

    // Sort by match score (in a real app, this would be calculated based on multiple factors)
    const sortedResults = matchedTenants.sort((a, b) => b.matchScore - a.matchScore)

    setSearchResults(sortedResults)
    setHasSearched(true)

    toast({
      title: "Tenant Search Complete",
      description: `Found ${sortedResults.length} matching tenants`,
    })
  }

  const TenantCard = ({ tenant }: { tenant: (typeof mockTenants)[0] }) => (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {tenant.firstName} {tenant.lastName}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <span>
                {tenant.occupation}, {tenant.age} years old
              </span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-green-400 text-green-400" />
            <span className="font-semibold">{tenant.matchScore}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>{tenant.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span>{tenant.phone}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>${tenant.income.toLocaleString()}/year</span>
          </div>
          <div>
            <span className="font-medium">Budget:</span> ${tenant.maxBudget}/week
          </div>
          <div>
            <span className="font-medium">Credit:</span> {tenant.creditScore}
          </div>
          <div>
            <span className="font-medium">Score:</span> {tenant.tenantScore}/100
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span>Available from {tenant.availableFrom}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            <span>Preferred: {tenant.preferredLocation.join(", ")}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div>
            <span className="font-medium">Min Bed:</span> {tenant.minBedrooms}
          </div>
          <div>
            <span className="font-medium">Min Bath:</span> {tenant.minBathrooms}
          </div>
          <div>
            <span className="font-medium">Parking:</span> {tenant.needsParking ? "Required" : "Not needed"}
          </div>
          <div>
            <span className="font-medium">Lease:</span> {tenant.preferredLease}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{tenant.employmentStatus}</Badge>
          <Badge variant="secondary">{tenant.smokingStatus}</Badge>
          {tenant.hasPets && <Badge variant="outline">Has Pets</Badge>}
          <Badge variant="outline">{tenant.references} References</Badge>
          <Badge variant="outline">{tenant.previousRentals} Previous Rentals</Badge>
        </div>

        {tenant.notes && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Notes</Label>
            <p className="text-sm text-muted-foreground bg-muted p-2 rounded">{tenant.notes}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button size="sm" className="flex-1">
            <Mail className="h-4 w-4 mr-2" />
            Contact
          </Button>
          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
            <User className="h-4 w-4 mr-2" />
            View Profile
          </Button>
          <Button size="sm" variant="outline">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(searchTenants)} className="space-y-6">
        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
            <CardDescription>Enter your property information to find the best matching tenants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Location Information */}
            <div className="space-y-4">
              <h4 className="font-medium">Location Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input id="country" {...form.register("country")} placeholder="e.g., Australia" />
                  {form.formState.errors.country && (
                    <p className="text-sm text-red-500">{form.formState.errors.country.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <Input id="region" {...form.register("region")} placeholder="e.g., Victoria" />
                  {form.formState.errors.region && (
                    <p className="text-sm text-red-500">{form.formState.errors.region.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Input id="district" {...form.register("district")} placeholder="e.g., Melbourne" />
                  {form.formState.errors.district && (
                    <p className="text-sm text-red-500">{form.formState.errors.district.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="suburb">Suburb *</Label>
                  <Input id="suburb" {...form.register("suburb")} placeholder="e.g., Richmond" />
                  {form.formState.errors.suburb && (
                    <p className="text-sm text-red-500">{form.formState.errors.suburb.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postcode">Postcode *</Label>
                  <Input id="postcode" {...form.register("postcode")} placeholder="e.g., 3121" />
                  {form.formState.errors.postcode && (
                    <p className="text-sm text-red-500">{form.formState.errors.postcode.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input id="address" {...form.register("address")} placeholder="e.g., 123 Swan Street" />
                  {form.formState.errors.address && (
                    <p className="text-sm text-red-500">{form.formState.errors.address.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apartmentCode">Apartment Code</Label>
                  <Input id="apartmentCode" {...form.register("apartmentCode")} placeholder="e.g., 12A (optional)" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Property Details */}
            <div className="space-y-4">
              <h4 className="font-medium">Property Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type *</Label>
                  <Select onValueChange={(value) => form.setValue("propertyType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.propertyType && (
                    <p className="text-sm text-red-500">{form.formState.errors.propertyType.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availableFrom">Available From *</Label>
                  <Input id="availableFrom" {...form.register("availableFrom")} placeholder="DD-MM-YYYY" />
                  {form.formState.errors.availableFrom && (
                    <p className="text-sm text-red-500">{form.formState.errors.availableFrom.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pricePerWeek">Price per Week *</Label>
                  <Input
                    id="pricePerWeek"
                    type="number"
                    {...form.register("pricePerWeek", { valueAsNumber: true })}
                    placeholder="450"
                  />
                  {form.formState.errors.pricePerWeek && (
                    <p className="text-sm text-red-500">{form.formState.errors.pricePerWeek.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bondAmount">Bond Amount *</Label>
                  <Input
                    id="bondAmount"
                    type="number"
                    {...form.register("bondAmount", { valueAsNumber: true })}
                    placeholder="1800"
                  />
                  {form.formState.errors.bondAmount && (
                    <p className="text-sm text-red-500">{form.formState.errors.bondAmount.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    {...form.register("bedrooms", { valueAsNumber: true })}
                    placeholder="2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    {...form.register("bathrooms", { valueAsNumber: true })}
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="carSpaces">Car Spaces</Label>
                  <Input
                    id="carSpaces"
                    type="number"
                    {...form.register("carSpaces", { valueAsNumber: true })}
                    placeholder="1"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox
                    id="petsAllowed"
                    checked={form.watch("petsAllowed")}
                    onCheckedChange={(checked) => form.setValue("petsAllowed", checked as boolean)}
                  />
                  <Label htmlFor="petsAllowed">Pets Allowed</Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Information */}
            <div className="space-y-4">
              <h4 className="font-medium">Additional Information</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="features">Features</Label>
                  <Input
                    id="features"
                    {...form.register("features")}
                    placeholder="e.g., Air Conditioning, Balcony, Dishwasher, Built-in Wardrobes"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Property Description</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="Describe your property, its unique features, and what makes it special..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="min-w-[200px]">
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
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Matching Tenants</h2>
              <Badge variant="secondary">{searchResults.length} tenants found</Badge>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid gap-6">
                {searchResults.map((tenant) => (
                  <TenantCard key={tenant.id} tenant={tenant} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center space-y-2">
                    <User className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-lg font-medium">No matching tenants found</h3>
                    <p className="text-muted-foreground">
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
