'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, Clock, MapPin, DollarSign, Bookmark, Share2, MapIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { fakeApi } from '@/lib/fake-api'
import { Place, City, places as allPlaces, cities as allCities } from '@/lib/seeds'

export default function PlaceDetailPage() {
  const params = useParams()
  const placeId = params?.id as string

  const [place, setPlace] = useState<Place | null>(null)
  const [city, setCity] = useState<City | null>(null)
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([])
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const placeResult = await fakeApi.fetch(`/place/${placeId}`)
      const foundPlace = placeResult.data

      if (foundPlace) {
        setPlace(foundPlace)

        // Find city
        const foundCity = allCities.find((c) => c.id === foundPlace.cityId)
        setCity(foundCity || null)

        // Find nearby places (same type, same city)
        const nearby = allPlaces
          .filter(
            (p) => p.cityId === foundPlace.cityId && p.type === foundPlace.type && p.id !== foundPlace.id
          )
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4)

        setNearbyPlaces(nearby)
        setIsBookmarked(fakeApi.isBookmarked(placeId))
      }

      setLoading(false)
    }

    if (placeId) {
      loadData()
    }
  }, [placeId])

  const toggleBookmark = () => {
    if (isBookmarked) {
      fakeApi.removeBookmark(placeId)
    } else {
      fakeApi.addBookmark(placeId)
    }
    setIsBookmarked(!isBookmarked)
  }

  const handleShare = () => {
    const url = `${window.location.origin}/place/${placeId}`
    if (navigator.share) {
      navigator.share({
        title: place?.name,
        text: `Check out ${place?.name} on Wanderwell!`,
        url,
      })
    } else {
      // FIX 5: use sonner toast instead of blocking alert()
      navigator.clipboard.writeText(url).then(() => {
        toast.success('Link copied to clipboard!', { duration: 2500 })
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-96 bg-muted animate-pulse" />
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }

  if (!place || !city) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Place not found</h1>
          <Link href="/">
            <Button>Back to home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href={`/city/${city.id}`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleBookmark}
              className={isBookmarked ? 'text-primary' : 'text-muted-foreground'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-primary' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Image */}
      <div
        className="h-96 bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden"
        style={{
          backgroundImage: `url(${place.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title and Rating */}
        <div className="py-8 border-b border-border">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground mb-2">{place.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-accent text-accent" />
                  <span className="text-lg font-semibold text-foreground">{place.rating.toFixed(1)}</span>
                </div>
                <Link href={`/city/${city.id}`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {city.name}, {city.region}
                </Link>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-4 h-4" /> Duration
              </p>
              <p className="font-semibold text-foreground">{place.bestTimeMinutes} minutes</p>
            </div>
            {place.priceRange && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSign className="w-4 h-4" /> Price Range
                </p>
                <p className="font-semibold text-foreground">
                  ₹{place.priceRange.min} - ₹{place.priceRange.max}
                </p>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-4 h-4" /> Hours
              </p>
              <p className="font-semibold text-foreground text-sm">{place.openingHours}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapIcon className="w-4 h-4" /> Type
              </p>
              <p className="font-semibold text-foreground capitalize">{place.type}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <Card className="my-8 p-6">
          <h2 className="text-xl font-bold text-foreground mb-3">About</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">{place.description}</p>

          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {place.tags.map((tag) => (
                  <span key={tag} className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {tag.charAt(0).toUpperCase() + tag.slice(1).replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* User Tips */}
        <Card className="my-8 p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Quick Tips</h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                ✓
              </div>
              <div>
                <p className="font-medium text-foreground">Best Time to Visit</p>
                <p className="text-sm text-muted-foreground">
                  Plan {place.bestTimeMinutes} minutes for this {place.type}.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                ✓
              </div>
              <div>
                <p className="font-medium text-foreground">Opening Hours</p>
                <p className="text-sm text-muted-foreground">{place.openingHours}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                ✓
              </div>
              <div>
                <p className="font-medium text-foreground">Highly Rated</p>
                <p className="text-sm text-muted-foreground">Rated {place.rating}/5 by visitors</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Nearby Places */}
        {nearbyPlaces.length > 0 && (
          <div className="my-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              More {place.type === 'sight' ? 'Things to Do' : place.type === 'hotel' ? 'Hotels' : 'Restaurants'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {nearbyPlaces.map((nearbyPlace) => (
                <Link key={nearbyPlace.id} href={`/place/${nearbyPlace.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all h-full cursor-pointer group">
                    <div
                      className="h-40 bg-gradient-to-br from-primary/20 to-accent/20"
                      style={{
                        backgroundImage: `url(${nearbyPlace.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      <div className="w-full h-full bg-gradient-to-t from-foreground/30 to-transparent" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {nearbyPlace.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <Star className="w-4 h-4 fill-accent text-accent" />
                        <span className="text-foreground font-medium">{nearbyPlace.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">· {nearbyPlace.bestTimeMinutes} min</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Action Section */}
        <div className="py-8 flex gap-3">
          <Button asChild className="flex-1 bg-primary hover:bg-primary/90">
            <Link href={`/city/${city.id}`}>Explore {city.name}</Link>
          </Button>
          <Button variant="outline" onClick={toggleBookmark} className="flex-shrink-0 bg-transparent">
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-primary text-primary' : ''}`} />
          </Button>
        </div>
      </div>
    </div>
  )
}
