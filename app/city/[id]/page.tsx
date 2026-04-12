'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  DollarSign,
  Bookmark,
  Calendar,
  Zap,
  Utensils,
  Hotel,
  Compass,
  Plane,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { fakeApi } from '@/lib/fake-api'
import { City, Place } from '@/lib/seeds'

export default function CityPage() {
  const params = useParams()
  const cityId = params?.id as string

  const [city, setCity] = useState<City | null>(null)
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [bookmarkedPlaces, setBookmarkedPlaces] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadData = async () => {
      const cityResult = await fakeApi.fetch(`/cities/${cityId}`)
      setCity(cityResult.data)

      const placesResult = await fakeApi.fetch(`/cities/${cityId}/places`, { limit: 100 })
      setPlaces(placesResult.data || [])

      const bookmarks = fakeApi.getBookmarks()
      setBookmarkedPlaces(new Set(bookmarks))

      setLoading(false)
    }

    if (cityId) {
      loadData()
    }
  }, [cityId])

  const hotels = places.filter((p) => p.type === 'hotel')
  const restaurants = places.filter((p) => p.type === 'restaurant')
  const sights = places.filter((p) => p.type === 'sight')

  const toggleBookmark = (placeId: string) => {
    if (bookmarkedPlaces.has(placeId)) {
      fakeApi.removeBookmark(placeId)
      bookmarkedPlaces.delete(placeId)
    } else {
      fakeApi.addBookmark(placeId)
      bookmarkedPlaces.add(placeId)
    }
    setBookmarkedPlaces(new Set(bookmarkedPlaces))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-64 bg-muted animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!city) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">City not found</h1>
          <Link href="/">
            <Button>Back to home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <Link href="/" className="flex items-center gap-2 ml-auto">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
              W
            </div>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div
        className="h-80 bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden"
        style={{
          backgroundImage: `url(${city.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">{city.name}</h1>
          <p className="text-lg text-white/90">{city.summary}</p>
        </div>
      </div>

      {/* City Info Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 mb-8">
        <Card className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Best Time
            </p>
            <p className="font-semibold text-foreground">{city.bestTimeToVisit}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <DollarSign className="w-4 h-4" /> Avg. Budget
            </p>
            <p className="font-semibold text-foreground">
              ₹{city.avgPrice.min.toLocaleString()} - ₹{city.avgPrice.max.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Region
            </p>
            <p className="font-semibold text-foreground">{city.region}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Zap className="w-4 h-4" /> Popular
            </p>
            <p className="font-semibold text-foreground">{places.length} Places</p>
          </div>
        </Card>
      </div>

      {/* Tabs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Tabs defaultValue="sights" className="space-y-6">
          <TabsList className="w-full justify-start bg-muted/40 p-1 rounded-lg flex-wrap">
            <TabsTrigger value="sights" className="flex items-center gap-2">
              <Compass className="w-4 h-4" />
              <span className="hidden sm:inline">Things to Do</span>
              <span className="sm:hidden">Sights</span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded ml-2">{sights.length}</span>
            </TabsTrigger>
            <TabsTrigger value="hotels" className="flex items-center gap-2">
              <Hotel className="w-4 h-4" />
              <span className="hidden sm:inline">Hotels</span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded ml-2">{hotels.length}</span>
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="flex items-center gap-2">
              <Utensils className="w-4 h-4" />
              <span className="hidden sm:inline">Eat</span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded ml-2">{restaurants.length}</span>
            </TabsTrigger>
            <TabsTrigger value="transport" className="flex items-center gap-2">
              <Plane className="w-4 h-4" />
              <span className="hidden sm:inline">Transport</span>
              <span className="sm:hidden">Travel</span>
            </TabsTrigger>
            <TabsTrigger value="itinerary" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Itinerary</span>
              <span className="sm:hidden">Plan</span>
            </TabsTrigger>
          </TabsList>

          {/* Sights Tab */}
          <TabsContent value="sights" className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Things to Do in {city.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sights.map((place) => (
                <Link key={place.id} href={`/place/${place.id}`}>
                  <PlaceCard
                    place={place}
                    isBookmarked={bookmarkedPlaces.has(place.id)}
                    onBookmarkToggle={() => toggleBookmark(place.id)}
                  />
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* Hotels Tab */}
          <TabsContent value="hotels" className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Hotels in {city.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hotels.map((place) => (
                <Link key={place.id} href={`/place/${place.id}`}>
                  <PlaceCard
                    place={place}
                    isBookmarked={bookmarkedPlaces.has(place.id)}
                    onBookmarkToggle={() => toggleBookmark(place.id)}
                  />
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* Restaurants Tab */}
          <TabsContent value="restaurants" className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Restaurants in {city.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {restaurants.map((place) => (
                <Link key={place.id} href={`/place/${place.id}`}>
                  <PlaceCard
                    place={place}
                    isBookmarked={bookmarkedPlaces.has(place.id)}
                    onBookmarkToggle={() => toggleBookmark(place.id)}
                  />
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* FIX 9: Transport tab with city context */}
          <TabsContent value="transport" className="space-y-4">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Getting to {city.name}</h2>
              <Card className="p-8 bg-gradient-to-r from-primary/10 to-accent/10">
                <p className="text-muted-foreground mb-2">
                  Find flights and trains connecting <span className="font-semibold text-foreground">{city.name}</span> with other major cities.
                </p>
                <p className="text-sm text-muted-foreground mb-5">
                  Best time to visit: <span className="font-medium text-foreground">{city.bestTimeToVisit}</span>
                </p>
                <Link href={`/transport?city=${city.id}`}>
                  <Button className="bg-primary hover:bg-primary/90 gap-2">
                    <Plane className="w-4 h-4" />
                    Browse Transport to {city.name}
                  </Button>
                </Link>
              </Card>
            </div>
          </TabsContent>

          {/* Itinerary Tab */}
          <TabsContent value="itinerary" className="space-y-4">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Generate Your Itinerary</h2>
              <ItineraryGenerator cityId={city.id} cityName={city.name} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// FIX 2: Bookmark always visible (not just on hover)
// FIX 7: Consistent price display with fallback
function PlaceCard({
  place,
  isBookmarked,
  onBookmarkToggle,
}: {
  place: Place
  isBookmarked: boolean
  onBookmarkToggle: () => void
}) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col">
      <div
        className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden"
        style={{
          backgroundImage: `url(${place.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
        {/* FIX 2: Always-visible bookmark button with clear filled/outline state */}
        <button
          onClick={(e) => {
            e.preventDefault()
            onBookmarkToggle()
          }}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this place'}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all z-10 shadow-sm ${
            isBookmarked
              ? 'bg-primary text-primary-foreground'
              : 'bg-white/90 text-muted-foreground hover:bg-white hover:text-primary'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {place.name}
        </h3>

        <div className="flex items-center gap-4 text-sm text-muted-foreground my-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span>{place.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{place.bestTimeMinutes} min</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{place.description}</p>

        <div className="flex flex-wrap gap-1 mb-3">
          {place.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>

        {/* FIX 7: Always render price row — fallback for missing price */}
        <div className="text-sm font-semibold mt-auto pt-2 border-t border-border flex items-center justify-between">
          {place.priceRange ? (
            <span className="text-primary">
              ₹{place.priceRange.min.toLocaleString()} – ₹{place.priceRange.max.toLocaleString()}
            </span>
          ) : (
            <span className="text-muted-foreground font-normal">Free entry</span>
          )}
          <span className="text-xs text-muted-foreground">{place.openingHours}</span>
        </div>
      </div>
    </Card>
  )
}

// FIX 4: shadcn Select components + FIX 6: loading spinner & skeleton
function ItineraryGenerator({ cityId, cityName }: { cityId: string; cityName: string }) {
  const [days, setDays] = useState('1')
  const [pace, setPace] = useState<'relaxed' | 'normal' | 'packed'>('normal')
  const [interests, setInterests] = useState<string[]>(['heritage'])
  const [itinerary, setItinerary] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const availableInterests = ['heritage', 'food', 'nature', 'nightlife', 'art', 'local-experience']

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest))
    } else {
      setInterests([...interests, interest])
    }
  }

  const generateItinerary = async () => {
    setLoading(true)
    setItinerary(null)
    const result = await fakeApi.fetch('/itinerary/generate', {
      cityId,
      days: Number(days),
      pace,
      interests,
    })
    setItinerary(result.data)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 bg-muted/40 p-6 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* FIX 4: shadcn Select for Duration */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Duration</label>
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select days" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d} Day{d > 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* FIX 4: shadcn Select for Pace */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Pace</label>
            <Select value={pace} onValueChange={(v) => setPace(v as any)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select pace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relaxed">Relaxed</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="packed">Packed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Interests</label>
          <div className="flex flex-wrap gap-2">
            {availableInterests.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  interests.includes(interest)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {interest.charAt(0).toUpperCase() + interest.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* FIX 6: Loading spinner on button */}
        <Button
          onClick={generateItinerary}
          disabled={loading || interests.length === 0}
          className="w-full bg-primary hover:bg-primary/90 gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating your {cityName} itinerary…
            </>
          ) : (
            'Generate Itinerary'
          )}
        </Button>
      </div>

      {/* FIX 6: Skeleton while loading */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: Number(days) }).map((_, i) => (
            <Card key={i} className="p-6 space-y-3">
              <Skeleton className="h-6 w-24" />
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex gap-4 pb-3 border-b border-border last:border-b-0">
                  <Skeleton className="h-4 w-16 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </Card>
          ))}
        </div>
      )}

      {itinerary && !loading && (
        <div className="space-y-4">
          {itinerary.itinerary.map((day: any) => (
            <Card key={day.day} className="p-6">
              <h3 className="font-bold text-lg text-foreground mb-4">Day {day.day}</h3>
              <div className="space-y-3">
                {day.schedule.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-4 pb-3 border-b border-border last:border-b-0">
                    <div className="flex-shrink-0 w-16 font-semibold text-primary text-sm">{item.startTime}</div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.type === 'meal'
                          ? `${item.meal} · ${Math.round(item.duration * 60)} min`
                          : `${item.duration}h`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
