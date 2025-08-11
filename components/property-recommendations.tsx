"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Trash2, Search, MapPin, Home, DollarSign, Calendar, Star } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

const propertySchema = z.object({
  country: z.string().min(1, "Country is required"),
  region: z.string().min(1, "Region is required"),
  district: z.string().optional(),
  suburb: z.string().optional(),
  propertyType: z.string().min(1, "Property type is required"),
  minPrice: z.number().min(0, "Minimum price must be positive"),
  maxPrice: z.number().min(0, "Maximum price must be positive"),
  bedrooms: z.number().min(0, "Bedrooms must be 0 or more"),
  bathrooms: z.number().min(0, "Bathrooms must be 0 or more"),
  carSpaces: z.number().min(0, "Car spaces must be 0 or more"),
  petsAllowed: z.boolean().default(false),
})

const searchSchema = z.object({
  properties: z.array(propertySchema),
  priorities: z.array(z.string()),
})

type PropertyForm = z.infer<typeof propertySchema>
type SearchForm = z.infer<typeof searchSchema>

// Mock property listings data
const mockListings = [
  {
    id: 1,
    country: "Australia",
    region: "Victoria",
    district: "Melbourne",
    suburb: "Richmond",
    address: "123 Swan Street",
    postcode: "3121",
    apartmentCode: "12A",
    propertyType: "apartment",
    pricePerWeek: 450,
    bondAmount: 1800,
    bedrooms: 2,
    bathrooms: 1,
    carSpaces: 1,
    petsAllowed: false,
    availableFrom: "15-03-2024",
    features: ["Air Conditioning", "Balcony", "Dishwasher", "Built-in Wardrobes", "Gym"],
    score: 95,
  },
  {
    id: 2,
    country: "Australia",
    region: "Victoria",
    district: "Melbourne",
    suburb: "South Yarra",
    address: "456 Toorak Road",
    postcode: "3141",
    propertyType: "apartment",
    pricePerWeek: 520,
    bondAmount: 2080,
    bedrooms: 2,
    bathrooms: 2,
    carSpaces: 1,
    petsAllowed: true,
    availableFrom: "01-04-2024",
    features: ["Pool", "Concierge", "Air Conditioning", "Balcony", "Storage"],
    score: 88,
  },
  {
    id: 3,
    country: "Australia",
    region: "Victoria",
    district: "Melbourne",
    suburb: "Carlton",
    address: "789 Lygon Street",
    postcode: "3053",
    propertyType: "house",
    pricePerWeek: 650,
    bondAmount: 2600,
    bedrooms: 3,
    bathrooms: 2,
    carSpaces: 2,
    petsAllowed: true,
    availableFrom: "20-03-2024",
    features: ["Garden", "Fireplace", "Dishwasher", "Air Conditioning", "Study Room"],
    score: 92,
  },
  {
    id: 4,
    country: "Australia",
    region: "Victoria",
    district: "Melbourne",
    suburb: "Fitzroy",
    address: "321 Brunswick Street",
    postcode: "3065",
    propertyType: "townhouse",
    pricePerWeek: 580,
    bondAmount: 2320,
    bedrooms: 2,
    bathrooms: 2,
    carSpaces: 1,
    petsAllowed: false,
    availableFrom: "10-04-2024",
    features: ["Courtyard", "Modern Kitchen", "Air Conditioning", "Storage", "Laundry"],
    score: 85,
  },
  {
    id: 5,
    country: "Australia",
    region: "Victoria",
    district: "Melbourne",
    suburb: "St Kilda",
    address: "654 Acland Street",
    postcode: "3182",
    apartmentCode: "5B",
    propertyType: "apartment",
    pricePerWeek: 480,
    bondAmount: 1920,
    bedrooms: 1,
    bathrooms: 1,
    carSpaces: 0,
    petsAllowed: false,
    availableFrom: "25-03-2024",
    features: ["Beach Views", "Balcony", "Modern Kitchen", "Air Conditioning"],
    score: 78,
  },
]

const priorityOptions = [
  { id: "location", label: "Location" },
  { id: "price", label: "Price Range" },
  { id: "bedrooms", label: "Number of Bedrooms" },
  { id: "bathrooms", label: "Number of Bathrooms" },
  { id: "carSpaces", label: "Car Spaces" },
  { id: "propertyType", label: "Property Type" },
  { id: "petsAllowed", label: "Pets Allowed" },
]

export function PropertyRecommendations() {
  const [searchResults, setSearchResults] = useState<typeof mockListings>([])
  const [priorities, setPriorities] = useState<string[]>(priorityOptions.map((p) => p.id))
  const [hasSearched, setHasSearched] = useState(false)
  const { toast } = useToast()

  const form = useForm<SearchForm>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      properties: [
        {
          country: "",
          region: "",
          district: "",
          suburb: "",
          propertyType: "",
          minPrice: 0,
          maxPrice: 1000,
          bedrooms: 1,
          bathrooms: 1,
          carSpaces: 0,
          petsAllowed: false,
        },
      ],
      priorities: priorityOptions.map((p) => p.id),
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "properties",
  })

  const addProperty = () => {
    append({
      country: "",
      region: "",
      district: "",
      suburb: "",
      propertyType: "",
      minPrice: 0,
      maxPrice: 1000,
      bedrooms: 1,
      bathrooms: 1,
      carSpaces: 0,
      petsAllowed: false,
    })
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(priorities)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setPriorities(items)
  }

  const searchProperties = (data: SearchForm) => {
    // Simulate search with mock data
    const filteredResults = mockListings.filter((listing) => {
      return data.properties.some((property) => {
        const matchesCountry =
          !property.country || listing.country.toLowerCase().includes(property.country.toLowerCase())
        const matchesRegion = !property.region || listing.region.toLowerCase().includes(property.region.toLowerCase())
        const matchesType = !property.propertyType || listing.propertyType === property.propertyType
        const matchesPrice = listing.pricePerWeek >= property.minPrice && listing.pricePerWeek <= property.maxPrice
        const matchesBedrooms = listing.bedrooms >= property.bedrooms
        const matchesBathrooms = listing.bathrooms >= property.bathrooms
        const matchesCarSpaces = listing.carSpaces >= property.carSpaces
        const matchesPets = !property.petsAllowed || listing.petsAllowed

        return (
          matchesCountry &&
          matchesRegion &&
          matchesType &&
          matchesPrice &&
          matchesBedrooms &&
          matchesBathrooms &&
          matchesCarSpaces &&
          matchesPets
        )
      })
    })

    // Sort by priority-based scoring (simplified)
    const sortedResults = filteredResults.sort((a, b) => b.score - a.score)

    setSearchResults(sortedResults)
    setHasSearched(true)

    toast({
      title: "Search Complete",
      description: `Found ${sortedResults.length} matching properties`,
    })
  }

  const PropertyCard = ({ listing }: { listing: (typeof mockListings)[0] }) => (
    <Card className="w-full">
      <CardHeader className="space-y-2 pb-4">
        <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Home className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="break-words">{listing.address}</span>
            </CardTitle>
            <CardDescription className="flex items-center gap-1 text-xs sm:text-sm">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="break-words">{listing.suburb}, {listing.district}, {listing.region}</span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 self-start">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-sm">{listing.score}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs sm:text-sm">${listing.pricePerWeek}/week</span>
          </div>
          <div className="text-xs sm:text-sm">
            <span className="font-medium">{listing.bedrooms}</span> bed
          </div>
          <div className="text-xs sm:text-sm">
            <span className="font-medium">{listing.bathrooms}</span> bath
          </div>
          <div className="text-xs sm:text-sm">
            <span className="font-medium">{listing.carSpaces}</span> car
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Available from {listing.availableFrom}</span>
          </div>
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:gap-2 sm:space-y-0 text-xs sm:text-sm">
            <span>Bond: ${listing.bondAmount}</span>
            {listing.petsAllowed && <Badge variant="secondary" className="text-xs self-start">Pets OK</Badge>}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs sm:text-sm font-medium">Features</Label>
          <div className="flex flex-wrap gap-1">
            {listing.features.map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <form onSubmit={form.handleSubmit(searchProperties)} className="space-y-4 sm:space-y-6">
        {/* Property Criteria */}
        <Card>
          <CardHeader className="space-y-2 pb-4">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-lg sm:text-xl">Property Search Criteria</CardTitle>
                <CardDescription className="text-sm">Add multiple property preferences to find the best matches</CardDescription>
              </div>
              <Button type="button" onClick={addProperty} variant="outline" size="sm" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 p-3 sm:p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm sm:text-base">Property {index + 1}</h4>
                  {fields.length > 1 && (
                    <Button type="button" onClick={() => remove(index)} variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Country</Label>
                    <Input {...form.register(`properties.${index}.country`)} placeholder="e.g., Australia" className="text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Region</Label>
                    <Input {...form.register(`properties.${index}.region`)} placeholder="e.g., Victoria" className="text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">District</Label>
                    <Input {...form.register(`properties.${index}.district`)} placeholder="e.g., Melbourne" className="text-sm" />
                  </div>
                </div>

                <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Suburb</Label>
                    <Input {...form.register(`properties.${index}.suburb`)} placeholder="e.g., Richmond" className="text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Property Type</Label>
                    <Select onValueChange={(value) => form.setValue(`properties.${index}.propertyType`, value)}>
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
                  </div>
                </div>

                <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Min Price/Week</Label>
                    <Input
                      type="number"
                      {...form.register(`properties.${index}.minPrice`, { valueAsNumber: true })}
                      placeholder="0"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Max Price/Week</Label>
                    <Input
                      type="number"
                      {...form.register(`properties.${index}.maxPrice`, { valueAsNumber: true })}
                      placeholder="1000"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Bedrooms</Label>
                    <Input
                      type="number"
                      {...form.register(`properties.${index}.bedrooms`, { valueAsNumber: true })}
                      placeholder="1"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Bathrooms</Label>
                    <Input
                      type="number"
                      {...form.register(`properties.${index}.bathrooms`, { valueAsNumber: true })}
                      placeholder="1"
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Car Spaces</Label>
                    <Input
                      type="number"
                      {...form.register(`properties.${index}.carSpaces`, { valueAsNumber: true })}
                      placeholder="0"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Pets Allowed</Label>
                    <Select
                      onValueChange={(value) => form.setValue(`properties.${index}.petsAllowed`, value === "true")}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false" className="text-sm">No Preference</SelectItem>
                        <SelectItem value="true" className="text-sm">Pets Required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Priority Ranking */}
        <Card>
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-lg sm:text-xl">Priority Ranking</CardTitle>
            <CardDescription className="text-sm">Drag and drop to arrange your priorities from most to least important</CardDescription>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="priorities">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {priorities.map((priorityId, index) => {
                      const priority = priorityOptions.find((p) => p.id === priorityId)
                      return (
                        <Draggable key={priorityId} draggableId={priorityId} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="flex items-center gap-3 p-3 bg-muted rounded-lg cursor-move"
                            >
                              <span className="font-medium text-xs sm:text-sm w-6">{index + 1}.</span>
                              <span className="text-xs sm:text-sm">{priority?.label}</span>
                            </div>
                          )}
                        </Draggable>
                      )
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="w-full sm:min-w-[200px] sm:w-auto">
            <Search className="h-4 w-4 mr-2" />
            Search Properties
          </Button>
        </div>
      </form>

      {/* Search Results */}
      {hasSearched && (
        <>
          <Separator />
          <div className="space-y-4">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold">Closest Matches</h2>
              <Badge variant="secondary" className="text-xs self-start">{searchResults.length} results found</Badge>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid gap-4 sm:gap-6">
                {searchResults.map((listing) => (
                  <PropertyCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center space-y-2">
                    <Home className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-base sm:text-lg font-medium">No properties found</h3>
                    <p className="text-muted-foreground text-sm">Try adjusting your search criteria or priorities</p>
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
